import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/db';

const JWT_SECRET = process.env.JWT_SECRET || 'helpstudy_secret_key_123';

// Registro de Usuário
export const register = (req: Request, res: Response) => {
  try {
    const { name, email, password, profile_type } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    // Verificar se e-mail já existe
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }

    // Criptografar a senha
    const password_hash = bcrypt.hashSync(password, 8);

    const stmt = db.prepare(`
      INSERT INTO users (name, email, password_hash, profile_type)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(name, email, password_hash, profile_type || 'STUDENT');

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      userId: result.lastInsertRowid
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
};

// Login
export const login = (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Validar senha
    const isValidPassword = bcrypt.compareSync(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Gerar Token JWT (válido por 7 dias)
    const token = jwt.sign({ userId: user.id, name: user.name }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_type: user.profile_type,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao realizar login.' });
  }
};