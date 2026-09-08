import Database from 'better-sqlite3';
import path from 'path';

// Cria o arquivo 'database.sqlite' automaticamente dentro da pasta database
const dbPath = path.resolve(__dirname, '../../database.sqlite');
export const db = new Database(dbPath);

// Configuração opcional para melhorar performance
db.pragma('journal_mode = WAL');