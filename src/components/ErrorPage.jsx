import React from 'react';
import './ErrorPage.css';

function ErrorPage({ error, url, onReload, onGoHome }) {
  const getErrorInfo = () => {
    if (!error) {
      return {
        code: 404,
        title: 'Página não encontrada',
        message: 'Não foi possível encontrar esta página.',
        icon: '🔍'
      };
    }

    // Códigos de erro comuns do Electron
    const errorCodes = {
      '-105': { title: 'Nome do host não encontrado', message: 'O servidor não foi encontrado. Verifique sua conexão com a internet.' },
      '-106': { title: 'Conexão interrompida', message: 'A conexão com o servidor foi interrompida.' },
      '-107': { title: 'Timeout', message: 'A conexão demorou muito para responder.' },
      '-118': { title: 'Timeout de conexão', message: 'O servidor demorou muito para responder.' },
      '-501': { title: 'Conexão recusada', message: 'A conexão foi recusada pelo servidor.' },
      '-502': { title: 'Erro no servidor', message: 'O servidor encontrou um erro interno.' },
      '-503': { title: 'Serviço indisponível', message: 'O serviço está temporariamente indisponível.' },
    };

    const errorInfo = errorCodes[error.errorCode] || {
      title: 'Erro ao carregar página',
      message: error.errorDescription || 'Ocorreu um erro desconhecido ao tentar carregar esta página.'
    };

    return {
      code: error.errorCode || 404,
      title: errorInfo.title,
      message: errorInfo.message,
      icon: '⚠️'
    };
  };

  const errorInfo = getErrorInfo();

  return (
    <div className="error-page">
      <div className="error-content">
        <div className="error-icon">{errorInfo.icon}</div>
        <h1 className="error-title">{errorInfo.title}</h1>
        <p className="error-message">{errorInfo.message}</p>
        
        {url && url !== 'about:blank' && (
          <div className="error-url">
            <span className="error-url-label">URL:</span>
            <span className="error-url-value">{url}</span>
          </div>
        )}

        <div className="error-actions">
          <button className="error-btn error-btn-primary" onClick={onReload}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16M21 3v5M21 8h-5M3 21v-5M3 16h5"/>
            </svg>
            Tentar Novamente
          </button>
          <button className="error-btn error-btn-secondary" onClick={onGoHome}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Página Inicial
          </button>
        </div>

        <div className="error-suggestions">
          <h3>Sugestões:</h3>
          <ul>
            <li>Verifique sua conexão com a internet</li>
            <li>Verifique se o endereço está correto</li>
            <li>Tente recarregar a página</li>
            <li>Limpe o cache e cookies se o problema persistir</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;

