export type CreateBookingDTO = {
    userId: number;
    hotelId: number;
    totalGuests: number;
    bookingAmount: number;
    userEmail: string;
    roomCategoryId?: number;
}