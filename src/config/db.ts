import { connect, connection } from "mongoose";

const host = process.env.DB_HOST || "localhost";

connect(`${host}`, {
  dbName: "the-power",
})
  .then(() => console.info("> db connected!"))
  .catch((error) => {
    console.error("> something went wrong:", error.message);
    process.exit(0);
  });

process.on("SIGINT", () => {
  connection.close();
});
