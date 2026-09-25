import { QueryInterface } from "sequelize";

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.sequelize.query(`
        ALTER TABLE hotels
        ADD COLUMN image_url VARCHAR(2048) NULL DEFAULT NULL;
      `);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.sequelize.query(`
        ALTER TABLE hotels DROP COLUMN image_url;
      `);
  },
};
