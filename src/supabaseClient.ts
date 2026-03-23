import { createClient } from '@supabase/supabase-js';

// 这两个值在 Supabase 后台的 Project Settings -> API 里找
const supabaseUrl ='https://wzudlbwixslqgbeldzoi.supabase.co';
const supabaseKey = 'sb_publishable_VCUXg1R97B4BKedwCmaEhw_zZDITyBm';

export const supabase = createClient(supabaseUrl, supabaseKey);