import express from "express";
import cors from "cors";
import jsonRoutes from "./routes/jsonRoutes";

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api", jsonRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "SchemaSense AI API Running",
  });
});

export default app;
