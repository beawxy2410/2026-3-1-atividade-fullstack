# 2026.3.1 - POS - Frontend web e backend API RESTful

## Informações gerais

- **Público alvo**: alunos da disciplina de **Programação Orientada a Serviços** do curso de [Infoweb](https://diatinf.ifrn.edu.br/cursos/tecnico-em-informatica-para-internet/) na [DIATINF](https://diatinf.ifrn.edu.br/) no [CNAT-IFRN](https://portal.ifrn.edu.br/campus/natalcentral/)
- **Professor**: [L A Minora](https://github.com/leonardo-minora/)
- **Objetivo**:
  1. Construir uma aplicação fullstack com frontend web e backend em API RESTful.
  2. Aplicar conceitos de autenticação, persistência em banco de dados, consumo de API, CORS e integração entre frontend e backend.

[A descrição da atividade](../atividade.md)

---

## Relato da atividade

- **Nome da aluna**: Juliana Beatriz de Lima Araújo
- **GitHub**: [beawxy2410](https://github.com/beawxy2410)
- **LinkedIn**: Não Possui.

A atividade foi desenvolvida como projeto de aplicação fullstack para a disciplina de POS, com foco em uma rede social acadêmica inspirada na DIATINF, chamada Diatinf X.

---

### Componentes e tecnologias

O projeto foi implementado com as seguintes tecnologias:

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Banco de dados**: SQLite
- **Autenticação**: JWT (JSON Web Token)
- **Criptografia de senha**: bcryptjs
- **Comunicação entre frontend e backend**: Fetch API
- **Configuração de segurança**: CORS
- **Variáveis de ambiente**: dotenv


---

### Agente de IA


- **GitHub Copilot**: foi usado para auxiliar na escrita e revisão de trechos de código, sugestões de estrutura e correções de erros durante o desenvolvimento.
- **ChatGPT**: foi usado para debugar dificuldades de integração entre frontend e backend, revisar a lógica da API, explicar erros de CORS e ajudar na organização das soluções.


---

### Execução do projeto

Para rodar o projeto localmente, siga os passos abaixo:

1. Abra o terminal na raiz do projeto.
2. Instale as dependências do backend:
   ```bash
   cd api
   npm install
   ```
3. Inicie a API:
   ```bash
   npm run start
   ```
4. Em outro terminal, instale as dependências do frontend:
   ```bash
   cd web
   npm install
   ```
5. Inicie o frontend:
   ```bash
   npm run dev -- --host 0.0.0.0
   ```
6. Acesse a aplicação no navegador pela URL do Vite, normalmente:
   ```bash
   http://localhost:5173
   ```

A API fica disponível em:
```bash
http://localhost:3001
```

### Observação

Ao resolver o problema de CORS e rodar a aplicação em um ambiente com acesso externo ou em containers/servidores remotos, pode ser necessário liberar as portas do frontend e do backend manualmente para que o navegador e a API consigam se comunicar corretamente.

Em alguns ambientes, isso exige permitir o acesso público às portas utilizadas, por exemplo:

- frontend: `5173`
- backend: `3001`

Se as portas não estiverem expostas, a aplicação pode falhar ao tentar acessar a API mesmo com o CORS configurado corretamente.

### Executando o Projeto

[Vídeo do Código em Funcionamento (Desktop)](/video.mp4)

---
