# financIA

Projeto frontend desenvolvido em **React + TypeScript + Vite** que gera um insight financeiro personalizado com base nos dados de uma simulação, como **renda, despesas, dívidas e metas**.

O aplicativo apresenta um diagnóstico financeiro e permite que o usuário tenha uma conversa de acompanhamento com uma IA.

## 🚀 Como executar

### Pré-requisitos

- Node.js
- PNPM
- Uma chave de API do Gemini

### Instalação

Instale as dependências do projeto:

```bash
pnpm install
```

### Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto e adicione sua chave da API do Gemini:

```env
VITE_GEMINI_API_KEY=sua_gemini_api_key
```

> **Importante:** nunca versione o arquivo `.env.local` ou exponha sua chave de API publicamente.

### Desenvolvimento

Execute o projeto em modo de desenvolvimento:

```bash
pnpm dev
```

Após iniciar o servidor, acesse a URL exibida no terminal.

### Build de produção

Para gerar a versão de produção:

```bash
pnpm build
```

Para visualizar a build localmente:

```bash
pnpm preview
```

## 🛠️ Tecnologias utilizadas

- **React** — construção da interface
- **TypeScript** — tipagem estática
- **Vite** — ferramenta de desenvolvimento e build
- **PNPM** — gerenciamento de dependências
- **Gemini API** — geração dos insights e respostas da IA
- **ESLint** — padronização e análise do código

## ✨ Funcionalidades

- Simulação financeira baseada nos dados informados pelo usuário
- Geração de diagnóstico financeiro personalizado
- Conversação com IA para acompanhamento do diagnóstico
- Armazenamento das simulações e conversas
- Histórico das simulações realizadas
- Indicador visual da viabilidade das metas no histórico
- Interface desenvolvida com React e TypeScript

## 🔄 Fluxo de criação de conversas

Foi corrigido o fluxo de criação das conversas para evitar a criação automática de uma mensagem `assistant` ao salvar o insight inicial.

O comportamento esperado é:

1. O usuário preenche os dados da simulação.
2. O insight financeiro inicial é gerado.
3. A simulação é salva sem uma mensagem `assistant` automática na `conversation`.
4. A primeira mensagem adicionada à conversa deve obrigatoriamente ser uma mensagem do usuário (`user`).
5. A IA responde somente após o usuário realizar uma pergunta.

Essas alterações foram realizadas em:

```text
src/hooks/useInsight.tsx
```

## 🎯 Indicador de viabilidade das metas

Na tela de **Histórico**, o ícone relacionado à meta utiliza cores para representar visualmente sua viabilidade.

Dessa forma, o usuário consegue identificar rapidamente a situação das metas diretamente pelo histórico das simulações.

## 🧪 Como testar o fluxo principal

1. Execute o projeto com:

```bash
pnpm dev
```

2. Preencha o formulário da simulação.
3. Salve a simulação.
4. Acesse a página de resultados.
5. Verifique se não existe uma mensagem com `role: 'assistant'` criada automaticamente antes de o usuário realizar uma pergunta.
6. Para conferir os dados salvos, abra:

```text
DevTools → Application → Local Storage → simulation-data
```

7. Faça a primeira pergunta no campo de chat.
8. Verifique se a primeira mensagem salva na `conversation` possui:

```ts
{
  role: 'user',
  ...
}
```

9. Na aba **Network** do DevTools, verifique se apenas uma requisição à API de IA foi realizada durante a geração inicial do insight.

## 🐛 Comandos úteis para depuração

Iniciar o servidor de desenvolvimento:

```bash
pnpm dev
```

Gerar a build:

```bash
pnpm build
```

Visualizar a build:

```bash
pnpm preview
```

Durante a depuração, também é possível utilizar:

- Console do navegador para verificar erros;
- **Network** para acompanhar as requisições à API;
- **Application → Local Storage** para verificar os dados das simulações;
- React DevTools para inspecionar os componentes e estados da aplicação.

## 📚 O que aprendi

Durante o desenvolvimento do projeto, pude aprender na prática como integrar **Inteligência Artificial** a uma aplicação web utilizando React e TypeScript.

A integração com a IA tornou o projeto mais dinâmico e permitiu transformar os dados financeiros fornecidos pelo usuário em insights personalizados e interações conversacionais.

Além do desenvolvimento da interface, o projeto também proporcionou aprendizado sobre:

- Integração com APIs de Inteligência Artificial;
- Gerenciamento de estado no React;
- Desenvolvimento com TypeScript;
- Persistência de dados no navegador;
- Organização de componentes e hooks;
- Tratamento do fluxo de conversação com IA;
- Depuração utilizando as ferramentas do navegador;
- Desenvolvimento e build de aplicações com Vite.

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos e de aprendizado.
