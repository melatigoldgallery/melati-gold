import { schedule } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

// Scheduled function untuk keep-alive Supabase database
// Runs setiap hari jam 3:00 AM UTC untuk mencegah auto-pause
const handler = schedule('0 3 * * *', async () => {
  try {
    // Get Supabase credentials dari environment variables
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase credentials tidak ditemukan di environment variables')
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Missing Supabase credentials',
          message: 'SUPABASE_URL atau SUPABASE_ANON_KEY tidak ditemukan'
        })
      }
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('🔄 Memulai database ping untuk mencegah auto-pause...')
    
    // Lakukan query sederhana untuk keep database active
    // Query ke tabel catalog_products (atau tabel lain yang ada)
    const { data, error } = await supabase
      .from('catalog_products')
      .select('id')
      .limit(1)

    if (error) {
      console.error('❌ Error saat ping database:', error.message)
      
      // Coba alternatif: query dengan RPC atau health check
      const { data: healthData, error: healthError } = await supabase
        .rpc('version') // Built-in PostgreSQL function
        .single()
      
      if (healthError) {
        console.error('❌ Health check juga gagal:', healthError.message)
        return {
          statusCode: 500,
          body: JSON.stringify({ 
            error: 'Database ping failed',
            message: healthError.message,
            timestamp: new Date().toISOString()
          })
        }
      }
      
      console.log('✅ Database ping berhasil via health check')
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true,
          method: 'health_check',
          message: 'Database ping berhasil (via health check)',
          timestamp: new Date().toISOString()
        })
      }
    }

    console.log('✅ Database ping berhasil - Supabase project tetap aktif')
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        method: 'table_query',
        message: 'Database ping berhasil',
        timestamp: new Date().toISOString()
      })
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Unexpected error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    }
  }
})

export { handler }
