import { http } from "../api/http";

export type CartItem = {
  productId:number; name:string; price:number;
  imagePath?: string | null; quantity:number; lineTotal:number;
};
export type CartSummary = { items:CartItem[]; totalQuantity:number; subtotal:number };

export const getCart        = (t:string) => http<CartSummary>("/api/cart", {}, t);
export const addToCart      = (t:string, productId:number, quantity=1) =>
  http<void>("/api/cart/items", { method:"POST", body: JSON.stringify({ productId, quantity }) }, t);
export const updateCartItem = (t:string, productId:number, quantity:number) =>
  http<void>(`/api/cart/items/${productId}`, { method:"PUT", body: JSON.stringify({ quantity }) }, t);
export const removeFromCart = (t:string, productId:number) =>
  http<void>(`/api/cart/items/${productId}`, { method:"DELETE" }, t);
export const clearCart      = (t:string) => http<void>("/api/cart", { method:"DELETE" }, t);
