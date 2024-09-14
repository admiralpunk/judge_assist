"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JudgeRouter = void 0;
const express_1 = __importDefault(require("express"));
const judge_controller_1 = require("../controllers/judge.controller");
exports.JudgeRouter = express_1.default.Router();
exports.JudgeRouter.post('/login', judge_controller_1.login);
exports.JudgeRouter.post("/score", judge_controller_1.addScore);
exports.JudgeRouter.get('/events/:id', judge_controller_1.getEvents);
//# sourceMappingURL=judge.routes.js.map