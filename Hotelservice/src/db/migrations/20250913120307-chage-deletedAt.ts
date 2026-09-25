import { QueryInterface } from "sequelize";

module.exports = {
  async up(queryInterface: QueryInterface) {
    // PostgreSQL uses RENAME COLUMN instead of CHANGE
    await queryInterface.sequelize.query(`
      ALTER TABLE hotels 
      RENAME COLUMN "deleted_At" TO deleted_at;
    `);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE hotels 
      RENAME COLUMN deleted_at TO "deleted_At";
    `);
  },
};
