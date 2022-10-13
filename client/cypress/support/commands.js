// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
const jwt = require("jsonwebtoken");

Cypress.Commands.add("loginAuth0", (username, password) => {
    const client_id = Cypress.env("auth0_client_id");
    const audience = Cypress.env("auth0_audience");
    const scope = Cypress.env("auth0_scope");

    const options = {
        method: "POST",
        url: `https://${Cypress.env("auth0_domain")}/oauth/token`,
        body: {
            grant_type: "password",
            username,
            password,
            audience,
            scope,
            client_id,
        },
    };

    cy.request(options).then(({ body }) => {
        console.log(body);

        let claims;
        if (body.token_type === "Bearer") {
            claims = jwt.decode(body.access_token);
        } else {
            claims = jwt.decode(body.id_token);
        }

        const {
            nickname,
            name,
            picture,
            updated_at,
            email,
            email_verified,
            sub,
            exp,
        } = claims;

        const item = {
            body: {
                ...body,
                decodedToken: {
                    claims,
                    user: {
                        nickname,
                        name,
                        picture,
                        updated_at,
                        email,
                        email_verified,
                        sub,
                    },
                    audience,
                    client_id,
                },
            },
            expiresAt: exp,
        };

        window.localStorage.setItem("auth0Cypress", JSON.stringify(item));

        cy.visit("http://localhost:3000");
    });
});
