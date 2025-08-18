import { http } from "../api/http";

export type Brand = { id:number; name:string; slug?:string };
export type Category = { id:number; name:string; slug?:string };
export type Product = {
  id:number; 
  name:string;
  price:number;
  categoryId:number; 
  categoryName:string;
  brandId:number; 
  brandName:string;
  imagePath?: string | null;
};

export const getBrands = () => http<Brand[]>("/api/brands");
export const getCategories = () => http<Category[]>("/api/categories");

export const getProducts = (p?: {categoryId?:number; brandId?:number; page?:number; pageSize?:number}) => {
  const q = new URLSearchParams();
  if (p?.categoryId) q.append("categoryId", String(p.categoryId));
  if (p?.brandId) q.append("brandId", String(p.brandId));
  if (p?.page) q.append("page", String(p.page));
  if (p?.pageSize) q.append("pageSize", String(p.pageSize));
  const qs = q.toString();
  return http<Product[]>(`/api/products${qs ? `?${qs}` : ""}`);
};
