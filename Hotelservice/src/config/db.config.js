const dotenv = require('dotenv');
dotenv.config();

const config = {
  development: {
    username: 'root',
    password: 'aneesh123',
    database: 'airbnb_dev',
    host: '127.0.0.1',
    dialect: 'mysql', // 'mysql'
  }
}

module.exports = config;