import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://szloqueilztpbdurfowm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Tu clave anon de Supabase

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Asegura que la sesión se mantenga entre recargas
    autoRefreshToken: true, // Renueva automáticamente los tokens
  },
});