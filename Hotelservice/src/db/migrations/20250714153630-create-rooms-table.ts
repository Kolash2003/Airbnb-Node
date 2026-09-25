import { QueryInterface } from "sequelize";

module.exports = {
  async up (queryInterface: QueryInterface) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS rooms(
        id SERIAL PRIMARY KEY,
        room_category_id INT,
        hotels_id INT,
        date_of_availability DATE NOT NULL,
        booking_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP DEFAULT NULL
      );

      CREATE TRIGGER rooms_updated_at
          BEFORE UPDATE ON rooms
          FOR EACH ROW
          EXECUTE PROCEDURE update_updated_at_column();
    `);
  },

  async down (queryInterface: QueryInterface) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS rooms_updated_at ON rooms;
      DROP TABLE IF EXISTS rooms;
    `);
  }
};
