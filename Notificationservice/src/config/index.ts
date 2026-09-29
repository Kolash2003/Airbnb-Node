// This file contains all the basic configuration logic for the app server to work
import dotenv from 'dotenv';

type ServerConfig = {
    PORT: number,
    REDIS_URL: string,
    MAIL_PASS: string,
    MAIL_USER: string,
}

function loadEnv() {
    dotenv.config();
    console.log(`Environment variables loaded`);
}

loadEnv();

// Fail at boot instead of silently dialing localhost when the platform didn't inject it.
if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is not set — add it to this service's variables and redeploy");
}

export const serverConfig: ServerConfig = {
    PORT: Number(process.env.PORT) || 3001,
    REDIS_URL: process.env.REDIS_URL,
    MAIL_PASS: process.env.MAIL_PASS || '',
    MAIL_USER: process.env.MAIL_USER || '',
};
