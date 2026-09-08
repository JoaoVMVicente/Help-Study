import { Response } from 'express';
import { db } from '../database/db';
import { AuthRequest } from '../middlewares/authMiddleware';

// Listar tarefas do usuário logado
export const getTasks = (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar tarefas.' });
  }
};

// Criar tarefa vinculada ao usuário logado
export const createTask = (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { title, description, category_color, estimated_minutes, due_date, priority } = req.body;

    const stmt = db.prepare(`
      INSERT INTO tasks (user_id, title, description, category_color, estimated_minutes, due_date, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId,
      title,
      description || null,
      category_color || '#3B82F6',
      Number(estimated_minutes) || 30,
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

// Atualizar status (Pendentes/Concluídas) garantindo pertencimento ao usuário
export const updateTaskStatus = (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { status } = req.body;

    const stmt = db.prepare('UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?');
    const result = stmt.run(status, id, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada ou não autorizada.' });
    }

    res.json({ message: 'Status atualizado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar tarefa.' });
  }
};

// Deletar tarefa garantindo pertencimento ao usuário
export const deleteTask = (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const stmt = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?');
    const result = stmt.run(id, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada ou não autorizada.' });
    }

    res.json({ message: 'Tarefa deletada com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar tarefa.' });
  }
};