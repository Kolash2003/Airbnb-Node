import IORedis from 'ioredis';
import Redlock from 'redlock';
import { serverConfig } from '.';
import Redis from 'ioredis';

// export const redisClient = new IORedis(serverConfig.REDIS_SERVER_URL);

function connectToRedis() {
    try {

        let connection: Redis;

        return () => {
            if(!connection) {
                connection = new IORedis(serverConfig.REDIS_SERVER_URL);
                return connection;
            }

            return connection;
        }

    } catch (error) {
        console.log('Error connection to Redis', error);
        throw error;
    }
}

export const getRedisConnObject = connectToRedis();


// small default values you can put 
export const redlock = new Redlock([getRedisConnObject()], {
    driftFactor: 0.01, // time in ms
    retryCount: 10, 
    retryDelay: 200, // time in ms
    retryJitter: 200 // time in ms
});