import { createServer } from "node:http";

import app from "./app.js";
import { env } from "./config/env.config.js";
import { initializeSocket } from "./lib/socket.js";

const startServer = async (): Promise<void> => {
  try {
    const httpServer = createServer(app);
    initializeSocket(httpServer);

    httpServer.listen(env.PORT, () => {
      console.log(`Server Running On Port: ${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
