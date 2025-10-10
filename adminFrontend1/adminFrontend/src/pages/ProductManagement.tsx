import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import Beams from '../components/Beams';
import GradientText from "@/components/GradientText";
import { Trash2, Edit, Plus, Search, Image as ImageIcon } from "lucide-react";
import ProductForm from "../components/ProductForm";

interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  imagePath?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedBrand]);

  const fetchInitialData = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        api.get("/api/categories"),
        api.get("/api/brands")
      ]);
      setCategories(categoriesRes.data);
      setBrands(brandsRes.data);
      await fetchProducts();
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("categoryId", selectedCategory.toString());
      if (selectedBrand) params.append("brandId", selectedBrand.toString());
      params.append("pageSize", "100"); // Tüm ürünleri getir

      const response = await api.get(`/api/products?${params.toString()}`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return;

    try {
      await api.delete(`/api/products/${productId}`);
      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Ürün silinirken hata oluştu!");
    }
  };

  const handleProductSaved = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "/placeholder-product.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${api.defaults.baseURL}${imagePath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Beams Background */}
      <div className="fixed inset-0 z-0">
        <Beams
          beamWidth={3}
          beamHeight={45}
          beamNumber={35}
          lightColor="#D4AF37"
          speed={2.5}
          noiseIntensity={1.95}
          scale={0.2}
          rotation={20}
        />
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen bg-neutral-950/40 text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-800/50 p-6 bg-neutral-950/30 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <GradientText
            colors={["#C48913", "#D4AF37", "#C48913"]}
            animationSpeed={3}
            showBorder={false}
            className="text-3xl font-['Cinzel']"
          >
            Ürün Yönetimi
          </GradientText>

          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-[#C48913] hover:text-[#C48913]  font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Ürün Ekle
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/"}
              className="border-[#C48913] text-[#C48913] hover:text-[#C48913]"
            >
              Geri Dön
            </Button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="p-6 border-b border-neutral-800/50 bg-neutral-950/20 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-neutral-900 border-neutral-700 text-white"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Brand Filter */}
          <select
            value={selectedBrand || ""}
            onChange={(e) => setSelectedBrand(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
          >
            <option value="">Tüm Markalar</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCategory(null);
              setSelectedBrand(null);
              setSearchTerm("");
            }}
            className="border-neutral-600 text-neutral-300 hover:text-[#c40000]"
          >
            Filtreleri Temizle
          </Button>
        </div>
      </div>
      

      {/* Products Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <Card key={product.id} className="bg-neutral-900/20 backdrop-blur-sm border border-neutral-700/30 hover:bg-neutral-900/30 transition-all duration-300">
              <CardHeader className="p-4">
                <div className="aspect-square relative bg-neutral-800/40 backdrop-blur-sm rounded-lg overflow-hidden mb-3">
                    {product.imagePath ? (
                      <img
                        src={getImageUrl(product.imagePath)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-product.png";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-neutral-600" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg text-white truncate">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-[#C48913]">
                      ₺{product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {product.categoryName}
                      </Badge>
                      <Badge variant="default" className="text-xs">
                        {product.brandName}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingProduct(product)}
                        className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="border-red-600 text-red-400 hover:bg-red-600/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-neutral-400 text-lg">Ürün bulunamadı</div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="mt-4 bg-[#C48913] hover:bg-[#D4AF37] text-black"
            >
              İlk Ürünü Ekle
            </Button>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {(showAddForm || editingProduct) && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          brands={brands}
          onSave={handleProductSaved}
          onCancel={() => {
            setShowAddForm(false);
            setEditingProduct(null);
          }}
        />
      )}
      </div>
    </div>
  );
}