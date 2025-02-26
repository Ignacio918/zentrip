import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://szloqueilztpbdurfowm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6bG9xdWVpbHp0cGJkdXJmb3dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzOTE3OTUsImV4cCI6MjA0OTk2Nzc5NX0.LtNjCX1Dexp_3g8zZ3N4gHXDFuAEYS7tWqQYii4BFFw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Asegura que la sesión se mantenga entre recargas
    autoRefreshToken: true, // Renueva automáticamente los tokens
  },
});