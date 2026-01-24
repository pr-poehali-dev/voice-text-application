-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'pro', 'unlimited')),
    balance INTEGER DEFAULT 0,
    characters_used INTEGER DEFAULT 0,
    characters_limit INTEGER DEFAULT 5000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица проектов озвучки
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    voice_id VARCHAR(100) NOT NULL,
    voice_name VARCHAR(100) NOT NULL,
    speed DECIMAL(3,1) DEFAULT 1.0,
    pitch DECIMAL(3,1) DEFAULT 1.0,
    format VARCHAR(10) DEFAULT 'mp3',
    audio_url TEXT,
    duration INTEGER,
    character_count INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица транзакций
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('payment', 'refund', 'bonus')),
    plan VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    payment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица статистики
CREATE TABLE IF NOT EXISTS usage_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    characters_used INTEGER DEFAULT 0,
    projects_created INTEGER DEFAULT 0,
    audio_duration INTEGER DEFAULT 0,
    UNIQUE(user_id, date)
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_date ON usage_stats(user_id, date);

-- Вставка тестового администратора
INSERT INTO users (email, password_hash, name, role, plan, characters_limit)
VALUES ('admin@voiceai.ru', 'admin123hash', 'Администратор', 'admin', 'unlimited', 999999999)
ON CONFLICT (email) DO NOTHING;