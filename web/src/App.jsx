import { useEffect, useMemo, useState } from 'react';

const getApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    if (hostname.endsWith('.app.github.dev')) {
      const base = hostname.replace(/-\d+\.app\.github\.dev$/, '');
      return `https://${base}-3001.app.github.dev`;
    }

    if (['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname)) {
      return 'http://localhost:3001';
    }
  }

  return 'http://localhost:3001';
};

const API_URL = getApiBaseUrl();

function App() {
  const [token, setToken] = useState(localStorage.getItem('diatinf-token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('diatinf-user') || 'null'));
  const [view, setView] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [stats, setStats] = useState({ who_you_comment: [], who_comments_you: [] });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authForm, setAuthForm] = useState({ name: '', username: 'julianalima', password: '2448', mode: 'login' });
  const [newPost, setNewPost] = useState('');

  const fetchJson = async (url, options = {}) => {
    try {
      console.log(`${API_URL}${url}`);
      
      const response = await fetch(`${API_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
        ...options,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição.');
      }
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao conectar com o servidor.';
      if (message === 'Failed to fetch') {
        throw new Error('Não foi possível conectar com a API. Verifique se o backend está rodando em http://localhost:3001.');
      }
      throw new Error(message);
    }
  };

  const loadPosts = async () => {
    try {
      const data = await fetchJson(`/posts?search=${encodeURIComponent(search)}${user ? `&user_id=${user.id}` : ''}`);
      setPosts(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadMyPosts = async () => {
    if (!token) return;
    try {
      const data = await fetchJson('/posts/me');
      setMyPosts(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadStats = async () => {
    if (!token) return;
    try {
      const data = await fetchJson('/stats');
      setStats(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!token) return;
    const sync = async () => {
      setLoading(true);
      try {
        const profile = await fetchJson('/auth/me');
        setUser(profile.user);
        localStorage.setItem('diatinf-user', JSON.stringify(profile.user));
        await loadPosts();
        await loadMyPosts();
        await loadStats();
      } catch (err) {
        setError(err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    sync();
  }, [token]);

  useEffect(() => {
    if (token && user) {
      loadPosts();
    }
  }, [search]);

  const handleAuth = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      const endpoint = authForm.mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = authForm.mode === 'login'
        ? { username: authForm.username, password: authForm.password }
        : { name: authForm.name, username: authForm.username, password: authForm.password };

      const data = await fetchJson(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('diatinf-token', data.token);
      localStorage.setItem('diatinf-user', JSON.stringify(data.user));
      setSuccess(authForm.mode === 'login' ? 'Login realizado com sucesso!' : 'Usuário criado com sucesso!');
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setPosts([]);
    setMyPosts([]);
    setStats({ who_you_comment: [], who_comments_you: [] });
    localStorage.removeItem('diatinf-token');
    localStorage.removeItem('diatinf-user');
  };

  const handleCreatePost = async (event) => {
    event.preventDefault();
    if (!newPost.trim()) {
      setError('Escreva algo antes de publicar.');
      return;
    }

    try {
      await fetchJson('/posts', {
        method: 'POST',
        body: JSON.stringify({ content: newPost }),
      });
      setNewPost('');
      setSuccess('Publicação criada com sucesso!');
      await loadPosts();
      await loadMyPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleComment = async (postId, content, parentId = null) => {
    if (!content.trim()) return;
    try {
      await fetchJson('/comments', {
        method: 'POST',
        body: JSON.stringify({ post_id: postId, parent_id: parentId, content }),
      });
      setSuccess('Comentário adicionado!');
      await loadPosts();
      await loadMyPosts();
      await loadStats();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRating = async (postId, value) => {
    try {
      await fetchJson('/ratings', {
        method: 'POST',
        body: JSON.stringify({ post_id: postId, value }),
      });
      setSuccess('Avaliação salva!');
      await loadPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredPosts = useMemo(() => {
    if (!search.trim()) return posts;
    return posts.filter((post) => post.content.toLowerCase().includes(search.toLowerCase()));
  }, [posts, search]);

  const renderComments = (comments, depth = 0) => comments.map((comment) => (
    <div key={comment.id} className="comment-item" style={{ marginLeft: depth * 18 }}>
      <div className="comment-head">
        <strong>{comment.author.name}</strong>
        <span>@{comment.author.username}</span>
      </div>
      <p>{comment.content}</p>
      <ReplyBox postId={comment.post_id} parentId={comment.id} onReply={handleComment} />
      {comment.replies && comment.replies.length > 0 && renderComments(comment.replies, depth + 1)}
    </div>
  ));

  if (!token || !user) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="brand-block">
            <span className="brand-pill">DIATINF X</span>
            <h1>Rede social acadêmica</h1>
          </div>

          <form onSubmit={handleAuth} className="auth-form">
            {authForm.mode === 'register' && (
              <input
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                placeholder="Seu nome completo"
              />
            )}

            <input
              value={authForm.username}
              onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
              placeholder="Nome de usuário"
            />
            <input
              type="password"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              placeholder="Senha"
            />

            {error && <p className="message error">{error}</p>}
            {success && <p className="message success">{success}</p>}

            <button type="submit">{authForm.mode === 'login' ? 'Entrar' : 'Criar conta'}</button>
            <button
              type="button"
              className="ghost"
              onClick={() => {
                setAuthForm({ ...authForm, mode: authForm.mode === 'login' ? 'register' : 'login' });
                setError('');
                setSuccess('');
              }}
            >
              {authForm.mode === 'login' ? 'Criar conta' : 'Voltar ao login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-pill">DIATINF X</span>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar publicações..."
          className="search"
        />
        <div className="user-box">
          <span>{user.name}</span>
          <button className="logout-btn" onClick={logout}>Sair</button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <button className={view === 'feed' ? 'nav active' : 'nav'} onClick={() => setView('feed')}>Feed Global</button>
          <button className={view === 'my-posts' ? 'nav active' : 'nav'} onClick={() => setView('my-posts')}>Meus Posts</button>
          <button className={view === 'stats' ? 'nav active' : 'nav'} onClick={() => setView('stats')}>Social Stats</button>
          <button className={view === 'profile' ? 'nav active' : 'nav'} onClick={() => setView('profile')}>Perfil</button>
        </aside>

        <main className="main-content">
          {error && <p className="message error">{error}</p>}
          {success && <p className="message success">{success}</p>}

          <form className="composer" onSubmit={handleCreatePost}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="No que você está pensando?"
              rows={3}
            />
            <div className="composer-actions">
              <button type="submit">Publicar</button>
            </div>
          </form>

          {view === 'feed' && (
            <section className="feed">
              {loading && <p>Carregando publicações...</p>}
              {filteredPosts.length === 0 && <p>Nenhuma publicação encontrada.</p>}
              {filteredPosts.map((post) => (
                <article key={post.id} className="post-card">
                  <div className="post-header">
                    <div className="avatar">{post.author.name[0]}</div>
                    <div>
                      <h3>{post.author.name}</h3>
                      <small>@{post.author.username}</small>
                    </div>
                  </div>

                  <p className="post-content">{post.content}</p>

                  <div className="post-meta">
                    <span>{new Date(post.created_at).toLocaleString('pt-BR')}</span>
                    <span>{post.comments.length} comentários</span>
                    <span>{post.rating} ★</span>
                  </div>

                  <div className="rating-row">
                    {[1, 2, 3].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={post.my_rating === value ? 'star selected' : 'star'}
                        onClick={() => handleRating(post.id, value)}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <div className="comment-list">
                    {post.comments.length > 0 ? renderComments(post.comments) : <p className="empty">Seja o primeiro a comentar.</p>}
                  </div>

                  <ReplyBox postId={post.id} parentId={null} onReply={handleComment} />
                </article>
              ))}
            </section>
          )}

          {view === 'my-posts' && (
            <section className="feed">
              {myPosts.length === 0 && <p>Você ainda não publicou nada.</p>}
              {myPosts.map((post) => (
                <article key={post.id} className="post-card compact">
                  <div className="post-header">
                    <div className="avatar">{user.name[0]}</div>
                    <div>
                      <h3>{user.name}</h3>
                      <small>@{user.username}</small>
                    </div>
                  </div>
                  <p>{post.content}</p>
                  <div className="post-meta">
                    <span>{new Date(post.created_at).toLocaleString('pt-BR')}</span>
                    <span>{post.comments.length} comentários</span>
                    <span>{post.rating} ★</span>
                  </div>
                </article>
              ))}
            </section>
          )}

          {view === 'stats' && (
            <section className="stats-panel">
              <div className="stats-card">
                <h2>Quem você mais comenta</h2>
                <ul>
                  {stats.who_you_comment.length === 0 && <li>Nenhuma interação registrada.</li>}
                  {stats.who_you_comment.map((item) => (
                    <li key={item.id}><span>{item.name}</span> <strong>💬 {item.count}</strong></li>
                  ))}
                </ul>
              </div>

              <div className="stats-card">
                <h2>Quem mais te comenta</h2>
                <ul>
                  {stats.who_comments_you.length === 0 && <li>Ninguém comentou ainda.</li>}
                  {stats.who_comments_you.map((item) => (
                    <li key={item.id}><span>{item.name}</span> <strong>💬 {item.count}</strong></li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {view === 'profile' && (
            <section className="stats-panel">
              <div className="stats-card">
                <h2>Perfil público</h2>
                <div className="profile-panel">
                  <div className="avatar large">{user.name[0]}</div>
                  <div>
                    <h3>{user.name}</h3>
                    <p>@{user.username}</p>
                  </div>
                </div>
                <p>Publicações: {myPosts.length}</p>
              </div>
            </section>
          )}
        </main>

        <aside className="right-panel">
          <div className="mini-card">
            <h3>Social Stats</h3>
            <p><strong>{stats.who_you_comment.length}</strong> perfis com interação</p>
            <p><strong>{stats.who_comments_you.length}</strong> comentaristas ativos</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ReplyBox({ postId, parentId, onReply }) {
  const [value, setValue] = useState('');

  return (
    <div className="reply-box">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={parentId ? 'Responder comentário...' : 'Adicionar comentário...'}
      />
      <button
        type="button"
        onClick={() => {
          onReply(postId, value, parentId);
          setValue('');
        }}
      >
        Enviar
      </button>
    </div>
  );
}

export default App;
