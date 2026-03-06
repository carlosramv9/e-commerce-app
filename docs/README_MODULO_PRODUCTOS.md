# 📦 Módulo de Gestión de Productos - E-Commerce

Sistema completo de administración de productos para e-commerce con Next.js 16, React 19, NestJS 11 y diseño Shadcn UI.

## ✨ Características

- ✅ **CRUD Completo**: Crear, leer, actualizar y eliminar productos
- ✅ **Formularios con Validación**: React Hook Form + Zod
- ✅ **Diseño Moderno**: Componentes Shadcn UI con Tailwind CSS
- ✅ **Gestión de Inventario**: Control de stock y alertas
- ✅ **Categorización**: Asociación con categorías
- ✅ **SEO**: Campos meta para optimización
- ✅ **Múltiples Estados**: Borrador, Activo, Inactivo, Archivado
- ✅ **Responsive**: Diseño adaptable a todos los dispositivos
- ✅ **Notificaciones**: Toasts para feedback del usuario
- ✅ **Confirmaciones**: Diálogos modales para acciones destructivas
- ✅ **TypeScript**: Tipado completo en frontend y backend

## 📁 Archivos Creados

### Frontend (ecommerce-web)

#### Componentes UI (components/ui/)
- `form.tsx` - Sistema de formularios con React Hook Form
- `label.tsx` - Labels para formularios
- `input.tsx` - Campos de texto (ya existía)
- `textarea.tsx` - Áreas de texto
- `select.tsx` - Selectores dropdown
- `button.tsx` - Botones (ya existía, mejorado)
- `card.tsx` - Tarjetas contenedoras (ya existía)
- `table.tsx` - Tablas (ya existía)
- `badge.tsx` - Etiquetas de estado (ya existía)
- `alert-dialog.tsx` - Diálogos de confirmación

#### Componentes de Productos (components/products/)
- `product-form.tsx` - Formulario principal de productos
- `delete-product-dialog.tsx` - Diálogo de eliminación

#### Páginas (app/(dashboard)/products/)
- `page.tsx` - Lista de productos (actualizada)
- `new/page.tsx` - Crear producto
- `[id]/edit/page.tsx` - Editar producto

#### API Clients (lib/api/)
- `products.api.ts` - Cliente API para productos
- `categories.api.ts` - Cliente API para categorías

### Documentación

- `MODULO_PRODUCTOS.md` - Documentación completa del módulo
- `INSTALACION_PRODUCTOS.md` - Guía de instalación paso a paso
- `DISEÑO_UI_PRODUCTOS.md` - Guía visual del diseño UI
- `EJEMPLOS_USO_PRODUCTOS.md` - Ejemplos de código prácticos
- `README_MODULO_PRODUCTOS.md` - Este archivo

### Configuración

- `package.json` - Actualizado con nuevas dependencias de Radix UI

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
cd ecommerce-web
npm install
```

### 2. Iniciar el Backend

```bash
cd ecommerce-server
npm run start:dev
```

Backend disponible en `http://localhost:3001`

### 3. Iniciar el Frontend

```bash
cd ecommerce-web
npm run dev
```

Frontend disponible en `http://localhost:3000`

### 4. Acceder al Módulo

1. Inicia sesión en el sistema
2. Navega a `/dashboard/products`
3. Click en "Crear Producto" para empezar

## 📚 Documentación

### Guías Principales

1. **[INSTALACION_PRODUCTOS.md](./INSTALACION_PRODUCTOS.md)**
   - Instrucciones detalladas de instalación
   - Configuración del entorno
   - Troubleshooting

2. **[MODULO_PRODUCTOS.md](./MODULO_PRODUCTOS.md)**
   - Arquitectura del módulo
   - API endpoints
   - Características completas
   - Próximas funcionalidades

3. **[DISEÑO_UI_PRODUCTOS.md](./DISEÑO_UI_PRODUCTOS.md)**
   - Paleta de colores
   - Componentes UI detallados
   - Layout y responsive design
   - Guía de personalización

4. **[EJEMPLOS_USO_PRODUCTOS.md](./EJEMPLOS_USO_PRODUCTOS.md)**
   - Ejemplos de código prácticos
   - Casos de uso comunes
   - Recetas de implementación

## 🎨 Stack Tecnológico

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Components**: Shadcn UI (Radix UI)
- **Forms**: React Hook Form + Zod
- **State**: Zustand
- **HTTP Client**: Axios
- **Notifications**: Sonner
- **Icons**: React Icons

### Backend
- **Framework**: NestJS 11
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT + Passport
- **Validation**: class-validator + class-transformer

## 📸 Capturas de Pantalla

### Lista de Productos
```
┌─────────────────────────────────────────────────────────┐
│ Productos                           [+ Crear Producto]  │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Todos los Productos                                 │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ SKU    │ Nombre  │ Categoría │ Precio │ Stock │ ... │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ PROD-1 │ Laptop  │ Tech      │ $999   │ 10    │ ✏️🗑️│ │
│ │ PROD-2 │ Mouse   │ Tech      │ $29    │ 50    │ ✏️🗑️│ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Formulario de Producto
```
┌──────────────────────────────────────────────────────┐
│ Crear Producto                                       │
├──────────────────────────────────────────────────────┤
│ ┌────────────────┐  ┌────────────────────────────┐  │
│ │ Info Básica    │  │ Estado                     │  │
│ │ Precios        │  │ - Borrador                 │  │
│ │ Inventario     │  │ - Activo                   │  │
│ │ SEO            │  │ - Inactivo                 │  │
│ └────────────────┘  └────────────────────────────┘  │
│                                                      │
│                      [Cancelar] [Crear Producto]    │
└──────────────────────────────────────────────────────┘
```

## 🔑 Funcionalidades Principales

### 1. Lista de Productos
- Visualización en tabla
- Estados con badges coloridos
- Botones de editar y eliminar
- Link para crear nuevos productos

### 2. Crear Producto
- Formulario completo con validación
- Campos organizados en secciones
- Validación en tiempo real
- Mensajes de error claros
- Redirect automático después de crear

### 3. Editar Producto
- Pre-población de datos
- Misma validación que crear
- Actualización parcial o completa
- Confirmación de cambios

### 4. Eliminar Producto
- Diálogo de confirmación modal
- Información clara del producto a eliminar
- Actualización automática de la lista
- Manejo de errores

## 🔧 API Endpoints

### Productos
```
GET    /api/products              # Listar con filtros
GET    /api/products/:id          # Obtener por ID
POST   /api/products              # Crear
PATCH  /api/products/:id          # Actualizar
DELETE /api/products/:id          # Eliminar
POST   /api/products/:id/images   # Agregar imagen
DELETE /api/products/:id/images/:imageId  # Eliminar imagen
PATCH  /api/products/:id/stock    # Actualizar stock
GET    /api/products/low-stock    # Productos con stock bajo
```

### Categorías
```
GET /api/categories               # Listar todas
GET /api/categories/:id           # Obtener por ID
```

## 📋 Campos del Formulario

### Información Básica
- Nombre del Producto (requerido)
- Descripción (textarea)
- SKU (requerido, único)
- Categoría (select)

### Precios
- Precio de Venta (requerido)
- Precio de Comparación (opcional)
- Precio de Costo (opcional)

### Inventario
- Cantidad en Stock
- Alerta de Stock Bajo
- Peso en kg

### SEO
- Meta Título
- Meta Descripción

### Estado
- Estado (Borrador, Activo, Inactivo, Archivado)
- Rastrear Inventario (checkbox)

## ⚙️ Validaciones

- **SKU**: Requerido, único
- **Nombre**: Requerido, min 1 caracter
- **Precio**: Número >= 0
- **Cantidad**: Número >= 0
- **Campos opcionales**: Validación solo si se proporcionan

## 🎯 Próximas Funcionalidades

- [ ] Subida de imágenes múltiples
- [ ] Galería de imágenes con drag & drop
- [ ] Variantes de productos
- [ ] Búsqueda avanzada con filtros
- [ ] Paginación
- [ ] Exportación CSV/Excel
- [ ] Importación masiva
- [ ] Historial de cambios
- [ ] Productos relacionados
- [ ] Sistema de descuentos

## 🐛 Troubleshooting

### Problema: Dependencias no se instalan
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Problema: Componentes no se ven bien
- Verifica que Tailwind CSS esté configurado
- Reinicia el servidor de desarrollo
- Limpia el caché: `rm -rf .next`

### Problema: Error 401 Unauthorized
- Verifica que estés logueado
- Revisa que el token no haya expirado
- Verifica permisos del usuario (debe ser ADMIN o SUPER_ADMIN)

## 📞 Soporte

Para reportar bugs o solicitar funcionalidades:

1. Verifica la documentación completa
2. Revisa los ejemplos de uso
3. Consulta el troubleshooting
4. Revisa los logs del navegador y servidor

## 📄 Licencia

Este módulo es parte del proyecto e-commerce y sigue la misma licencia del proyecto principal.

---

**Desarrollado con ❤️ usando Next.js, React, NestJS y Shadcn UI**
