import { QueryInterface } from "sequelize";

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.sequelize.query(`DROP EXTENSION IF EXISTS pg_trgm;`);
  },
};