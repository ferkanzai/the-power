# The Power tech test

## How to work with the project

In order to use the API, we have 2 options: use the deployed API or use it in local.

The deployed version uses the DB in Mongo Atlas and the API deployed in Render, in the following url: https://the-power-api.onrender.com.

To use it as deployed, you will need to import to Postman de collection and the `the-power-deployed.postman_environment.json` environment file. Select this environment and everything should work out of the box. In the `/signin` endpoint in the collection, in the body, you'll find all the logins of the users already created in the deployed DB, so it's a matter of uncomment the one you want to use and comment the rest. Then you can use the rest of the endpoints in the collection.

**Note**: bear in mind as it's deployed in a free tier version of the service, the API can take longer in the first request, as the service goes to a sleep state when not used.

To use the local version, you need do the following:

Run the command:

```bash
npm run deploy
```

Then, you need to import to Postman the environment `the-power-local.postman_environment.json` and in the project `.env` file set the correct variables (a `.env` file has been sent over email, so that can be used, as that one points to the deployed MongoDB).

Lastly, you can run the project using

```bash
npm start
```

Or for local development:

```bash
npm run dev
```

## Postman collection

All the queries in the collection are ready to work out of the box with the proper authorization token. You just need to use the `/auth/signin` endpoint and the token there will be propagated to the rest of the queries.
