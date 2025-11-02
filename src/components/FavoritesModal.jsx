import React, { useState, useEffect } from 'react';
import './ModalBase.css';
import './FavoritesModal.css';

function FavoritesModal({ onClose, onNavigate }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    if (window.electronAPI) {
      try {
        const data = await window.electronAPI.favoritesGetAll();
        setFavorites(data);
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.electronAPI) {
      await window.electronAPI.favoritesRemove(id);
      loadFavorites();
    }
  };

  const handleNavigate = (url) => {
    onNavigate(url);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content favorites-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Favoritos</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <div className="loading">Carregando...</div>
          ) : favorites.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              <p>Nenhum favorito ainda</p>
            </div>
          ) : (
            <div className="favorites-list">
              {favorites.map((fav) => (
                <div key={fav.id} className="favorite-item">
                  <div className="favorite-icon">
                    {fav.favicon ? (
                      <img src={fav.favicon} alt="" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                      </svg>
                    )}
                  </div>
                  <div className="favorite-info" onClick={() => handleNavigate(fav.url)}>
                    <div className="favorite-title">{fav.title}</div>
                    <div className="favorite-url">{fav.url}</div>
                  </div>
                  <button 
                    className="favorite-delete"
                    onClick={() => handleDelete(fav.id)}
                    title="Remover favorito"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FavoritesModal;

