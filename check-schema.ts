import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const res = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    }
  });
  const data = await res.json();
  
  if (data.definitions.listings) {
    console.log('listings:', data.definitions.listings.properties);
  }
}
check();
