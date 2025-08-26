import { http } from "../api/http";

export type Card = { id:number; holderName:string; brand:string; last4:string; expMonth:number; expYear:number };
export type CreateCard = { holderName:string; pan:string; expMonth:number; expYear:number; cvv:string };

export const getMyCards = (t:string) => http<Card[]>("/api/cards", {}, t);
export const createCard = (t:string, body:CreateCard) =>
  http<Card>("/api/cards", { method:"POST", body:JSON.stringify(body) }, t);
export const deleteCard = (t:string, id:number) =>
  http<void>(`/api/cards/${id}`, { method:"DELETE" }, t);
