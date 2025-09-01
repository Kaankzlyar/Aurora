import { http } from "../api/http";

export type Brand = { id:number; name:string; slug?:string };
export type Category = { id:number; name:string; slug?:string };
export type Product = {
  id:number; 
  name:string;
  price:number;
  originalPrice?: number | null;
  discountPercentage?: number | null;
  categoryId:number; 
  categoryName:string;
  brandId:number; 
  brandName:string;
  gender: string;
  imagePath?: string | null;
  createdAt: string;
  isOnDiscount: boolean;
  isNewArrival: boolean;
};

export const getBrands = () => http<Brand[]>("/api/brands");
export const getCategories = () => http<Category[]>("/api/categories");

export const getProducts = (p?: {categoryId?:number; brandId?:number; page?:number; pageSize?:number}) => {
  console.log('[Catalog] getProducts çağrıldı, parametreler:', p);
  const q = new URLSearchParams();
  if (p?.categoryId) q.append("categoryId", String(p.categoryId));
  if (p?.brandId) q.append("brandId", String(p.brandId));
  if (p?.page) q.append("page", String(p.page));
  if (p?.pageSize) q.append("pageSize", String(p.pageSize));
  const qs = q.toString();
  const url = `/api/products${qs ? `?${qs}` : ""}`;
  console.log('[Catalog] Oluşturulan URL:', url);
  return http<Product[]>(url);
};

// Special categorized product endpoints
export const getSpecialTodayProducts = (p?: {page?:number; pageSize?:number}) => {
  console.log('[Catalog] getSpecialTodayProducts çağrıldı, parametreler:', p);
  const q = new URLSearchParams();
  if (p?.page) q.append("page", String(p.page));
  if (p?.pageSize) q.append("pageSize", String(p.pageSize));
  const qs = q.toString();
  const url = `/api/products/special-today${qs ? `?${qs}` : ""}`;
  console.log('[Catalog] Special Today URL:', url);
  return http<Product[]>(url);
};

export const getIconicSelections = (p?: {page?:number; pageSize?:number}) => {
  console.log('[Catalog] getIconicSelections çağrıldı, parametreler:', p);
  const q = new URLSearchParams();
  if (p?.page) q.append("page", String(p.page));
  if (p?.pageSize) q.append("pageSize", String(p.pageSize));
  const qs = q.toString();
  const url = `/api/products/iconic-selections${qs ? `?${qs}` : ""}`;
  console.log('[Catalog] Iconic Selections URL:', url);
  return http<Product[]>(url);
};

export const getNewArrivals = (p?: {page?:number; pageSize?:number}) => {
  console.log('[Catalog] getNewArrivals çağrıldı, parametreler:', p);
  const q = new URLSearchParams();
  if (p?.page) q.append("page", String(p.page));
  if (p?.pageSize) q.append("pageSize", String(p.pageSize));
  const qs = q.toString();
  const url = `/api/products/new-arrivals${qs ? `?${qs}` : ""}`;
  console.log('[Catalog] New Arrivals URL:', url);
  return http<Product[]>(url);
};
