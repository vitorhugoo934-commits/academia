
import { createClient } from '@supabase/supabase-js';

// No Vite/Vercel, usamos import.meta.env para acessar variáveis de ambiente
// O fallback (??) mantém as chaves atuais caso as variáveis não estejam configuradas, 
// facilitando o deploy inicial, mas o ideal é usar as variáveis no dashboard do Vercel.
// Fix: Casting import.meta to any to resolve "Property 'env' does not exist on type 'ImportMeta'" TypeScript error
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL ?? 'https://vdfgjczuibnhbyxojzzn.supabase.co';
// Fix: Casting import.meta to any to resolve "Property 'env' does not exist on type 'ImportMeta'" TypeScript error
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkZmdqY3p1aWJuaGJ5eG9qenpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MzY3OTAsImV4cCI6MjA4NDUxMjc5MH0.L71qElUijJA3xJzzsZo96MEwgwdVF4M80LxFy_7tgHc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
