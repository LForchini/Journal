describe("CI/CD", () => {
    beforeEach(() => {
        cy.loginAuth0(
            Cypress.env("auth0_username"),
            Cypress.env("auth0_password")
        );
    });

    it("can add a new entry", () => {});
});
