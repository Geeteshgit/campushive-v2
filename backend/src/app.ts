import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { errorHandler } from "./middleware/error-handler.js";

// Import Routes
import authRoutes from "./modules/auth/auth.route.js";
import userRoutes from "./modules/users/user.route.js";
import carpoolRoutes from "./modules/carpools/carpool.route.js";
import messageRoutes from "./modules/messages/message.route.js";

const app: Express = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL,
//     credentials: true,
//   }),
// );

// Routes

app.use((req, _res, next) => {
  console.log("REQUEST:", req.method, req.originalUrl);
  next();
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/carpools", carpoolRoutes);
app.use("/api/messages", messageRoutes);

app.get("/api/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "CampusHive API is running",
  });
});

// 404 Error
app.use((_req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
