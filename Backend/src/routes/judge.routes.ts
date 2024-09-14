import express from "express"
import { getEvents, addScore, login } from "../controllers/judge.controller";
export const JudgeRouter = express.Router();

JudgeRouter.post('/login', login)
JudgeRouter.post("/score", addScore);
JudgeRouter.get('/events/:id', getEvents);

