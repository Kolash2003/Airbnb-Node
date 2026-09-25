import { Sequelize } from "sequelize";
import { dbConfig } from "../../config";

const sequelize = new Sequelize({
    dialect: "postgres",
    host: dbConfig.DB_HOST,
    port: dbConfig.DB_PORT,
    username: dbConfig.DB_USERNAME,
    password: dbConfig.DB_PASSWORD,
    database: dbConfig.DB_DATABASE,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false, // Neon uses a trusted CA; set true in prod with proper cert
        },
    },
    logging: true,
});

export default sequelize;
