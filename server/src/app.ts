import express from "express";
import cors from "cors";
import jsonRoutes from "./routes/jsonRoutes";

const app = express();

// Temporary acceptable configuration during deployment phase
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "*"
}));

app.use(express.json());

app.use("/api", jsonRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "SchemaSense AI API Running",
  });
});

export default app;
