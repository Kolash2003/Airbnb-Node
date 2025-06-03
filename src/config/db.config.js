const dotenv = require('dotenv');
dotenv.config();

const config = {
  development: {
    username: process.env.DB_USER, // 'root'
    password: process.env.DB_PASSWORD, // 'aneesh123'
    database: process.env.DB_NAME, // 'airbnb_dev'
    host: process.env.DB_HOST, // '127.0.0.1'
    dialect: 'mysql', // 'mysql'
  }
}

module.exports = config;