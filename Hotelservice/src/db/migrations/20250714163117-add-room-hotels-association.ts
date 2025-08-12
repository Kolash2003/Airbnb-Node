import { QueryInterface } from "sequelize";
module.exports = {
  async up (queryInterface: QueryInterface) {
    await queryInterface.addConstraint('rooms', {
      type: 'foreign key',
      name: 'room_hotel_fkey_constraint',
      fields: ['hotels_id'],
      references: {
        table: 'hotels',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down (queryInterface: QueryInterface) {
    await queryInterface.removeConstraint(
      'rooms',
      'room_hotel_fkey_constraint'
    );
  }
};
