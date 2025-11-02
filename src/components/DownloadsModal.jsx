import React, { useState, useEffect } from 'react';
import './ModalBase.css';
import './DownloadsModal.css';

function DownloadsModal({ onClose }) {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDownloadIds, setNewDownloadIds] = useState(new Set());

  useEffect(() => {
    loadDownloads();
    
    // Escutar eventos de progresso e conclusão
    if (window.electronAPI) {
      // Novo download iniciado
      window.electronAPI.onDownloadStarted((event, data) => {
        // Adicionar animação de feedback
        setNewDownloadIds(prev => new Set([...prev, data.id]));
        setTimeout(() => {
          setNewDownloadIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.id);
            return newSet;
          });
        }, 2000);
        loadDownloads(); // Recarregar lista
      });

      window.electronAPI.onDownloadProgress((event, data) => {
        console.log('📨 Recebido progresso:', data);
        setDownloads(prev => {
          const existing = prev.find(d => d.id === data.id);
          if (existing) {
            // Calcular percentual corretamente
            const percent = data.total && data.total > 0 
              ? parseFloat(((data.received / data.total) * 100).toFixed(2))
              : (data.percent ? parseFloat(data.percent) : 0);
            
            console.log(`📈 Atualizando download ${data.id}: ${percent}%`);
            
            return prev.map(d => 
              d.id === data.id 
                ? { ...d, received_bytes: data.received, total_bytes: data.total || d.total_bytes, percent: percent, status: data.status || d.status }
                : d
            );
          } else {
            // Se não existe, recarregar lista
            console.log('⚠️ Download não encontrado na lista, recarregando...');
            loadDownloads();
            return prev;
          }
        });
      });

      window.electronAPI.onDownloadCompleted((event, data) => {
        setDownloads(prev => prev.map(d => 
          d.id === data.id 
            ? { ...d, status: 'completed', completed_at: new Date().toISOString() }
            : d
        ));
      });

      return () => {
        window.electronAPI?.removeAllListeners('download-progress');
        window.electronAPI?.removeAllListeners('download-completed');
        window.electronAPI?.removeAllListeners('download-started');
      };
    }
  }, []);

  const loadDownloads = async () => {
    if (window.electronAPI) {
      try {
        const data = await window.electronAPI.downloadsGetAll({ limit: 100 });
        // Calcular percentual para cada download
        const downloadsWithPercent = data.map(download => {
          const percent = download.total_bytes && download.total_bytes > 0
            ? parseFloat(((download.received_bytes / download.total_bytes) * 100).toFixed(2))
            : 0;
          return { ...download, percent };
        });
        setDownloads(downloadsWithPercent);
      } catch (error) {
        console.error('Erro ao carregar downloads:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.electronAPI) {
      await window.electronAPI.downloadDelete(id);
      loadDownloads();
    }
  };

  const handleClearCompleted = async () => {
    if (window.electronAPI && confirm('Tem certeza que deseja limpar downloads concluídos?')) {
      await window.electronAPI.downloadsClearCompleted();
      loadDownloads();
    }
  };

  const handleDownloadUrl = async () => {
    const url = prompt('Digite a URL para download:');
    if (url && url.trim() && window.electronAPI) {
      try {
        // Extrair nome do arquivo da URL ou gerar um
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        const filename = pathParts[pathParts.length - 1] || `download_${Date.now()}`;
        
        const result = await window.electronAPI.downloadStart({
          url: url.trim(),
          filename: filename
        });
        
        if (result.success) {
          loadDownloads(); // Recarregar lista
        } else {
          alert('Erro ao iniciar download: ' + (result.error || 'Erro desconhecido'));
        }
      } catch (error) {
        alert('Erro ao iniciar download. Verifique se a URL está correta.');
        console.error('Erro ao iniciar download:', error);
      }
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="status-icon completed">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        );
      case 'downloading':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="status-icon downloading">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        );
      case 'interrupted':
      case 'cancelled':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="status-icon error">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content downloads-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Downloads</h2>
          <div className="modal-header-actions">
            <button className="btn-download-url" onClick={handleDownloadUrl} title="Baixar URL">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Baixar URL
            </button>
            <button className="btn-clear" onClick={handleClearCompleted} title="Limpar concluídos">
              Limpar Concluídos
            </button>
            <button className="modal-close" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <div className="loading">Carregando...</div>
          ) : downloads.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <p>Nenhum download ainda</p>
            </div>
          ) : (
            <div className="downloads-list">
              {downloads.map((download) => (
                <div 
                  key={download.id} 
                  className={`download-item ${download.status} ${newDownloadIds.has(download.id) ? 'new-download' : ''}`}
                >
                  <div className="download-icon">
                    {getStatusIcon(download.status)}
                  </div>
                  <div className="download-info">
                    <div className="download-filename">{download.filename}</div>
                    <div className="download-details">
                      {download.status === 'downloading' && (
                        <div className="download-progress-container">
                          <div className="download-progress-bar">
                            <div 
                              className="download-progress-fill" 
                              style={{ width: `${download.percent || 0}%` }}
                            ></div>
                          </div>
                          <div className="download-progress-text">
                            {download.total_bytes ? (
                              <>
                                {formatBytes(download.received_bytes || 0)} / {formatBytes(download.total_bytes)} ({download.percent || 0}%)
                              </>
                            ) : (
                              <>
                                {formatBytes(download.received_bytes || 0)} baixado... ({download.percent || 0}%)
                              </>
                            )}
                          </div>
                        </div>
                      )}
                      {download.status === 'completed' && (
                        <div className="download-completed">
                          {formatBytes(download.received_bytes || download.total_bytes)} • {formatDate(download.completed_at)}
                        </div>
                      )}
                      {(download.status === 'interrupted' || download.status === 'cancelled') && (
                        <div className="download-error">
                          {download.error || 'Download interrompido'}
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    className="download-delete"
                    onClick={() => handleDelete(download.id)}
                    title="Remover download"
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

export default DownloadsModal;

