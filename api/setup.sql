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

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Flights;
SET FOREIGN_KEY_CHECKS = 1;

INSERT IGNORE INTO Flights (airline, flight_number, departure_city, destination_city, departure_time, price, createdAt, updatedAt) VALUES
('مصر للطيران', 'MS721', 'القاهرة', 'الرياض', '2025-12-20 08:00:00', 1200.00, NOW(), NOW()),
('الخطوط السعودية', 'SV123', 'القاهرة', 'جدة', '2025-12-20 10:30:00', 1150.00, NOW(), NOW()),
('طيران الإمارات', 'EK234', 'القاهرة', 'دبي', '2025-12-21 14:00:00', 1900.00, NOW(), NOW()),
('الاتحاد للطيران', 'EY345', 'القاهرة', 'أبوظبي', '2025-12-21 16:30:00', 1850.00, NOW(), NOW()),
('الخطوط الجوية الكويتية', 'KU456', 'القاهرة', 'الكويت', '2025-12-22 09:15:00', 1300.00, NOW(), NOW()),
('الملكية الأردنية', 'RJ567', 'القاهرة', 'عمان', '2025-12-22 11:45:00', 800.00, NOW(), NOW()),
('طيران الشرق الأوسط', 'ME678', 'القاهرة', 'بيروت', '2025-12-23 13:20:00', 750.00, NOW(), NOW()),
('الخطوط الجوية القطرية', 'QR789', 'القاهرة', 'الدوحة', '2025-12-23 15:50:00', 1600.00, NOW(), NOW()),
('طيران الخليج', 'GF890', 'القاهرة', 'المنامة', '2025-12-24 10:00:00', 1450.00, NOW(), NOW()),
('الخطوط الجوية العراقية', 'IA901', 'القاهرة', 'بغداد', '2025-12-24 12:30:00', 1100.00, NOW(), NOW()),
('الطيران العماني', 'WY012', 'القاهرة', 'مسقط', '2025-12-25 14:45:00', 1750.00, NOW(), NOW()),
('الخطوط التونسية', 'TU123', 'القاهرة', 'تونس', '2025-12-25 17:15:00', 1050.00, NOW(), NOW()),
('الخطوط الملكية المغربية', 'AT234', 'القاهرة', 'الدار البيضاء', '2025-12-26 08:30:00', 2100.00, NOW(), NOW()),
('نسما للطيران', 'NM345', 'القاهرة', 'شرم الشيخ', '2025-12-26 10:45:00', 400.00, NOW(), NOW()),
('اير كايرو', 'SM456', 'القاهرة', 'الأقصر', '2025-12-27 12:00:00', 350.00, NOW(), NOW()),
('النيل للطيران', 'NP567', 'القاهرة', 'أسوان', '2025-12-27 14:30:00', 380.00, NOW(), NOW());