import express, { type Express } from "express";
import cors from "cors";

// Import Routes
import userRoutes from "./modules/users/user.route.js";
import carpoolRoutes from "./modules/carpools/carpool.route.js";
import messageRoutes from "./modules/messages/message.route.js";

const app: Express = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/carpools", carpoolRoutes);
app.use("/api/messages", messageRoutes);

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    message: "CampusHive API is running",
  });
});

// 404 Error
app.use((req, res) => {
  return res.status(404).json({
    message: "Route not found",
  });
});

export default app;
