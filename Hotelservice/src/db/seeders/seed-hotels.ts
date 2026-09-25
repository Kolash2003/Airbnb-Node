/**
 * Dummy Data Seed Script for Hotels
 *
 * Run with:  npx ts-node src/db/seeders/seed-hotels.ts
 *
 * This script inserts dummy hotels, room categories and rooms so that the
 * application can be tested end-to-end.  It is safe to re-run – it checks for
 * existing records before inserting.
 */

import * as dotenv from 'dotenv';
dotenv.config();

import sequelize from '../models/sequelize';
import Hotel from '../models/hotel';
import RoomCategory, { RoomType } from '../models/roomCategory';
import Room from '../models/room';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

// ---------------------------------------------------------------------------
// Seed data definition
// ---------------------------------------------------------------------------

const HOTELS: Array<{
  name: string;
  address: string;
  location: string;
  imageUrl: string;
  rating: number;
  ratingCount: number;
  price: number;
  categories: Array<{
    roomType: RoomType;
    price: number;
    roomCount: number;
  }>;
}> = [
  {
    name: 'The Grand Azure',
    address: '12 Marine Drive, Colaba',
    location: 'Mumbai',
    imageUrl:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
    rating: 5,
    ratingCount: 312,
    price: 8500,
    categories: [
      { roomType: RoomType.SINGLE, price: 5000, roomCount: 10 },
      { roomType: RoomType.DOUBLE, price: 8500, roomCount: 12 },
      { roomType: RoomType.SUITE,  price: 22000, roomCount: 4 },
    ],
  },
  {
    name: 'Lakeview Retreat',
    address: '7 Mall Road, Near Naini Lake',
    location: 'Nainital',
    imageUrl:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80',
    rating: 4,
    ratingCount: 198,
    price: 4200,
    categories: [
      { roomType: RoomType.SINGLE, price: 2500, roomCount: 8 },
      { roomType: RoomType.DOUBLE, price: 4200, roomCount: 10 },
      { roomType: RoomType.FAMILY, price: 6800, roomCount: 6 },
    ],
  },
  {
    name: 'Rajwada Palace Hotel',
    address: 'Sardar Patel Marg, Civil Lines',
    location: 'Jaipur',
    imageUrl:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80',
    rating: 5,
    ratingCount: 445,
    price: 12000,
    categories: [
      { roomType: RoomType.DOUBLE,  price: 7000, roomCount: 15 },
      { roomType: RoomType.DELUXE,  price: 12000, roomCount: 8 },
      { roomType: RoomType.SUITE,   price: 28000, roomCount: 3 },
    ],
  },
  {
    name: 'Backwater Bliss',
    address: '45 Kumarakom Road, Vembanad Lake Shore',
    location: 'Kerala',
    imageUrl:
      'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1200&q=80',
    rating: 4,
    ratingCount: 276,
    price: 5500,
    categories: [
      { roomType: RoomType.SINGLE, price: 3200, roomCount: 6 },
      { roomType: RoomType.DOUBLE, price: 5500, roomCount: 12 },
      { roomType: RoomType.DELUXE, price: 9500, roomCount: 4 },
    ],
  },
  {
    name: 'The Himalayan Hideaway',
    address: 'Cart Road, Near Mall Road',
    location: 'Shimla',
    imageUrl:
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&q=80',
    rating: 4,
    ratingCount: 134,
    price: 3800,
    categories: [
      { roomType: RoomType.SINGLE, price: 2200, roomCount: 8 },
      { roomType: RoomType.DOUBLE, price: 3800, roomCount: 10 },
      { roomType: RoomType.FAMILY, price: 5900, roomCount: 5 },
    ],
  },
  {
    name: 'Urban Oasis Bengaluru',
    address: 'MG Road, Shivaji Nagar',
    location: 'Bengaluru',
    imageUrl:
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80',
    rating: 4,
    ratingCount: 389,
    price: 6200,
    categories: [
      { roomType: RoomType.SINGLE, price: 3800, roomCount: 12 },
      { roomType: RoomType.DOUBLE, price: 6200, roomCount: 14 },
      { roomType: RoomType.SUITE,  price: 18000, roomCount: 3 },
    ],
  },
  {
    name: 'Desert Dunes Resort',
    address: 'Sam Sand Dunes Road, Thar Desert',
    location: 'Jaisalmer',
    imageUrl:
      'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=1200&q=80',
    rating: 5,
    ratingCount: 521,
    price: 9800,
    categories: [
      { roomType: RoomType.DOUBLE,  price: 5500, roomCount: 10 },
      { roomType: RoomType.DELUXE,  price: 9800, roomCount: 6 },
      { roomType: RoomType.SUITE,   price: 24000, roomCount: 2 },
    ],
  },
  {
    name: 'Seaside Serenity Goa',
    address: 'Calangute Beach Road, North Goa',
    location: 'Goa',
    imageUrl:
      'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=1200&q=80',
    rating: 4,
    ratingCount: 602,
    price: 7200,
    categories: [
      { roomType: RoomType.SINGLE, price: 4000, roomCount: 10 },
      { roomType: RoomType.DOUBLE, price: 7200, roomCount: 16 },
      { roomType: RoomType.FAMILY, price: 11000, roomCount: 6 },
      { roomType: RoomType.SUITE,  price: 20000, roomCount: 3 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function seed() {
  await sequelize.authenticate();
  console.log('✅  Database connection established.');

  // Run migration for image_url if column doesn't exist yet
  try {
    await sequelize.query(
      `ALTER TABLE hotels ADD COLUMN image_url VARCHAR(2048) NULL DEFAULT NULL;`
    );
    console.log('✅  image_url column added to hotels table.');
  } catch (err: any) {
    if (
      err.original?.code === 'ER_DUP_FIELDNAME' ||
      (err.message && err.message.includes('Duplicate column name'))
    ) {
      console.log('ℹ️   image_url column already exists – skipping ALTER.');
    } else {
      throw err;
    }
  }

  // Sync models (no force – keeps existing data)
  await Hotel.sync();
  await RoomCategory.sync();
  await Room.sync();

  for (const hotelData of HOTELS) {
    // Check for existing hotel by name + location to avoid duplicates
    const [hotel, created] = await Hotel.findOrCreate({
      where: { name: hotelData.name, location: hotelData.location },
      defaults: {
        name: hotelData.name,
        address: hotelData.address,
        location: hotelData.location,
        rating: hotelData.rating,
        ratingCount: hotelData.ratingCount,
        // @ts-ignore – price was added via migration; model type may not reflect it yet
        price: hotelData.price,
        // @ts-ignore – imageUrl added via migration
        imageUrl: hotelData.imageUrl,
      },
    });

    if (!created) {
      // Update imageUrl on existing record if null
      await sequelize.query(
        `UPDATE hotels SET image_url = :imageUrl, price = :price WHERE id = :id`,
        {
          replacements: {
            imageUrl: hotelData.imageUrl,
            price: hotelData.price,
            id: hotel.id,
          },
        }
      );
      console.log(`ℹ️   Hotel "${hotelData.name}" already exists – updated image_url & price.`);
    } else {
      console.log(`🏨  Created hotel: ${hotelData.name} (${hotelData.location})`);
    }

    // Create room categories for this hotel
    for (const cat of hotelData.categories) {
      const [category, catCreated] = await RoomCategory.findOrCreate({
        where: { hotelId: hotel.id, roomType: cat.roomType },
        defaults: {
          hotelId: hotel.id,
          price: cat.price,
          roomType: cat.roomType,
          roomCount: cat.roomCount,
        },
      });

      if (catCreated) {
        console.log(
          `  🛏️  Created RoomCategory: ${cat.roomType} @ Rs.${cat.price} (${cat.roomCount} rooms)`
        );
      }

      // Create individual room records with availability spread over next 60 days
      const existingRooms = await Room.count({ where: { hotelId: hotel.id, roomCategoryId: category.id } });
      if (existingRooms === 0) {
        const roomsToCreate = [];
        for (let i = 0; i < cat.roomCount; i++) {
          // Each room available from a different day in the next 60 days
          roomsToCreate.push({
            hotelId: hotel.id,
            roomCategoryId: category.id,
            dateofAvailability: daysFromNow(i * 2), // spread availability
            price: cat.price,
          });
        }
        await Room.bulkCreate(roomsToCreate);
        console.log(`      ✅  Inserted ${roomsToCreate.length} room records.`);
      } else {
        console.log(`      ℹ️  Rooms already exist for ${cat.roomType} – skipping.`);
      }
    }
  }

  console.log('\n🎉  Seeding complete! Total hotels seeded:', HOTELS.length);
  await sequelize.close();
}

seed().catch((err) => {
  console.error('❌  Seeding failed:', err);
  process.exit(1);
});
