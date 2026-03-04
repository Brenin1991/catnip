import React, { useEffect, useRef } from 'react';
import './WebViewContainer.css';

function WebViewContainer({ tabs, activeTabId, hasError, onTitleUpdate, onUrlUpdate, onLoadingChange, onFaviconUpdate, onError, onNewTab }) {
  const containerRef = useRef(null);
  const webviewRefs = useRef({});

  useEffect(() => {
    if (!containerRef.current) return;

    tabs.forEach(tab => {
      if (!webviewRefs.current[tab.id]) {
        // Criar sessão isolada ANTES de criar o webview
        const partition = `persist:tab-${tab.id}`;
        
        const webview = document.createElement('webview');
        webview.id = `webview-${tab.id}`;
        webview.src = tab.url === 'about:blank' ? 'about:blank' : tab.url;
        webview.className = tab.id === activeTabId ? 'webview' : 'webview hidden';
        webview.setAttribute('allowpopups', 'false');
        
        // Sessão isolada por aba (container/virtualização)
        // partition: Cada aba tem seus próprios cookies, cache, localStorage, etc.
        webview.setAttribute('partition', partition);
        
        // Configurações de segurança críticas para webviews:
        // - nodeIntegration=no: CRÍTICO - IMPEDE acesso ao Node.js (require, fs, etc.)
        // - contextIsolation=yes: Isola contexto do preload
        // - sandbox=no: Necessário para webviews funcionarem corretamente
        //   (A segurança vem do nodeIntegration=no, não do sandbox)
        // - webSecurity=yes: Proteções padrão do Chromium
        webview.setAttribute('webpreferences', 'nodeIntegration=no,contextIsolation=yes,sandbox=no,webSecurity=yes,allowRunningInsecureContent=yes');
        
        // Criar sessão no backend quando o webview é criado
        if (window.electronAPI) {
          window.electronAPI.getIsolatedSession(tab.id).then(() => {
            console.log(`🔒 Sessão isolada configurada para aba ${tab.id} (${partition})`);
          });
        }
        
        // Garantir que o webview está visível e configurado
        webview.style.width = '100%';
        webview.style.height = '100%';

        // Event listeners
        webview.addEventListener('did-start-loading', () => {
          onLoadingChange(tab.id, true);
        });

        webview.addEventListener('did-stop-loading', () => {
          onLoadingChange(tab.id, false);
          
          // Injetar CSS de scrollbar quando a página terminar de carregar
          setTimeout(() => {
            try {
              // Obter cores do tema atual do documento principal
              const rootStyles = getComputedStyle(document.documentElement);
              const bgPrimary = rootStyles.getPropertyValue('--bg-primary')?.trim() || '#1c1c1e';
              const bgTertiary = rootStyles.getPropertyValue('--bg-tertiary')?.trim() || '#3a3a3c';
              const bgHover = rootStyles.getPropertyValue('--bg-hover')?.trim() || '#48484a';
              const accent = rootStyles.getPropertyValue('--accent')?.trim() || '#007aff';
              const borderLight = rootStyles.getPropertyValue('--border-light')?.trim() || 'rgba(255, 255, 255, 0.05)';

              const scrollbarCSS = `
                /* Scrollbar customizada adaptável ao tema */
                ::-webkit-scrollbar {
                  width: 12px;
                  height: 12px;
                }
                
                ::-webkit-scrollbar-track {
                  background: ${bgPrimary};
                  border-left: 1px solid ${borderLight};
                }
                
                ::-webkit-scrollbar-thumb {
                  background: ${bgTertiary};
                  border-radius: 6px;
                  border: 2px solid ${bgPrimary};
                  transition: background 0.2s ease;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                  background: ${bgHover};
                }
                
                ::-webkit-scrollbar-thumb:active {
                  background: ${accent};
                }
                
                ::-webkit-scrollbar-corner {
                  background: ${bgPrimary};
                }
                
                /* Firefox */
                * {
                  scrollbar-width: thin;
                  scrollbar-color: ${bgTertiary} ${bgPrimary};
                }
              `;
              
              if (webview && webview.insertCSS) {
                webview.insertCSS(scrollbarCSS).catch(err => {
                  console.warn('Erro ao injetar CSS de scrollbar no webview (did-stop-loading):', err);
                });
              }
            } catch (error) {
              console.warn('Erro ao tentar injetar CSS de scrollbar (did-stop-loading):', error);
            }
          }, 300);
          
          // Tentar obter favicon após carregar a página
          setTimeout(() => {
            try {
              const webviewUrl = webview.src || tab.url;
              if (webviewUrl && webviewUrl !== 'about:blank' && !webviewUrl.startsWith('about:')) {
                // Tentar obter favicon via JavaScript do webview
                webview.executeJavaScript(`
                  (function() {
                    const links = document.querySelectorAll('link[rel*="icon"]');
                    if (links.length > 0) {
                      return links[0].href;
                    }
                    // Fallback: tentar /favicon.ico
                    try {
                      const url = new URL(window.location.href);
                      return url.origin + '/favicon.ico';
                    } catch(e) {
                      return null;
                    }
                  })();
                `).then((faviconUrl) => {
                  if (faviconUrl && onFaviconUpdate) {
                    console.log('✅ Favicon obtido via executeJavaScript:', faviconUrl);
                    onFaviconUpdate(tab.id, faviconUrl);
                  }
                }).catch(err => {
                  console.warn('Erro ao obter favicon via executeJavaScript:', err);
                  
                  // Fallback final: usar URL base + /favicon.ico
                  try {
                    const urlObj = new URL(webviewUrl);
                    const faviconFallback = `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
                    if (onFaviconUpdate) {
                      console.log('🔄 Usando favicon fallback final:', faviconFallback);
                      onFaviconUpdate(tab.id, faviconFallback);
                    }
                  } catch (e) {
                    console.warn('Não foi possível gerar favicon fallback');
                  }
                });
              }
            } catch (error) {
              console.warn('Erro ao tentar obter favicon:', error);
            }
          }, 500);
        });

        webview.addEventListener('page-title-updated', (e) => {
          onTitleUpdate(tab.id, e.title || 'Sem título');
        });

        webview.addEventListener('page-favicon-updated', (e) => {
          console.log('🔔 page-favicon-updated event:', e);
          console.log('🔔 Event details:', {
            favicons: e.favicons,
            type: typeof e.favicons,
            length: e.favicons?.length
          });
          
          // O evento pode ter favicons como array ou como propriedade
          const favicons = e.favicons || (Array.isArray(e) ? e : []);
          
          if (favicons && favicons.length > 0 && onFaviconUpdate) {
            const faviconUrl = favicons[0];
            console.log('✅ Atualizando favicon para tab', tab.id, ':', faviconUrl);
            onFaviconUpdate(tab.id, faviconUrl);
          } else if (onFaviconUpdate) {
            // Tentar obter favicon da URL diretamente como fallback
            const tabUrl = tab.url || webview.src;
            if (tabUrl && tabUrl !== 'about:blank' && !tabUrl.startsWith('about:')) {
              try {
                const urlObj = new URL(tabUrl);
                const faviconFallback = `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
                console.log('🔄 Tentando favicon fallback:', faviconFallback);
                onFaviconUpdate(tab.id, faviconFallback);
              } catch (err) {
                console.warn('Erro ao gerar favicon fallback:', err);
              }
            }
          }
        });

        webview.addEventListener('did-navigate', (e) => {
          onUrlUpdate(tab.id, e.url);
        });

        webview.addEventListener('did-navigate-in-page', (e) => {
          onUrlUpdate(tab.id, e.url);
        });

        webview.addEventListener('new-window', (e) => {
          e.preventDefault();
          // Quando clica com botão do meio ou Ctrl+clique, abrir em nova aba
          if (e.url && onNewTab) {
            onNewTab(e.url);
          }
        });

        let errorState = { hasError: false, errorCode: null };

        webview.addEventListener('did-fail-load', (e) => {
          // e.errorCode: código do erro
          // e.errorDescription: descrição do erro
          // e.validatedURL: URL que falhou
          if (e.errorCode !== -3 && e.errorCode !== -102) { 
            // -3 é ERR_ABORTED (cancelado pelo usuário), ignorar
            // -102 é ERR_ABORTED também, ignorar
            errorState.hasError = true;
            errorState.errorCode = e.errorCode;
            
            // Usar setTimeout para garantir que o erro seja processado corretamente
            setTimeout(() => {
              onError && onError(tab.id, {
                errorCode: e.errorCode,
                errorDescription: e.errorDescription,
                validatedURL: e.validatedURL || e.url || tab.url
              });
            }, 50);
          }
        });

        webview.addEventListener('did-finish-load', () => {
          // Só limpar erro se não houve erro durante este carregamento
          // Usar timeout maior para garantir que did-fail-load já foi processado
          setTimeout(() => {
            if (!errorState.hasError) {
              onError && onError(tab.id, null);
            }
            errorState.hasError = false;
            errorState.errorCode = null;
          }, 200);

          // Injetar CSS customizado para scrollbar no webview
          try {
            // Obter cores do tema atual do documento principal
            const rootStyles = getComputedStyle(document.documentElement);
            const bgPrimary = rootStyles.getPropertyValue('--bg-primary')?.trim() || '#1c1c1e';
            const bgTertiary = rootStyles.getPropertyValue('--bg-tertiary')?.trim() || '#3a3a3c';
            const bgHover = rootStyles.getPropertyValue('--bg-hover')?.trim() || '#48484a';
            const accent = rootStyles.getPropertyValue('--accent')?.trim() || '#007aff';
            const borderLight = rootStyles.getPropertyValue('--border-light')?.trim() || 'rgba(255, 255, 255, 0.05)';

            const scrollbarCSS = `
              /* Scrollbar customizada adaptável ao tema */
              ::-webkit-scrollbar {
                width: 12px;
                height: 12px;
              }
              
              ::-webkit-scrollbar-track {
                background: ${bgPrimary};
                border-left: 1px solid ${borderLight};
              }
              
              ::-webkit-scrollbar-thumb {
                background: ${bgTertiary};
                border-radius: 6px;
                border: 2px solid ${bgPrimary};
                transition: background 0.2s ease;
              }
              
              ::-webkit-scrollbar-thumb:hover {
                background: ${bgHover};
              }
              
              ::-webkit-scrollbar-thumb:active {
                background: ${accent};
              }
              
              ::-webkit-scrollbar-corner {
                background: ${bgPrimary};
              }
              
              /* Firefox */
              * {
                scrollbar-width: thin;
                scrollbar-color: ${bgTertiary} ${bgPrimary};
              }
            `;
            
            if (webview && webview.insertCSS) {
              webview.insertCSS(scrollbarCSS).catch(err => {
                console.warn('Erro ao injetar CSS de scrollbar no webview:', err);
              });
            }
          } catch (error) {
            console.warn('Erro ao tentar injetar CSS de scrollbar:', error);
          }
        });

        webview.addEventListener('did-start-loading', () => {
          // Reset do estado de erro quando começa novo carregamento
          errorState.hasError = false;
          errorState.errorCode = null;
        });

        // Suporte para modo de tela cheia (F11, botão fullscreen do YouTube, etc.)
        webview.addEventListener('enter-html-full-screen', (e) => {
          console.log('🎬 Entrando em fullscreen...');
          // Esconder toolbar, tabs e titlebar quando entrar em fullscreen
          if (window.electronAPI) {
            window.electronAPI.enterFullscreen().catch(err => {
              console.error('Erro ao entrar em fullscreen:', err);
            });
          }
        });

        webview.addEventListener('leave-html-full-screen', (e) => {
          console.log('🚪 Saindo de fullscreen...');
          // Restaurar toolbar, tabs e titlebar quando sair de fullscreen
          if (window.electronAPI) {
            window.electronAPI.leaveFullscreen().catch(err => {
              console.error('Erro ao sair de fullscreen:', err);
            });
          }
        });

        containerRef.current.appendChild(webview);
        webviewRefs.current[tab.id] = webview;
        
        // Forçar recarregamento se necessário
        console.log('Webview criado para tab:', tab.id, 'URL:', tab.url);
        
        // Aguardar um pouco antes de definir src para garantir que está no DOM
        setTimeout(() => {
          if (tab.url && tab.url !== 'about:blank') {
            try {
              webview.src = tab.url;
            } catch (error) {
              console.error('Erro ao definir src do webview:', error);
            }
          }
        }, 50);
      } else {
        // Atualizar src se necessário
        const webview = webviewRefs.current[tab.id];
        if (webview) {
          const currentUrl = webview.getAttribute('src') || webview.src;
          const newUrl = tab.url === 'about:blank' ? 'about:blank' : tab.url;
          
          if (currentUrl !== newUrl && tab.url !== 'about:blank') {
            webview.src = newUrl;
          }
        }
      }
    });

    // Atualizar visibilidade
    Object.keys(webviewRefs.current).forEach(id => {
      const webview = webviewRefs.current[id];
      if (webview) {
        const tabId = parseInt(id);
        // Esconder webview se não for a aba ativa OU se houver erro na aba ativa
        const shouldShow = tabId === activeTabId && !hasError;
        webview.className = shouldShow ? 'webview' : 'webview hidden';
      }
    });
  }, [tabs, activeTabId, hasError, onTitleUpdate, onUrlUpdate, onLoadingChange, onFaviconUpdate, onError]);

  // Limpar webviews de abas fechadas e destruir sessões isoladas
  useEffect(() => {
    const existingIds = tabs.map(t => t.id);
    Object.keys(webviewRefs.current).forEach(id => {
      const tabId = parseInt(id);
      if (!existingIds.includes(tabId)) {
        const webview = webviewRefs.current[id];
        if (webview && webview.parentNode) {
          webview.parentNode.removeChild(webview);
        }
        delete webviewRefs.current[id];
        
        // Destruir sessão isolada quando aba é fechada
        if (window.electronAPI) {
          window.electronAPI.destroyIsolatedSession(tabId).then(() => {
            console.log(`🗑️ Sessão isolada ${tabId} destruída`);
          });
        }
      }
    });
  }, [tabs]);

  return <div ref={containerRef} className="webview-container"></div>;
}

export default WebViewContainer;

