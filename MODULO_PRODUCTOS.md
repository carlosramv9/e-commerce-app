# Módulo de Gestión de Productos

Este documento describe el módulo completo de creación y edición de productos implementado en el e-commerce.

## Estructura de Archivos

### Frontend

```
ecommerce-web/
├── components/
│   ├── ui/                           # Componentes UI de Shadcn
│   │   ├── form.tsx                  # Formularios con React Hook Form
│   │   ├── label.tsx                 # Labels para formularios
│   │   ├── input.tsx                 # Input fields
│   │   ├── textarea.tsx              # Textarea
│   │   ├── select.tsx                # Select dropdown
│   │   ├── button.tsx                # Botones
│   │   ├── card.tsx                  # Cards
│   │   ├── table.tsx                 # Tablas
│   │   ├── badge.tsx                 # Badges
│   │   └── alert-dialog.tsx          # Diálogos de confirmación
│   └── products/
│       └── product-form.tsx          # Formulario de producto
├── app/(dashboard)/products/
│   ├── page.tsx                      # Lista de productos
│   ├── new/
│   │   └── page.tsx                  # Crear producto
│   └── [id]/
│       └── edit/
│           └── page.tsx              # Editar producto
└── lib/
    └── api/
        ├── products.api.ts           # API client para productos
        └── categories.api.ts         # API client para categorías
```

## Instalación de Dependencias

Antes de usar el módulo, instala las dependencias necesarias:

```bash
cd ecommerce-web
npm install
```

Las dependencias nuevas agregadas al `package.json`:
- `@radix-ui/react-label` - Componente Label
- `@radix-ui/react-select` - Componente Select
- `@radix-ui/react-slot` - Utilidad para composición
- `@radix-ui/react-alert-dialog` - Diálogos de confirmación

## Características

### 1. Lista de Productos (Dashboard)

**Ruta:** `/dashboard/products`

Características:
- Tabla con todos los productos
- Columnas: SKU, Nombre, Categoría, Precio, Stock, Estado
- Botón para crear nuevo producto
- Botones de editar y eliminar por cada producto
- Confirmación antes de eliminar
- Actualización en tiempo real después de acciones

### 2. Crear Producto

**Ruta:** `/dashboard/products/new`

Formulario completo con las siguientes secciones:

#### Información Básica
- **Nombre del Producto** (requerido)
- **Descripción** (textarea)
- **SKU** (requerido) - Código único
- **Categoría** (select con categorías activas)

#### Precios
- **Precio de Venta** (requerido)
- **Precio de Comparación** (opcional) - Para mostrar descuentos
- **Precio de Costo** (opcional) - Solo uso interno

#### Inventario
- **Cantidad en Stock**
- **Alerta de Stock Bajo** - Notificación cuando llegue a esta cantidad
- **Peso (kg)**

#### SEO
- **Meta Título** - Para motores de búsqueda
- **Meta Descripción** - Para motores de búsqueda

#### Estado
- **Estado del Producto**: Borrador, Activo, Inactivo, Archivado
- **Rastrear Inventario**: Checkbox para controlar stock

### 3. Editar Producto

**Ruta:** `/dashboard/products/{id}/edit`

- Mismo formulario que crear producto
- Pre-poblado con datos existentes
- Botón "Actualizar Producto" en lugar de "Crear Producto"

## Validaciones

El formulario incluye validación con Zod:

```typescript
- SKU: requerido
- Nombre: requerido, mínimo 1 caracter
- Precio: número >= 0
- Cantidad: número >= 0
- Otros campos numéricos: opcionales, si se proporcionan deben ser válidos
```

## API Endpoints Utilizados

### Productos

```typescript
GET    /api/products              # Listar productos
GET    /api/products/:id          # Obtener producto por ID
POST   /api/products              # Crear producto
PATCH  /api/products/:id          # Actualizar producto
DELETE /api/products/:id          # Eliminar producto
POST   /api/products/:id/images   # Agregar imagen
DELETE /api/products/:id/images/:imageId  # Eliminar imagen
```

### Categorías

```typescript
GET /api/categories               # Listar categorías
```

## Notificaciones

Se utilizan toasts (Sonner) para notificar al usuario:
- ✅ Producto creado correctamente
- ✅ Producto actualizado correctamente
- ✅ Producto eliminado correctamente
- ❌ Errores de validación
- ❌ Errores de red

## Diseño UI

El diseño está basado en **Shadcn UI** con:

### Componentes Principales
- **Form**: Manejo de formularios con React Hook Form + Zod
- **Input/Textarea**: Campos de texto
- **Select**: Dropdown con búsqueda
- **Button**: Variantes primary, outline, danger
- **Card**: Contenedores para secciones
- **Badge**: Estados visuales (Activo, Borrador, etc.)
- **Table**: Listado de datos

### Layout
- Diseño responsive con grid de Tailwind CSS
- 3 columnas en desktop, 1 columna en mobile
- Columna principal (2/3) para formularios
- Columna lateral (1/3) para metadatos

### Colores y Estados
```css
- Primary: Blue-600 (acciones principales)
- Success: Green-500 (estado activo)
- Warning: Yellow-500 (borrador)
- Danger: Red-500 (eliminar, inactivo)
- Gray: Neutral para bordes y fondos
```

## Uso del Módulo

### 1. Crear un producto

```typescript
1. Navegar a /dashboard/products
2. Click en "Crear Producto"
3. Completar formulario
4. Click en "Crear Producto"
5. Redirección automática a lista
```

### 2. Editar un producto

```typescript
1. Navegar a /dashboard/products
2. Click en botón de editar (icono lápiz)
3. Modificar campos necesarios
4. Click en "Actualizar Producto"
5. Redirección automática a lista
```

### 3. Eliminar un producto

```typescript
1. Navegar a /dashboard/products
2. Click en botón de eliminar (icono papelera)
3. Confirmar eliminación
4. Producto eliminado de la lista
```

## Personalización

### Agregar campos al formulario

1. Actualizar el schema de Zod en `product-form.tsx`:
```typescript
const productFormSchema = z.object({
  // ... campos existentes
  nuevoField: z.string().optional(),
});
```

2. Agregar el campo al formulario:
```tsx
<FormField
  control={form.control}
  name="nuevoField"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Nuevo Campo</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

3. Actualizar la interfaz en `products.api.ts`:
```typescript
export interface CreateProductDto {
  // ... campos existentes
  nuevoField?: string;
}
```

## Próximas Funcionalidades

- [ ] Subir imágenes de productos
- [ ] Galería de imágenes con ordenamiento
- [ ] Variantes de productos (tallas, colores)
- [ ] Búsqueda y filtros avanzados
- [ ] Exportar/importar productos (CSV, Excel)
- [ ] Historial de cambios
- [ ] Productos relacionados
- [ ] Descuentos y promociones

## Notas Técnicas

- El formulario usa **React Hook Form** para mejor rendimiento
- Validación del lado del cliente con **Zod**
- Validación del lado del servidor en NestJS
- Estados del formulario manejados con hooks
- Navegación con Next.js App Router
- Cliente API con Axios y interceptors para autenticación

## Soporte

Para reportar bugs o solicitar funcionalidades:
1. Verifica que el backend esté corriendo en `http://localhost:3001`
2. Verifica que el frontend esté corriendo en `http://localhost:3000`
3. Revisa la consola del navegador para errores
4. Revisa los logs del servidor NestJS
