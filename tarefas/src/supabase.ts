import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pglxwzuevywrapmemojm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbHh3enVldnl3cmFwbWVtb2ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTgzMDcsImV4cCI6MjA4NTk3NDMwN30.S94M6rW5T7sflhDKi-uaIzZJBGilpgoxicD2yndAfI4'

export const supabase = createClient(supabaseUrl, supabaseKey)
