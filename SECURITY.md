# 🔒 Documentação de Segurança

Este documento explica as camadas de segurança implementadas no Privacy Browser e como elas protegem contra código malicioso.

## ⛔ Por que `require('fs').unlink()` NÃO funciona

**Resposta curta:** Porque `nodeIntegration` está desabilitado e o código JavaScript das páginas web **não tem acesso ao Node.js**.

## 🛡️ Camadas de Segurança

### 1. **Node Integration Desabilitado**
```javascript
nodeIntegration: false  // Na janela principal
nodeIntegration=no      // Nos webviews
```

**O que faz:** Impede completamente que código JavaScript dentro das páginas web acesse APIs do Node.js como:
- `require()` - não pode importar módulos Node.js
- `process` - não tem acesso ao objeto process
- `fs` - não pode ler/escrever arquivos
- `child_process` - não pode executar processos
- Qualquer módulo nativo do Node.js

**Teste:** Se um site tentar executar `require('fs')`, retornará `undefined` ou um erro, mas **nunca** terá acesso ao sistema de arquivos.

### 2. **Context Isolation**
```javascript
contextIsolation: true
```

**O que faz:** Mantém o código do `preload.js` em um contexto JavaScript separado do código da página web. Isso significa:
- Código da página não pode acessar variáveis do preload
- Comunicação só acontece através de APIs expostas via `contextBridge`
- Previne vazamento de dados entre contextos

### 3. **Sandbox nos Webviews**
```javascript
sandbox=no  // Nos webviews (necessário para funcionarem)
```

**Nota importante:** O sandbox está desabilitado nos webviews porque eles precisam funcionar corretamente. **A segurança principal vem do `nodeIntegration=no`**, não do sandbox.

**O que importa:** Mesmo sem sandbox, sites ainda não podem:
- Acessar Node.js (`nodeIntegration=no` é o bloqueio principal)
- Executar código no processo principal
- Acessar o sistema de arquivos

Cada webview roda em um processo separado, mas isso é principalmente para isolamento de crashes, não para segurança de acesso ao sistema.

### 4. **Web Security Habilitado**
```javascript
webSecurity: true
```

**O que faz:** Mantém todas as proteções padrão do Chromium:
- Same-Origin Policy
- CORS (Cross-Origin Resource Sharing)
- Proteções contra XSS (Cross-Site Scripting)
- Validação de certificados SSL/TLS

### 5. **Remote Module Desabilitado**
```javascript
enableRemoteModule: false
```

**O que faz:** Impede uso do módulo `remote` (deprecated) que poderia permitir acesso ao processo principal.

### 6. **Preload Seguro**
O `preload.js` só expõe APIs específicas e necessárias via `contextBridge`:
- APIs de configurações de privacidade
- Utilitários controlados
- Nenhum acesso direto ao sistema de arquivos ou Node.js

## 🧪 Teste de Segurança

Para verificar que está funcionando, tente abrir o console em qualquer site e executar:

```javascript
// Isso deve retornar undefined ou erro
require('fs')

// Isso também deve falhar
process.platform

// Não tem acesso ao Node.js
typeof require  // "undefined"
```

## ⚠️ O que AINDA é possível (e é normal)

Mesmo com todas essas proteções, sites ainda podem:
- Executar JavaScript normal (como qualquer navegador)
- Fazer requisições HTTP/HTTPS
- Armazenar dados em localStorage/cookies (dentro do navegador)
- Acessar APIs web padrão (Geolocation, Notifications, etc. - se não bloqueadas)

**Mas NÃO podem:**
- ❌ Acessar o sistema de arquivos
- ❌ Executar processos do sistema
- ❌ Acessar módulos Node.js
- ❌ Modificar arquivos do sistema
- ❌ Acessar variáveis de ambiente sensíveis
- ❌ Instalar software

## 🔐 Arquitetura de Segurança

```
┌─────────────────────────────────────────┐
│  Site (JavaScript normal)               │
│  - Não tem acesso a Node.js             │
│  - Não pode usar require()              │
│  - Roda em sandbox isolado              │
└──────────────┬──────────────────────────┘
               │ (isolado)
┌──────────────▼──────────────────────────┐
│  Context Isolation                      │
│  - Separação de contextos               │
│  - Comunicação via contextBridge        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Preload Script                         │
│  - APIs controladas e limitadas         │
│  - Sem acesso ao sistema de arquivos   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Main Process (Node.js)                 │
│  - Acesso completo ao sistema           │
│  - MAS: Código dos sites NUNCA          │
│     executa aqui                        │
└─────────────────────────────────────────┘
```

## ✅ Conclusão

**O navegador é seguro porque:**

1. ✅ `nodeIntegration: false` - **PRINCIPAL** - Bloqueia completamente acesso ao Node.js
2. ✅ `contextIsolation: true` - Isola contextos JavaScript
3. ✅ Processos isolados - Cada webview em processo separado (isolamento de crashes)
4. ✅ `webSecurity: true` - Proteções padrão do Chromium (CORS, Same-Origin, etc.)
5. ✅ Sem `remote` module - Não há backdoor para Node.js
6. ✅ Preload limitado - Apenas APIs necessárias expostas via `contextBridge`

**Um site malicioso não pode:**
- ❌ Deletar arquivos (`require('fs')` não existe para ele)
- ❌ Executar comandos do sistema
- ❌ Acessar dados sensíveis do sistema operacional
- ❌ Instalar malware

**Está protegido contra o exemplo que você mencionou!** 🛡️

