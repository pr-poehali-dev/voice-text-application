CREATE TABLE IF NOT EXISTS plans (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  characters_limit INTEGER NOT NULL DEFAULT 5000,
  max_chars_per_request INTEGER NOT NULL DEFAULT 5000,
  duration_days INTEGER NOT NULL DEFAULT 30,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  features JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO plans (id, name, price, characters_limit, max_chars_per_request, duration_days, is_popular, is_active, features) VALUES
  ('free',      'Бесплатный', 0,     5000,   5000, 30, FALSE, TRUE, '["5 000 символов в месяц","Базовые голоса","MP3 формат","Базовая поддержка"]'),
  ('basic',     'Базовый',    500,   50000,  5000, 30, FALSE, TRUE, '["50 000 символов в месяц","Все базовые голоса","MP3, WAV, OGG форматы","Приоритетная поддержка","История проектов"]'),
  ('pro',       'Профи',      5000,  300000, 5000, 30, TRUE,  TRUE, '["300 000 символов в месяц","Все голоса + премиум","Все форматы","Поддержка 24/7","API доступ","Без водяных знаков"]'),
  ('unlimited', 'Безлимит',   15000, -1,     8000, 30, FALSE, TRUE, '["Безлимитные символы","До 8 000 символов за запрос","Все голоса + эксклюзивные","Все форматы","Персональный менеджер","Полный API доступ","Кастомные голоса"]')
ON CONFLICT (id) DO NOTHING;
