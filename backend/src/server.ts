import app from "./app.js";
import { env } from "./config/env.config.js";

const startServer = async (): Promise<void> => {
  try {
    app.listen(env.PORT, () => {
      console.log(`Server Running On Port: ${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
