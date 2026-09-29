import { QueryInterface } from "sequelize";

module.exports = {
  async up (queryInterface: QueryInterface) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS favorites(
        user_id INT NOT NULL,
        hotel_id INT NOT NULL REFERENCES hotels(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, hotel_id)
      );
    `);
  },

  async down (queryInterface: QueryInterface) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS favorites;`);
  }
};
