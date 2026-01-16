-- M0 占位：核心表结构草案
-- 注意：实际迁移与索引会在 MVP 前完善

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin','coach','student')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  education TEXT,
  major TEXT,
  political_status TEXT,
  grad_type TEXT,
  region_preferences TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  city TEXT,
  education_required TEXT,
  major_required TEXT,
  political_required TEXT,
  deadline DATE,
  source_url TEXT,
  jd_text TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_profiles(id),
  job_id UUID REFERENCES jobs(id),
  score NUMERIC(5,2),
  reasons TEXT[],
  risks TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES users(id),
  student_id UUID REFERENCES student_profiles(id),
  status TEXT DEFAULT 'draft',
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
