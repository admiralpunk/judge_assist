import { Request, Response } from "express"
import { client } from "../database/models/connection";
import { EventType } from '../types'

interface ApiRequest {
    (req: Request, res: Response): void;
}

export const login: ApiRequest = async (req, res) => {
    const { email, password } = req.body
    try {
        const judgePassword = await client.query("SELECT * from judges WHERE judges.email = $1", [email]);
        if (!judgePassword.rowCount) return res.status(400).json({
            message: "No judge found with this email"
        })
        if (judgePassword.rows[0].password === password) {
            return res.status(200).json({
                message: "Login Successful"
            })
        }
        return res.status(400).json({
            message: "Invalid Credentials"
        })
    } catch (error) {
        console.log(error),
            res.status(500).send(error)
    }

}

export const getEvents: ApiRequest = async (req, res) => {
    const { id } = req.params;
    try {
        const response = (await client.query("SELECT * FROM judge_events je INNER JOIN events e ON je.fk_eventid = e.pk_eventid WHERE je.fk_judgeid = $1", [id])).rows;
        res.status(200).json(response);

    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

export const addScore: ApiRequest = async (req, res) => {
    const { judge_id, event_id, team_id, scores } = req.body;
    try {
        const response = (await client.query("SELECT * FROM judge_scores js WHERE fk_teamid = $1", [team_id])).rowCount;
        if (response) return res.status(401).json({
            message: "Jugdge Already Scored this team"
        })
        for (const score of scores) {
            const param_id = score.param_id;
            const marks = score.marks;
            const response = await client.query("INSERT INTO judge_scores(fk_eventid,fk_teamid, fk_judgeid, fk_paramid, score) VALUES($1, $2, $3, $4, $5)", [event_id, team_id, judge_id, param_id, marks])
        }
        res.status(201).json({
            message: "Marks Entered Succesfully"
        })

    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
}
