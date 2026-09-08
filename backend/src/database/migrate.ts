import { db } from './db';

const createTablesSQL = `
-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    profile_type TEXT CHECK (profile_type IN ('STUDENT', 'WORKER', 'BOTH')) DEFAULT 'STUDENT',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Tarefas
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category_color TEXT DEFAULT '#3B82F6',
    estimated_minutes INTEGER NOT NULL,
    due_date DATETIME NOT NULL,
    status TEXT CHECK (status IN ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA')) DEFAULT 'PENDENTE',
    priority TEXT CHECK (priority IN ('BAIXA', 'MEDIA', 'ALTA')) DEFAULT 'MEDIA',
    notify_by_email BOOLEAN DEFAULT 1,
    notify_before_minutes INTEGER DEFAULT 30,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Inserir usuário padrão para testes
INSERT OR IGNORE INTO users (id, name, email, password_hash, profile_type)
VALUES (1, 'Usuário Teste', 'teste@helpstudy.com', 'hash_ficticia', 'STUDENT');
`;

function runMigrations() {
  try {
    db.exec(createTablesSQL);
    console.log('✅ Tabelas e usuário padrão criados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
  }
}

runMigrations();