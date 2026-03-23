-- 人才盘点项目 Supabase 初始化脚本

-- 1. 创建 employees 表
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    role TEXT NOT NULL,
    performance_score INT NOT NULL CHECK (performance_score >= 1 AND performance_score <= 5),
    potential_score INT NOT NULL CHECK (potential_score >= 1 AND potential_score <= 5),
    grid_position TEXT DEFAULT '3-2',
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建 talent_logs 表 (九宫格位置变动历史)
CREATE TABLE IF NOT EXISTS talent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    from_position TEXT,
    to_position TEXT NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    note TEXT
);

-- 3. 插入 5 条模拟数据
-- 王小明 - 研发部，高绩效高潜力
INSERT INTO employees (name, department, role, performance_score, potential_score, grid_position)
VALUES ('王小明', '研发部', '高级工程师', 4, 5, '4-5');

-- 李华 - 市场部，中绩效中潜力
INSERT INTO employees (name, department, role, performance_score, potential_score, grid_position)
VALUES ('李华', '市场部', '市场经理', 3, 3, '3-3');

-- 赵雷 - 人力资源，中绩效高潜力
INSERT INTO employees (name, department, role, performance_score, potential_score, grid_position)
VALUES ('赵雷', '人力资源', 'HR主管', 3, 4, '3-4');

-- 孙美 - 产品部，高绩效中潜力
INSERT INTO employees (name, department, role, performance_score, potential_score, grid_position)
VALUES ('孙美', '产品部', '产品经理', 4, 3, '4-3');

-- 周强 - 财务部，低绩效中潜力
INSERT INTO employees (name, department, role, performance_score, potential_score, grid_position)
VALUES ('周强', '财务部', '财务专员', 2, 3, '2-3');

-- 4. 为初始数据创建日志记录
INSERT INTO talent_logs (employee_id, from_position, to_position, note)
SELECT
    id,
    NULL,
    grid_position,
    '初始数据导入'
FROM employees;

-- 5. 启用 RLS (行级安全策略)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_logs ENABLE ROW LEVEL SECURITY;

-- 6. 创建 RLS 策略 (允许所有操作，仅开发环境使用)
CREATE POLICY "employees_select" ON employees FOR SELECT USING (true);
CREATE POLICY "employees_insert" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "employees_update" ON employees FOR UPDATE USING (true);
CREATE POLICY "employees_delete" ON employees FOR DELETE USING (true);

CREATE POLICY "talent_logs_select" ON talent_logs FOR SELECT USING (true);
CREATE POLICY "talent_logs_insert" ON talent_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "talent_logs_update" ON talent_logs FOR UPDATE USING (true);
CREATE POLICY "talent_logs_delete" ON talent_logs FOR DELETE USING (true);

-- 7. 创建索引优化查询性能
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_grid_position ON employees(grid_position);
CREATE INDEX idx_talent_logs_employee_id ON talent_logs(employee_id);
CREATE INDEX idx_talent_logs_changed_at ON talent_logs(changed_at);