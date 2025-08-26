import { http } from "../api/http";

export type Address = {
  id: number; title: string; country: string; city: string; district: string;
  neighborhood: string; street: string; buildingNo: string; apartmentNo?: string | null;
  postalCode?: string | null; line2?: string | null; contactPhone?: string | null;
};

export type CreateAddress = Omit<Address, "id">;

export const getMyAddresses = (t: string) => http<Address[]>("/api/addresses", {}, t);
export const createAddress  = (t: string, body: CreateAddress) =>
  http<Address>("/api/addresses", { method: "POST", body: JSON.stringify(body) }, t);
export const updateAddress  = (t: string, id: number, body: CreateAddress) =>
  http<void>(`/api/addresses/${id}`, { method: "PUT", body: JSON.stringify(body) }, t);
export const deleteAddress  = (t: string, id: number) =>
  http<void>(`/api/addresses/${id}`, { method: "DELETE" }, t);
