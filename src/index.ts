import "dotenv/config";
import app from "./app";
import "./config/db";

const requiredEnvVars = ["ACCESS_TOKEN_SECRET", "DB_HOST", "REDIS_HOST", "REDIS_PORT"];

const { PORT = 3000 } = process.env;

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !(envVar in process.env)
);

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}

const server = app.listen(PORT, () => {
  console.log(`> Server running on port ${PORT} 🚀`);
});


const closeServer = () => {
  server.closeAllConnections();
  server.closeIdleConnections();
  server.close();
};

process.on("SIGINT", closeServer);
process.on("SIGTERM", closeServer);
