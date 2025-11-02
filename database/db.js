const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

let db = null;
let SQL = null;

async function initDatabase() {
  if (db) return db;

  try {
    SQL = await initSqlJs();
    const dbPath = path.join(app.getPath('userData'), 'privacy-browser.db');
    
    // Carregar banco existente ou criar novo
    if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
      createTables();
    }

    return db;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      favicon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      visit_count INTEGER DEFAULT 1,
      last_visit_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS downloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      url TEXT NOT NULL,
      path TEXT NOT NULL,
      total_bytes INTEGER,
      received_bytes INTEGER DEFAULT 0,
      status TEXT DEFAULT 'downloading',
      error TEXT,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      paused_at DATETIME
    );

    CREATE INDEX IF NOT EXISTS idx_history_url ON history(url);
    CREATE INDEX IF NOT EXISTS idx_history_last_visit ON history(last_visit_at DESC);
    CREATE INDEX IF NOT EXISTS idx_favorites_url ON favorites(url);
    CREATE INDEX IF NOT EXISTS idx_downloads_status ON downloads(status);
  `);
  saveDatabase();
}

function saveDatabase() {
  if (!db) return;
  
  try {
    const dbPath = path.join(app.getPath('userData'), 'privacy-browser.db');
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (error) {
    console.error('Erro ao salvar banco de dados:', error);
  }
}

// Funções auxiliares para executar queries
function execQuery(sql, params = []) {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const result = [];
  while (stmt.step()) {
    result.push(stmt.getAsObject());
  }
  stmt.free();
  return result;
}

function execRun(sql, params = []) {
  if (!db) throw new Error('Database not initialized');
  try {
    db.run(sql, params);
    saveDatabase();
  } catch (error) {
    // Re-throw para que o código chamador possa lidar com o erro
    throw error;
  }
}

// Inicializar banco quando módulo for carregado
let dbInitPromise = null;

function getDb() {
  if (!dbInitPromise) {
    dbInitPromise = initDatabase();
  }
  return dbInitPromise;
}

// Funções para uso no main.js
const dbFunctions = {
  // Favoritos
  insertFavorite: async (title, url, favicon) => {
    await getDb();
    
    // Verificar se já existe
    const existing = execQuery('SELECT id FROM favorites WHERE url = ?', [url]);
    
    if (existing.length > 0) {
      // Atualizar existente
      execRun('UPDATE favorites SET title = ?, favicon = ?, updated_at = datetime("now") WHERE url = ?', 
        [title, favicon || null, url]);
      return { lastInsertRowid: existing[0].id };
    } else {
      // Inserir novo
      const stmt = db.prepare('INSERT INTO favorites (title, url, favicon, updated_at) VALUES (?, ?, ?, datetime("now"))');
      stmt.bind([title, url, favicon || null]);
      stmt.step();
      stmt.free();
      
      saveDatabase();
      
      const result = execQuery('SELECT id FROM favorites WHERE url = ? ORDER BY id DESC LIMIT 1', [url]);
      return { lastInsertRowid: result[0]?.id || null };
    }
  },

  deleteFavorite: async (id) => {
    await getDb();
    execRun('DELETE FROM favorites WHERE id = ?', [id]);
  },

  deleteFavoriteByUrl: async (url) => {
    await getDb();
    execRun('DELETE FROM favorites WHERE url = ?', [url]);
  },

  getFavorite: async (url) => {
    await getDb();
    const result = execQuery('SELECT * FROM favorites WHERE url = ?', [url]);
    return result[0] || null;
  },

  getAllFavorites: async () => {
    await getDb();
    return execQuery('SELECT * FROM favorites ORDER BY updated_at DESC');
  },

  // Histórico
  insertHistory: async (title, url) => {
    await getDb();
    try {
      // Usar INSERT OR REPLACE para evitar erros de UNIQUE constraint
      // Isso atualiza se já existir ou insere se não existir
      const existing = execQuery('SELECT id, visit_count FROM history WHERE url = ?', [url]);
      if (existing.length > 0) {
        // Atualizar existente - incrementar contador
        execRun('UPDATE history SET visit_count = visit_count + 1, last_visit_at = datetime("now"), title = ? WHERE url = ?', 
          [title, url]);
      } else {
        // Inserir novo registro
        execRun('INSERT INTO history (title, url, last_visit_at, visit_count) VALUES (?, ?, datetime("now"), 1)', 
          [title, url]);
      }
    } catch (error) {
      // Se ainda assim houver erro de UNIQUE (race condition), tentar apenas atualizar
      if (error.message && error.message.includes('UNIQUE')) {
        try {
          execRun('UPDATE history SET visit_count = visit_count + 1, last_visit_at = datetime("now"), title = ? WHERE url = ?', 
            [title, url]);
        } catch (updateError) {
          console.error('Erro ao atualizar histórico após UNIQUE:', updateError);
          throw error;
        }
      } else {
        console.error('Erro ao inserir histórico:', error);
        throw error;
      }
    }
  },

  updateHistoryTitle: async (url, title) => {
    await getDb();
    // Atualizar o título do histórico para esta URL
    // Atualizar apenas se o título atual for igual à URL (título temporário) ou diferente do novo título
    execRun('UPDATE history SET title = ? WHERE url = ?', [title, url]);
  },

  deleteHistory: async (id) => {
    await getDb();
    execRun('DELETE FROM history WHERE id = ?', [id]);
  },

  deleteHistoryByUrl: async (url) => {
    await getDb();
    execRun('DELETE FROM history WHERE url = ?', [url]);
  },

  clearHistory: async () => {
    await getDb();
    execRun('DELETE FROM history');
  },

  getHistory: async (limit = 50, offset = 0) => {
    await getDb();
    return execQuery('SELECT * FROM history ORDER BY last_visit_at DESC LIMIT ? OFFSET ?', [limit, offset]);
  },

  searchHistory: async (query, limit = 20) => {
    await getDb();
    const searchTerm = `%${query}%`;
    return execQuery('SELECT * FROM history WHERE title LIKE ? OR url LIKE ? ORDER BY last_visit_at DESC LIMIT ?', 
      [searchTerm, searchTerm, limit]);
  },

  deleteOldHistory: async (days = 30) => {
    await getDb();
    execRun('DELETE FROM history WHERE last_visit_at < datetime("now", "-" || ? || " days")', [days]);
  },

  // Downloads
  insertDownload: async (filename, url, filePath, totalBytes, status) => {
    await getDb();
    
    // Para sql.js, fazer o INSERT e depois buscar o ID inserido
    const stmt = db.prepare('INSERT INTO downloads (filename, url, path, total_bytes, status) VALUES (?, ?, ?, ?, ?)');
    stmt.bind([filename, url, filePath, totalBytes || 0, status]);
    stmt.step();
    stmt.free();
    
    saveDatabase();
    
    // Buscar o ID do registro recém-inserido
    const result = execQuery('SELECT id FROM downloads WHERE filename = ? AND url = ? ORDER BY id DESC LIMIT 1', [filename, url]);
    const insertedId = result[0]?.id || null;
    
    return { lastInsertRowid: insertedId };
  },

  updateDownload: async (receivedBytes, status, error, completedAt, pausedAt, id, totalBytes = null) => {
    await getDb();
    if (totalBytes !== null) {
      execRun('UPDATE downloads SET received_bytes = ?, status = ?, error = ?, completed_at = ?, paused_at = ?, total_bytes = ? WHERE id = ?', 
        [receivedBytes, status, error, completedAt, pausedAt, totalBytes, id]);
    } else {
      execRun('UPDATE downloads SET received_bytes = ?, status = ?, error = ?, completed_at = ?, paused_at = ? WHERE id = ?', 
        [receivedBytes, status, error, completedAt, pausedAt, id]);
    }
  },

  getDownload: async (id) => {
    await getDb();
    const result = execQuery('SELECT * FROM downloads WHERE id = ?', [id]);
    return result[0] || null;
  },

  getAllDownloads: async (limit = 50, offset = 0) => {
    await getDb();
    return execQuery('SELECT * FROM downloads ORDER BY started_at DESC LIMIT ? OFFSET ?', [limit, offset]);
  },

  deleteDownload: async (id) => {
    await getDb();
    execRun('DELETE FROM downloads WHERE id = ?', [id]);
  },

  clearCompletedDownloads: async () => {
    await getDb();
    execRun('DELETE FROM downloads WHERE status = ?', ['completed']);
  },
};

module.exports = dbFunctions;
