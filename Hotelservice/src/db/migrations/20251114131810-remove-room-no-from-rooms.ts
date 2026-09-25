import { QueryInterface } from "sequelize"
module.exports = {
  async up (queryInterface: QueryInterface) {
    // room_no was not included in the PostgreSQL create-rooms-table migration.
    // This migration is a no-op on PostgreSQL.
    const tableDescription = await queryInterface.describeTable('rooms');
    if ('room_no' in tableDescription) {
      await queryInterface.sequelize.query(`
          ALTER TABLE rooms DROP COLUMN room_no;
        `);
    }
  },

  async down (queryInterface: QueryInterface) {
    const tableDescription = await queryInterface.describeTable('rooms');
    if (!('room_no' in tableDescription)) {
      await queryInterface.sequelize.query(`
          ALTER TABLE rooms ADD COLUMN room_no INT NOT NULL DEFAULT 0;
        `);
    }
  }
};
