-- Create test accounts for Pedidos360
-- Note: These accounts need to be created in Supabase Auth first
-- Then this script will create their profiles

-- Instructions to create auth accounts:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add user" and create:
--    - Employee: empleado@pedidos360.com / password: Empleado123!
--    - Client: cliente@pedidos360.com / password: Cliente123!
-- 3. Copy the user IDs and update them below
-- 4. Run this script

-- After creating the auth users in Supabase Dashboard, insert their profiles:
-- Replace 'EMPLOYEE_USER_ID' and 'CLIENT_USER_ID' with actual UUIDs from Supabase Auth

-- Example (update with real UUIDs):
-- INSERT INTO public.users (id, email, role, full_name, phone, address)
-- VALUES 
--   ('EMPLOYEE_USER_ID', 'empleado@pedidos360.com', 'employee', 'Empleado de Prueba', '555-0001', 'Oficina Principal'),
--   ('CLIENT_USER_ID', 'cliente@pedidos360.com', 'client', 'Cliente de Prueba', '555-0002', 'Calle Principal 123');

-- Alternative: Use Supabase Auth API to create users programmatically
-- The trigger will automatically create the profile when auth user is created
