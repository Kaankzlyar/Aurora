# PowerShell script to assign different images to each product
$baseUrl = "http://localhost:5270"

Write-Host "Her ürün için farklı resim atanıyor..." -ForegroundColor Green

# Önce mevcut ürünleri al
try {
    $products = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method GET
    Write-Host "Toplam $($products.Count) ürün bulundu." -ForegroundColor Yellow
    
    # Her ürün için farklı resim listesi
    $imagePaths = @(
        "/images/balenciaga/balenciaga_track.jpg",
        "/images/gucci/GucciAyakkabı1.jpg",
        "/images/gucci/GucciAyakkabı1.1.jpg",
        "/images/prada/PradaEyewear1.jpg",
        "/images/prada/PradaEyewear2.jpg",
        "/images/prada/PradaEyewear3.jpg",
        "/images/prada/PradaEyewear4.jpg",
        "/images/prada/PradaShirt1.jpg",
        "/images/swarovski/swarovskiJewelry1.jpg",
        "/images/swarovski/swarovskiJewelry2.jpg",
        "/images/swarovski/swarovskiJewelry3.jpg",
        "/images/swarovski/swarovskiJewelry4.jpg",
        "/images/tom-ford/TomFordSuit1.jpg",
        "/images/tom-ford/TomFordSuit1.1.jpg",
        "/images/versace/versace_eros_edt.jpg",
        "/images/saint-laurent/ysl_loulou_medium.jpg"
    )
    
    for ($i = 0; $i -lt $products.Count; $i++) {
        $product = $products[$i]
        $newImagePath = $imagePaths[$i % $imagePaths.Count]  # Modulo ile döngü
        
        # Güncelleme için product objesini hazırla
        $updateData = @{
            name = $product.name
            price = $product.price
            categoryId = $product.categoryId
            brandId = $product.brandId
            gender = $product.gender
            imagePath = $newImagePath
        }
        
        try {
            $json = $updateData | ConvertTo-Json
            Invoke-RestMethod -Uri "$baseUrl/api/products/$($product.id)" -Method PUT -Body $json -ContentType "application/json"
            Write-Host "✅ Güncellendi: $($product.name) -> $newImagePath" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Hata: $($product.name) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}
catch {
    Write-Host "❌ API'ye bağlanılamadı: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "API'nin çalıştığından emin olun: dotnet run" -ForegroundColor Yellow
}

Write-Host "Güncelleme tamamlandı!" -ForegroundColor Green

