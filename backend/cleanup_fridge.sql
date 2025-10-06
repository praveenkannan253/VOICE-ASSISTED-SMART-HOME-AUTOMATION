-- Clean up duplicate fridge items
USE smarthome;

-- Delete all fridge items
DELETE FROM fridge_items;

-- Reset auto increment
ALTER TABLE fridge_items AUTO_INCREMENT = 1;

-- Add only unique items with proper capitalization
INSERT INTO fridge_items (item, quantity, status) VALUES
('Milk', 0, 'ok'),
('Banana', 0, 'ok'),
('Orange', 0, 'ok'),
('Apple', 0, 'ok'),
('Tomato', 0, 'ok'),
('Carrot', 0, 'ok')
ON DUPLICATE KEY UPDATE quantity = quantity;

SELECT * FROM fridge_items;
