# Instalación y Configuración del Módulo de Productos

## Pasos de Instalación

### 1. Instalar Dependencias

Navega a la carpeta del frontend e instala las dependencias:

```bash
cd ecommerce-web
npm install
```

Esto instalará las nuevas dependencias de Radix UI:
- `@radix-ui/react-alert-dialog` - Para diálogos de confirmación
- `@radix-ui/react-label` - Para labels de formularios
- `@radix-ui/react-select` - Para selectores dropdown
- `@radix-ui/react-slot` - Para composición de componentes

### 2. Verificar Backend

Asegúrate de que el backend esté corriendo:

```bash
cd ecommerce-server
npm run start:dev
```

El backend debe estar disponible en `http://localhost:3001`

### 3. Iniciar Frontend

Inicia el servidor de desarrollo:

```bash
cd ecommerce-web
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

### 4. Verificar Autenticación

Antes de acceder a los productos, asegúrate de:
1. Estar logueado en el sistema
2. Tener rol de ADMIN, SUPER_ADMIN o MANAGER
3. El token JWT debe estar válido

## Acceso a las Páginas

### Lista de Productos
```
URL: http://localhost:3000/dashboard/products
Método: GET
```

### Crear Producto
```
URL: http://localhost:3000/dashboard/products/new
Método: GET
```

### Editar Producto
```
URL: http://localhost:3000/dashboard/products/{id}/edit
Método: GET
Parámetro: id del producto
```

## Estructura del Proyecto

```
ecommerce-web/
├── app/(dashboard)/products/
│   ├── page.tsx                    # Lista de productos
│   ├── new/
│   │   └── page.tsx                # Crear producto
│   └── [id]/
│       └── edit/
│           └── page.tsx            # Editar producto
├── components/
│   ├── products/
│   │   ├── product-form.tsx        # Formulario principal
│   │   └── delete-product-dialog.tsx  # Diálogo de eliminación
│   └── ui/                         # Componentes Shadcn
│       ├── alert-dialog.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       └── textarea.tsx
└── lib/
    └── api/
        ├── products.api.ts         # Cliente API de productos
        └── categories.api.ts       # Cliente API de categorías
```

## Troubleshooting

### Error: "Cannot read properties of null"

Si encuentras este error al instalar dependencias, intenta:

```bash
# Limpiar caché de npm
npm cache clean --force

# Eliminar node_modules y package-lock.json
rm -rf node_modules package-lock.json

# Reinstalar dependencias
npm install
```

### Error: "Module not found"

Si ves errores de módulos no encontrados:

1. Verifica que todas las dependencias estén instaladas
2. Reinicia el servidor de desarrollo
3. Limpia el caché de Next.js:

```bash
rm -rf .next
npm run dev
```

### Error: "Unauthorized" o "401"

Si no puedes acceder a las páginas:

1. Verifica que estés logueado
2. Revisa que el token JWT no haya expirado
3. Verifica que tu usuario tenga los permisos necesarios

```bash
# Revisa el token en localStorage
console.log(localStorage.getItem('auth-storage'))
```

### Componentes no se muestran correctamente

Si los componentes de Shadcn no se ven bien:

1. Verifica que Tailwind CSS esté configurado correctamente
2. Revisa que el archivo `tailwind.config.ts` incluya las rutas correctas
3. Asegúrate de que `@tailwindcss/postcss` esté instalado

## Verificación de Instalación

Para verificar que todo funciona correctamente:

1. **Lista de Productos**
   - Navega a `/dashboard/products`
   - Deberías ver una tabla con los productos
   - Botón "Crear Producto" visible

2. **Crear Producto**
   - Click en "Crear Producto"
   - Formulario debe cargarse con todos los campos
   - Select de categorías debe mostrar opciones
   - Al enviar, debe redirigir a la lista

3. **Editar Producto**
   - Click en el icono de lápiz de un producto
   - Formulario debe pre-poblarse con datos
   - Al guardar, debe actualizar y redirigir

4. **Eliminar Producto**
   - Click en el icono de papelera
   - Debe aparecer un diálogo de confirmación
   - Al confirmar, debe eliminar y actualizar la lista

## Scripts Útiles

### Desarrollo
```bash
npm run dev              # Inicia servidor de desarrollo
npm run build            # Compila para producción
npm run start            # Inicia servidor de producción
npm run lint             # Ejecuta linter
```

### Backend
```bash
npm run start:dev        # Inicia servidor de desarrollo
npm run test             # Ejecuta tests
npm run test:e2e         # Ejecuta tests e2e
```

## Próximos Pasos

Después de instalar el módulo, puedes:

1. Personalizar los campos del formulario
2. Agregar validaciones adicionales
3. Implementar subida de imágenes
4. Agregar búsqueda y filtros
5. Exportar datos a CSV/Excel

Consulta `MODULO_PRODUCTOS.md` para más detalles sobre personalización y extensión del módulo.
