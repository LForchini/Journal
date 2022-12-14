import express from 'express';
import { StatusCodes } from 'http-status-codes';
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

    res.status(StatusCodes.OK).send(JSON.stringify(entries));
});

app.post('/entries', checkJwt, express.json(), async (req: JWTRequest, res) => {
    let { date, content } = req.body;
    let user_id = req.auth?.sub as string;

    if (!date || !content) {
        res.status(StatusCodes.BAD_REQUEST).send(
            `'date ${date}' or 'content ${content}' missing`
        );
    } else {
        let [entry, created] = await Entry.findOrCreate({
            where: { date, user_id },
            defaults: { date, content, user_id },
        });

        if (!created) {
            res.status(StatusCodes.BAD_REQUEST).send(`Entry already exists`);
        } else {
            res.status(StatusCodes.OK).send(JSON.stringify(entry));
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

        if (!date) {
            res.status(StatusCodes.BAD_REQUEST).send(`No Date`);
        } else {
            let entry = await Entry.findOne({ where: { date, user_id } });

            if (!entry) {
                res.sendStatus(StatusCodes.NOT_FOUND);
            } else {
                await entry.destroy();
                res.sendStatus(StatusCodes.NO_CONTENT);
            }
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

        try {
            await sequelize.transaction(async (transaction) => {
                let entry = await Entry.findOne({
                    where: { date, user_id },
                    transaction,
                });

                if (!entry) {
                    entry = new Entry({ date, content, user_id });
                } else {
                    entry.content = content;
                }

                await entry.save({ transaction });

                res.status(StatusCodes.OK).send(JSON.stringify(entry));
            });
        } catch (e) {
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
);

app.listen(PORT, async () => {
    console.log(`Starting server on http://localhost:${PORT}`);
    await sequelize.sync();
});
