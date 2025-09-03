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
export const getSpecialTodayProducts = async (p?: {page?:number; pageSize?:number}) => {
  console.log('[Catalog] getSpecialTodayProducts çağrıldı, parametreler:', p);
  
  try {
    // Try to get from API first
    const q = new URLSearchParams();
    if (p?.page) q.append("page", String(p.page));
    if (p?.pageSize) q.append("pageSize", String(p.pageSize));
    const qs = q.toString();
    const url = `/api/products/special-today${qs ? `?${qs}` : ""}`;
    console.log('[Catalog] Special Today URL:', url);
    
    return await http<Product[]>(url);
  } catch (error) {
    console.log('[Catalog] API failed, generating special today products locally:', error);
    
    // Fallback: Generate special today products locally
    try {
      // Get all products first
      const allProducts = await getProducts({ pageSize: 100 });
      
      // Generate today's special products using algorithm
      const specialProducts = generateTodaysSpecialProducts(allProducts);
      
      console.log('[Catalog] Generated special today products:', specialProducts.length);
      return specialProducts;
    } catch (fallbackError) {
      console.error('[Catalog] Fallback also failed, creating mock products:', fallbackError);
      
      // Last resort: Create some mock special products
      return generateMockSpecialProducts();
    }
  }
};

// Generate mock special products as last resort
const generateMockSpecialProducts = (): Product[] => {
  const mockProducts: Product[] = [
    {
      id: 1,
      name: "Special Deal 1",
      price: 99.99,
      originalPrice: 129.99,
      discountPercentage: 23,
      imagePath: "https://via.placeholder.com/300x300?text=Special+Deal+1",
      categoryId: 1,
      categoryName: "Electronics",
      brandId: 1,
      brandName: "Special Brand",
      gender: "unisex",
      createdAt: new Date().toISOString(),
      isOnDiscount: true,
      isNewArrival: false,
    },
    {
      id: 2,
      name: "Special Deal 2",
      price: 79.99,
      originalPrice: 99.99,
      discountPercentage: 20,
      imagePath: "https://via.placeholder.com/300x300?text=Special+Deal+2",
      categoryId: 2,
      categoryName: "Fashion",
      brandId: 2,
      brandName: "Special Brand",
      gender: "unisex",
      createdAt: new Date().toISOString(),
      isOnDiscount: true,
      isNewArrival: false,
    },
    {
      id: 3,
      name: "Special Deal 3",
      price: 149.99,
      originalPrice: 199.99,
      discountPercentage: 25,
      imagePath: "https://via.placeholder.com/300x300?text=Special+Deal+3",
      categoryId: 3,
      categoryName: "Home",
      brandId: 3,
      brandName: "Special Brand",
      gender: "unisex",
      createdAt: new Date().toISOString(),
      isOnDiscount: true,
      isNewArrival: false,
    },
    {
      id: 4,
      name: "Special Deal 4",
      price: 59.99,
      originalPrice: 79.99,
      discountPercentage: 25,
      imagePath: "https://via.placeholder.com/300x300?text=Special+Deal+4",
      categoryId: 4,
      categoryName: "Sports",
      brandId: 4,
      brandName: "Special Brand",
      gender: "unisex",
      createdAt: new Date().toISOString(),
      isOnDiscount: true,
      isNewArrival: false,
    },
    {
      id: 5,
      name: "Special Deal 5",
      price: 199.99,
      originalPrice: 249.99,
      discountPercentage: 20,
      imagePath: "https://via.placeholder.com/300x300?text=Special+Deal+5",
      categoryId: 5,
      categoryName: "Beauty",
      brandId: 5,
      brandName: "Special Brand",
      gender: "unisex",
      createdAt: new Date().toISOString(),
      isOnDiscount: true,
      isNewArrival: false,
    },
  ];

  return mockProducts;
};

// Algorithm to generate today's special products
const generateTodaysSpecialProducts = (allProducts: Product[]): Product[] => {
  if (!allProducts || allProducts.length === 0) {
    console.log('[Catalog] No products available for special today algorithm');
    return [];
  }

  console.log('[Catalog] Starting special today algorithm with', allProducts.length, 'products');

  // Create a deterministic seed based on today's date
  // This ensures the same products are special for the entire day
  const today = new Date();
  const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
  const seed = generateSeedFromDate(dateString);
  
  console.log('[Catalog] Using date seed:', dateString, 'seed:', seed);

  // Create a seeded random number generator
  let randomSeed = seed;
  const seededRandom = () => {
    randomSeed = (randomSeed * 9301 + 49297) % 233280;
    return randomSeed / 233280;
  };

  // Filter products that can be on special (exclude already discounted items if needed)
  const eligibleProducts = allProducts.filter(product => 
    product.price > 0 && 
    product.name && 
    product.brandName && 
    product.price >= 10 // Minimum price to make discounts meaningful
  );

  console.log('[Catalog] Eligible products for special:', eligibleProducts.length);

  if (eligibleProducts.length === 0) {
    console.log('[Catalog] No eligible products found');
    return [];
  }

  // Randomly select 5 products (or fewer if not enough products)
  const numberOfSpecialProducts = Math.min(5, eligibleProducts.length);
  const selectedProducts: Product[] = [];
  const usedIndices = new Set<number>();

  // Select unique products
  while (selectedProducts.length < numberOfSpecialProducts) {
    const randomIndex = Math.floor(seededRandom() * eligibleProducts.length);
    
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      const selectedProduct = { ...eligibleProducts[randomIndex] };
      
      // Apply random discount (5% to 20%)
      const discountPercentage = Math.floor(seededRandom() * 16) + 5; // 5-20%
      const originalPrice = selectedProduct.price;
      const discountedPrice = originalPrice * (1 - discountPercentage / 100);
      
      // Update product with discount information
      selectedProduct.originalPrice = originalPrice;
      selectedProduct.price = Math.round(discountedPrice * 100) / 100; // Round to 2 decimal places
      selectedProduct.discountPercentage = discountPercentage;
      selectedProduct.isOnDiscount = true;
      
      console.log(`[Catalog] Product "${selectedProduct.name}" - Original: $${originalPrice}, Discount: ${discountPercentage}%, New Price: $${selectedProduct.price}`);
      
      selectedProducts.push(selectedProduct);
    }
  }

  console.log('[Catalog] Generated', selectedProducts.length, 'special products for today');
  return selectedProducts;
};

// Generate a numeric seed from date string
const generateSeedFromDate = (dateString: string): number => {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
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
