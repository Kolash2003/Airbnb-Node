// This file contains all the basic configuration logic for the app server to work
import dotenv from 'dotenv';

type ServerConfig = {
    PORT: number,
    REDIS_URL: string,
    JWT_SECRET: string,
    INTERNAL_API_KEY: string,
    AUTH_SERVICE_URL: string,
    BOOKING_SERVICE_URL: string,
}

type dbConfig = {
    DB_HOST: string,
    DB_PORT: number,
    DB_USERNAME: string,
    DB_PASSWORD: string,
    DB_DATABASE: string
}

function loadEnv() {
    dotenv.config();
    console.log(`Environment variables loaded`);
}

loadEnv();

export const serverConfig: ServerConfig = {
    PORT: Number(process.env.PORT) || 3001,
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    // Must match AuthinGo's JWT_SECRET; no default so a missing value fails closed.
    JWT_SECRET: process.env.JWT_SECRET || '',
    // Shared with Bookingservice for the internal room reserve/release calls.
    INTERNAL_API_KEY: process.env.INTERNAL_API_KEY || '',
    AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    BOOKING_SERVICE_URL: process.env.BOOKING_SERVICE_URL || 'http://localhost:3002',
};

export const dbConfig: dbConfig = {
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: Number(process.env.DB_PORT) || 5432,
    DB_USERNAME: process.env.DB_USERNAME || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_DATABASE: process.env.DB_DATABASE || 'airbnb_dev'
};
