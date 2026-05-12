# GameRent Admin

Sistema de administración para renta de videojuegos, consolas y accesorios.

## Tecnologías

* Frontend: React + Vite + TypeScript
* Backend: NestJS + Prisma
* Base de datos: PostgreSQL
* Docker
* Nginx

---

# Arquitectura

El proyecto se encuentra dockerizado utilizando una arquitectura desacoplada basada en contenedores independientes.

## Contenedores

| Contenedor          | Función                   |
| ------------------- | ------------------------- |
| `frontend_app`      | Aplicación frontend React |
| `backend_app`       | API REST NestJS           |
| `gamerent_postgres` | Base de datos PostgreSQL  |

---

# Requisitos

* Docker Desktop
* Node.js
* npm

---

# Estructura del proyecto

```txt
ProyectoDT/
│
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ...
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .dockerignore
│   └── ...
│
├── db/
│   └── docker-compose.yml
│
└── docker-compose.yml
```

---

# Inicialización del proyecto

## 1. Iniciar base de datos

La base de datos PostgreSQL se ejecuta en un contenedor independiente.

```bash
docker start gamerent_postgres
```

Verificar que el contenedor esté activo:

```bash
docker ps
```

Debe aparecer:

```txt
gamerent_postgres
```

---

## 2. Iniciar frontend y backend

Desde la raíz del proyecto:

```bash
cd ProyectoDT
docker compose up --build
```

Esto levantará:

```txt
frontend_app
backend_app
```

---

# URLs del sistema

## Frontend

```txt
http://localhost:5173
```

## Backend

```txt
http://localhost:3000
```

## PostgreSQL

```txt
localhost:5433
```

---

# Detener contenedores

## Frontend y Backend

Desde la raíz del proyecto:

```bash
docker compose down
```

## Base de datos

```bash
docker stop gamerent_postgres
```

---

# Variables de entorno

## Frontend

Archivo:

```txt
frontend/.env
```

Contenido:

```env
VITE_API_URL=http://localhost:3000
```

---

## Backend

La conexión a base de datos se define directamente en `docker-compose.yml`.

```yaml
DATABASE_URL: "postgresql://gamerent:gamerent123@gamerent_postgres:5432/gamerent_db?schema=public"
```

---

# Funcionalidades

* Gestión de productos
* Gestión de inventario
* Gestión de órdenes
* Gestión de categorías
* Cambio automático de estado del inventario
* Reserva automática de unidades
* Administración de stock disponible
* API REST desacoplada
* Arquitectura basada en contenedores Docker

---

# Tecnologías utilizadas

## Frontend

* React
* Vite
* TypeScript
* Axios
* React Router DOM

## Backend

* NestJS
* Prisma ORM
* PostgreSQL

## Infraestructura

* Docker
* Docker Compose
* Nginx

---

# Contenedores Docker

Ver contenedores activos:

```bash
docker ps
```

Ver logs del backend:

```bash
docker logs backend_app
```

Ver logs del frontend:

```bash
docker logs frontend_app
```

Ver logs de PostgreSQL:

```bash
docker logs gamerent_postgres
```
