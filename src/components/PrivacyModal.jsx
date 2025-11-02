import React, { useState, useEffect } from 'react';
import './Modal.css';

function PrivacyModal({ privacySettings, onClose, onSave, onClearData }) {
  const [settings, setSettings] = useState(privacySettings);

  useEffect(() => {
    setSettings(privacySettings);
  }, [privacySettings]);

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    onSave(settings);
  };

  const handleClearData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados de navegação?')) {
      onClearData();
      window.alert('Todos os dados foram limpos!');
    }
  };

  const settingGroups = [
    {
      id: 'blockTrackers',
      label: 'Bloquear Rastreadores',
      desc: 'Bloqueia scripts e requisições de rastreamento de terceiros'
    },
    {
      id: 'blockAds',
      label: 'Bloquear Anúncios',
      desc: 'Bloqueia anúncios e scripts publicitários'
    },
    {
      id: 'blockFingerprinting',
      label: 'Proteção contra Fingerprinting',
      desc: 'Modifica APIs para prevenir identificação única do navegador'
    },
    {
      id: 'blockThirdPartyCookies',
      label: 'Bloquear Cookies de Terceiros',
      desc: 'Impede que sites de terceiros armazenem cookies'
    },
    {
      id: 'blockThirdPartyScripts',
      label: 'Bloquear Scripts de Terceiros',
      desc: 'Bloqueia todos os scripts de domínios externos (pode quebrar alguns sites)'
    },
    {
      id: 'httpsOnly',
      label: 'HTTPS Apenas',
      desc: 'Redireciona automaticamente conexões HTTP para HTTPS'
    },
    {
      id: 'doNotTrack',
      label: 'Enviar Do Not Track',
      desc: 'Envia cabeçalho DNT para todos os sites'
    },
    {
      id: 'clearDataOnExit',
      label: 'Limpar Dados ao Fechar',
      desc: 'Remove cookies e cache ao fechar o navegador'
    },
    {
      id: 'disableWebGL',
      label: 'Proteger WebGL',
      desc: 'Modifica informações do WebGL para prevenir fingerprinting'
    },
    {
      id: 'disableCanvas',
      label: 'Proteger Canvas',
      desc: 'Bloqueia técnicas de fingerprinting via Canvas (pode quebrar alguns sites)'
    },
    {
      id: 'disableWebAudio',
      label: 'Proteger Web Audio',
      desc: 'Protege contra fingerprinting via Web Audio API'
    },
    {
      id: 'disableNotifications',
      label: 'Bloquear Notificações',
      desc: 'Bloqueia todas as solicitações de notificações'
    },
    {
      id: 'disableGeolocation',
      label: 'Bloquear Geolocalização',
      desc: 'Bloqueia todas as solicitações de geolocalização'
    }
  ];

  return (
    <div className="modal show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔒 Configurações de Privacidade</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {settingGroups.map(group => (
            <div key={group.id} className="setting-group">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings[group.id] || false}
                  onChange={() => handleToggle(group.id)}
                />
                <span className="slider"></span>
                <span className="label-text">{group.label}</span>
              </label>
              <p className="setting-desc">{group.desc}</p>
            </div>
          ))}

          <div className="modal-actions">
            <button className="btn btn-primary" onClick={handleSave}>
              Salvar Configurações
            </button>
            <button className="btn btn-secondary" onClick={handleClearData}>
              Limpar Todos os Dados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyModal;

