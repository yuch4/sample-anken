-- 営業案件管理システム データベーススキーマ

-- ユーザーテーブル拡張（auth.usersに追加情報を保存）
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'manager', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 案件テーブル
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'negotiation', 'proposal', 'won', 'lost')),
  sales_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  gross_profit DECIMAL(15,2) NOT NULL DEFAULT 0,
  probability INTEGER NOT NULL DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  category VARCHAR(50),
  expected_order_month DATE,
  expected_booking_month DATE,
  assigned_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 活動履歴テーブル
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('visit', 'call', 'email', 'meeting')),
  content TEXT NOT NULL,
  activity_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 月次目標テーブル
CREATE TABLE IF NOT EXISTS public.monthly_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_month DATE NOT NULL,
  sales_target DECIMAL(15,2) NOT NULL DEFAULT 0,
  profit_target DECIMAL(15,2) NOT NULL DEFAULT 0,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(target_month, user_id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_projects_assigned_user ON public.projects(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_expected_order_month ON public.projects(expected_order_month);
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON public.projects(deleted_at);
CREATE INDEX IF NOT EXISTS idx_activities_project_id ON public.activities(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_targets_target_month ON public.monthly_targets(target_month);
CREATE INDEX IF NOT EXISTS idx_monthly_targets_user_id ON public.monthly_targets(user_id);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_targets_updated_at BEFORE UPDATE ON public.monthly_targets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) 有効化
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_targets ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: users
-- ユーザーは自分の情報のみ読み取り可能、管理者は全員の情報を読み取り・更新可能
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLSポリシー: projects
-- ユーザーは全案件を閲覧可能、自分が担当の案件は更新可能、マネージャーと管理者は全件更新可能
CREATE POLICY "Users can view all projects" ON public.projects
  FOR SELECT USING (
    deleted_at IS NULL AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can create projects" ON public.projects
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update their own projects" ON public.projects
  FOR UPDATE USING (
    assigned_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Managers and admins can delete projects" ON public.projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

-- RLSポリシー: activities
-- ユーザーは全活動履歴を閲覧可能、自分が作成した活動履歴は編集可能
CREATE POLICY "Users can view all activities" ON public.activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = activities.project_id AND deleted_at IS NULL
    )
  );

CREATE POLICY "Users can create activities" ON public.activities
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update their own activities" ON public.activities
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own activities" ON public.activities
  FOR DELETE USING (user_id = auth.uid());

-- RLSポリシー: monthly_targets
-- 全員が目標を閲覧可能、管理者とマネージャーのみ作成・更新可能
CREATE POLICY "Users can view all targets" ON public.monthly_targets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Managers and admins can create targets" ON public.monthly_targets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Managers and admins can update targets" ON public.monthly_targets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Managers and admins can delete targets" ON public.monthly_targets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );
