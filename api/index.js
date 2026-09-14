const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'diatinf-secret';
const dbPath = path.join(__dirname, 'database.sqlite');

if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new sqlite3.Database(dbPath);

const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '1mb' }));

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Token não informado.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido.' });
  }
}

function buildUserPayload(user) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    avatar: user.avatar,
  };
}

function normalizeComments(rawComments) {
  const byId = new Map();
  const roots = [];

  rawComments.forEach((comment) => {
    const item = {
      id: comment.id,
      user_id: comment.user_id,
      post_id: comment.post_id,
      parent_id: comment.parent_id,
      content: comment.content,
      created_at: comment.created_at,
      author: {
        id: comment.author_id,
        name: comment.author_name,
        username: comment.author_username,
        avatar: comment.author_avatar,
      },
      replies: [],
    };

    byId.set(comment.id, item);
    if (!comment.parent_id) {
      roots.push(item);
    }
  });

  rawComments.forEach((comment) => {
    if (comment.parent_id) {
      const parent = byId.get(comment.parent_id);
      if (parent) parent.replies.push(byId.get(comment.id));
    }
  });

  return roots;
}

async function getPostDetails(post, currentUserId = null) {
  const commentsRows = await all(
    `
      SELECT c.*, u.id AS author_id, u.name AS author_name, u.username AS author_username, u.avatar AS author_avatar
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `,
    [post.id]
  );

  const ratingRows = await all('SELECT value, user_id FROM ratings WHERE post_id = ?', [post.id]);
  const average = ratingRows.length
    ? (ratingRows.reduce((sum, entry) => sum + entry.value, 0) / ratingRows.length).toFixed(1)
    : '0.0';
  const myRating = ratingRows.find((entry) => entry.user_id === currentUserId)?.value || null;

  const comments = normalizeComments(commentsRows);

  return {
    id: post.id,
    content: post.content,
    created_at: post.created_at,
    author: {
      id: post.user_id,
      name: post.name,
      username: post.username,
      avatar: post.avatar,
    },
    comments,
    rating: Number(average),
    ratings_count: ratingRows.length,
    my_rating: myRating,
  };
}

async function initializeDatabase() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      avatar TEXT DEFAULT 'https://api.dicebear.com/7.x/adventurer/svg?seed=diatinf'
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      post_id INTEGER NOT NULL,
      parent_id INTEGER,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(post_id) REFERENCES posts(id),
      FOREIGN KEY(parent_id) REFERENCES comments(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      post_id INTEGER NOT NULL,
      value INTEGER NOT NULL CHECK(value BETWEEN 1 AND 3),
      UNIQUE(user_id, post_id),
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(post_id) REFERENCES posts(id)
    )
  `);

  const defaultUser = await get('SELECT * FROM users WHERE username = ?', ['julianalima']);
  if (!defaultUser) {
    const passwordHash = await bcrypt.hash('2448', 10);
    const user = await run(
      'INSERT INTO users (name, username, password, avatar) VALUES (?, ?, ?, ?)',
      ['Juliana Lima', 'julianalima', passwordHash, 'https://api.dicebear.com/7.x/adventurer/svg?seed=juliana']
    );

    await run(
      'INSERT INTO posts (user_id, content) VALUES (?, ?), (?, ?), (?, ?)',
      [
        user.id, 'A criatividade digital transforma a forma como aprendemos e compartilhamos conhecimento.',
        user.id, 'Hoje foi um ótimo dia para revisar design, produto e possibilidades de inovação.',
        user.id, 'Na DIATINF, a colaboração e a prática fazem toda a diferença no aprendizado.',
      ]
    );

    const otherUser = await run(
      'INSERT INTO users (name, username, password, avatar) VALUES (?, ?, ?, ?)',
      ['João Souza', 'joaosouza', await bcrypt.hash('123456', 10), 'https://api.dicebear.com/7.x/adventurer/svg?seed=joao']
    );

    const postId = await run('INSERT INTO posts (user_id, content) VALUES (?, ?)', [otherUser.id, 'O futuro da tecnologia pede pessoas curiosas, criativas e dispostas a construir soluções reais.']);

    await run('INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)', [user.id, postId.id, 'Muito boa essa reflexão!']);
    await run('INSERT INTO comments (user_id, post_id,content,parent_id) VALUES (?, ?, ?, ?)', [otherUser.id, postId.id, 'Concordo totalmente!', 1]);
    await run('INSERT INTO ratings (user_id, post_id, value) VALUES (?, ?, ?), (?, ?, ?)', [user.id, postId.id, 3, otherUser.id, postId.id, 2]);
  }
}

initializeDatabase().catch((error) => {
  console.error('Erro ao inicializar banco de dados:', error);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Diatinf X API ativa.' });
});

app.post('/auth/register', async (req, res) => {
  const { name, username, password } = req.body || {};

  if (!name || !username || !password) {
    return res.status(400).json({ message: 'Nome, username e senha são obrigatórios.' });
  }

  const existing = await get('SELECT id FROM users WHERE username = ?', [username.trim()]);
  if (existing) {
    return res.status(409).json({ message: 'Usuário já existe.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await run('INSERT INTO users (name, username, password) VALUES (?, ?, ?)', [name.trim(), username.trim(), hashedPassword]);
    const user = await get('SELECT * FROM users WHERE id = ?', [result.id]);

    res.status(201).json({
      token: generateToken(user),
      user: buildUserPayload(user),
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar usuário.', error: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Username e senha são obrigatórios.' });
  }

  const user = await get('SELECT * FROM users WHERE username = ?', [username.trim()]);
  if (!user) {
    return res.status(401).json({ message: 'Usuário não encontrado.' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Senha inválida.' });
  }

  res.json({
    token: generateToken(user),
    user: buildUserPayload(user),
  });
});

app.get('/auth/me', authMiddleware, async (req, res) => {
  const user = await get('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }

  res.json({ user: buildUserPayload(user) });
});

app.get('/users', async (req, res) => {
  const users = await all('SELECT id, name, username, avatar FROM users ORDER BY name ASC');
  res.json(users);
});

app.get('/users/:id', async (req, res) => {
  const user = await get('SELECT id, name, username, avatar FROM users WHERE id = ?', [req.params.id]);
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }

  const posts = await all('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC', [req.params.id]);
  res.json({ user, posts });
});

app.get('/posts', async (req, res) => {
  const searchTerm = (req.query.search || '').trim();
  const query = searchTerm
    ? `SELECT p.*, u.name, u.username, u.avatar FROM posts p JOIN users u ON u.id = p.user_id WHERE p.content LIKE ? ORDER BY p.created_at DESC`
    : `SELECT p.*, u.name, u.username, u.avatar FROM posts p JOIN users u ON u.id = p.user_id ORDER BY p.created_at DESC`;

  const params = searchTerm ? [`%${searchTerm}%`] : [];

  const posts = await all(query, params);
  const currentUserId = req.query.user_id ? Number(req.query.user_id) : null;

  const detailedPosts = await Promise.all(posts.map((post) => getPostDetails(post, currentUserId)));
  res.json(detailedPosts);
});

app.get('/posts/me', authMiddleware, async (req, res) => {
  const posts = await all('SELECT p.*, u.name, u.username, u.avatar FROM posts p JOIN users u ON u.id = p.user_id WHERE p.user_id = ? ORDER BY p.created_at DESC', [req.user.id]);
  const detailedPosts = await Promise.all(posts.map((post) => getPostDetails(post, req.user.id)));
  res.json(detailedPosts);
});

app.post('/posts', authMiddleware, async (req, res) => {
  const { content } = req.body || {};

  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'O texto da publicação é obrigatório.' });
  }

  try {
    const result = await run('INSERT INTO posts (user_id, content) VALUES (?, ?)', [req.user.id, content.trim()]);
    const post = await get('SELECT p.*, u.name, u.username, u.avatar FROM posts p JOIN users u ON u.id = p.user_id WHERE p.id = ?', [result.id]);
    const detailedPost = await getPostDetails(post, req.user.id);
    res.status(201).json(detailedPost);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar publicação.', error: error.message });
  }
});

app.post('/comments', authMiddleware, async (req, res) => {
  const { post_id, parent_id, content } = req.body || {};

  if (!post_id || !content || !content.trim()) {
    return res.status(400).json({ message: 'Dados do comentário inválidos.' });
  }

  const postExists = await get('SELECT id FROM posts WHERE id = ?', [post_id]);
  if (!postExists) {
    return res.status(404).json({ message: 'Publicação não encontrada.' });
  }

  if (parent_id) {
    const parentComment = await get('SELECT id FROM comments WHERE id = ?', [parent_id]);
    if (!parentComment) {
      return res.status(404).json({ message: 'Resposta não encontrada.' });
    }
  }

  try {
    const result = await run('INSERT INTO comments (user_id, post_id, parent_id, content) VALUES (?, ?, ?, ?)', [req.user.id, post_id, parent_id || null, content.trim()]);
    const comment = await get(
      `SELECT c.*, u.id AS author_id, u.name AS author_name, u.username AS author_username, u.avatar AS author_avatar
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.id = ?`,
      [result.id]
    );
    res.status(201).json({
      id: comment.id,
      user_id: comment.user_id,
      post_id: comment.post_id,
      parent_id: comment.parent_id,
      content: comment.content,
      created_at: comment.created_at,
      author: {
        id: comment.author_id,
        name: comment.author_name,
        username: comment.author_username,
        avatar: comment.author_avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar comentário.', error: error.message });
  }
});

app.post('/ratings', authMiddleware, async (req, res) => {
  const { post_id, value } = req.body || {};

  if (!post_id || !value) {
    return res.status(400).json({ message: 'Publicação e avaliação são obrigatórios.' });
  }

  if (value < 1 || value > 3) {
    return res.status(400).json({ message: 'A avaliação deve estar entre 1 e 3 estrelas.' });
  }

  const postExists = await get('SELECT id FROM posts WHERE id = ?', [post_id]);
  if (!postExists) {
    return res.status(404).json({ message: 'Publicação não encontrada.' });
  }

  const existingRating = await get('SELECT * FROM ratings WHERE user_id = ? AND post_id = ?', [req.user.id, post_id]);

  try {
    if (existingRating) {
      await run('UPDATE ratings SET value = ? WHERE id = ?', [value, existingRating.id]);
    } else {
      await run('INSERT INTO ratings (user_id, post_id, value) VALUES (?, ?, ?)', [req.user.id, post_id, value]);
    }

    const rows = await all('SELECT value FROM ratings WHERE post_id = ?', [post_id]);
    const average = rows.length
      ? rows.reduce((sum, row) => sum + row.value, 0) / rows.length
      : 0;

    res.status(200).json({ message: 'Avaliação registrada com sucesso.', average: Number(average.toFixed(1)), value });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar avaliação.', error: error.message });
  }
});

app.get('/stats', authMiddleware, async (req, res) => {
  const usersYouComment = await all(
    `
      SELECT u.id, u.name, u.username, COUNT(c.id) as count
      FROM comments c
      JOIN posts p ON p.id = c.post_id
      JOIN users u ON u.id = p.user_id
      WHERE c.user_id = ?
      GROUP BY u.id, u.name, u.username
      ORDER BY count DESC, u.name ASC
      LIMIT 5
    `,
    [req.user.id]
  );

  const usersWhoCommentYou = await all(
    `
      SELECT u.id, u.name, u.username, COUNT(c.id) as count
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.post_id IN (SELECT id FROM posts WHERE user_id = ?)
      GROUP BY u.id, u.name, u.username
      ORDER BY count DESC, u.name ASC
      LIMIT 5
    `,
    [req.user.id]
  );

  res.json({
    who_you_comment: usersYouComment,
    who_comments_you: usersWhoCommentYou,
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Diatinf X API running on http://localhost:${PORT}`);
});
