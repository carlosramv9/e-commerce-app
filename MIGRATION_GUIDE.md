# 🚀 Guía de Migración a PostgreSQL

## ⚠️ Estado Actual

La migración de base de datos **NO se ha ejecutado aún** porque PostgreSQL no está disponible.

## 📋 Opciones Disponibles

### ✅ Opción 1: Docker (Recomendado - Más Fácil)

**Ventajas:**
- No necesitas instalar PostgreSQL
- Setup automático
- Aislado del sistema
- Fácil de limpiar

**Pasos:**

1. **Instalar Docker Desktop:**
   - Descargar: https://www.docker.com/products/docker-desktop
   - Instalar y reiniciar si es necesario
   - Abrir Docker Desktop y esperar a que inicie

2. **Ejecutar el script automático:**

   **Windows:**
   ```bash
   setup.bat
   ```

   **macOS/Linux:**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

   Esto hará TODO automáticamente:
   - ✅ Iniciar PostgreSQL en Docker
   - ✅ Instalar dependencias
   - ✅ Crear migración
   - ✅ Poblar base de datos

3. **Verificar:**
   ```bash
   docker ps
   ```
   Deberías ver `ecommerce-postgres` corriendo.

---

### 🔧 Opción 2: PostgreSQL Local

**Si ya tienes PostgreSQL instalado o prefieres instalarlo:**

1. **Instalar PostgreSQL:**
   - Windows: https://www.postgresql.org/download/windows/
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Iniciar PostgreSQL:**

   **Windows:**
   ```cmd
   # Buscar "Services" y iniciar "postgresql-x64-XX"
   # O ejecutar:
   net start postgresql-x64-15
   ```

   **macOS:**
   ```bash
   brew services start postgresql
   ```

   **Linux:**
   ```bash
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

3. **Crear la base de datos:**

   ```bash
   # Conectar a PostgreSQL
   psql -U postgres

   # Dentro de psql:
   CREATE DATABASE ecommerce_db;
   \q
   ```

4. **Actualizar credenciales:**

   Edita `ecommerce-server/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/ecommerce_db?schema=public"
   ```

5. **Ejecutar migración:**

   ```bash
   cd ecommerce-server
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

---

### ⚡ Opción 3: Migración Manual Paso a Paso

Si prefieres hacerlo manualmente sin scripts:

1. **Iniciar PostgreSQL** (Docker o local)

2. **Instalar dependencias del backend:**
   ```bash
   cd ecommerce-server
   pnpm install
   ```

3. **Generar Prisma Client:**
   ```bash
   npx prisma generate
   ```

4. **Crear migración:**
   ```bash
   npx prisma migrate dev --name init
   ```

   Esto creará:
   - `prisma/migrations/XXXXXX_init/migration.sql`
   - Todas las tablas en PostgreSQL

5. **Poblar con datos de prueba:**
   ```bash
   npx prisma db seed
   ```

   Esto creará:
   - Usuario admin: `admin@ecommerce.com` / `admin123`
   - Categorías de ejemplo
   - Productos de ejemplo
   - Cliente de ejemplo
   - Orden de ejemplo

---

## 📊 Verificar la Migración

### 1. Ver archivos de migración:

```bash
dir ecommerce-server\prisma\migrations  # Windows
ls ecommerce-server/prisma/migrations   # macOS/Linux
```

Deberías ver una carpeta con timestamp: `XXXXXXXXXXXXXX_init/`

### 2. Explorar base de datos con Prisma Studio:

```bash
cd ecommerce-server
npx prisma studio
```

Abre: http://localhost:5555

Deberías ver 9 tablas:
- ✅ users
- ✅ customers
- ✅ customer_addresses
- ✅ categories
- ✅ products
- ✅ product_images
- ✅ orders
- ✅ order_items
- ✅ payments

### 3. Verificar datos seed:

En Prisma Studio o con SQL:

```sql
-- Ver usuario admin
SELECT * FROM users;

-- Ver productos
SELECT * FROM products;

-- Ver categorías
SELECT * FROM categories;
```

---

## 🎯 Iniciar la Aplicación

Una vez la migración esté completa:

### 1. Iniciar Backend:

```bash
cd ecommerce-server
pnpm run start:dev
```

**Verificar:**
- API: http://localhost:3001/api
- Swagger Docs: http://localhost:3001/api/docs
- Deberías ver: `🚀 Server running on http://localhost:3001`

### 2. Iniciar Frontend (en otra terminal):

```bash
cd ecommerce-web
pnpm install  # Si aún no lo hiciste
pnpm run dev
```

**Verificar:**
- Frontend: http://localhost:3000
- Deberías ver la página de login

### 3. Login:

- Email: `admin@ecommerce.com`
- Password: `admin123`

---

## 🛠️ Comandos Útiles

### Ver estado de la base de datos:
```bash
cd ecommerce-server
npx prisma migrate status
```

### Resetear base de datos (elimina todos los datos):
```bash
cd ecommerce-server
npx prisma migrate reset
```

### Crear nueva migración después de cambios en schema:
```bash
cd ecommerce-server
npx prisma migrate dev --name nombre_descriptivo
```

### Ver logs de Docker (si usas Docker):
```bash
docker-compose logs -f postgres
```

### Detener PostgreSQL (Docker):
```bash
docker-compose down
```

### Eliminar PostgreSQL y datos (Docker):
```bash
docker-compose down -v
```

---

## ❌ Solución de Problemas

### "P1000: Authentication failed"

**Problema:** Credenciales incorrectas o PostgreSQL no corriendo.

**Solución:**
```bash
# Verificar que PostgreSQL esté corriendo
docker ps                           # Si usas Docker
sudo systemctl status postgresql    # Si usas PostgreSQL local

# Verificar credenciales en .env
cat ecommerce-server/.env
```

### "P1001: Can't reach database server"

**Problema:** PostgreSQL no está corriendo.

**Solución:**
```bash
# Docker:
docker-compose up -d

# Local:
sudo systemctl start postgresql     # Linux
brew services start postgresql      # macOS
net start postgresql-x64-15         # Windows
```

### "Database does not exist"

**Problema:** Base de datos no creada.

**Solución:**
```bash
# Docker: Recrear contenedor
docker-compose down -v
docker-compose up -d

# Local: Crear manualmente
psql -U postgres -c "CREATE DATABASE ecommerce_db;"
```

### "Module not found: @prisma/client"

**Problema:** Cliente de Prisma no generado.

**Solución:**
```bash
cd ecommerce-server
npx prisma generate
```

---

## 📝 Resumen de Archivos SQL Creados

La migración creará automáticamente el siguiente schema:

```sql
-- ENUMS
UserRole: SUPER_ADMIN, ADMIN, MANAGER, STAFF
UserStatus: ACTIVE, INACTIVE, SUSPENDED
CustomerStatus: ACTIVE, INACTIVE, BLOCKED
CategoryStatus: ACTIVE, INACTIVE
ProductStatus: DRAFT, ACTIVE, INACTIVE, ARCHIVED
OrderStatus: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
PaymentStatus: PENDING, PAID, FAILED, REFUNDED

-- TABLAS
users (8 campos)
customers (7 campos)
customer_addresses (13 campos)
categories (8 campos)
products (15 campos)
product_images (6 campos)
orders (12 campos)
order_items (8 campos)
payments (8 campos)

-- RELACIONES
✅ Customer -> CustomerAddress (1-N)
✅ Customer -> Order (1-N)
✅ Category -> Category (self-referencing)
✅ Category -> Product (1-N)
✅ Product -> ProductImage (1-N)
✅ Product -> OrderItem (1-N)
✅ Order -> OrderItem (1-N)
✅ Order -> Payment (1-1)
```

---

## ✅ Siguiente Paso

1. **Elige una opción de arriba** (Docker recomendado)
2. **Ejecuta la migración**
3. **Inicia backend y frontend**
4. **Accede a http://localhost:3000**
5. **Login con credenciales por defecto**

¡Listo para usar! 🎉
