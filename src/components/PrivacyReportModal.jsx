import React, { useState, useEffect } from 'react';
import './ModalBase.css';
import './PrivacyReportModal.css';

function PrivacyReportModal({ onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    
    // Atualizar estatísticas a cada 2 segundos
    const interval = setInterval(loadStats, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    if (window.electronAPI) {
      try {
        const data = await window.electronAPI.getPrivacyStats();
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        setLoading(false);
      }
    }
  };

  const resetStats = async () => {
    if (window.confirm('Tem certeza que deseja resetar todas as estatísticas?')) {
      if (window.electronAPI) {
        try {
          await window.electronAPI.resetPrivacyStats();
          await loadStats();
        } catch (error) {
          console.error('Erro ao resetar estatísticas:', error);
        }
      }
    }
  };

  if (loading || !stats) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Relatório de Privacidade</h2>
            <button className="modal-close" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="loading">
            <p>Carregando estatísticas...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalBlocked = stats.trackersBlocked + stats.adsBlocked + stats.thirdPartyCookiesBlocked + stats.thirdPartyScriptsBlocked;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Relatório de Privacidade</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="report-content">
          <div className="stats-summary">
            <div className="stat-card total">
              <div className="stat-icon">🛡️</div>
              <div className="stat-info">
                <div className="stat-value">{totalBlocked.toLocaleString()}</div>
                <div className="stat-label">Total Bloqueado</div>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card tracker">
              <div className="stat-icon">👁️</div>
              <div className="stat-info">
                <div className="stat-value">{stats.trackersBlocked.toLocaleString()}</div>
                <div className="stat-label">Rastreadores Bloqueados</div>
                <div className="stat-desc">Scripts e requisições de rastreamento</div>
              </div>
            </div>

            <div className="stat-card ads">
              <div className="stat-icon">📢</div>
              <div className="stat-info">
                <div className="stat-value">{stats.adsBlocked.toLocaleString()}</div>
                <div className="stat-label">Anúncios Bloqueados</div>
                <div className="stat-desc">Scripts e recursos publicitários</div>
              </div>
            </div>

            <div className="stat-card cookies">
              <div className="stat-icon">🍪</div>
              <div className="stat-info">
                <div className="stat-value">{stats.thirdPartyCookiesBlocked.toLocaleString()}</div>
                <div className="stat-label">Cookies de Terceiros Bloqueados</div>
                <div className="stat-desc">Cookies bloqueados em requisições</div>
              </div>
            </div>

            <div className="stat-card scripts">
              <div className="stat-icon">📜</div>
              <div className="stat-info">
                <div className="stat-value">{stats.thirdPartyScriptsBlocked.toLocaleString()}</div>
                <div className="stat-label">Scripts de Terceiros Bloqueados</div>
                <div className="stat-desc">Scripts externos bloqueados</div>
              </div>
            </div>
          </div>

          {stats.topTrackers && stats.topTrackers.length > 0 && (
            <div className="top-trackers">
              <h3>Top Domínios Bloqueados</h3>
              <div className="trackers-list">
                {stats.topTrackers.slice(0, 10).map((tracker, index) => (
                  <div key={index} className="tracker-item">
                    <div className="tracker-rank">{index + 1}</div>
                    <div className="tracker-domain">{tracker.domain}</div>
                    <div className="tracker-count">{tracker.count.toLocaleString()}x</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="report-footer">
            <button className="btn-secondary" onClick={resetStats}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              Resetar Estatísticas
            </button>
            <div className="last-updated">
              Última atualização: {new Date(stats.lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyReportModal;

