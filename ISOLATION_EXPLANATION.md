# 🔒 Sistema de Isolamento/Containerização por Aba

## O que foi implementado

Cada aba agora roda em um **container isolado** (sessão separada), similar ao Firefox Containers ou Chrome Profiles.

## 🛡️ Como Funciona

### 1. **Sessões Isoladas por Aba**
- Cada aba tem sua própria sessão Electron (`session.fromPartition`)
- Cada sessão é completamente isolada das outras
- Dados não são compartilhados entre abas

### 2. **O que é isolado por aba:**

✅ **Cookies** - Cada aba tem seus próprios cookies
✅ **Cache** - Cache separado por aba
✅ **localStorage** - Dados locais isolados
✅ **sessionStorage** - Dados de sessão isolados
✅ **IndexedDB** - Bancos de dados isolados
✅ **WebSQL** - Dados SQL isolados
✅ **Configurações de privacidade** - Cada sessão tem suas próprias regras aplicadas

### 3. **Benefícios de Segurança:**

#### Isolamento Total entre Abas
- Site malicioso na aba 1 não pode acessar dados da aba 2
- Cookies não vazam entre abas
- Rastreadores não podem correlacionar você entre abas diferentes

#### Limpeza Automática
- Quando uma aba é fechada, TODOS os dados dessa aba são limpos
- Cookies, cache, localStorage tudo é destruído
- Reduz pegadas digitais

#### Proteções Individuais
- Cada sessão isolada tem suas próprias proteções:
  - Bloqueio de trackers
  - Bloqueio de anúncios
  - Bloqueio de cookies de terceiros
  - HTTPS Only (se ativado)

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────┐
│  Aba 1 (google.com)                      │
│  └─ Sessão: persist:tab-1                │
│     └─ Cookies/Cache/LocalStorage        │
│        completamente isolados             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Aba 2 (facebook.com)                    │
│  └─ Sessão: persist:tab-2                │
│     └─ Cookies/Cache/LocalStorage        │
│        completamente isolados             │
│        (NÃO compartilha nada com Aba 1)   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Aba 3 (malicious-site.com)              │
│  └─ Sessão: persist:tab-3                │
│     └─ Site malicioso                   │
│        ❌ NÃO pode acessar dados de     │
│           outras abas                    │
│        ❌ NÃO pode ler cookies de outras │
│        ❌ NÃO pode ler localStorage      │
└─────────────────────────────────────────┘
```

## 🎯 Casos de Uso

### Caso 1: Navegação Privada por Aba
- Abra um site em uma aba específica
- Faça login, navegue normalmente
- Feche a aba → **TUDO é limpo automaticamente**
- Próxima vez que abrir essa aba, estará "limpa"

### Caso 2: Isolamento de Contas
- Aba 1: Conta pessoal do Google
- Aba 2: Conta trabalho do Google
- Cada aba mantém cookies separados
- Não há risco de misturar contas

### Caso 3: Proteção contra Rastreamento
- Aba 1: Site de compras (tem cookies de rastreadores)
- Aba 2: Site de notícias
- Os rastreadores da Aba 1 **NÃO** podem rastrear a Aba 2
- Isolamento completo

## 🔧 Implementação Técnica

### Backend (main.js)
- `createIsolatedSession(tabId)` - Cria sessão isolada para cada aba
- `applyPrivacySettingsToSession(ses)` - Aplica proteções individuais
- `destroyIsolatedSession(tabId)` - Limpa tudo quando aba fecha

### Frontend (WebViewContainer.jsx)
- Cada webview usa atributo `partition="persist:tab-{id}"`
- Sessão é criada automaticamente quando aba é criada
- Sessão é destruída automaticamente quando aba é fechada

## ⚠️ Limitações

1. **Processo ainda compartilhado**: Cada webview ainda roda em processo separado (isolamento de crashes), mas as sessões de dados são isoladas

2. **Memória**: Múltiplas sessões podem usar mais memória, mas isso é esperado para isolamento

3. **Performance**: Criar/destruir sessões tem overhead mínimo, mas é necessário para segurança

## ✅ Benefícios Reais

- ✅ **Segurança**: Sites não podem vazar dados entre abas
- ✅ **Privacidade**: Rastreadores não podem correlacionar você entre abas
- ✅ **Limpeza**: Fechar aba = limpar tudo automaticamente
- ✅ **Isolamento**: Cada aba é como um navegador separado

## 🎓 Comparação

| Recurso | Sem Isolamento | Com Isolamento (Este) |
|---------|---------------|----------------------|
| Cookies compartilhados | ✅ Sim | ❌ Não |
| Cache compartilhado | ✅ Sim | ❌ Não |
| localStorage compartilhado | ✅ Sim | ❌ Não |
| Rastreamento entre abas | ✅ Sim | ❌ Não |
| Limpeza ao fechar aba | ❌ Não | ✅ Sim |
| Isolamento de contas | ❌ Não | ✅ Sim |

