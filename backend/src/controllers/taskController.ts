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

// 3. Buscar uma tarefa específica por ID
export const getTaskById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const task = stmt.get(id);

    if (!task) return res.status(404).json({ error: 'Tarefa não encontrada.' });

    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar a tarefa.' });
  }
};

// 4. Atualizar uma tarefa (ex: marcar como concluída)
export const updateTask = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority } = req.body;

    // Busca a tarefa atual primeiro para não apagar dados sem querer
    const currentTask: any = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    
    if (!currentTask) return res.status(404).json({ error: 'Tarefa não encontrada.' });

    const stmt = db.prepare(`
      UPDATE tasks 
      SET title = ?, description = ?, status = ?, priority = ?
      WHERE id = ?
    `);

    stmt.run(
      title || currentTask.title,
      description !== undefined ? description : currentTask.description,
      status || currentTask.status,
      priority || currentTask.priority,
      id
    );

    res.status(200).json({ message: 'Tarefa atualizada com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar a tarefa.' });
  }
};

// 5. Deletar uma tarefa
export const deleteTask = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) return res.status(404).json({ error: 'Tarefa não encontrada.' });

    res.status(200).json({ message: 'Tarefa deletada com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar a tarefa.' });
  }
};