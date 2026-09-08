import { Request, Response } from 'express';
import { db } from '../database/db';

// 1. Criar uma nova tarefa
export const createTask = (req: Request, res: Response) => {
  try {
    const { title, description, category_color, estimated_minutes, due_date, priority } = req.body;

    // Usuário fixo (1) apenas para testes da Semana 1
    const userId = 1;

    const stmt = db.prepare(`
      INSERT INTO tasks (user_id, title, description, category_color, estimated_minutes, due_date, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId,
      title,
      description || null,
      category_color || '#3B82F6',
      estimated_minutes,
      due_date,
      priority || 'MEDIA'
    );

    res.status(201).json({
      message: 'Tarefa criada com sucesso!',
      taskId: result.lastInsertRowid
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar tarefa.' });
  }
};

// 2. Listar todas as tarefas
export const getTasks = (_req: Request, res: Response) => {
  try {
    const stmt = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC');
    const tasks = stmt.all();

    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar tarefas.' });
  }
};