"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScoreByTeamId = exports.getEventById = exports.getWinner = exports.getScoreByJudge = exports.getEventJudge = exports.addJudge = exports.getEventTeams = exports.addTeam = exports.addEvent = exports.getAllEvents = exports.login = void 0;
const connection_1 = require("../database/models/connection");
const utils_1 = require("../utils");
const utils_2 = require("../utils");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({
            message: "Please provide email and password"
        });
    try {
        if (email === "adminemail69@gmail.com" && password === "golu69") {
            res.status(200).json({
                message: "Login Success"
            });
        }
        else {
            res.status(400).json({
                message: "Invalid Creds"
            });
        }
    }
    catch (error) {
        console.log(error),
            res.status(500).send(error);
    }
});
exports.login = login;
const getAllEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = [];
        const events = (yield connection_1.client.query('SELECT * FROM events')).rows;
        for (const event of events) {
            const eventId = event.pk_eventid;
            const users = (yield connection_1.client.query("SELECT * FROM user_events WHERE fk_eventid = $1", [eventId])).rows;
            const parameters = (yield connection_1.client.query("SELECT * FROM event_parameters WHERE fk_eventid = $1", [eventId])).rows;
            response.push({ event, users, parameters });
        }
        res.status(200).json({ response });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.getAllEvents = getAllEvents;
const addEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, parameters, starting_date, ending_date } = req.body;
    try {
        const response = yield connection_1.client.query('INSERT INTO events (name, starting_date,ending_date) VALUES ($1, $2, $3) RETURNING *', [name, starting_date, ending_date]);
        const id = (_a = response === null || response === void 0 ? void 0 : response.rows[0]) === null || _a === void 0 ? void 0 : _a.pk_eventid;
        parameters.forEach((parameter) => __awaiter(void 0, void 0, void 0, function* () {
            yield connection_1.client.query('INSERT INTO event_parameters (fk_eventid, name, full_marks) VALUES ($1, $2, $3)', [id, parameter.name, parameter.marks]);
        }));
        res.status(201).json(response.rows[0]);
    }
    catch (error) {
        console.log('error', error);
        res.status(500).send(error);
    }
});
exports.addEvent = addEvent;
const addTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { email, name, event_id, leader_name } = req.body;
    try {
        const response = yield connection_1.client.query('INSERT INTO teams (email,name,leader_name) VALUES ($1, $2,$3) RETURNING *', [email, name, leader_name]);
        const teamId = (_b = response === null || response === void 0 ? void 0 : response.rows[0]) === null || _b === void 0 ? void 0 : _b.pk_teamid;
        yield connection_1.client.query("INSERT INTO user_events (fk_eventid, fk_teamid) VALUES ($1, $2)", [event_id, teamId]);
        res.status(201).json(response.rows[0]);
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.addTeam = addTeam;
const getEventTeams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const response = (yield connection_1.client.query("SELECT t.name, t.pk_teamid, t.email,t.leader_name from user_events ue INNER JOIN teams t ON ue.fk_teamid = t.pk_teamid WHERE ue.fk_teamid = $1", [id]));
        if (!response.rowCount)
            res.status(400).json({
                message: "No teams for this event"
            });
        res.status(200).json(response.rows);
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});
exports.getEventTeams = getEventTeams;
const addJudge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { email, name, event_id } = req.body;
    try {
        const password = yield (0, utils_1.generatePassword)();
        const response = yield connection_1.client.query('INSERT INTO judges (email,name,password) VALUES ($1, $2, $3) RETURNING *', [email, name, password]);
        const judgeId = (_c = response === null || response === void 0 ? void 0 : response.rows[0]) === null || _c === void 0 ? void 0 : _c.pk_judgeid;
        yield connection_1.client.query("INSERT INTO judge_events (fk_eventid, fk_judgeid) VALUES ($1, $2)", [event_id, judgeId]);
        const event_name = (yield connection_1.client.query("SELECT events.name FROM events WHERE events.pk_eventid = $1", [event_id])).rows[0];
        (0, utils_2.sendMail)(response.rows[0].email, event_name.name, `
                <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Credenz</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    padding: 0;
                    color: #333;
                }
                .container {
                    max-width: 600px;
                    margin: auto;
                    background: #f4f4f4;
                    padding: 20px;
                    border-radius: 8px;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 0.8em;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Welcome to Credenz!</h2>
                <p>Please use these credentials to login through our portal,</p>

                <p><strong>Email:</strong> <span id="email">${response.rows[0].email}</span></p>
                <p><strong>Password:</strong> <span id="password">${password}</span></p>

                <div class="footer">
                    Regards,<br>
                    Credenz Team
                </div>
            </div>
        </body>
        </html>
                `);
        res.status(201).json(response.rows[0]);
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});
exports.addJudge = addJudge;
const getEventJudge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(401).json({
            message: "Please send a id"
        });
    }
    try {
        const response = (yield connection_1.client.query("SELECT jd.email,jd.name from judge_events je INNER JOIN judges jd ON je.fk_judgeid = jd.pk_judgeid WHERE fk_eventid = $1", [id]));
        if (!response.rowCount)
            return res.status(400).json({
                message: "No judge for this event found"
            });
        res.status(200).json(response.rows);
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});
exports.getEventJudge = getEventJudge;
const getScoreByJudge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const response = (yield connection_1.client.query(`SELECT 
        e.pk_eventId AS event_id,
        e.name AS event_name,
        e.starting_date,
        e.ending_date,
        e.created_at AS event_created_at,
        t.pk_teamid AS team_id,
        t.email AS team_email,
        t.name AS team_name,
        t.leader_name,
        j.pk_judgeid AS judge_id,
        j.email AS judge_email,
        j.name AS judge_name,
        json_agg(json_build_object('param_id', p.pk_paramid, 'score', js.score)) AS scores
    FROM 
        judge_scores js
    INNER JOIN 
        events e ON js.fk_eventid = e.pk_eventId
    INNER JOIN 
        teams t ON js.fk_teamid = t.pk_teamid
    INNER JOIN 
        event_parameters p ON js.fk_paramid = p.pk_paramid
    INNER JOIN 
        judges j ON js.fk_judgeid = j.pk_judgeid
    WHERE 
        js.fk_judgeid = $1
    GROUP BY 
        e.pk_eventId, t.pk_teamid, j.pk_judgeid;    
    `, [id]));
        if (!response.rowCount)
            return res.status(400).json({
                message: "No score found of this judge id"
            });
        res.status(200).json(response.rows);
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});
exports.getScoreByJudge = getScoreByJudge;
const getWinner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const response = (yield connection_1.client.query(`SELECT 
        e.pk_eventId AS event_id,
        e.name AS event_name,
        e.starting_date,
        e.ending_date,
        e.created_at AS event_created_at,
        t.pk_teamid AS team_id,
        t.email AS team_email,
        t.leader_name,
        t.name AS team_name,
        AVG(team_scores.sum_score) AS average_score
    FROM 
        (SELECT 
            js.fk_eventid,
            js.fk_teamid,
            SUM(js.score) AS sum_score
         FROM 
            judge_scores js
         GROUP BY 
            js.fk_eventid, js.fk_teamid, js.fk_judgeid
        ) AS team_scores
    INNER JOIN 
        events e ON team_scores.fk_eventid = e.pk_eventId
    INNER JOIN 
        teams t ON team_scores.fk_teamid = t.pk_teamid
    WHERE 
        e.pk_eventId = $1
    GROUP BY 
        e.pk_eventId, t.pk_teamid
    ORDER BY
        average_score DESC;`, [id]));
        if (!response.rowCount)
            return res.status(400).json({
                message: "No Scores for this event yet"
            });
        res.status(200).json(response.rows);
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});
exports.getWinner = getWinner;
const getEventById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const response = (yield connection_1.client.query(`SELECT 
        e.pk_eventid,
            e.name,
            e.starting_date,
            e.ending_date,
            json_agg(
                json_build_object('param_id', ep.pk_paramid, 'param_name', ep.name, 'full_marks', ep.full_marks)
            ) AS params 
      FROM 
        events e 
      INNER JOIN event_parameters ep ON e.pk_eventid = ep.fk_eventid 
      WHERE 
        e.pk_eventid = $1
      GROUP BY 
        e.pk_eventid, e.name, e.starting_date, e.ending_date
      `, [id]));
        if (!response.rowCount)
            return res.status(400).json({
                message: "No Event Found"
            });
        const users = (yield connection_1.client.query(`
        SELECT * FROM user_events ue INNER JOIN teams t ON t.pk_teamid = ue.fk_teamid WHERE ue.fk_eventid = $1
        `, [id])).rows;
        const data = response.rows;
        res.status(200).json({
            data, users
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});
exports.getEventById = getEventById;
const getScoreByTeamId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const response = (yield connection_1.client.query(`SELECT 
        e.pk_eventId AS event_id,
            e.name AS event_name,
            e.starting_date,
            e.ending_date,
            e.created_at AS event_created_at,
            t.pk_teamid AS team_id,
            t.email AS team_email,
            t.name AS team_name,
            t.leader_name,
            j.pk_judgeid AS judge_id,
            j.email AS judge_email,
            j.name AS judge_name,
            json_agg(json_build_object('param_id', p.pk_paramid, 'score', js.score)) AS scores
    FROM 
        judge_scores js
    INNER JOIN 
        events e ON js.fk_eventid = e.pk_eventId
    INNER JOIN 
        teams t ON js.fk_teamid = t.pk_teamid
    INNER JOIN 
        event_parameters p ON js.fk_paramid = p.pk_paramid
    INNER JOIN 
        judges j ON js.fk_judgeid = j.pk_judgeid
    WHERE 
        js.fk_teamid = $1
    GROUP BY 
        e.pk_eventId, t.pk_teamid, j.pk_judgeid;
        `, [id]));
        if (!response.rowCount)
            return res.status(400).json({
                message: "No score found for this team id"
            });
        res.status(200).json(response.rows);
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});
exports.getScoreByTeamId = getScoreByTeamId;
//# sourceMappingURL=admin.controller.js.map