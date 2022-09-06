import express from 'express';
import { StatusCode } from 'status-code-enum';
import 'dotenv/config';
import {
    expressjwt,
    GetVerificationKey,
    Request as JWTRequest,
} from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import cors from 'cors';
import { Entry, sequelize } from './db';

const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors());

const checkJwt = expressjwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    }) as GetVerificationKey,
    audience: process.env.AUTH0_AUDIENCE,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    algorithms: ['RS256'],
});

app.get('/entries', checkJwt, async (req: JWTRequest, res) => {
    let user_id = req.auth?.sub as string;
    let entries = await Entry.findAll({ where: { user_id } });

    res.status(StatusCode.SuccessOK).send(JSON.stringify(entries));
});

app.post('/entries', checkJwt, express.json(), async (req: JWTRequest, res) => {
    let { date, content } = req.body;
    let user_id = req.auth?.sub as string;

    if (!date || !content) {
        res.sendStatus(StatusCode.ClientErrorBadRequest);
    } else {
        let entry = await Entry.findOne({ where: { date, user_id } });
        if (entry) {
            res.sendStatus(StatusCode.ClientErrorBadRequest);
        } else {
            let entry = new Entry({ date, content, user_id });
            entry.save();
            res.status(StatusCode.SuccessCreated).send(JSON.stringify(entry));
        }
    }
});

app.delete(
    '/entries',
    checkJwt,
    express.json(),
    async (req: JWTRequest, res) => {
        let { date } = req.body;
        let user_id = req.auth?.sub as string;

        let entry = await Entry.findOne({ where: { date, user_id } });

        if (!entry) {
            res.sendStatus(StatusCode.ClientErrorNotFound);
        } else {
            await entry.destroy();
            res.sendStatus(StatusCode.SuccessNoContent);
        }
    }
);

app.patch(
    '/entries',
    checkJwt,
    express.json(),
    async (req: JWTRequest, res) => {
        let { date, content } = req.body;
        let user_id = req.auth?.sub as string;

        let entry = await Entry.findOne({ where: { date, user_id } });

        if (!entry) {
            entry = new Entry({ date, content, user_id });
        } else {
            entry.content = content;
        }

        await entry.save();
        res.sendStatus(StatusCode.SuccessNoContent);
    }
);

app.listen(PORT, async () => {
    console.log(`Starting server on http://localhost:${PORT}`);
    await sequelize.sync();
});
