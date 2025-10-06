CREATE DATABASE IF NOT EXISTS smarthome;
CREATE USER IF NOT EXISTS 'PRAVIN'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON smarthome.* TO 'PRAVIN'@'localhost';
FLUSH PRIVILEGES;

show tables;
select * from fridge_items;

USE smarthome;

INSERT INTO fridge_items (item, quantity, status) VALUES
('Milk', 5, 'ok'),
('Banana', 5, 'ok'),
('Orange', 5, 'ok'),
('Apple', 5, 'ok'),
('Tomato', 5, 'ok'),
('Carrot', 5, 'ok')
ON DUPLICATE KEY UPDATE quantity=5, status='ok';

USE smarthome;

-- Delete old test entries (keep only the new ones with quantity 5)
DELETE FROM fridge_items WHERE id IN (1, 2, 3, 4, 5);

-- Verify
SELECT * FROM fridge_items;


USE smarthome;

-- Delete all existing fridge items
DELETE FROM fridge_items;

-- Reset auto-increment
ALTER TABLE fridge_items AUTO_INCREMENT = 1;

-- Insert fresh default items (quantity 5)
INSERT INTO fridge_items (item, quantity, status) VALUES
('Milk', 5, 'ok'),
('Banana', 5, 'ok'),
('Orange', 5, 'ok'),
('Apple', 5, 'ok'),
('Tomato', 5, 'ok'),
('Carrot', 5, 'ok');

-- Verify
SELECT * FROM fridge_items;


SET SQL_SAFE_UPDATES = 0;
DELETE FROM fridge_items;
ALTER TABLE fridge_items AUTO_INCREMENT = 1;
INSERT INTO fridge_items (item, quantity, status) VALUES
('Milk', 5, 'ok'),
('Banana', 5, 'ok'),
('Orange', 5, 'ok'),
('Apple', 5, 'ok'),
('Tomato', 5, 'ok'),
('Carrot', 5, 'ok');
SET SQL_SAFE_UPDATES = 1;
SELECT * FROM fridge_items;

USE smarthome;

-- Face Recognition Table
CREATE TABLE IF NOT EXISTS face_recognition (
  id INT AUTO_INCREMENT PRIMARY KEY,
  person_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  confidence FLOAT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  image_path VARCHAR(255),
  location VARCHAR(100) DEFAULT 'entrance',
  INDEX idx_timestamp (timestamp),
  INDEX idx_status (status)
);

-- Known Persons Table
CREATE TABLE IF NOT EXISTS known_persons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP NULL,
  visit_count INT DEFAULT 0
);


