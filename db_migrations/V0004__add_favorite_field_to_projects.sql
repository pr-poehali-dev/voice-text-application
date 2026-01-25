-- Добавить поле is_favorite в таблицу projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;

-- Создать индекс для быстрого поиска избранных проектов
CREATE INDEX IF NOT EXISTS idx_projects_favorite 
ON projects(user_id, is_favorite) 
WHERE is_favorite = TRUE;
