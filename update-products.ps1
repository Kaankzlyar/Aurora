# PowerShell script to update product image paths
$baseUrl = "http://localhost:5270"

Write-Host "Product image paths güncelleniyor..." -ForegroundColor Green

# Önce mevcut ürünleri al
try {
    $products = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method GET
    Write-Host "Toplam $($products.Count) ürün bulundu." -ForegroundColor Yellow
    
    foreach ($product in $products) {
        $oldPath = $product.imagePath
        $newPath = Get-NewImagePath $oldPath
        
        if ($newPath -ne $oldPath) {
            # Güncelleme için product objesini hazırla
            $updateData = @{
                name = $product.name
                price = $product.price
                categoryId = $product.categoryId
                brandId = $product.brandId
                gender = $product.gender
                imagePath = $newPath
            }
            
            try {
                $json = $updateData | ConvertTo-Json
                Invoke-RestMethod -Uri "$baseUrl/api/products/$($product.id)" -Method PUT -Body $json -ContentType "application/json"
                Write-Host "✅ Güncellendi: $($product.name) - $oldPath -> $newPath" -ForegroundColor Green
            }
            catch {
                Write-Host "❌ Hata: $($product.name) - $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        else {
            Write-Host "⏭️  Değişiklik yok: $($product.name)" -ForegroundColor Gray
        }
    }
}
catch {
    Write-Host "❌ API'ye bağlanılamadı: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "API'nin çalıştığından emin olun: dotnet run" -ForegroundColor Yellow
}

function Get-NewImagePath($oldPath) {
    if ([string]::IsNullOrEmpty($oldPath)) {
        return "/images/default/no-image.jpg"
    }
    
    $lowerPath = $oldPath.ToLower()
    
    # Marka bazlı güncellemeler
    if ($lowerPath -like "*balenciaga*") {
        return "/images/balenciaga/balenciagaShoe1.jpg"
    }
    elseif ($lowerPath -like "*gucci*") {
        return "/images/gucci/GucciAyakkabı1.jpg"
    }
    elseif ($lowerPath -like "*prada*") {
        return "/images/prada/PradaEyewear1.jpg"
    }
    elseif ($lowerPath -like "*swarovski*") {
        return "/images/swarovski/swarovskiJewelry1.jpg"
    }
    elseif ($lowerPath -like "*tom*" -or $lowerPath -like "*ford*") {
        return "/images/tom-ford/TomFordSuit1.jpg"
    }
    elseif ($lowerPath -like "*versace*") {
        return "/images/versace/versacePerfume1.jpg"
    }
    elseif ($lowerPath -like "*saint*" -or $lowerPath -like "*laurent*" -or $lowerPath -like "*ysl*") {
        return "/images/saint-laurent/SaintLaurentBag1.jpg"
    }
    
    # Eğer zaten tam yol ise, olduğu gibi bırak
    if ($oldPath.StartsWith("/images/")) {
        return $oldPath
    }
    
    # Varsayılan
    return "/images/default/no-image.jpg"
}

Write-Host "Güncelleme tamamlandı!" -ForegroundColor Green
