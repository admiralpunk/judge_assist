import { Request, Response } from "express"
import { client } from "../database/models/connection";
import { EventType } from '../types'
import { generatePassword } from "../utils";
import { sendMail } from "../utils"
interface ApiRequest {
    (req: Request, res: Response): void;
}

export const login: ApiRequest = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({
        message: "Please provide email and password"
    });
    try {
        if (email === "adminemail69@gmail.com" && password === "golu69") {
            res.status(200).json({
                message: "Login Success"
            })
        }
        else {
            res.status(400).json({
                message: "Invalid Creds"
            })
        }
    } catch (error) {
        console.log(error),
            res.status(500).send(error)
    }

}

export const getAllEvents: ApiRequest = async (req, res) => {

    try {
        const response: any = []
        const events = (await client.query('SELECT * FROM events')).rows;

        for (const event of events) {
            const eventId = event.pk_eventid;
            const users = (await client.query("SELECT * FROM user_events WHERE fk_eventid = $1", [eventId])).rows;
            const parameters = (await client.query("SELECT * FROM event_parameters WHERE fk_eventid = $1", [eventId])).rows;
            response.push({ event, users, parameters });
        }

        res.status(200).json({ response });
    } catch (error) {
        res.status(500).send(error);
    }
}

export const addEvent: ApiRequest = async (req, res) => {
    const { name, parameters, starting_date, ending_date } = req.body;
    try {
        const response = await client.query('INSERT INTO events (name, starting_date,ending_date) VALUES ($1, $2, $3) RETURNING *', [name, starting_date, ending_date]);
        const id = response?.rows[0]?.pk_eventid;
        parameters.forEach(async (parameter: any) => {
            await client.query('INSERT INTO event_parameters (fk_eventid, name, full_marks) VALUES ($1, $2, $3)', [id, parameter.name, parameter.marks]);
        });

        res.status(201).json(response.rows[0]);
    } catch (error) {
        console.log('error', error)
        res.status(500).send(error);
    }
}

export const addTeam: ApiRequest = async (req, res) => {
    const { email, name, event_id, leader_name } = req.body;
    try {
        const response = await client.query('INSERT INTO teams (email,name,leader_name) VALUES ($1, $2,$3) RETURNING *', [email, name, leader_name]);

        const teamId = response?.rows[0]?.pk_teamid;
        await client.query("INSERT INTO user_events (fk_eventid, fk_teamid) VALUES ($1, $2)", [event_id, teamId]);
        res.status(201).json(response.rows[0]);
    } catch (error) {
        res.status(500).send(error);
    }
}

export const getEventTeams: ApiRequest = async (req, res) => {
    const { id } = req.params;

    try {
        const response = (await client.query("SELECT t.name, t.pk_teamid, t.email,t.leader_name from user_events ue INNER JOIN teams t ON ue.fk_teamid = t.pk_teamid WHERE ue.fk_teamid = $1", [id]));
        if (!response.rowCount) res.status(400).json({
            message: "No teams for this event"
        })
        res.status(200).json(response.rows);
    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }

}

export const addJudge: ApiRequest = async (req, res) => {
    const { email, name, event_id } = req.body;
    try {
        const password = await generatePassword()
        const response = await client.query('INSERT INTO judges (email,name,password) VALUES ($1, $2, $3) RETURNING *', [email, name, password]);

        const judgeId = response?.rows[0]?.pk_judgeid;
        await client.query("INSERT INTO judge_events (fk_eventid, fk_judgeid) VALUES ($1, $2)", [event_id, judgeId]);

        const event_name = (await client.query("SELECT events.name FROM events WHERE events.pk_eventid = $1", [event_id])).rows[0];
        sendMail(response.rows[0].email, event_name.name, `
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
                `)
        res.status(201).json(response.rows[0]);
    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
}

export const getEventJudge: ApiRequest = async (req, res) => {
    const { id } = req.params
    if (!id) {
        return res.status(401).json({
            message: "Please send a id"
        })
    }
    try {

        const response = (await client.query("SELECT jd.email,jd.name from judge_events je INNER JOIN judges jd ON je.fk_judgeid = jd.pk_judgeid WHERE fk_eventid = $1", [id]));
        if (!response.rowCount) return res.status(400).json({
            message: "No judge for this event found"
        })
        res.status(200).json(response.rows)
    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
}

export const getScoreByJudge: ApiRequest = async (req, res) => {
    const { id } = req.params;
    try {
        const response = (await client.query(`SELECT 
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
        if (!response.rowCount) return res.status(400).json({
            message: "No score found of this judge id"
        })
        res.status(200).json(response.rows)

    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
}

export const getWinner: ApiRequest = async (req, res) => {
    const { id } = req.params;
    try {
        const response = (await client.query(`SELECT 
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
        average_score DESC;`, [id]))
        if (!response.rowCount) return res.status(400).json({
            message: "No Scores for this event yet"
        })
        res.status(200).json(response.rows)
    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
}

export const getEventById: ApiRequest = async (req, res) => {
    const { id } = req.params;

    try {
        const response = (await client.query(`SELECT 
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
        if (!response.rowCount) return res.status(400).json({
            message: "No Event Found"
        });
        const users = (await client.query(`
        SELECT * FROM user_events ue INNER JOIN teams t ON t.pk_teamid = ue.fk_teamid WHERE ue.fk_eventid = $1
        `, [id]
        )).rows
        const data = response.rows;
        res.status(200).json({
            data, users
        });

    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
}

export const getScoreByTeamId: ApiRequest = async (req, res) => {
    const { id } = req.params;
    try {

        const response = (await client.query(`SELECT 
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
        if (!response.rowCount) return res.status(400).json({
            message: "No score found for this team id"
        })
        res.status(200).json(response.rows);

    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
}
