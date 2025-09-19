import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { X, Upload, Loader2 } from "lucide-react";

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

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  brands: Brand[];
  onSave: () => void;
  onCancel: () => void;
}

export default function ProductForm({
  product,
  categories,
  brands,
  onSave,
  onCancel
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    price: product?.price?.toString() || "",
    categoryId: product?.categoryId?.toString() || "",
    brandId: product?.brandId?.toString() || "",
    imagePath: product?.imagePath || ""
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.imagePath ? getImageUrl(product.imagePath) : null
  );
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function getImageUrl(imagePath: string): string {
    if (imagePath.startsWith("http")) return imagePath;
    return `${api.defaults.baseURL}${imagePath}`;
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya türü kontrolü
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Sadece JPG, PNG veya WebP formatında resim yükleyebilirsiniz.');
      return;
    }

    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Dosya boyutu 10MB\'dan küçük olmalıdır.');
      return;
    }

    setImageFile(file);
    
    // Preview oluştur
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !formData.categoryId || !formData.brandId) return null;

    setUploadingImage(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', imageFile);
      uploadFormData.append('categoryId', formData.categoryId);
      uploadFormData.append('brandId', formData.brandId);
      uploadFormData.append('fileName', formData.name || 'product');

      const response = await api.post('/api/files/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.webPath;
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Resim yüklenirken hata oluştu!');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.name.trim() || !formData.price || !formData.categoryId || !formData.brandId) {
      alert('Lütfen tüm gerekli alanları doldurun.');
      return;
    }

    setLoading(true);
    
    try {
      let imagePath = formData.imagePath;

      // Yeni resim seçilmişse yükle
      if (imageFile) {
        const uploadedPath = await uploadImage();
        if (uploadedPath) {
          imagePath = uploadedPath;
        }
      }

      const productData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        categoryId: parseInt(formData.categoryId),
        brandId: parseInt(formData.brandId),
        imagePath: imagePath || null
      };

      if (product) {
        // Güncelleme
        await api.put(`/api/products/${product.id}`, productData);
      } else {
        // Yeni ekleme
        await api.post('/api/products', productData);
      }

      onSave();
    } catch (error) {
      console.error('Product save error:', error);
      alert('Ürün kaydedilirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] }
      } as any;
      handleImageSelect(fakeEvent);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-neutral-900 border-neutral-700 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl text-white">
              {product ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ürün Adı */}
            <div>
              <Label htmlFor="name" className="text-white">Ürün Adı *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ürün adını girin"
                className="bg-neutral-800 border-neutral-600 text-white mt-1"
                required
              />
            </div>

            {/* Fiyat */}
            <div>
              <Label htmlFor="price" className="text-white">Fiyat (₺) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                className="bg-neutral-800 border-neutral-600 text-white mt-1"
                required
              />
            </div>

            {/* Kategori ve Marka */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-white">Kategori *</Label>
                <select
                  id="category"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-md text-white"
                  required
                >
                  <option value="">Kategori seçin</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="brand" className="text-white">Marka *</Label>
                <select
                  id="brand"
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-md text-white"
                  required
                >
                  <option value="">Marka seçin</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resim Yükleme */}
            <div>
              <Label className="text-white">Ürün Resmi</Label>
              <div className="mt-2 space-y-4">
                {/* Drag & Drop Area */}
                <div
                  className="border-2 border-dashed border-neutral-600 rounded-lg p-6 text-center hover:border-[#C48913] transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <div className="space-y-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-32 w-32 object-cover rounded-lg"
                      />
                      <p className="text-sm text-neutral-400">Değiştirmek için tıklayın</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto h-12 w-12 text-neutral-400" />
                      <div>
                        <p className="text-neutral-300">Resim yüklemek için tıklayın veya sürükleyin</p>
                        <p className="text-xs text-neutral-500">JPG, PNG, WebP - Max 10MB</p>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="border-red-600 text-red-400 hover:bg-red-600/10"
                  >
                    Resmi Kaldır
                  </Button>
                )}
              </div>
            </div>

            {/* Form Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading || uploadingImage}
                className="border-neutral-600 text-neutral-300 hover:bg-neutral-800"
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={loading || uploadingImage}
                className="bg-[#C48913] hover:bg-[#D4AF37] text-black font-medium"
              >
                {loading || uploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {uploadingImage ? 'Resim Yükleniyor...' : 'Kaydediliyor...'}
                  </>
                ) : (
                  product ? 'Güncelle' : 'Ekle'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}