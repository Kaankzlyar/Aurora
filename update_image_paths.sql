-- ImagePath güncelleme SQL komutları
-- Bu komutları SQL Server Management Studio veya başka bir SQL client'ta çalıştırın

-- Balenciaga ürünleri
UPDATE Products 
SET ImagePath = '/images/balenciaga/balenciagaShoe1.jpg' 
WHERE ImagePath = 'balenciaga_track.jpg' OR ImagePath LIKE '%balenciaga%';

-- Gucci ürünleri
UPDATE Products 
SET ImagePath = '/images/gucci/GucciAyakkabı1.jpg' 
WHERE ImagePath LIKE '%gucci%' OR ImagePath LIKE '%Gucci%';

-- Prada ürünleri
UPDATE Products 
SET ImagePath = '/images/prada/PradaEyewear1.jpg' 
WHERE ImagePath LIKE '%prada%' OR ImagePath LIKE '%Prada%';

-- Swarovski ürünleri
UPDATE Products 
SET ImagePath = '/images/swarovski/swarovskiJewelry1.jpg' 
WHERE ImagePath LIKE '%swarovski%' OR ImagePath LIKE '%Swarovski%';

-- Tom Ford ürünleri
UPDATE Products 
SET ImagePath = '/images/tom-ford/TomFordSuit1.jpg' 
WHERE ImagePath LIKE '%tom%' OR ImagePath LIKE '%Tom%';

-- Versace ürünleri
UPDATE Products 
SET ImagePath = '/images/versace/versacePerfume1.jpg' 
WHERE ImagePath LIKE '%versace%' OR ImagePath LIKE '%Versace%';

-- Saint Laurent ürünleri
UPDATE Products 
SET ImagePath = '/images/saint-laurent/SaintLaurentBag1.jpg' 
WHERE ImagePath LIKE '%saint%' OR ImagePath LIKE '%laurent%';

-- Tüm ürünleri kontrol et
SELECT Id, Name, ImagePath FROM Products;
