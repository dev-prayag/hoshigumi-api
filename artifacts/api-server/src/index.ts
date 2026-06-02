import app from "./app";
import { logger } from "./lib/logger";

export default app;

const rawPort = process.env["PORT"];

if (rawPort) {
  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    logger.error({ port: rawPort }, "Invalid PORT value");
    process.exit(1);
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });
} else if (process.env["VERCEL"] !== "1") {
  logger.warn("PORT not set — server will not listen. Set PORT to start.");
}
