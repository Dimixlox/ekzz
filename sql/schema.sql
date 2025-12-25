

CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  login           VARCHAR(64) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  full_name       VARCHAR(200) NOT NULL,
  phone           VARCHAR(20) NOT NULL,
  email           VARCHAR(200) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_name       VARCHAR(120) NOT NULL,
  desired_start_date DATE NOT NULL,
  payment_method    VARCHAR(30) NOT NULL,
  status            VARCHAR(30) NOT NULL DEFAULT 'Новая',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_app_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_app_course ON applications(course_name);

CREATE TABLE IF NOT EXISTS feedback (
  id              SERIAL PRIMARY KEY,
  application_id  INTEGER UNIQUE NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_app_id ON feedback(application_id);
