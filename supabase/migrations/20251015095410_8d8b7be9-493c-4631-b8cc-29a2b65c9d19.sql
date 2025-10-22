-- Vincular el customer existente con el usuario de Google
UPDATE customers 
SET user_id = '1681e609-16b5-48d4-acb0-04e7eae3edc7'
WHERE email = 'zarkojrpajarino@gmail.com' AND user_id IS NULL;

-- Crear el perfil si no existe
INSERT INTO profiles (user_id, name)
VALUES ('1681e609-16b5-48d4-acb0-04e7eae3edc7', 'Zarko Jr Pajariño Martín')
ON CONFLICT (user_id) DO NOTHING;