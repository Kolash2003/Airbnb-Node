import Redis from "ioredis";
import { serverConfig } from ".";


// Singleton pattern to connect to Redis // Study about closures
function connectToRedis() {
    try {

        let connection: Redis;

        return () => {
            if(!connection) {
                // Layerbase routes connections by TLS SNI, so the servername
                // must be set to the Redis hostname.
                const { hostname } = new URL(serverConfig.REDIS_URL);
                connection = new Redis(serverConfig.REDIS_URL, {
                    maxRetriesPerRequest: null, // Disable automatic reconnection
                    tls: { servername: hostname },
                });
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
