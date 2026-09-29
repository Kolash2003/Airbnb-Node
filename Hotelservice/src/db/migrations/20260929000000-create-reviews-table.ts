import { QueryInterface } from "sequelize";

module.exports = {
  async up (queryInterface: QueryInterface) {
    // One review per user per hotel; the unique index is what enforces it.
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS reviews(
        id SERIAL PRIMARY KEY,
        hotel_id INT NOT NULL REFERENCES hotels(id),
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (hotel_id, user_id)
      );
    `);
  },

  async down (queryInterface: QueryInterface) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS reviews;`);
  }
};
