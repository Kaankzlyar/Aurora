import { http } from "../api/http";

export type OrderItem = { productId:number; productName:string; productImagePath?:string|null; unitPrice:number; quantity:number; lineTotal:number };
export type Order = { id:number; status:number; subtotal:number; shippingFee:number; grandTotal:number; createdAt:string; items:OrderItem[] };

export const checkout = (t:string, body:{ addressId:number; cardId:number; note?:string }) =>
  http<Order>("/api/orders/checkout", { method:"POST", body:JSON.stringify(body) }, t);

export const getMyOrders = (t:string) => http<Order[]>("/api/orders", {}, t);
export const getOrder    = (t:string, id:number) => http<Order>(`/api/orders/${id}`, {}, t);
