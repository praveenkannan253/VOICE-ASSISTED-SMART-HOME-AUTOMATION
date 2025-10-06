-- Database: smarthome

CREATE TABLE IF NOT EXISTS devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  topic VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensors (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  topic VARCHAR(255) NOT NULL,
  value_json JSON NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_topic_time (topic, recorded_at)
);

CREATE TABLE IF NOT EXISTS logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  level VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_level_time (level, created_at)
);

CREATE TABLE IF NOT EXISTS fridge_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item VARCHAR(100) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'ok',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_item (item)
);

-- Face Recognition Table
CREATE TABLE IF NOT EXISTS face_recognition (
  id INT AUTO_INCREMENT PRIMARY KEY,
  person_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'known' or 'unknown'
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

SELECT User, Host FROM mysql.user WHERE User = 'PRAVIN';
CREATE USER 'PRAVIN'@'localhost' IDENTIFIED BY 'YourPasswordHere';
GRANT ALL PRIVILEGES ON smarthome.* TO 'PRAVIN'@'localhost';
FLUSH PRIVILEGES;

GRANT ALL PRIVILEGES ON smarthome.* TO 'PRAVIN'@'localhost';
FLUSH PRIVILEGES;





