import nodemailer from 'nodemailer';
import { serverConfig } from '.';
// also install npm i --save-dev @types/nodemailer to run this

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: serverConfig.MAIL_USER,
        pass: serverConfig.MAIL_PASS
    }
}); // this obj is res ponsible for finally sending emails

export default transporter;
