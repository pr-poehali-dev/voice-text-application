-- Добавляем поле avatar_url к таблице users
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Добавляем поле characters_used для отслеживания использованных символов в текущем периоде
ALTER TABLE users ADD COLUMN IF NOT EXISTS characters_used INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS usage_reset_date DATE DEFAULT CURRENT_DATE;