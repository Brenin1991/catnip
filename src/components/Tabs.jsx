import React from 'react';
import './Tabs.css';

function Tabs({ tabs, activeTabId, onTabClick, onTabClose, onNewTab }) {
  return (
    <div className="tabs-container">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
          onClick={() => onTabClick(tab.id)}
        >
          <span className="tab-title" title={tab.title}>
            {tab.title}
          </span>
          <button
            className="tab-close"
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
            title="Fechar aba"
          >
            ×
          </button>
        </div>
      ))}
      <button className="nav-btn new-tab-btn" onClick={onNewTab} title="Nova Aba">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
    </div>
  );
}

export default Tabs;

