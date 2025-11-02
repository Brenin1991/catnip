# Como Gerar o Executável (.exe)

## Pré-requisitos

1. Certifique-se de que todas as dependências estão instaladas:
   ```bash
   npm install
   ```

2. **IMPORTANTE**: Crie um ícone para o aplicativo:
   - Crie um arquivo `icon.ico` na pasta `assets/`
   - Você pode usar ferramentas online para converter PNG para ICO
   - Tamanho recomendado: 256x256 ou 512x512 pixels

## Gerar o Executável

### Para Windows (.exe):

```bash
npm run electron:build:win
```

Este comando irá:
1. Compilar o código React com Vite
2. Gerar o executável usando electron-builder
3. Criar dois arquivos na pasta `dist/`:
   - **Instalador NSIS**: `Privacy Browser-1.0.0-setup.exe` (instalador com interface)
   - **Portable**: `Privacy Browser-1.0.0.exe` (executável portável, não precisa instalar)

### Para macOS (.dmg):

```bash
npm run electron:build:mac
```

### Para Linux:

```bash
npm run electron:build:linux
```

### Build genérico (todos os sistemas):

```bash
npm run electron:build
```

## Arquivos Gerados

Após a build, os arquivos estarão na pasta `dist/`:

- Windows:
  - `Privacy Browser-1.0.0-setup.exe` - Instalador
  - `Privacy Browser-1.0.0.exe` - Versão portável

## Notas Importantes

1. **Primeira vez pode demorar**: A primeira build baixa o Electron e ferramentas necessárias
2. **Tamanho do executável**: Aproximadamente 100-200 MB (inclui Chromium/Electron)
3. **Ícone**: Se você não criar o `icon.ico`, o electron-builder usará um ícone padrão

## Resolução de Problemas

### Erro de ícone não encontrado:
Crie o arquivo `assets/icon.ico` ou remova a referência ao ícone no `package.json`

### Erro de build:
- Verifique se o Vite build funcionou: `npm run build`
- Verifique se todas as dependências estão instaladas
- Limpe a pasta `dist` e tente novamente

