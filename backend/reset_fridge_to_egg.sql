-- Quick fix: Replace Milk with Egg in fridge_items
USE smarthome;

-- Update existing Milk entry to Egg
UPDATE fridge_items SET item = 'Egg', quantity = 12 WHERE item = 'Milk';

-- If Milk doesn't exist, insert Egg
INSERT INTO fridge_items (item, quantity, status) 
VALUES ('Egg', 12, 'ok')
ON DUPLICATE KEY UPDATE quantity = 12;

-- Verify the change
SELECT * FROM fridge_items ORDER BY id;
