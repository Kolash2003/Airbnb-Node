// This file contains all the basic configuration logic for the app server to work
import dotenv from 'dotenv';

type ServerConfig = {
    PORT: number,
    REDIS_URL: string,
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
};

export const dbConfig: dbConfig = {
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: Number(process.env.DB_PORT) || 5432,
    DB_USERNAME: process.env.DB_USERNAME || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_DATABASE: process.env.DB_DATABASE || 'airbnb_dev'
};
