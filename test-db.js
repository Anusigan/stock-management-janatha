import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testConnection() {
  try {
    // Test connection by trying to fetch items
    const { data, error } = await supabase.from('items').select('*').limit(1)
    
    if (error) {
      console.log('Database connection error:', error.message)
      console.log('This likely means the tables haven\'t been created yet.')
      console.log('Please run the SQL scripts in your Supabase SQL editor:')
      console.log('1. scripts/001_create_tables.sql')
      console.log('2. scripts/002_seed_initial_data.sql')
      console.log('3. scripts/003_add_customers_and_documents.sql')
      return false
    }
    
    console.log('✅ Database connection successful!')
    console.log('Items in database:', data?.length || 0)
    return true
  } catch (err) {
    console.error('Connection test failed:', err)
    return false
  }
}

testConnection()
