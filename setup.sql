-- SQL schema for MySQL
CREATE DATABASE IF NOT EXISTS flights_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE flights_db;

CREATE TABLE `Flights` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `airline` varchar(255) NOT NULL,
  `flight_number` varchar(255) NOT NULL,
  `departure_city` varchar(255) NOT NULL,bookings
  `destination_city` varchar(255) NOT NULL,
  `departure_time` datetime NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'SAR',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE `Bookings` (
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

-- إضافة بيانات تجريبية (مهمة للاختبار لاحقاً)
INSERT INTO Flights (airline, flight_number, departure_city, destination_city, departure_time, price, createdAt, updatedAt) VALUES
('طيران الإمارات', 'EK205', 'دبي', 'القاهرة', '2025-12-20 10:30:00', 1850.00, NOW(), NOW()),
('الخطوط السعودية', 'SV544', 'الرياض', 'جدة', '2025-12-21 15:00:00', 670.00, NOW(), NOW()),
('مصر للطيران', 'MS721', 'القاهرة', 'دبي', '2025-12-22 08:00:00', 1900.00, NOW(), NOW());bookings