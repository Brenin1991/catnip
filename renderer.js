// Estado da aplicação
let currentTabId = 0;
let tabs = [];
let privacyStats = {
    trackersBlocked: 0,
    adsBlocked: 0,
    cookiesBlocked: 0
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initializeBrowser();
    loadPrivacySettings();
    setupEventListeners();
});

// Inicializar navegador
function initializeBrowser() {
    // Criar primeira aba
    createNewTab();
    showHomePage();
}

// Criar nova aba
function createNewTab(url = 'about:blank') {
    const tabId = currentTabId++;
    const tab = {
        id: tabId,
        url: url,
        title: 'Nova Aba',
        webview: null
    };

    tabs.push(tab);

    // Criar elemento de aba
    const tabElement = document.createElement('div');
    tabElement.className = 'tab';
    tabElement.dataset.tabId = tabId;
    tabElement.innerHTML = `
        <span class="tab-title">Nova Aba</span>
        <button class="tab-close">×</button>
    `;

    // Event listeners da aba
    tabElement.querySelector('.tab-title').addEventListener('click', () => switchTab(tabId));
    tabElement.querySelector('.tab-close').addEventListener('click', (e) => {
        e.stopPropagation();
        closeTab(tabId);
    });

    document.getElementById('tabs-container').appendChild(tabElement);

    // Criar webview
    const webview = document.createElement('webview');
    webview.id = `webview-${tabId}`;
    webview.src = url;
    webview.className = 'hidden';
    webview.setAttribute('allowpopups', 'false');
    webview.setAttribute('webpreferences', 'nodeIntegration=no,contextIsolation=yes');

    // Event listeners do webview
    webview.addEventListener('did-start-loading', () => {
        updateTabTitle(tabId, 'Carregando...');
        updateNavigationButtons();
    });

    webview.addEventListener('did-stop-loading', () => {
        updateNavigationButtons();
        hideHomePage();
    });

    webview.addEventListener('page-title-updated', (e) => {
        updateTabTitle(tabId, e.title || 'Sem título');
    });

    webview.addEventListener('page-favicon-updated', (e) => {
        // Poderia atualizar o ícone da aba aqui
    });

    webview.addEventListener('did-navigate', (e) => {
        updateAddressBar(e.url);
        updateTabUrl(tabId, e.url);
        updateSecurityIndicator(e.url);
    });

    webview.addEventListener('did-navigate-in-page', (e) => {
        updateAddressBar(e.url);
        updateTabUrl(tabId, e.url);
        updateSecurityIndicator(e.url);
    });

    webview.addEventListener('new-window', (e) => {
        e.preventDefault();
        navigate(e.url);
    });

    webview.addEventListener('will-prevent-unload', (e) => {
        // Permitir navegação
    });

    document.getElementById('content-area').appendChild(webview);

    tab.webview = webview;
    switchTab(tabId);

    return tab;
}

// Alternar aba
function switchTab(tabId) {
    // Atualizar estado das abas
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab-id="${tabId}"]`).classList.add('active');

    // Mostrar/esconder webviews
    document.querySelectorAll('webview').forEach(wv => {
        wv.classList.add('hidden');
    });

    const tab = tabs.find(t => t.id === tabId);
    if (tab && tab.webview) {
        tab.webview.classList.remove('hidden');
        updateAddressBar(tab.url);
        updateNavigationButtons();
        updateSecurityIndicator(tab.url);
        
        if (tab.url === 'about:blank' || tab.url === '') {
            showHomePage();
        } else {
            hideHomePage();
        }
    }
}

// Fechar aba
function closeTab(tabId) {
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;

    // Remover aba do DOM
    const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (tabElement) {
        tabElement.remove();
    }

    // Remover webview
    const tab = tabs[tabIndex];
    if (tab && tab.webview) {
        tab.webview.remove();
    }

    // Remover da lista
    tabs.splice(tabIndex, 1);

    // Se fechou a aba ativa, ativar outra
    if (tabs.length > 0) {
        const activeTab = tabs[0];
        switchTab(activeTab.id);
    } else {
        // Criar nova aba se não houver nenhuma
        createNewTab();
        showHomePage();
    }
}

// Atualizar título da aba
function updateTabTitle(tabId, title) {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
        tab.title = title;
        const tabElement = document.querySelector(`[data-tab-id="${tabId}"] .tab-title`);
        if (tabElement) {
            tabElement.textContent = title;
        }
    }
}

// Atualizar URL da aba
function updateTabUrl(tabId, url) {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
        tab.url = url;
    }
}

// Navegar
function navigate(url) {
    if (!url) return;

    // Limpar URL
    url = url.trim();

    // Se não tiver protocolo, tratar como busca ou adicionar https://
    if (!url.match(/^https?:\/\//i)) {
        if (url.includes('.') && !url.includes(' ')) {
            url = 'https://' + url;
        } else {
            // Buscar no DuckDuckGo
            url = `https://duckduckgo.com/?q=${encodeURIComponent(url)}`;
        }
    }

    const activeTab = tabs.find(t => 
        document.querySelector(`[data-tab-id="${t.id}"]`)?.classList.contains('active')
    );

    if (activeTab && activeTab.webview) {
        activeTab.webview.src = url;
    } else {
        createNewTab(url);
    }
}

// Atualizar barra de endereço
function updateAddressBar(url) {
    const addressBar = document.getElementById('address-bar');
    if (addressBar) {
        addressBar.value = url === 'about:blank' ? '' : url;
    }
}

// Atualizar botões de navegação
function updateNavigationButtons() {
    const activeTab = tabs.find(t => 
        document.querySelector(`[data-tab-id="${t.id}"]`)?.classList.contains('active')
    );

    if (activeTab && activeTab.webview) {
        const webview = activeTab.webview;
        document.getElementById('btn-back').disabled = !webview.canGoBack();
        document.getElementById('btn-forward').disabled = !webview.canGoForward();
    }
}

// Atualizar indicador de segurança
function updateSecurityIndicator(url) {
    const indicator = document.getElementById('security-indicator');
    if (url.startsWith('https://')) {
        indicator.classList.remove('insecure');
        indicator.title = 'Conexão Segura (HTTPS)';
    } else if (url.startsWith('http://')) {
        indicator.classList.add('insecure');
        indicator.title = 'Conexão Insegura (HTTP)';
    } else {
        indicator.classList.remove('insecure');
        indicator.title = '';
    }
}

// Mostrar página inicial
function showHomePage() {
    document.getElementById('home-page').classList.remove('hidden');
    updatePrivacyStats();
}

// Esconder página inicial
function hideHomePage() {
    document.getElementById('home-page').classList.add('hidden');
}

// Configurar event listeners
function setupEventListeners() {
    // Barra de endereço
    const addressBar = document.getElementById('address-bar');
    addressBar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            navigate(addressBar.value);
        }
    });

    // Botões de navegação
    document.getElementById('btn-back').addEventListener('click', () => {
        const activeTab = tabs.find(t => 
            document.querySelector(`[data-tab-id="${t.id}"]`)?.classList.contains('active')
        );
        if (activeTab && activeTab.webview && activeTab.webview.canGoBack()) {
            activeTab.webview.goBack();
        }
    });

    document.getElementById('btn-forward').addEventListener('click', () => {
        const activeTab = tabs.find(t => 
            document.querySelector(`[data-tab-id="${t.id}"]`)?.classList.contains('active')
        );
        if (activeTab && activeTab.webview && activeTab.webview.canGoForward()) {
            activeTab.webview.goForward();
        }
    });

    document.getElementById('btn-reload').addEventListener('click', () => {
        const activeTab = tabs.find(t => 
            document.querySelector(`[data-tab-id="${t.id}"]`)?.classList.contains('active')
        );
        if (activeTab && activeTab.webview) {
            activeTab.webview.reload();
        }
    });

    // Nova aba
    document.getElementById('btn-new-tab').addEventListener('click', () => {
        createNewTab();
        showHomePage();
    });

    // Botão de privacidade
    document.getElementById('btn-privacy').addEventListener('click', () => {
        openPrivacyModal();
    });

    // Links rápidos
    document.querySelectorAll('.quick-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = link.dataset.url;
            navigate(url);
        });
    });

    // Modal de privacidade
    document.getElementById('close-privacy-modal').addEventListener('click', closePrivacyModal);
    document.getElementById('close-about-modal').addEventListener('click', closeAboutModal);
    document.getElementById('save-privacy-settings').addEventListener('click', savePrivacySettings);
    document.getElementById('clear-all-data-btn').addEventListener('click', clearAllData);

    // Fechar modal ao clicar fora
    document.getElementById('privacy-modal').addEventListener('click', (e) => {
        if (e.target.id === 'privacy-modal') {
            closePrivacyModal();
        }
    });

    document.getElementById('about-modal').addEventListener('click', (e) => {
        if (e.target.id === 'about-modal') {
            closeAboutModal();
        }
    });

    // IPC Listeners
    if (window.electronAPI) {
        window.electronAPI.onNewTab(() => {
            createNewTab();
            showHomePage();
        });

        window.electronAPI.onCloseTab(() => {
            const activeTab = tabs.find(t => 
                document.querySelector(`[data-tab-id="${t.id}"]`)?.classList.contains('active')
            );
            if (activeTab) {
                closeTab(activeTab.id);
            }
        });

        window.electronAPI.onOpenPrivacySettings(() => {
            openPrivacyModal();
        });

        window.electronAPI.onShowMessage((event, message) => {
            alert(message);
        });

        window.electronAPI.onShowAbout(() => {
            openAboutModal();
        });
    }
}

// Carregar configurações de privacidade
async function loadPrivacySettings() {
    if (window.electronAPI) {
        try {
            const settings = await window.electronAPI.getPrivacySettings();
            applyPrivacySettingsToUI(settings);
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        }
    }
}

// Aplicar configurações na UI
function applyPrivacySettingsToUI(settings) {
    document.getElementById('block-trackers').checked = settings.blockTrackers || false;
    document.getElementById('block-ads').checked = settings.blockAds || false;
    document.getElementById('block-fingerprinting').checked = settings.blockFingerprinting || false;
    document.getElementById('block-third-party-cookies').checked = settings.blockThirdPartyCookies || false;
    document.getElementById('block-third-party-scripts').checked = settings.blockThirdPartyScripts || false;
    document.getElementById('https-only').checked = settings.httpsOnly || false;
    document.getElementById('do-not-track').checked = settings.doNotTrack || false;
    document.getElementById('clear-data-on-exit').checked = settings.clearDataOnExit || false;
    document.getElementById('disable-webgl').checked = settings.disableWebGL || false;
    document.getElementById('disable-canvas').checked = settings.disableCanvas || false;
    document.getElementById('disable-webaudio').checked = settings.disableWebAudio || false;
    document.getElementById('disable-notifications').checked = settings.disableNotifications || false;
    document.getElementById('disable-geolocation').checked = settings.disableGeolocation || false;
}

// Abrir modal de privacidade
function openPrivacyModal() {
    document.getElementById('privacy-modal').classList.add('show');
}

// Fechar modal de privacidade
function closePrivacyModal() {
    document.getElementById('privacy-modal').classList.remove('show');
}

// Salvar configurações de privacidade
async function savePrivacySettings() {
    const settings = {
        blockTrackers: document.getElementById('block-trackers').checked,
        blockAds: document.getElementById('block-ads').checked,
        blockFingerprinting: document.getElementById('block-fingerprinting').checked,
        blockThirdPartyCookies: document.getElementById('block-third-party-cookies').checked,
        blockThirdPartyScripts: document.getElementById('block-third-party-scripts').checked,
        httpsOnly: document.getElementById('https-only').checked,
        doNotTrack: document.getElementById('do-not-track').checked,
        clearDataOnExit: document.getElementById('clear-data-on-exit').checked,
        disableWebGL: document.getElementById('disable-webgl').checked,
        disableCanvas: document.getElementById('disable-canvas').checked,
        disableWebAudio: document.getElementById('disable-webaudio').checked,
        disableNotifications: document.getElementById('disable-notifications').checked,
        disableGeolocation: document.getElementById('disable-geolocation').checked
    };

    if (window.electronAPI) {
        try {
            await window.electronAPI.setPrivacySettings(settings);
            alert('Configurações salvas! O navegador será recarregado.');
            closePrivacyModal();
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            alert('Erro ao salvar configurações.');
        }
    }
}

// Limpar todos os dados
async function clearAllData() {
    if (confirm('Tem certeza que deseja limpar todos os dados de navegação?')) {
        if (window.electronAPI) {
            try {
                await window.electronAPI.clearAllData();
                alert('Todos os dados foram limpos!');
            } catch (error) {
                console.error('Erro ao limpar dados:', error);
                alert('Erro ao limpar dados.');
            }
        }
    }
}

// Abrir modal sobre
function openAboutModal() {
    document.getElementById('about-modal').classList.add('show');
}

// Fechar modal sobre
function closeAboutModal() {
    document.getElementById('about-modal').classList.remove('show');
}

// Atualizar estatísticas de privacidade
function updatePrivacyStats() {
    document.getElementById('trackers-blocked').textContent = privacyStats.trackersBlocked;
    document.getElementById('ads-blocked').textContent = privacyStats.adsBlocked;
    document.getElementById('cookies-blocked').textContent = privacyStats.cookiesBlocked;
}

// Incrementar estatísticas (pode ser chamado quando algo é bloqueado)
function incrementStat(statName) {
    if (privacyStats.hasOwnProperty(statName)) {
        privacyStats[statName]++;
        updatePrivacyStats();
    }
}

