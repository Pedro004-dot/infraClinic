# MediConnect - CRM para Clínicas

Um sistema de CRM e gerenciamento de conversas para clínicas médicas, desenvolvido com Next.js, React e Tailwind CSS.

## Funcionalidades

- **Dashboard**: Visualização rápida de métricas e conversas recentes
- **Chat Integrado**: Interface para gerenciamento de conversas do WhatsApp/Instagram
- **Kanban**: Visualização e gerenciamento do funil de pacientes
- **Design Responsivo**: Interface adaptável para diferentes tamanhos de tela
- **Tema Moderno**: Design limpo e profissional para ambiente médico

## Tecnologias Utilizadas

- Next.js 14
- React 18
- Tailwind CSS
- TypeScript
- Heroicons
- @hello-pangea/dnd (Drag and Drop)

## Pré-requisitos

- Node.js 18.x ou superior
- npm ou yarn

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/mediconnect.git
cd mediconnect
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

4. Acesse a aplicação em `http://localhost:3000`

## Estrutura do Projeto

```
mediconnect/
├── app/
│   ├── chat/
│   ├── kanban/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── Navbar.tsx
├── public/
├── tailwind.config.ts
└── package.json
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
