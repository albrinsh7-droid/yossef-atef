SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

DROP TABLE IF EXISTS `Bookings`;
DROP TABLE IF EXISTS `Flights`;

CREATE TABLE `Flights` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `airline` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `flight_number` varchar(255) NOT NULL,
  `departure_city` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `destination_city` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `departure_time` datetime NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'SAR',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Bookings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `bookingReference` varchar(255) NOT NULL,
  `passengerName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `passengers` int unsigned NOT NULL DEFAULT 1,
  `FlightId` int unsigned DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FlightId` (`FlightId`),
  CONSTRAINT `Bookings_ibfk_1` FOREIGN KEY (`FlightId`) REFERENCES `Flights` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO Flights (airline, flight_number, departure_city, destination_city, departure_time, price, createdAt, updatedAt) VALUES
('مصر للطيران', 'MS101', 'القاهرة', 'الرياض', '2025-10-01 08:00:00', 1200.00, NOW(), NOW()),
('الخطوط السعودية', 'SV202', 'الرياض', 'القاهرة', '2025-10-01 14:00:00', 950.00, NOW(), NOW()),
('طيران الإمارات', 'EK812', 'دبي', 'نيويورك', '2025-10-05 08:30:00', 7500.00, NOW(), NOW());
