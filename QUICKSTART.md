# 🚀 Guia Rápido de Início

## Instalação Rápida

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Execute o navegador em modo desenvolvimento:**
   ```bash
   npm run electron:dev
   ```

   Este comando inicia o servidor Vite (React) e o Electron simultaneamente.

   Ou se preferir executar manualmente:
   ```bash
   # Terminal 1 - Inicia o servidor React
   npm run dev
   
   # Terminal 2 - Após o servidor iniciar, execute:
   npm run electron
   ```

Pronto! O navegador deve abrir automaticamente.

## Primeiros Passos

1. **Navegue para um site:**
   - Digite um endereço na barra de endereço (ex: `duckduckgo.com`)
   - Pressione Enter

2. **Faça uma busca:**
   - Digite termos de busca na barra de endereço (ex: `privacidade online`)
   - Pressione Enter (será pesquisado no DuckDuckGo)

3. **Configure a privacidade:**
   - Clique no ícone de cadeado na barra de endereço
   - Ajuste as configurações conforme necessário
   - Clique em "Salvar Configurações"

## Dicas

- **Novas Abas:** Clique no botão "+" ao lado das abas
- **Fechar Aba:** Clique no "×" na aba
- **Alternar Abas:** Clique no título da aba
- **Navegação:** Use os botões Voltar/Avançar na barra de ferramentas

## Resolução de Problemas

### O navegador não abre
- Certifique-se de ter Node.js instalado (versão 16+)
- Execute `npm install` novamente
- Certifique-se de que o servidor Vite está rodando em `http://localhost:5173` antes de executar o Electron

### Alguns sites não funcionam
- Desative temporariamente "Bloquear Scripts de Terceiros"
- Alguns sites podem precisar de JavaScript habilitado

### Build não funciona
- Certifique-se de ter todas as dependências instaladas
- Verifique se você tem permissões de escrita na pasta `dist/`

## Suporte

Para mais informações, consulte o [README.md](README.md) completo.

