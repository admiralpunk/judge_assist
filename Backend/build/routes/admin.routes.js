"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("../controllers/admin.controller");
exports.adminRoutes = express_1.default.Router();
exports.adminRoutes.post('/login', admin_controller_1.login);
exports.adminRoutes.get('/events', admin_controller_1.getAllEvents);
exports.adminRoutes.get('/events/:id', admin_controller_1.getEventById);
exports.adminRoutes.post('/events', admin_controller_1.addEvent);
exports.adminRoutes.post('/team', admin_controller_1.addTeam);
exports.adminRoutes.get('/team/:id', admin_controller_1.getEventTeams);
exports.adminRoutes.get("/team/score/:id", admin_controller_1.getScoreByTeamId);
exports.adminRoutes.post('/judge', admin_controller_1.addJudge);
exports.adminRoutes.get("/judge/:id", admin_controller_1.getEventJudge);
exports.adminRoutes.get("/score/:id", admin_controller_1.getScoreByJudge);
exports.adminRoutes.get('/winner/:id', admin_controller_1.getWinner);
//# sourceMappingURL=admin.routes.js.map