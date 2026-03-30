<div align="center">
  <h1>Yoog</h1>
  <p><strong>Um Sistema Full-Stack de Gestão de Pacientes e Atendimentos</strong></p>
</div>

> English version. See **[README.md](./README.md)**.

## Índice

- [Descrição](#descrição)
- [Prólogo](#prólogo)
- [Como Iniciar](#como-iniciar)
- [Rodando com Docker](#rodando-com-docker)
- [Endpoints](#endpoints)
- [Decisões de Arquitetura & Trade-offs](#decisões-de-arquitetura--trade-offs)
- [O que foi deliberadamente deixado de fora (e por quê)](#o-que-foi-deliberadamente-deixado-de-fora-e-por-quê)
- [Epílogo](#epílogo)

## Descrição

Um mini-crm full-stack construído com [NestJS](https://nestjs.com/) e [React](https://react.dev/) em um [Monorepo](https://pnpm.io/workspaces) [TypeScript](https://www.typescriptlang.org/).

## Prólogo

Este projeto é a minha submissão para o desafio técnico de Engenharia de Software da [Yoog](https://yoogsaude.com.br/).

Desenhado com foco em modularidade e experiência de desenvolvimento (DX), este projeto utiliza um Monorepo em TypeScript para unificar o frontend em React e o backend em NestJS.

#### Stack Principal

**Monorepo & Compartilhamento**
- [PNPM Workspaces](https://pnpm.io/workspaces) + [TypeScript](https://www.typescriptlang.org/)
- [Zod](https://zod.dev/) (Fonte única de verdade para tipos e validações)

**Backend (API)**
- [NestJS](https://docs.nestjs.com/)
- [@nestjs/typeorm](https://docs.nestjs.com/techniques/database) + [TypeORM](https://typeorm.io/) + [PostgreSQL](https://www.postgresql.org/)
- [@nestjs/passport](https://docs.nestjs.com/security/authentication) + [JWT](https://jwt.io/) + [Bcrypt](https://www.npmjs.com/package/bcrypt)
- [@nestjs/config](https://docs.nestjs.com/techniques/configuration)
- [Jest](https://jestjs.io/) + [Supertest](https://github.com/ladjs/supertest) (Testes de Integração/E2E)

**Frontend (Web)**
- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [TanStack Query](https://tanstack.com/query/latest) (Gerenciamento de estado do servidor)
- [React Hook Form](https://react-hook-form.com/) + [@hookform/resolvers](https://www.npmjs.com/package/@hookform/resolvers)
- [React Router DOM](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [Lucide React](https://lucide.dev/) (Ícones) & [Sonner](https://sonner.emilkowal.ski/) (Toasts)

## Como Iniciar

Como este projeto utiliza uma arquitetura de monorepo, as dependências são gerenciadas na raiz através do [PNPM Workspaces](https://pnpm.io/workspaces).

Instale as dependências:


```bash
pnpm install
```

Inicie a aplicação localmente (isso vai rodar a API e o Web simultaneamente):

```bash
pnpm dev
```

Você vai precisar de um `.env` contendo as seguintes variaveis:

```env
DATABASE_URL=postgresql://crm_user:crm_password@localhost:5432/mini_crm
JWT_SECRET=
PORT=3000
FRONTEND_URL=http://localhost:5173
```

> 💡 Dica: Para rodar o projeto localmente (pnpm dev), você precisará de uma instância do PostgreSQL ativa. Você pode subir o banco rapidamente utilizando o Docker: docker-compose up -d db.

## Rodando com Docker

O projeto inclui um ambiente Dockerizado completo, orquestrado para subir o Banco de Dados, o Backend (API) e o Frontend (Web) sem a necessidade de ter Node.js ou PNPM instalados localmente.

```bash
docker-compose up --build
```

- Frontend disponível em: `http://localhost:8080`
- Backend disponível em: `http://localhost:3000`
- PostgreSQL disponível em: `5432`


Essa configuração utiliza um `healthcheck` no banco de dados, garantindo que a API só inicie a sua execução quando o PostgreSQL estiver 100% pronto para aceitar conexões.

## Endpoints

### POST /patients

Registra um novo paciente no CRM.

**Headers Necessários:**
- `Authorization: Bearer <token>`

**Body:**
- `name` (string) – Nome completo do paciente
- `phone` (string) – Telefone de contato

Retorna o objeto do paciente criado, incluindo seu UUID.

---

### GET /appointments

Lista a fila de atendimentos. Inclui paginação via par��metros de busca (query params).

**Headers Necessários:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number, opcional) – Padrão é 1
- `limit` (number, opcional) – Padrão é 20

Retorna um array de atendimentos contendo os dados do paciente aninhados e metadados com a contagem total.

---

### POST /appointments

Cria uma nova solicitação de atendimento vinculada a um paciente. O status inicial é sempre definido como `AGUARDANDO` por padrão, em conformidade com as regras de negócio.

**Headers Necessários:**
- `Authorization: Bearer <token>`

**Body:**
- `patientId` (uuid) – ID do paciente registrado
- `description` (string) – Breve descrição ou queixa médica

---

### PATCH /appointments/:id/status

Realiza a transição do estado do atendimento com base em regras de negócio rigorosas (`AGUARDANDO` → `EM_ATENDIMENTO` → `FINALIZADO`). Transições inválidas (ex: pular de Aguardando direto para Finalizado) retornarão automaticamente um erro `400 Bad Request`.

**Headers Necessários:**
- `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (uuid) – ID do atendimento

**Body:**
- `status` (string) – O próximo estado válido

---

### PATCH /appointments/:id

Atualiza a descrição textual/queixa de um atendimento existente.

**Headers Necessários:**
- `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (uuid) – ID do atendimento

**Body:**
- `description` (string) – O novo texto da descrição

## Decisões de Arquitetura & Trade-offs

### 1. Monorepo & Validação Isomórfica (Zod)
Optou-se por um Monorepo utilizando **PNPM Workspaces** para compartilhar o pacote `@mini-crm/shared` entre o Frontend e o Backend.
- **Por quê:** Ao centralizar Definições de Tipo, Máquinas de Estado e Schemas de Validação (Zod), criamos uma Fonte Única de Verdade (Single Source of Truth).
- **Vantagem:** O uso do `ZodValidationPipe` no NestJS e do `@hookform/resolvers/zod` no React garante que as regras de validação que o usuário visualiza na tela sejam exatamente as mesmas que o banco de dados impõe, prevenindo inconsistências entre a API e a Web.

### 2. TypeORM vs. Prisma
- **Decisão:** Escolha do **TypeORM** em vez do Prisma.
- **Por quê:** A abordagem baseada em decorators do TypeORM se integra de forma nativa ao NestJS. Além disso, ele proporciona um controle granular sobre as migrações SQL e evita o binário pesado da query-engine em Rust exigido pelo Prisma. Isso mantém o tamanho das nossas imagens Docker reduzido e garante tempos de inicialização (cold starts) muito mais rápidos.

### 3. Integridade de Dados ao invés de Soft Deletes
- **Decisão:** Foram implementados hard deletes com restrições rigorosas de Chave Estrangeira (Foreign Key), em vez de exclusão lógica (Soft Deletes via `deleted_at`).
- **Por quê:** Para o escopo deste desafio, isso demonstra uma forte compreensão de resiliência de dados. O banco de dados bloqueia a exclusão de um paciente caso este possua atendimentos vinculados, evitando registros órfãos e protegendo o histórico clínico.

### 4. Docker Multi-stage Builds & Nginx
- **Decisão:** Ambos os Dockerfiles (API e Web) utilizam multi-stage builds.
- **Trade-off:** O tempo de build é ligeiramente maior, mas as imagens finais de produção são desprovidas de código-fonte e gerenciadores de pacotes, reduzindo drasticamente a superfície de ataque.
- **Entrega Web:** O frontend é servido via **Nginx** (configurado com `try_files` para o roteamento do SPA) em vez de um servidor Node.js. Isso garante uma entrega de arquivos estáticos altamente eficiente, assíncrona e com mínimo consumo de memória.

---

### O que foi deliberadamente deixado de fora (e por quê)

- **Autenticação Complexa (OIDC/OAuth2):** Implementamos um fluxo JWT funcional e simplificado. Em um cenário real de saúde (em conformidade com HIPAA/LGPD), delegaríamos isso a provedores de identidade como Auth0 ou Keycloak.
- **Soft Deletes & Logs de Auditoria (Audit Logs):** Embora cruciais para um CRM médico real rastrear "quem alterou o quê", eles foram excluídos para manter o escopo estritamente focado na lógica principal da máquina de estados solicitada.
- **100% de Cobertura de Testes:** Em vez de buscar uma métrica genérica de cobertura, priorizamos a qualidade sobre a quantidade escrevendo **Testes de Integração E2E** robustos (utilizando Jest + Supertest). Estes foram direcionados aos fluxos críticos: criação de Atendimentos e as transições estritas de status (`AGUARDANDO → EM_ATENDIMENTO → FINALIZADO`).
- **Message Brokers (RabbitMQ/Redis):** O processamento assíncrono foi considerado excesso de engenharia (*over-engineering*) para este escopo, visto que o Event Loop nativo do Node.js lida facilmente com o volume de dados exigido.

## Epílogo

Este projeto foi uma ótima oportunidade para aplicar práticas modernas de desenvolvimento **Full-Stack** em um cenário realista. Foquei em manter a arquitetura coesa, aproveitando o Monorepo para criar uma ponte perfeita entre o frontend em React e o backend em NestJS, evitando estritamente complexidades desnecessárias.

Há sempre espaço para melhorias, mas acredito que esta implementação fornece uma base robusta, segura em termos de tipagem (type-safe) e altamente manutenível — pronta para escalar, suportar novos recursos e se adaptar a novas regras de negócio no futuro.

<br>

<p align="center">
  Feito com 💙 por <a href="https://github.com/jwcbmat" target="_blank">jwcbmat</a>
</p>
