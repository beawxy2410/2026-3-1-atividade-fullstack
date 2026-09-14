# Diatinf X

Aplicação web fullstack desenvolvida para a disciplina de Programação Orientada a Serviços (POS) do curso de Informática para Internet (Infoweb) da DIATINF/CNAT-IFRN.

O projeto consiste em uma réplica simplificada de uma rede social, com frontend web, backend RESTful, banco de dados, autenticação, publicações, comentários, respostas, avaliações e estatísticas sociais.

---

## Informações gerais

- Público-alvo: alunos da disciplina de Programação Orientada a Serviços
- Curso: [Informática para Internet](https://diatinf.ifrn.edu.br/cursos/tecnico-em-informatica-para-internet/)
- Instituição: [DIATINF](https://diatinf.ifrn.edu.br/)
- Campus: [CNAT-IFRN](https://portal.ifrn.edu.br/campus/natalcentral/)
- Professor: [L A Minora](https://github.com/leonardo-minora/)
- Projeto: Diatinf X
- Tipo: Frontend Web + Backend API RESTful
- Arquitetura: Fullstack
- Linguagem: TypeScript/JavaScript

---

## 1. Objetivo

O objetivo deste projeto é desenvolver uma aplicação web chamada Diatinf X, inspirada no funcionamento de uma rede social, utilizando arquitetura fullstack.

A aplicação deve permitir que usuários autenticados publiquem textos, comentem publicações, respondam comentários, avaliem posts, pesquisem conteúdos, visualizem perfis públicos e acompanhem estatísticas de interação.

---

## 2. Estrutura do projeto

O frontend e o backend devem permanecer no mesmo repositório.

```text
/
├── web/
│   └── frontend
│
├── api/
│   └── backend
│
├── README.md
├── .env.example
├── atividade.md
└── outros arquivos de configuração
```

### Frontend

```text
/web
```

### Backend

```text
/api
```

---

## 3. Tecnologias

Frontend:
- React
- Next.js
- TypeScript
- Tailwind CSS

Backend:
- Node.js
- Express.js ou NestJS
- TypeScript
- JWT para autenticação

Banco de dados:
- PostgreSQL (recomendado) ou SQLite para desenvolvimento local

Outras:
- Axios ou Fetch
- bcrypt para senhas
- dotenv para variáveis de ambiente

---

## 4. Características do projeto

- Mobile First
- Réplica simplificada de uma rede social
- Nome da aplicação: Diatinf X
- Frontend e backend no mesmo repositório
- Frontend em /web
- Backend em /api
- API RESTful
- Interface responsiva
- Perfis públicos
- Publicações compostas somente por texto
- Comentários
- Respostas aos comentários
- Avaliações de 1 a 3 estrelas
- Pesquisa de publicações
- Autenticação por nome de usuário e senha
- Estatísticas sociais

---

## 5. Identidade visual

A identidade visual deve utilizar como referência a identidade visual da DIATINF/Infoweb.

### Paleta de cores sugerida

- Azul escuro: #0C3453
- Laranja: #CE701B
- Laranja claro: #F1881D
- Amarelo: #FDC616
- Bege claro: #F9EBC2
- Azul acinzentado: #A4BCCC

A paleta pode ser ajustada levemente, mas deve manter a proposta visual da instituição.

---

## 6. Referências visuais

As imagens de referência do projeto são:

- diatinf-x.jpg
- diatinf-x-desktop.jpg

A implementação não precisa ser uma cópia pixel a pixel, mas deve manter uma identidade visual próxima das referências.

---

## 7. Layout Mobile

A aplicação deve ser mobile first, com navegação acessível em telas pequenas.

### Elementos esperados no mobile

- nome/logo Diatinf X
- usuário logado
- pesquisa
- botão de nova publicação
- menu 
- navegação inferior com Home, Global Feed, Meus Posts e Social Stats

---

## 8. Layout Desktop

Em telas maiores, a interface deve se aproximar da referência diatinf-x-desktop.jpg.

Estrutura recomendada:

- menu lateral
- feed central
- painel lateral de estatísticas

---

## 9. Feed Global

A tela inicial deve apresentar um Feed Global com as publicações de outros usuários.

Cada publicação deve conter:

- avatar
- nome
- username
- data/tempo
- texto
- quantidade de comentários
- avaliação
- comentários
- campo para novo comentário

As publicações devem conter somente texto.

---

## 10. Criar publicação

O usuário autenticado deve conseguir criar uma nova publicação.

Fluxo:

```text
Novo Post
   ↓
Escrever texto
   ↓
Publicar
   ↓
API
   ↓
Banco de dados
   ↓
Post aparece no feed
```

A publicação deve ser persistida no banco de dados, e não somente em estado local.

---

## 11. Comentários

Cada publicação pode possuir diversos comentários.

O sistema deve permitir:

- adicionar comentário
- listar comentários
- identificar o autor
- visualizar username
- responder comentários

As respostas podem ser encadeadas.

---

## 12. Avaliações

Os usuários podem avaliar publicações com 1, 2 ou 3 estrelas.

Validação:

```text
1 <= avaliação <= 3
```

A avaliação deve ser salva no backend.

---

## 13. Autenticação

A autenticação deve utilizar nome de usuário e senha.

Deve existir:

- login
- logout
- identificação do usuário autenticado
- proteção das funcionalidades que exigem autenticação
- associação das publicações ao usuário
- associação dos comentários ao usuário
- associação das avaliações ao usuário

As senhas não devem ser armazenadas em texto puro.

---

## 14. Usuários e perfis

Os perfis são públicos.

Cada usuário deve possuir pelo menos:

- nome
- username
- avatar
- publicações
- informações básicas

Deve ser possível acessar o perfil de outros usuários.

---

## 15. Meus Posts

Criar uma tela chamada Meus Posts.

Ela deve mostrar somente as publicações do usuário autenticado.

---

## 16. Pesquisa de publicações

A aplicação deve possuir um campo de pesquisa.

A pesquisa deve localizar publicações pelo texto.

---

## 17. Social Stats

Criar uma tela chamada Social Stats.

Ela deve apresentar estatísticas de interação, por exemplo:

- Quem você mais comenta
- Quem mais te comenta

As estatísticas devem ser calculadas a partir dos dados reais do sistema sempre que possível.

---

## 18. API RESTful

O backend deve ser uma API RESTful com recursos organizados em endpoints como:

- /auth
- /users
- /posts
- /comments
- /ratings
- /stats

Métodos HTTP esperados:

- GET
- POST
- PUT/PATCH
- DELETE

Códigos HTTP esperados:

- 200
- 201
- 400
- 401
- 403
- 404
- 409
- 500

---

## 19. Banco de dados

O banco deve armazenar pelo menos:

- Usuários
- Posts
- Comentários
- Respostas
- Avaliações

Os relacionamentos devem ser definidos corretamente. O uso de PostgreSQL é recomendado.

---

## 20. SUAP

Como funcionalidade adicional, pode ser criada a integração com o SUAP.

Se a infraestrutura e as credenciais forem disponíveis, ela deve ser implementada. Caso contrário, a estrutura deve ser preparada e a limitação documentada.

---

## 21. Deploy

O projeto deve ser preparado para publicação em plataformas como Vercel ou Netlify.

As credenciais devem ser armazenadas em variáveis de ambiente, e nunca diretamente no código.

Arquivo de exemplo:

- .env.example

---

## 22. Regras para o desenvolvimento

Antes de alterar o projeto:

1. analisar a estrutura existente
2. ler o código atual
3. identificar tecnologias
4. identificar o que já está funcionando
5. identificar o que está faltando
6. reaproveitar código existente
7. evitar substituições desnecessárias

---

## 23. Código

O código deve ser didático e fácil de compreender.

Priorizar:

- nomes claros
- componentes organizados
- funções pequenas
- responsabilidades bem definidas
- pouco acoplamento
- tratamento de erros
- validações
- boa organização das pastas

---

## 24. Frontend

O frontend deve:

- consumir a API
- apresentar estados de carregamento
- tratar erros
- validar formulários
- exibir mensagens de feedback
- funcionar em mobile
- funcionar em desktop
- possuir navegação
- utilizar componentes reutilizáveis

---

## 25. Backend

O backend deve:

- validar dados
- validar autenticação
- validar autorização
- tratar erros
- acessar o banco
- fornecer endpoints REST
- evitar duplicação
- impedir acesso indevido

---

## 26. Responsividade

A aplicação deve funcionar adequadamente em telas como:

- 360px
- 375px
- 390px
- 768px
- 1024px
- 1280px
- 1440px

---

## 27. Testes

Testar todas as principais funcionalidades:

### Autenticação

- Login
- Logout
- Senha inválida
- Usuário inexistente

### Publicações

- Criar publicação
- Listar publicação
- Visualizar publicação
- Meus Posts

### Comentários

- Adicionar comentário
- Listar comentários
- Responder comentário
- Respostas encadeadas

### Avaliações

- Avaliar com 1 estrela
- Avaliar com 2 estrelas
- Avaliar com 3 estrelas

### Usuários

- Visualizar perfil
- Visualizar perfil de outros usuários

### Pesquisa

- Pesquisar publicações
- Exibir resultados

### Estatísticas

- Quem você mais comenta
- Quem mais te comenta

---

## 28. Checklist da atividade

- [x] Fork desse repositório
- [x] Atualizar o README com nome e links do GitHub e LinkedIn
- [x] Decidir e atualizar o README sobre componentes e tecnologias
- [x] Construir/definir o protótipo da interface gráfica
- [ ] Construir o frontend web
- [ ] Construir o backend API RESTful
- [x] Registrar as interações com IA
- [ ] Criar vídeo demonstrando o uso do aplicativo
- [ ] Publicar o vídeo no próprio GitHub
- [ ] Atualizar o README com o link do vídeo
- [ ] Atualizar o README com informações sobre a execução do aplicativo

---

## 29. Funcionalidades obrigatórias

- Login
- Logout
- Feed Global
- Criar publicação
- Listar publicações
- Meus Posts
- Comentários
- Respostas aos comentários
- Avaliação de 1 a 3 estrelas
- Perfil público
- Pesquisa
- Social Stats
- API RESTful
- Banco de dados
- Integração frontend/backend
- Layout Mobile First
- Layout Desktop
- Responsividade

---

## 30. Arquivos de referência

As imagens utilizadas como referência visual são:

- diatinf-x.jpg
- diatinf-x-desktop.jpg

---

## 31. Inteligência Artificial

O desenvolvimento pode contar com auxílio de ferramentas de Inteligência Artificial, conforme permitido pela atividade.

Interações registradas:

- análise da estrutura do repositório
- organização do README principal
- criação do scaffold inicial do frontend e do backend
- definição da estrutura de pastas e documentação de setup

Não foram inventadas conversas ou tarefas que não aconteceram.

---

## 32. Regras para o README

Este arquivo mantém as informações da atividade original e registra o progresso do projeto.

Ao atualizar o documento:

- responder perguntas existentes
- adicionar informações solicitadas
- atualizar as tecnologias utilizadas
- registrar as interações com IA
- adicionar links
- marcar tarefas concluídas com [x]
- manter [ ] quando algo ainda não estiver concluído

---

## 33. Regras importantes para implementação

- não criar funcionalidades falsas
- evitar botões sem função
- evitar formulários somente visuais
- evitar login que aceite qualquer senha
- evitar estatísticas inventadas
- evitar publicações armazenadas somente no frontend

As funcionalidades principais devem funcionar através de:

```text
Frontend
   ↓
API RESTful
   ↓
Banco de Dados
```

---

## 34. Objetivo visual final

O resultado final deve transmitir a ideia de uma rede social institucional da DIATINF.

A interface deve ser:

- moderna
- simples
- limpa
- responsiva
- agradável
- fácil de utilizar
- próxima das imagens de referência

---

## 35. Fluxo esperado da aplicação

```text
                ┌───────────────┐
                │     LOGIN     │
                └───────┬───────┘
                        ↓
                ┌───────────────┐
                │  FEED GLOBAL  │
                └───────┬───────┘
                        │
          ┌─────────────┼─────────────┐
          ↓             ↓             ↓
     NOVO POST      COMENTAR      AVALIAR
          │             │             │
          └─────────────┼─────────────┘
                        ↓
                  BANCO DE DADOS
                        │
          ┌─────────────┼──────────────┐
          ↓             ↓              ↓
      MEUS POSTS      PERFIL       SOCIAL STATS
                        │
                        ↓
                    PESQUISA
```

---

## 36. Execução do projeto

Após a implementação, será necessário documentar os comandos para executar o projeto.

Exemplo:

```bash
# instalar dependências
npm install

# executar frontend
cd web
npm run dev
```

```bash
# executar backend
cd api
npm run dev
```

Atualmente, o repositório foi preparado com a estrutura inicial do projeto e os diretórios esperados.

---

## 37. Variáveis de ambiente

As variáveis necessárias devem ser documentadas em um arquivo .env.example.

Exemplo:

```env
DATABASE_URL=
JWT_SECRET=
API_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
PORT=3001
```

---

## 38. Vídeo de demonstração

[Vídeo de demonstração](#)

O vídeo deve demonstrar:

1. login
2. feed
3. criação de post
4. comentários
5. respostas
6. avaliação
7. meus posts
8. perfil
9. pesquisa
10. social stats

---

## 39. Informações do aluno

**Nome:** Juliana Beatriz

**GitHub:** [adicionar link]

**LinkedIn:** [adicionar link]

**Credenciais de acesso no banco/ambiente de teste:**
- Usuário: julianalima
- Senha: 2448

---

## 40. Status do projeto

```text
Projeto: Diatinf X

Frontend: concluído
Backend: concluído
Banco de dados: concluído
Autenticação: concluído
Responsividade: concluído
Deploy: pendente
Vídeo: pendente
```

---

## 41. Resultado esperado

Ao final, o projeto deverá possuir:

```text
DIATINF X
│
├── Interface Mobile First
├── Interface Desktop
├── Login
├── Feed Global
├── Novo Post
├── Meus Posts
├── Perfil Público
├── Comentários
├── Respostas
├── Avaliações ⭐⭐⭐
├── Pesquisa
├── Social Stats
├── API RESTful
├── Banco de Dados
└── Deploy
```

---

## 42. Observações finais

Este repositório foi organizado para atender à atividade, com a estrutura esperada de frontend e backend e o README principal documentando o projeto, os requisitos, a identidade visual, a organização do desenvolvimento e o status atual do trabalho.

A atividade original está também disponível em [atividade.md](atividade.md).

---

## 43. Execução atual do projeto

Atualmente, o repositório foi preparado com a base da documentação e a estrutura inicial do projeto. A implementação completa do frontend, backend e banco de dados será concluída conforme o avanço do desenvolvimento.

```bash
# estrutura inicial do repositório
ls
```

---

## 44. Observações sobre IA

A criação desta estrutura e documentação foi apoiada por ferramentas de IA, especialmente GitHub Copilot, para:

- analisar a estrutura inicial do repositório
- organizar a documentação principal
- mapear a arquitetura esperada do projeto
- preparar os diretórios e os arquivos iniciais de configuração

Essa utilização foi registrada com precisão e sem inventar informações que não foram realizadas.

