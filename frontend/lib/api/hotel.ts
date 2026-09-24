import { ApiError, request } from "./client";
import type { CreateHotelInput, Hotel, RoomGenerationInput } from "./types";

export async function listHotels(): Promise<Hotel[]> {
  try {
    return await request<Hotel[]>("hotel", "/hotels");
  } catch (err) {
    // Backend gap §7.9: GET /hotels throws 404 when the table is empty, so an
    // empty list is indistinguishable from a real error. Treat a 404 on the
    // *collection* as "no hotels yet".
    if (err instanceof ApiError && err.code === "not-found") return [];
    throw err;
  }
}

export function getHotel(id: number | string): Promise<Hotel> {
  return request<Hotel>("hotel", `/hotels/${id}`);
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
