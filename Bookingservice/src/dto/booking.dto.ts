// userId/userEmail come from the JWT and the amount from the held rooms, never the body.
export type CreateBookingDTO = {
    hotelId: number;
    roomCategoryId: number;
    totalGuests: number;
    checkIn: string;  // YYYY-MM-DD
    checkOut: string; // YYYY-MM-DD, exclusive
}
