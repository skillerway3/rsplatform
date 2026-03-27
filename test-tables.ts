import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

async function check() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Checking order_status_history...');
  const { data: h, error: he } = await supabase.from('order_status_history').select('*').limit(1);
  if (he) console.error('order_status_history error:', he);
  else console.log('order_status_history data:', h);

  console.log('Checking platform_reports...');
  const { data: p, error: pe } = await supabase.from('platform_reports').select('*').limit(1);
  if (pe) console.error('platform_reports error:', pe);
  else console.log('platform_reports data:', p);

  console.log('Checking user_reports...');
  const { data: u, error: ue } = await supabase.from('user_reports').select('*').limit(1);
  if (ue) console.error('user_reports error:', ue);
  else console.log('user_reports data:', u);
}
check();
