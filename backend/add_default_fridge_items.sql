-- Add default fridge items with quantity 5
USE smarthome;

INSERT INTO fridge_items (item, quantity, status) VALUES
('Milk', 5, 'ok'),
('Banana', 5, 'ok'),
('Orange', 5, 'ok'),
('Apple', 5, 'ok'),
('Tomato', 5, 'ok'),
('Carrot', 5, 'ok')
ON DUPLICATE KEY UPDATE quantity=5, status='ok';

SELECT * FROM fridge_items;
