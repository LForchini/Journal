# Server

## .env

The server requires a `.env` file for some config settings.
These settings don't need to be kept private as all private information is handled by [auth0](https://auth0.com).
Still, the file is in `.gitignore` just in case.

### Example `.env`

```
PORT="8080"
AUTH0_AUDIENCE="http://localhost:8080"
AUTH0_DOMAIN="dev-fq8tyev3.eu.auth0.com"
```
