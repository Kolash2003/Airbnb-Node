import { ApiError, request } from "./client";
import type { CreateHotelInput, Hotel, HotelWithCategories, RoomGenerationInput } from "./types";

export interface ListHotelsParams {
  q?: string;
  checkin?: string;
  checkout?: string;
  guests?: number;
}

export async function listHotels(params: ListHotelsParams = {}): Promise<Hotel[]> {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.checkin) query.set("checkin", params.checkin);
  if (params.checkout) query.set("checkout", params.checkout);
  if (params.guests) query.set("guests", String(params.guests));
  const qs = query.toString();

  try {
    return await request<Hotel[]>("hotel", `/hotels${qs ? `?${qs}` : ""}`);
  } catch (err) {
    // Backend gap §7.9: GET /hotels throws 404 when the table is empty, so an
    // empty list is indistinguishable from a real error. Treat a 404 on the
    // *collection* as "no hotels yet".
    if (err instanceof ApiError && err.code === "not-found") return [];
    throw err;
  }
}

export function getHotel(id: number | string): Promise<HotelWithCategories> {
  return request<HotelWithCategories>("hotel", `/hotels/${id}`);
}

export function createHotel(input: CreateHotelInput): Promise<Hotel> {
  return request<Hotel>("hotel", "/hotels", { method: "POST", body: input });
}

export function deleteHotel(id: number | string): Promise<unknown> {
  return request<unknown>("hotel", `/hotels/${id}`, { method: "DELETE" });
}

/** Fire-and-forget: the service returns data: {} with no job id, so the UI
 *  can only report "queued" (backend gap §7.2). */
export function queueRoomGeneration(input: RoomGenerationInput): Promise<unknown> {
  return request<unknown>("hotel", "/room-generation", {
    method: "POST",
    body: input,
  });
}
