
import { createClient } from '@supabase/supabase-js';

// 您的 Supabase 项目地址 (已根据您的 Project ID 自动生成)
const supabaseUrl = 'https://oxmsrjgutqtkvfefqggx.supabase.co';

// ⚠️ 请将下方的字符串替换为您在 Supabase Settings -> API 中看到的 anon / public Key
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);
