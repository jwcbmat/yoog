<div align="center">
  <img src="https://oyster.ignimgs.com/mediawiki/apis.ign.com/pokemon-black-and-white/f/f1/Pokemans_113.gif?width=396" width="100" alt="Minior Pokémon icon"/>
  <h1>Yoog</h1>
  <p><strong>A Full-Stack Patient and Appointment Management System</strong></p>
</div>

> Portuguese version. See **[README.pt-BR.md](./README.pt-BR.md)**.


## Table of contents

- [Description](#description)
- [Prologue](#prologue)
- [Getting Started](#getting-started)
- [Running with Docker](#running-with-docker)
- [Endpoints](#endpoints)
- [Architecture Decisions & Trade-offs](#architecture-decisions--trade-offs)
- [What was deliberately left out (and why)](#what-was-deliberately-left-out-and-why)
- [Epilogue](#epilogue)

## Description

A full-stack mini-crm built with [NestJs](https://nestjs.com/) and [ReactJs](https://react.dev/) in a [TypeScript](https://www.typescriptlang.org/) [Monorepo](https://pnpm.io/workspaces).


## Prologue

This project is my entry for the [Yoog](https://yoogsaude.com.br/) Software Engineering challenge.

Designed with modularity and a focus on developer experience, this project uses a TypeScript Monorepo to unify the React frontend and the NestJS backend.

#### Core Stack

**Monorepo & Shared**
- [PNPM Workspaces](https://pnpm.io/workspaces) + [TypeScript](https://www.typescriptlang.org/)
- [Zod](https://zod.dev/) (Single source of truth for validation and types)

**Backend (API)**
- [NestJS](https://docs.nestjs.com/)
- [@nestjs/typeorm](https://docs.nestjs.com/techniques/database) + [TypeORM](https://typeorm.io/) + [PostgreSQL](https://www.postgresql.org/)
- [@nestjs/passport](https://docs.nestjs.com/security/authentication) + [JWT](https://jwt.io/) + [Bcrypt](https://www.npmjs.com/package/bcrypt)
- [@nestjs/config](https://docs.nestjs.com/techniques/configuration)
- [Jest](https://jestjs.io/) + [Supertest](https://github.com/ladjs/supertest) (Integration/E2E Testing)

**Frontend (Web)**
- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [TanStack Query](https://tanstack.com/query/latest) (Server state management)
- [React Hook Form](https://react-hook-form.com/) + [@hookform/resolvers](https://www.npmjs.com/package/@hookform/resolvers)
- [React Router DOM](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [Lucide React](https://lucide.dev/) (Icons) & [Sonner](https://sonner.emilkowal.ski/) (Toasts)

## Getting Started

As this project uses a monorepo architecture, dependencies are managed from the root via [PNPM Workspaces](https://pnpm.io/workspaces).

Install the dependencies:

```bash
pnpm install
```

Run the application locally (this will start both API and Web concurrently):


```bash
pnpm dev
```

You will need a `.env` file with the following content:

```env
DATABASE_URL=postgresql://crm_user:crm_password@localhost:5432/mini_crm
JWT_SECRET=
PORT=3000
FRONTEND_URL=http://localhost:5173
```

> 💡 Tip: To run the project locally, you will need a running PostgreSQL instance. You can easily start one using Docker: docker-compose up -d db.


## Running with Docker

The project includes a complete Dockerized setup, orchestrated to spin up the Database, Backend, and Frontend without needing local Node.js or PNPM installed.

```bash
docker-compose up --build
```

- Frontend available at: `http://localhost:8080`
- Backend available at: `http://localhost:3000`
- PostgreSQL exposed on port: `5432`

This setup uses a `healthcheck` on the database to ensure the API only starts when PostgreSQL is ready to accept connections.

## Endpoints

### POST /patients

Registers a new patient in the CRM.

**Required Headers:**
- `Authorization: Bearer <token>`

**Body:**
- `name` (string) – Patient's full name
- `phone` (string) – Patient's phone number

Returns the created patient object, including its UUID.

---

### GET /appointments

Lists the appointment queue. Includes pagination via query parameters.

**Required Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number, optional) – Defaults to 1
- `limit` (number, optional) – Defaults to 20

Returns an array of appointments with nested patient data and total count metadata.

---

### POST /appointments

Creates a new appointment request linked to a patient. The initial status is always set to `AGUARDANDO` (Waiting) by default to comply with business rules.

**Required Headers:**
- `Authorization: Bearer <token>`

**Body:**
- `patientId` (uuid) – ID of the registered patient
- `description` (string) – Brief description or medical complaint

---

### PATCH /appointments/:id/status

Transitions the appointment state based on strict business rules (`AGUARDANDO` → `EM_ATENDIMENTO` → `FINALIZADO`). Invalid transitions (e.g., skipping from Waiting directly to Completed) will automatically return a `400 Bad Request`.

**Required Headers:**
- `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (uuid) – ID of the appointment

**Body:**
- `status` (string) – The next valid state

---

### PATCH /appointments/:id

Updates the textual description/complaint of an existing appointment.

**Required Headers:**
- `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (uuid) – ID of the appointment

**Body:**
- `description` (string) – The updated description text

## Architecture Decisions & Trade-offs

### 1. Monorepo & Isomorphic Validation (Zod)
We opted for a Monorepo using **PNPM Workspaces** to share the `@mini-crm/shared` package between Frontend and Backend.
- **Why:** By centralizing Type Definitions, Status State Machines, and Validation Schemas (Zod), we create a Single Source of Truth.
- **Advantage:** Using `ZodValidationPipe` in NestJS and `@hookform/resolvers/zod` in React ensures that the validation rules the user sees on the screen are exactly the same rules the database enforces, preventing API/Web mismatches.

### 2. TypeORM vs. Prisma
- **Decision:** Chosen **TypeORM** over Prisma.
- **Why:** TypeORM's decorator-based approach integrates natively with NestJS. Furthermore, it provides granular control over SQL migrations and avoids the heavy Rust query-engine binary required by Prisma, keeping our Docker image sizes small and cold starts fast.

### 3. Data Integrity over Soft Deletes
- **Decision:** Implemented hard deletes with Cascade Foreign Key constraints instead of Soft Deletes (`deleted_at`).
- **Why:** For the scope of this challenge, this ensures strict database hygiene. If a patient is removed, the database automatically cascades the deletion to their linked appointments, preventing orphaned records and maintaining structural consistency without the added complexity of managing soft states.

### 4. Docker Multi-stage Builds & Nginx
- **Decision:** Both API and Web Dockerfiles use multi-stage builds.
- **Trade-off:** Build times are slightly longer, but the final production images are stripped of source code and package managers, drastically reducing the attack surface.
- **Web Delivery:** The frontend is served via **Nginx** (configured with `try_files` for SPA routing) instead of a Node.js server, ensuring highly efficient, asynchronous static file delivery with minimal memory footprint.

---

### What was deliberately left out (and why)

- **Complex Authentication (OIDC/OAuth2):** We implemented a functional, simplified JWT flow. In a real-world healthcare scenario (HIPAA/LGPD compliant), we would delegate this to identity providers like Auth0 or Keycloak.
- **Soft Deletes & Audit Logs:** While crucial for a real medical CRM to track "who changed what," it was excluded to keep the scope strictly focused on the core state-machine logic requested.
- **100% Test Coverage:** Rather than chasing a generic coverage metric, we prioritized quality over quantity by writing robust **E2E Integration Tests** (using Jest + Supertest) specifically targeting the critical paths: Appointment creation and the strict status transition flow (`AGUARDANDO → EM_ATENDIMENTO → FINALIZADO`).
- **Message Brokers (RabbitMQ/Redis):** Asynchronous processing was deemed over-engineering for this scope, as Node.js's native Event Loop easily handles the required data volume.


## Epilogue

This project was a great opportunity to apply modern **Full-Stack** development practices in a realistic scenario. I focused on keeping the architecture cohesive, leveraging the Monorepo to create a seamless bridge between the React frontend and the NestJS backend, while strictly avoiding unnecessary complexity.

There is always room for improvement, but I believe this implementation provides a robust, type-safe, and highly maintainable foundation — ready to scale, support new features, and adapt to evolving business rules.

<br>

<p align="center">
  Made with 💙 by <a href="https://github.com/jwcbmat" target="_blank">jwcbmat</a>
</p>
