-- Her ürün için farklı resim atama SQL komutları
-- Bu komutları SQL Server Management Studio veya başka bir SQL client'ta çalıştırın

-- Önce mevcut ürünleri ve imagePath'lerini kontrol et
SELECT Id, Name, ImagePath FROM Products ORDER BY Id;

-- Her ürün için farklı resim atama (ID'ye göre)
UPDATE Products SET ImagePath = '/images/balenciaga/balenciaga_track.jpg' WHERE Id = 1;
UPDATE Products SET ImagePath = '/images/gucci/GucciAyakkabı1.jpg' WHERE Id = 2;
UPDATE Products SET ImagePath = '/images/gucci/GucciAyakkabı1.1.jpg' WHERE Id = 3;
UPDATE Products SET ImagePath = '/images/prada/PradaEyewear1.jpg' WHERE Id = 4;
UPDATE Products SET ImagePath = '/images/prada/PradaEyewear2.jpg' WHERE Id = 5;
UPDATE Products SET ImagePath = '/images/prada/PradaEyewear3.jpg' WHERE Id = 6;
UPDATE Products SET ImagePath = '/images/prada/PradaEyewear4.jpg' WHERE Id = 7;
UPDATE Products SET ImagePath = '/images/prada/PradaShirt1.jpg' WHERE Id = 8;
UPDATE Products SET ImagePath = '/images/swarovski/swarovskiJewelry1.jpg' WHERE Id = 9;
UPDATE Products SET ImagePath = '/images/swarovski/swarovskiJewelry2.jpg' WHERE Id = 10;
UPDATE Products SET ImagePath = '/images/swarovski/swarovskiJewelry3.jpg' WHERE Id = 11;
UPDATE Products SET ImagePath = '/images/swarovski/swarovskiJewelry4.jpg' WHERE Id = 12;
UPDATE Products SET ImagePath = '/images/tom-ford/TomFordSuit1.jpg' WHERE Id = 13;
UPDATE Products SET ImagePath = '/images/tom-ford/TomFordSuit1.1.jpg' WHERE Id = 14;
UPDATE Products SET ImagePath = '/images/versace/versace_eros_edt.jpg' WHERE Id = 15;
UPDATE Products SET ImagePath = '/images/saint-laurent/ysl_loulou_medium.jpg' WHERE Id = 16;

-- Güncelleme sonrası kontrol
SELECT Id, Name, ImagePath FROM Products ORDER BY Id;

