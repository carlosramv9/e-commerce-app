# Diseño UI del Módulo de Productos

Este documento describe el diseño visual y los componentes UI del módulo de productos.

## Paleta de Colores

```css
/* Colores Principales */
Primary:   #2563EB (Blue-600)    /* Botones principales, enlaces */
Secondary: #E5E7EB (Gray-200)    /* Fondos secundarios */
Success:   #10B981 (Green-500)   /* Estados activos, éxito */
Warning:   #F59E0B (Yellow-500)  /* Borradores, alertas */
Danger:    #EF4444 (Red-500)     /* Eliminar, errores */
Gray:      #6B7280 (Gray-500)    /* Texto secundario */

/* Fondos */
Background: #FFFFFF (White)
Card:       #FFFFFF (White)
Border:     #E5E7EB (Gray-200)

/* Texto */
Primary Text:   #111827 (Gray-900)
Secondary Text: #6B7280 (Gray-500)
```

## Layout General

### 1. Página de Lista de Productos

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
│ │ PROD-3 │ Teclado │ Tech      │ $79    │ 25    │ ✏️🗑️│ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 2. Formulario de Crear/Editar Producto

```
┌──────────────────────────────────────────────────────────────┐
│ Crear Producto / Editar Producto                             │
└──────────────────────────────────────────────────────────────┘

┌────────────────────────────┬──────────────────────────────────┐
│ COLUMNA PRINCIPAL (2/3)    │ COLUMNA LATERAL (1/3)            │
│                            │                                  │
│ ┌────────────────────────┐ │ ┌──────────────────────────────┐ │
│ │ Información Básica     │ │ │ Estado                       │ │
│ ├────────────────────────┤ │ ├──────────────────────────────┤ │
│ │ Nombre del Producto *  │ │ │ Estado del Producto          │ │
│ │ [________________]     │ │ │ [Dropdown ▼]                 │ │
│ │                        │ │ │ ☑ Solo productos activos     │ │
│ │ Descripción            │ │ │   son visibles               │ │
│ │ [________________]     │ │ └──────────────────────────────┘ │
│ │ [________________]     │ │                                  │
│ │                        │ │ ┌──────────────────────────────┐ │
│ │ SKU *      Categoría   │ │ │ Organización                 │ │
│ │ [_______] [Dropdown ▼] │ │ ├──────────────────────────────┤ │
│ └────────────────────────┘ │ │ ☑ Rastrear inventario        │ │
│                            │ │   Controlar stock            │ │
│ ┌────────────────────────┐ │ └──────────────────────────────┘ │
│ │ Precios                │ │                                  │
│ ├────────────────────────┤ │                                  │
│ │ Precio    Comparación  │ │                                  │
│ │ [_______] [_________]  │ │                                  │
│ │                        │ │                                  │
│ │ Costo                  │ │                                  │
│ │ [_______]              │ │                                  │
│ └────────────────────────┘ │                                  │
│                            │                                  │
│ ┌────────────────────────┐ │                                  │
│ │ Inventario             │ │                                  │
│ ├────────────────────────┤ │                                  │
│ │ Stock    Alerta  Peso  │ │                                  │
│ │ [______] [_____] [___] │ │                                  │
│ └────────────────────────┘ │                                  │
│                            │                                  │
│ ┌────────────────────────┐ │                                  │
│ │ SEO                    │ │                                  │
│ ├────────────────────────┤ │                                  │
│ │ Meta Título            │ │                                  │
│ │ [________________]     │ │                                  │
│ │                        │ │                                  │
│ │ Meta Descripción       │ │                                  │
│ │ [________________]     │ │                                  │
│ └────────────────────────┘ │                                  │
└────────────────────────────┴──────────────────────────────────┘

                        [Cancelar] [Crear Producto]
```

## Componentes UI

### 1. Button (Botón)

Variantes disponibles:

```tsx
// Primary - Azul, para acciones principales
<Button variant="primary">Crear Producto</Button>

// Outline - Borde gris, para acciones secundarias
<Button variant="outline">Cancelar</Button>

// Danger - Rojo, para acciones destructivas
<Button variant="danger">Eliminar</Button>

// Ghost - Sin fondo, hover gris
<Button variant="ghost">Editar</Button>
```

Tamaños:
```tsx
<Button size="sm">Pequeño</Button>    // Iconos en tablas
<Button size="md">Mediano</Button>    // Por defecto
<Button size="lg">Grande</Button>     // Botones destacados
```

### 2. Card (Tarjeta)

Contenedor para secciones del formulario:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Información Básica</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Contenido del formulario */}
  </CardContent>
</Card>
```

Estilo visual:
- Fondo blanco
- Borde gris claro
- Sombra sutil
- Padding interno de 24px (p-6)

### 3. Input (Campo de texto)

```tsx
// Input estándar
<Input placeholder="Ej: Laptop Dell XPS 15" />

// Input tipo número
<Input type="number" step="0.01" placeholder="0.00" />

// Input deshabilitado
<Input disabled value="SKU generado" />
```

Estados:
- Normal: Borde gris
- Focus: Borde azul + ring azul
- Error: Borde rojo + mensaje de error
- Disabled: Fondo gris + opacidad reducida

### 4. Textarea (Área de texto)

```tsx
<Textarea
  placeholder="Descripción detallada del producto..."
  rows={5}
/>
```

Mismo estilo que Input pero con altura ajustable

### 5. Select (Selector desplegable)

```tsx
<Select onValueChange={handleChange} defaultValue="ACTIVE">
  <SelectTrigger>
    <SelectValue placeholder="Seleccionar..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="DRAFT">Borrador</SelectItem>
    <SelectItem value="ACTIVE">Activo</SelectItem>
    <SelectItem value="INACTIVE">Inactivo</SelectItem>
  </SelectContent>
</Select>
```

Características:
- Búsqueda integrada
- Iconos de chevron
- Animaciones suaves
- Scroll en listas largas

### 6. Badge (Etiqueta)

```tsx
// Estados de productos
<Badge variant="success">Activo</Badge>
<Badge variant="warning">Borrador</Badge>
<Badge variant="danger">Inactivo</Badge>
<Badge variant="default">Archivado</Badge>
```

Estilos:
- Success: Verde con texto blanco
- Warning: Amarillo con texto oscuro
- Danger: Rojo con texto blanco
- Default: Gris con texto oscuro

### 7. Table (Tabla)

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>SKU</TableHead>
      <TableHead>Nombre</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>PROD-001</TableCell>
      <TableCell>Laptop</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

Características:
- Bordes sutiles
- Hover en filas
- Columnas alineadas
- Responsive con scroll horizontal

### 8. Form (Formulario)

Sistema completo de formularios con validación:

```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nombre *</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormDescription>
            Nombre visible del producto
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

Elementos:
- **FormLabel**: Label con marcador de requerido
- **FormControl**: Wrapper para el input
- **FormDescription**: Texto de ayuda gris
- **FormMessage**: Mensajes de error en rojo

### 9. AlertDialog (Diálogo de confirmación)

```tsx
<AlertDialog>
  <AlertDialogTrigger>
    <Button variant="outline">Eliminar</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta acción no se puede deshacer.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction variant="danger">
        Eliminar
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

Características:
- Overlay oscuro con transparencia
- Modal centrado
- Animaciones de entrada/salida
- Botones de acción claros

## Responsive Design

### Desktop (>= 1024px)
- Layout de 3 columnas (2/3 + 1/3)
- Tabla completa visible
- Formulario side-by-side

### Tablet (768px - 1023px)
- Layout de 2 columnas
- Tabla con scroll horizontal
- Formulario apilado

### Mobile (< 768px)
- Layout de 1 columna
- Cards apiladas verticalmente
- Tabla con scroll horizontal
- Botones full-width

## Animaciones y Transiciones

### Botones
```css
transition: colors 150ms
hover: cambio de color suave
focus: ring azul con offset
```

### Modals/Dialogs
```css
open: fade-in + zoom-in (200ms)
close: fade-out + zoom-out (200ms)
```

### Form Inputs
```css
focus: border color + ring (150ms)
error: shake animation
```

### Table Rows
```css
hover: background-color (150ms)
```

## Iconos

Usando React Icons (react-icons/fi):

```tsx
import {
  FiPlus,      // Crear
  FiEdit2,     // Editar
  FiTrash2,    // Eliminar
  FiCheck,     // Confirmación
  FiChevronDown, // Dropdown
  FiChevronUp,   // Dropdown
} from 'react-icons/fi';
```

Tamaños:
- Tabla: h-4 w-4 (16px)
- Botones: h-5 w-5 (20px)
- Headers: h-6 w-6 (24px)

## Notificaciones (Toasts)

Usando Sonner para notificaciones:

```tsx
// Success
toast.success('Producto creado correctamente');

// Error
toast.error('Error al crear el producto');

// Info
toast('Producto guardado como borrador');

// Warning
toast.warning('Stock bajo');
```

Posición: Bottom right
Duración: 4 segundos
Animación: Slide in from right

## Best Practices

1. **Consistencia**: Usa siempre los mismos componentes UI
2. **Accesibilidad**: Labels con htmlFor, aria-labels
3. **Validación**: Mensajes de error claros y específicos
4. **Feedback**: Loading states en todos los botones
5. **Responsive**: Mobile-first, prueba en todos los dispositivos
6. **Performance**: Lazy loading de componentes pesados
7. **UX**: Confirmación antes de acciones destructivas

## Personalización

### Cambiar colores principales

Edita `tailwind.config.ts`:

```ts
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#2563EB',  // Azul por defecto
        hover: '#1D4ED8',    // Azul hover
      }
    }
  }
}
```

### Cambiar tipografía

```ts
theme: {
  extend: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    }
  }
}
```

### Cambiar espaciado

```tsx
// Padding del formulario
<Card className="p-8">  // Más espacioso
<Card className="p-4">  // Más compacto
```
