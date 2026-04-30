import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://akbsaljjwspbjgjrgkur.supabase.co',
  'sb_publishable_EcAIBjcZ2IAT0Le8aYUPXA_6MyxR0iM'
);

const main = async () => {
  const { data, error } = await supabase.from('transactions').select('*').limit(1);
  console.log('error:', error);
  console.log('data sample:', data);
};

main().catch((err) => {
  console.error('unexpected error:', err);
  process.exit(1);
});
