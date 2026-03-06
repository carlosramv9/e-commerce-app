# ⚡ Quick Start - E-Commerce Application

## 🎯 Inicio Rápido (5 minutos)

### Prerrequisitos
- ✅ Node.js 18+ instalado
- ✅ pnpm instalado: `npm install -g pnpm`
- ✅ Docker Desktop instalado (recomendado)

### Opción Automática (Recomendada)

**Windows:**
```bash
setup.bat
```

**macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

Este script hará TODO automáticamente:
1. Iniciar PostgreSQL con Docker
2. Instalar dependencias
3. Crear migración de base de datos
4. Poblar con datos de prueba

### Opción Manual

Si prefieres hacerlo paso a paso, sigue **MIGRATION_GUIDE.md**

---

## 🚀 Iniciar la Aplicación

### 1. Backend (Terminal 1):

```bash
cd ecommerce-server
pnpm run start:dev
```

**Verificar:**
- ✅ API corriendo: http://localhost:3001/api
- ✅ Swagger Docs: http://localhost:3001/api/docs

### 2. Frontend (Terminal 2):

```bash
cd ecommerce-web
pnpm run dev
```

**Verificar:**
- ✅ Admin Panel: http://localhost:3000

---

## 🔐 Credenciales

**Usuario Admin:**
- Email: `admin@ecommerce.com`
- Password: `admin123`

---

## 📊 Qué Incluye

### Backend API (NestJS)
- ✅ Autenticación JWT
- ✅ Gestión de usuarios (4 roles)
- ✅ Productos con imágenes
- ✅ Categorías jerárquicas
- ✅ Órdenes y pagos
- ✅ Dashboard con estadísticas
- ✅ Swagger documentation

### Frontend (Next.js 16)
- ✅ Admin panel completo
- ✅ Dashboard con stats
- ✅ Gestión de productos
- ✅ Responsive design
- ✅ Dark mode ready

### Base de Datos
- ✅ 9 tablas relacionadas
- ✅ Datos de prueba incluidos
- ✅ Migrations con Prisma

---

## 🛠️ Comandos Útiles

### Ver datos en la base de datos:
```bash
cd ecommerce-server
npx prisma studio
```
Abre: http://localhost:5555

### Resetear base de datos:
```bash
cd ecommerce-server
npx prisma migrate reset
```

### Ver logs de Docker:
```bash
docker-compose logs -f
```

### Detener todo:
```bash
# Ctrl+C en ambas terminales (backend y frontend)
docker-compose down  # Detener PostgreSQL
```

---

## 📚 Documentación Completa

- **MIGRATION_GUIDE.md** - Guía detallada de setup de base de datos
- **SETUP_DATABASE.md** - Opciones de configuración de PostgreSQL
- **README.md** - Documentación completa del proyecto

---

## 🆘 Problemas Comunes

### "Cannot connect to database"
**Solución:** Verifica que Docker esté corriendo
```bash
docker ps
```

### "Port 3000 already in use"
**Solución:** Mata el proceso o cambia el puerto
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill
```

### "Migration failed"
**Solución:** Resetea la base de datos
```bash
docker-compose down -v
docker-compose up -d
cd ecommerce-server
npx prisma migrate dev --name init
npx prisma db seed
```

---

## ✅ Verificación Rápida

Después del setup, verifica:

- [ ] Backend corriendo en http://localhost:3001
- [ ] Swagger docs accesible en http://localhost:3001/api/docs
- [ ] Frontend corriendo en http://localhost:3000
- [ ] Puedes hacer login con admin@ecommerce.com
- [ ] Ves el dashboard con estadísticas
- [ ] Prisma Studio muestra datos: `npx prisma studio`

---

## 🎉 ¡Listo!

Tu aplicación e-commerce está lista para usar.

### Próximos pasos:
1. Explorar el dashboard
2. Crear productos nuevos
3. Ver documentación de API en Swagger
4. Personalizar según tus necesidades

### Para desarrollo:
- Modifica `prisma/schema.prisma` para cambios en BD
- Agrega nuevos módulos en `ecommerce-server/src/modules/`
- Crea páginas en `ecommerce-web/app/(dashboard)/`
