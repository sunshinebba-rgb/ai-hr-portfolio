import { createClient } from '@supabase/supabase-js'

// 1. 统一导出类型定义，供 App.tsx 使用
export interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  performance_score: number;
  potential_score: number;
  last_updated?: string;
}

// 2. 初始化客户端 (请确保这里的 URL 和 Key 是你自己的)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '你的_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '你的_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 3. 获取所有员工数据
export const fetchEmployees = async (): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('name', { ascending: true });
    
  if (error) {
    console.error('获取数据失败:', error.message);
    throw error;
  }
  return (data as Employee[]) || [];
}

// 4. 更新员工位置 (绩效和潜力分数)
// 确保接收 3 个参数：id, performance, potential
export const persistEmployeePlacement = async (id: string, perf: number, pot: number) => {
  const { error } = await supabase
    .from('employees')
    .update({ 
      performance_score: perf, 
      potential_score: pot,
      last_updated: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('更新数据库失败:', error.message);
    throw error;
  }
}
