import { Sequelize } from "sequelize";
import { dbConfig } from "../../config";

const sequelize = new Sequelize({
    dialect: "mysql",
    host: dbConfig.DB_HOST,
    port: dbConfig.DB_PORT,
    username: dbConfig.DB_USERNAME,
    password: dbConfig.DB_PASSWORD,
    database: dbConfig.DB_DATABASE,
    dialectOptions: {
        ssl: {
            minVersion: "TLSv1.2",
            rejectUnauthorized: true,
        },
    },
    logging: true,
});

export default sequelize;
