import express from "express";
import {
    login,
    getAllEvents,
    addEvent,
    addJudge,
    addTeam,
    getEventJudge,
    getEventTeams,
    getScoreByJudge,
    getWinner,
    getEventById,
    getScoreByTeamId,

} from "../controllers/admin.controller"
export const adminRoutes = express.Router()

adminRoutes.post('/login', login);
adminRoutes.get('/events', getAllEvents);
adminRoutes.get('/events/:id', getEventById)
adminRoutes.post('/events', addEvent);
adminRoutes.post('/team', addTeam);
adminRoutes.get('/team/:id', getEventTeams);
adminRoutes.get("/team/score/:id", getScoreByTeamId);
adminRoutes.post('/judge', addJudge);
adminRoutes.get("/judge/:id", getEventJudge);
adminRoutes.get("/score/:id", getScoreByJudge);
adminRoutes.get('/winner/:id', getWinner)



