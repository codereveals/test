import 'dotenv/config';
import nodemailer from 'nodemailer';

if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
    throw new Error("Missing EMAIL or EMAIL_PASS in environment variables.");
}

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
    },
});


const sendEmail = async (to, subject, text, html) => {
    if (!to) {
        throw new Error("No recipients defined");
    }

    const info = await transporter.sendMail({
        from: process.env.EMAIL,
        to, // Ensure `to` is defined here.
        subject,
        text,
        html,
    });

    return { success: true, messageId: info.messageId };
};

export default sendEmail;
