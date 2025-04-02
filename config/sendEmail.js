import VerificationEmail from "../utils/verifyEmailTemplate.js";
import sendEmail from "./emailService.js";


const sendEmailFun = async (to, subject, text, html) => {
    console.log("Recipient:", to); // Debug log
    const result = await sendEmail(to, subject, text, VerificationEmail(html));

    if (result.success) {
        return true;
    } else {
        console.error("Failed to send email:", result.error);
        return false;
    }
};



export default sendEmailFun