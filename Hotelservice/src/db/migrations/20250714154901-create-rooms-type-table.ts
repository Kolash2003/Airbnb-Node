import { QueryInterface } from "sequelize";

module.exports = {
  async up (queryInterface: QueryInterface) {
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_room_categories_room_type') THEN
          CREATE TYPE "enum_room_categories_room_type" AS ENUM('SINGLE', 'DOUBLE', 'FAMILY', 'DELUXE', 'SUITE');
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS room_categories(
        id SERIAL PRIMARY KEY,
        room_type "enum_room_categories_room_type" NOT NULL,
        price INT NOT NULL,
        hotel_id INT,
        room_count INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP DEFAULT NULL
      );

      CREATE TRIGGER room_categories_updated_at
          BEFORE UPDATE ON room_categories
          FOR EACH ROW
          EXECUTE PROCEDURE update_updated_at_column();
    `);
  },

  async down (queryInterface: QueryInterface) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS room_categories_updated_at ON room_categories;
      DROP TABLE IF EXISTS room_categories;
      DROP TYPE IF EXISTS "enum_room_categories_room_type";
    `);
  }
};
