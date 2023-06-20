import "dotenv/config";
import app from "./app";
import "./db";

const requiredEnvVars = ["ACCESS_TOKEN_SECRET", "DB_HOST"];

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

app.listen(PORT, () => {
  console.log(`> Server running on port ${PORT} 🚀`);
});
