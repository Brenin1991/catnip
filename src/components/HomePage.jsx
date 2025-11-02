import React, { useState, useEffect, useRef } from 'react';
import './HomePage.css';

function HomePage({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [recentHistory, setRecentHistory] = useState([]);
  const [activeView, setActiveView] = useState('search'); // search, favorites, history
  const searchInputRef = useRef(null);

  useEffect(() => {
    loadFavorites();
    loadRecentHistory();
    
    // Focar no input quando a página aparecer
    const timer = setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const loadFavorites = async () => {
    if (window.electronAPI) {
      try {
        const data = await window.electronAPI.favoritesGetAll();
        setFavorites(data.slice(0, 8)); // Top 8 favoritos
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
      }
    }
  };

  const loadRecentHistory = async () => {
    if (window.electronAPI) {
      try {
        const data = await window.electronAPI.historyGet({ limit: 8 });
        setRecentHistory(data);
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(searchQuery);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      // Navegação por teclado pode ser implementada aqui
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSearch(e);
    }
  };

  const getDomainFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (minutes < 1) return 'Agora';
      if (minutes < 60) return `${minutes}m`;
      if (hours < 24) return `${hours}h`;
      if (days < 7) return `${days}d`;
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="home-page">
      <div className="home-content">
        <div className="home-main">
          <form className="search-box" onSubmit={handleSearch}>
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder="Buscar ou digite uma URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </form>

          <div className="quick-access">
            {favorites.length > 0 && (
              <div className="access-section">
                <div className="access-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>Favoritos</span>
                </div>
                <div className="access-items">
                  {favorites.map(fav => (
                    <button
                      key={fav.id}
                      className="access-item"
                      onClick={() => onNavigate(fav.url)}
                      title={fav.url}
                    >
                      <span className="access-item-title">{fav.title}</span>
                      <span className="access-item-url">{getDomainFromUrl(fav.url)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {recentHistory.length > 0 && (
              <div className="access-section">
                <div className="access-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>Visitado Recentemente</span>
                </div>
                <div className="access-items">
                  {recentHistory.map(item => (
                    <button
                      key={item.id}
                      className="access-item"
                      onClick={() => onNavigate(item.url)}
                      title={item.url}
                    >
                      <span className="access-item-title">{item.title}</span>
                      <span className="access-item-meta">
                        {getDomainFromUrl(item.url)} • {formatTime(item.last_visit_at)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {favorites.length === 0 && recentHistory.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <p className="empty-text">Comece navegando ou adicione favoritos</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

