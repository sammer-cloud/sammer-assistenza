import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://eshgimmcuacfhjupqkml.supabase.co";   // ← il tuo Project URL
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzaGdpbW1jdWFjZmhqdXBxa21sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNzY4NzYsImV4cCI6MjA4OTg1Mjg3Nn0.Df-zlgSHEtNH-KuI9EIBXcawhdhMaA6tm8DpxeeFqMo";                      

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);