-- تنظيف الجداول القديمة لو عايز تبدأ من جديد (اختياري)
-- DROP TABLE IF EXISTS Bookings;
-- DROP TABLE IF EXISTS Flights;

CREATE TABLE IF NOT EXISTS `Flights` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `airline` varchar(255) NOT NULL,
  `flight_number` varchar(255) NOT NULL,
  `departure_city` varchar(255) NOT NULL,
  `destination_city` varchar(255) NOT NULL,
  `departure_time` datetime NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'SAR',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `Bookings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `bookingReference` varchar(255) NOT NULL,
  `passengerName` varchar(255) NOT NULL,
  `passengers` int unsigned NOT NULL DEFAULT 1,
  `FlightId` int unsigned DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FlightId` (`FlightId`),
  CONSTRAINT `Bookings_ibfk_1` FOREIGN KEY (`FlightId`) REFERENCES `Flights` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- مسح البيانات القديمة عشان ميتكررش
TRUNCATE TABLE Flights;

INSERT INTO Flights (airline, flight_number, departure_city, destination_city, departure_time, price, createdAt, updatedAt) VALUES
-- رحلات من القاهرة
('مصر للطيران', 'MS701', 'القاهرة', 'الرياض', '2025-10-01 08:00:00', 1200.00, NOW(), NOW()),
('مصر للطيران', 'MS910', 'القاهرة', 'دبي', '2025-10-01 12:30:00', 1500.00, NOW(), NOW()),
('مصر للطيران', 'MS777', 'القاهرة', 'لندن', '2025-10-02 09:00:00', 4500.00, NOW(), NOW()),
('الخطوط الفرنسية', 'AF503', 'القاهرة', 'باريس', '2025-10-03 16:45:00', 3800.00, NOW(), NOW()),
-- رحلات من الرياض
('الخطوط السعودية', 'SV101', 'الرياض', 'جدة', '2025-10-01 07:00:00', 450.00, NOW(), NOW()),
('الخطوط السعودية', 'SV202', 'الرياض', 'القاهرة', '2025-10-01 14:00:00', 950.00, NOW(), NOW()),
('طيران الإمارات', 'EK812', 'الرياض', 'دبي', '2025-10-02 11:00:00', 800.00, NOW(), NOW()),
('الخطوط السعودية', 'SV121', 'الرياض', 'لندن', '2025-10-04 02:00:00', 5200.00, NOW(), NOW()),
-- رحلات من دبي
('طيران الإمارات', 'EK201', 'دبي', 'نيويورك', '2025-10-05 08:30:00', 7500.00, NOW(), NOW()),
('طيران الإمارات', 'EK318', 'دبي', 'طوكيو', '2025-10-06 02:50:00', 8200.00, NOW(), NOW()),
('فلاي دبي', 'FZ102', 'دبي', 'الكويت', '2025-10-01 10:00:00', 600.00, NOW(), NOW()),
-- رحلات أوروبية ودولية
('الخطوط البريطانية', 'BA117', 'لندن', 'نيويورك', '2025-10-07 13:00:00', 4100.00, NOW(), NOW()),
('لوفتهانزا', 'LH402', 'باريس', 'فرانكفورت', '2025-10-01 18:00:00', 1100.00, NOW(), NOW()),
('الخطوط القطرية', 'QR101', 'الدوحة', 'لندن', '2025-10-05 01:00:00', 5500.00, NOW(), NOW()),
('طيران الاتحاد', 'EY103', 'أبوظبي', 'سيدني', '2025-10-08 22:00:00', 9800.00, NOW(), NOW());
