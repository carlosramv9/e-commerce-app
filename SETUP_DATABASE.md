# Configuración de Base de Datos PostgreSQL

## Opción 1: Usar Docker (Recomendado - más fácil)

### Prerrequisitos
- Docker Desktop instalado: https://www.docker.com/products/docker-desktop

### Pasos

1. **Iniciar PostgreSQL con Docker:**

En la raíz del proyecto ejecuta:

```bash
docker-compose up -d
```

Esto iniciará PostgreSQL en el puerto 5432 con las credenciales por defecto.

2. **Verificar que PostgreSQL esté corriendo:**

```bash
docker ps
```

Deberías ver un contenedor llamado `ecommerce-postgres` en estado "Up".

3. **Crear la migración:**

```bash
cd ecommerce-server
npx prisma migrate dev --name init
```

4. **Poblar la base de datos con datos de prueba:**

```bash
npx prisma db seed
```

5. **Para detener PostgreSQL:**

```bash
docker-compose down
```

6. **Para detener y eliminar todos los datos:**

```bash
docker-compose down -v
```

---

## Opción 2: PostgreSQL instalado localmente

### Prerrequisitos
- PostgreSQL 12+ instalado: https://www.postgresql.org/download/

### Pasos

1. **Iniciar el servicio de PostgreSQL:**

**Windows:**
```cmd
net start postgresql-x64-15
```

O buscar "Services" y iniciar "PostgreSQL".

**macOS:**
```bash
brew services start postgresql
```

**Linux:**
```bash
sudo systemctl start postgresql
```

2. **Crear la base de datos:**

```bash
# Conectar a PostgreSQL
psql -U postgres

# Dentro de psql, ejecutar:
CREATE DATABASE ecommerce_db;
\q
```

3. **Configurar credenciales en .env:**

Edita `ecommerce-server/.env` y actualiza:

```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/ecommerce_db?schema=public"
```

Reemplaza `TU_PASSWORD` con tu contraseña de PostgreSQL.

4. **Crear la migración:**

```bash
cd ecommerce-server
npx prisma migrate dev --name init
```

5. **Poblar la base de datos:**

```bash
npx prisma db seed
```

---

## Opción 3: Usar Prisma Dev (Base de datos temporal en contenedor)

Si tienes Docker instalado, puedes usar el comando de Prisma que automáticamente crea una base de datos temporal:

```bash
cd ecommerce-server
npx prisma dev
```

Esto:
- Inicia un contenedor PostgreSQL temporal
- Crea la base de datos
- Ejecuta las migraciones
- Actualiza el .env automáticamente

**Nota:** Esta base de datos se elimina cuando detienes el contenedor.

---

## Verificar la Migración

Después de ejecutar la migración exitosamente, deberías ver:

1. **Carpeta de migraciones creada:**
   - `ecommerce-server/prisma/migrations/XXXXXX_init/`

2. **Tablas creadas en la base de datos:**
   - users
   - customers
   - customer_addresses
   - categories
   - products
   - product_images
   - orders
   - order_items
   - payments

3. **Mensaje de éxito:**
   ```
   ✔ Generated Prisma Client
   ✔ Database synchronized with schema
   ```

## Explorar la Base de Datos

Para explorar la base de datos visualmente:

```bash
cd ecommerce-server
npx prisma studio
```

Esto abre una interfaz web en `http://localhost:5555` donde puedes ver y editar los datos.

---

## Solución de Problemas

### Error: "P1000: Authentication failed"

**Causa:** Credenciales incorrectas o PostgreSQL no está corriendo.

**Solución:**
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en el archivo `.env`
- Si usas Docker, verifica que el contenedor esté up: `docker ps`

### Error: "P1001: Can't reach database server"

**Causa:** PostgreSQL no está corriendo o el puerto está bloqueado.

**Solución:**
- Verifica que PostgreSQL esté corriendo en el puerto 5432
- Verifica que no haya firewall bloqueando el puerto
- Si usas Docker: `docker-compose up -d`

### Error: "Database does not exist"

**Causa:** La base de datos no fue creada.

**Solución con Docker:**
```bash
docker-compose down -v
docker-compose up -d
```

**Solución con PostgreSQL local:**
```bash
psql -U postgres
CREATE DATABASE ecommerce_db;
\q
```

### Resetear completamente la base de datos

```bash
cd ecommerce-server

# Eliminar todas las tablas
npx prisma migrate reset

# Esto automáticamente:
# 1. Elimina todas las tablas
# 2. Ejecuta todas las migraciones
# 3. Ejecuta el seed
```

---

## Próximos Pasos

Una vez la base de datos esté configurada:

1. Inicia el backend:
   ```bash
   cd ecommerce-server
   pnpm run start:dev
   ```

2. Verifica que funciona:
   - API: http://localhost:3001/api
   - Swagger: http://localhost:3001/api/docs

3. Inicia el frontend:
   ```bash
   cd ecommerce-web
   pnpm run dev
   ```

4. Accede al admin panel:
   - URL: http://localhost:3000
   - Email: `admin@ecommerce.com`
   - Password: `admin123`
