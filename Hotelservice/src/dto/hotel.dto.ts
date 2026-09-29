export type createHotelDTO = {
    name: string;
    address: string;
    location: string;
    rating?: number;
    ratingCount?: number;
}

export type updateHotelDTO = Partial<{
    name: string;
    address: string;
    location: string;
    price: number;
    imageUrl: string | null;
}>
