# Mini Rede Social

Projeto prático de uma Mini Rede Social desenvolvido para a disciplina de **Programação para Web** da faculdade **UNDB**.

## Sobre o Projeto

Uma rede social simplificada onde os usuários podem criar conta, fazer login, publicar posts, curtir, comentar e visitar perfis de outros usuários. O projeto utiliza **Next.js** no front-end e **Supabase** como back-end (autenticação e banco de dados).

## Tecnologias Utilizadas

- [Next.js](https://nextjs.org/) — Framework React para aplicações web
- [React](https://react.dev/) — Biblioteca para construção de interfaces
- [Supabase](https://supabase.com/) — Autenticação e banco de dados PostgreSQL
- CSS puro — Estilização sem frameworks de CSS

## Funcionalidades

- Cadastro e login de usuários (com confirmação por e-mail)
- Criação e exclusão de posts
- Curtidas e comentários nos posts
- Página de perfil com bio editável
- Busca de usuários
- Feed com posts de todos os usuários

## Como Rodar o Projeto

1. Clone o repositório:

```bash
git clone https://github.com/takeozin/mini-rede-social-faculdade.git
cd mini-rede-social-faculdade
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente criando um arquivo `.env.local` na raiz do projeto com as credenciais do Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

4. Rode o servidor de desenvolvimento:

```bash
npm run dev
```

5. Acesse no navegador: [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

```
src/
├── app/            # Páginas da aplicação (rotas)
│   ├── login/      # Página de login/cadastro
│   ├── perfil/     # Página de perfil do usuário
│   ├── page.jsx    # Feed principal
│   └── layout.jsx  # Layout global
├── components/     # Componentes reutilizáveis (Header, PostCard, etc.)
├── lib/            # Configuração do Supabase
└── middleware.js   # Proteção de rotas autenticadas
```

## Deploy

O projeto está hospedado na [Vercel](https://vercel.com/).
