// Configuración de Supabase para Guerrero Academy
const SUPABASE_URL = "https://daijiuqqafvjofafwqck.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk0MjMsImV4cCI6MjA4ODAzNTQyM30.DtdQALhTs8mt91GiBoWSrPbW2wc2EY5cmPXf-7oSC-g";

// Cliente de Supabase para navegador
if (typeof window !== 'undefined' && window.supabase) {
  window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
