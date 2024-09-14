import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import http from "http";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { adminRoutes } from "./routes/admin.routes";
import { JudgeRouter } from "./routes/judge.routes";
import cron from "node-cron";
import request from "request";
import { client } from "./database/models/connection";
dotenv.config();
interface ApiRequest {
  (req: Request, res: Response): void;
}

const app: Express = express();
const server = http.createServer(app);

// Express Configuration
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("PORT", process.env.PORT || 3000);
app.set("BASE_URL", process.env.BASE_URL || "localhost");

if (process.env.NODE_ENV === "dev") {
  app.use("/dev/api/admin", adminRoutes);
  app.use("/dev/api/judge", JudgeRouter);
} else {
  app.use("/api/admin", adminRoutes);
  app.use("/dev/api/judge", JudgeRouter);
}

app.get("/ping", (req: Request, res: Response) => {
  res.send("pong");
});
app.post("/pp", async (req, res) => {
  res.send("pong");
  console.log(req.body);
});



const startServer = async () => {
  try {
    // console.log("Db connected");

    const port: Number = app.get("PORT");
    const baseURL: String = app.get("BASE_URL");
    server.listen(port, (): void => {
      console.log("Server is listening", port);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

cron.schedule("*/5 * * * *", () => {
  console.log(
    "Sending scheduled request at",
    new Date().toLocaleDateString(),
    "at",
    `${new Date().getHours()}:${new Date().getMinutes()}`
  );
  request(
    "https://judging-be.onrender.com/ping",
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log("im okay");
        // console.log(body) // Optionally, log the response body
      }
    }
  );
});
startServer();

export default server;


app.post("/addTeam", async (req, res) => {
  const { email, name, event_id, leader_name } = req.body;
  try {
    const response = await client.query(
      "INSERT INTO teams (email,name,leader_name) VALUES ($1, $2,$3) RETURNING *",
      [email, name, leader_name]
    );

    const teamId = response?.rows[0]?.pk_teamid;
    await client.query(
      "INSERT INTO user_events (fk_eventid, fk_teamid) VALUES ($1, $2)",
      [event_id, teamId]
    );
    res.status(201).json(response.rows[0]);
  } catch (error) {
    res.status(500).send(error);
  }
});

