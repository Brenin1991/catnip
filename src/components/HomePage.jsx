import React from 'react';
import './HomePage.css';

function HomePage({ onNavigate }) {
  const quickLinks = [
    { name: 'DuckDuckGo', url: 'https://duckduckgo.com' },
    { name: 'Startpage', url: 'https://startpage.com' },
    { name: 'Searx', url: 'https://searx.org' },
    { name: 'ProtonMail', url: 'https://protonmail.com' }
  ];

  return (
    <div className="home-page">
      <div className="home-content">
        <div className="home-header">
          <div className="home-icon">🛡️</div>
          <h1>Privacy Browser</h1>
        </div>
        <p className="subtitle">Navegação segura e privada</p>
        
        <div className="quick-links">
          <h2>Links Rápidos</h2>
          <div className="links-grid">
            {quickLinks.map(link => (
              <button
                key={link.url}
                className="quick-link"
                onClick={() => onNavigate(link.url)}
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>

        <div className="privacy-info">
          <h2>Recursos de Privacidade</h2>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">🚫</span>
              <span className="feature-text">Bloqueio de Rastreadores</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛡️</span>
              <span className="feature-text">Proteção contra Fingerprinting</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🍪</span>
              <span className="feature-text">Bloqueio de Cookies de Terceiros</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span className="feature-text">HTTPS Only Mode</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

