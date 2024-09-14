
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

interface SendMail {
    (to: string, event: string, text: string): void;
}

export const sendMail: SendMail = async (to, event, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        }
    });


    const mailOptions = {
        from: `"${event.toUpperCase}" ${process.env.MAIL_USERNAME}`,
        to: to,
        subject: `Welcome to ${event.toUpperCase()}`,
        html: text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("error", error)
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}


export const generatePassword = async () => {
    var length = 5,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}
