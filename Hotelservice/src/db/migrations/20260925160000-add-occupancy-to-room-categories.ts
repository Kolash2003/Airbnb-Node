import { QueryInterface } from "sequelize";

module.exports = {
  async up(queryInterface: QueryInterface) {
    const tableDescription = await queryInterface.describeTable('room_categories');
    if (!('occupancy' in tableDescription)) {
      await queryInterface.sequelize.query(`
        ALTER TABLE room_categories ADD COLUMN occupancy INT NOT NULL DEFAULT 1;
      `);
    }
  },

  async down(queryInterface: QueryInterface) {
    const tableDescription = await queryInterface.describeTable('room_categories');
    if ('occupancy' in tableDescription) {
      await queryInterface.sequelize.query(`
        ALTER TABLE room_categories DROP COLUMN occupancy;
      `);
    }
  },
};