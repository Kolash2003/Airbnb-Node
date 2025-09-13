import { QueryInterface } from "sequelize";

module.exports = {
  async up(queryInterface: QueryInterface) {
    // Rename deleted_At → deleted_at, or create it if needed
    await queryInterface.sequelize.query(`
      ALTER TABLE hotels 
      CHANGE deleted_At deleted_at DATETIME NULL;
    `);
  },

  async down(queryInterface: QueryInterface) {
    // Rollback: rename deleted_at back to deleted_At
    await queryInterface.sequelize.query(`
      ALTER TABLE hotels 
      CHANGE deleted_at deleted_At DATETIME NULL;
    `);
  },
};
