import { request } from "./client";
import type { Permission, Role, User } from "./types";

/** Raw Go payload: capitalized keys, bcrypt hash included. */
interface RawUser {
  Id: number;
  Username: string;
  Email: string;
  Password?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}

function normalizeUser(raw: RawUser): User {
  return {
    id: raw.Id,
    username: raw.Username,
    email: raw.Email,
    createdAt: raw.CreatedAt,
    updatedAt: raw.UpdatedAt,
    // /profile carries no roles (backend gap); callers fill this in when known.
    roles: [],
  };
}

export async function signup(input: {
  username: string;
  email: string;
  password: string;
}): Promise<null> {
  return request<null>("auth", "/signup", { method: "POST", body: input, auth: false });
}

/** Login returns the bare JWT string as `data` (no object wrapper). */
export function login(input: { email: string; password: string }): Promise<string> {
  return request<string>("auth", "/login", { method: "POST", body: input, auth: false });
}

export async function fetchProfile(): Promise<User> {
  const raw = await request<RawUser>("auth", "/profile");
  return normalizeUser(raw);
}

// --- Roles & permissions (admin surface) ----------------------------------

export function listRoles(): Promise<Role[]> {
  return request<Role[]>("auth", "/roles");
}

export function createRole(input: { name: string; description?: string }): Promise<Role> {
  return request<Role>("auth", "/roles", { method: "POST", body: input });
}

export function deleteRole(id: number | string): Promise<unknown> {
  return request<unknown>("auth", `/roles/${id}`, { method: "DELETE" });
}

export function listPermissions(roleId: number | string): Promise<Permission[]> {
  return request<Permission[]>("auth", `/roles/${roleId}/permissions`);
}

export function assignRole(userId: number | string, roleId: number | string): Promise<unknown> {
  return request<unknown>("auth", `/users/${userId}/roles/${roleId}`, { method: "POST" });
}
