# GameRent Admin

Sistema de administración para renta de videojuegos, consolas y accesorios.

## Tecnologías

- Frontend: React + Vite + TypeScript
- Backend: NestJS + Prisma
- Base de datos: PostgreSQL
- Docker

---

## Requisitos

- Node.js
- Docker Desktop
- npm

---

## Instalación

### 1. Clonar repositorio

```bash
git clone URL_DEL_REPO
```

---

### 2. Levantar base de datos

```bash
cd db
docker compose up -d
```

---

### 3. Backend

```bash
cd backend
npm install
```

Crear `.env`

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gamerent
PORT=3000
```

Migraciones:

```bash
npx prisma migrate deploy
npx prisma db seed
```

Iniciar backend:

```bash
npm run start:dev
```

---

### 4. Frontend

```bash
cd frontend
npm install
```

Crear `.env`

```env
VITE_API_URL=http://localhost:3000
```

Iniciar frontend:

```bash
npm run dev
```

---

## Funcionalidades

- Gestión de productos
- Gestión de inventario
- Órdenes de renta
- Cambio automático de estado del inventario
- Reserva automática de unidades
