import { QueryInterface } from "sequelize";

module.exports = {
  async up(queryInterface: QueryInterface) {
    const tableDescription = await queryInterface.describeTable('rooms');
    if (!('price' in tableDescription)) {
      await queryInterface.sequelize.query(`
        ALTER TABLE rooms ADD COLUMN price INT NOT NULL DEFAULT 0;
      `);
    }
  },

  async down(queryInterface: QueryInterface) {
    const tableDescription = await queryInterface.describeTable('rooms');
    if ('price' in tableDescription) {
      await queryInterface.sequelize.query(`
        ALTER TABLE rooms DROP COLUMN price;
      `);
    }
  },
};