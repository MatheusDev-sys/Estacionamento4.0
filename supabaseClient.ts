
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gygsplwnskghbkaxpyya.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5Z3NwbHduc2tnaGJrYXhweXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMzk0MTYsImV4cCI6MjA4NTkxNTQxNn0.mKTaPGkCpDI8q4VlZLJ3ucerIlPNRy4RQWxK8J6fKB8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
