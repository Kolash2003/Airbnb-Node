// This file contains all the basic configuration logic for the app server to work
import dotenv from 'dotenv';

type ServerConfig = {
    PORT: number,
    REDIS_SERVER_URL: string,
    LOCK_TTL: number,
    JWT_SECRET: string,
    INTERNAL_API_KEY: string,
    HOTEL_SERVICE_URL: string,
}

function loadEnv() {
    dotenv.config();
    console.log(`Environment variables loaded`);
}

loadEnv();

export const serverConfig: ServerConfig = {
    PORT: Number(process.env.PORT) || 3001,
    REDIS_SERVER_URL: process.env.REDIS_SERVER_URL || 'redis://localhost:6379',
    LOCK_TTL: Number(process.env.LOCK_TTL) || 5000,
    // Must match AuthinGo's JWT_SECRET; no default so a missing value fails closed.
    JWT_SECRET: process.env.JWT_SECRET || '',
    // Shared with Hotelservice for the internal room reserve/release calls.
    INTERNAL_API_KEY: process.env.INTERNAL_API_KEY || '',
    HOTEL_SERVICE_URL: process.env.HOTEL_SERVICE_URL || 'http://localhost:3000',
};