const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ FATAL: SUPABASE_URL or SUPABASE_SERVICE_KEY is missing from .env!');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ MISSING');
  console.error('   SUPABASE_SERVICE_KEY:', supabaseKey ? '✅ Set' : '❌ MISSING');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase client initialized:', supabaseUrl);

module.exports = supabase;
