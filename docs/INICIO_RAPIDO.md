# 🚀 Inicio Rápido - Módulo de Productos

Guía de 5 minutos para poner en marcha el módulo de gestión de productos.

## ✅ Checklist Pre-requisitos

- [ ] Node.js instalado (v18 o superior)
- [ ] PostgreSQL corriendo
- [ ] Variables de entorno configuradas
- [ ] Backend compilado y funcionando

## 📦 Paso 1: Instalar Dependencias (2 min)

```bash
# En la carpeta del frontend
cd ecommerce-web

# Instalar dependencias
npm install
```

Esto instalará:
- `@radix-ui/react-label`
- `@radix-ui/react-select`
- `@radix-ui/react-slot`
- `@radix-ui/react-alert-dialog`

## 🔧 Paso 2: Verificar Backend (1 min)

```bash
# En otra terminal
cd ecommerce-server

# Iniciar backend en modo desarrollo
npm run start:dev
```

Verifica que veas:
```
✓ Nest application successfully started
✓ Listening on: http://localhost:3001
```

## 🎨 Paso 3: Iniciar Frontend (1 min)

```bash
# En la terminal del frontend
cd ecommerce-web

# Iniciar en modo desarrollo
npm run dev
```

Verifica que veas:
```
✓ Ready in 2s
✓ Local: http://localhost:3000
```

## 🔐 Paso 4: Login (30 segundos)

1. Abre el navegador en `http://localhost:3000`
2. Ve a `/login`
3. Ingresa credenciales de admin:
   ```
   Email: admin@example.com
   Password: tu-password
   ```

## 📦 Paso 5: Crear Tu Primer Producto (1 min)

1. Navega a `http://localhost:3000/dashboard/products`
2. Click en el botón **"Crear Producto"**
3. Llena los campos mínimos:
   - **SKU**: `PROD-001`
   - **Nombre**: `Mi Primer Producto`
   - **Precio**: `99.99`
   - **Estado**: `Activo`
4. Click en **"Crear Producto"**

¡Listo! Deberías ver tu producto en la lista.

---

## 🎯 Rutas Principales

| Ruta | Descripción |
|------|-------------|
| `/dashboard/products` | Lista de productos |
| `/dashboard/products/new` | Crear producto |
| `/dashboard/products/{id}/edit` | Editar producto |

---

## 🔍 Verificación Rápida

### ✅ Todo funciona si...

- ✓ Ves la lista de productos sin errores
- ✓ El botón "Crear Producto" es visible y funcional
- ✓ El formulario carga con todos los campos
- ✓ Puedes crear un producto y aparece en la lista
- ✓ Los botones de editar (✏️) y eliminar (🗑️) funcionan

### ❌ Algo está mal si...

- ✗ Error 401 Unauthorized → Verifica login y token
- ✗ Error 404 Not Found → Verifica que el backend esté corriendo
- ✗ Componentes no se ven → Ejecuta `npm install` de nuevo
- ✗ Página en blanco → Revisa la consola del navegador (F12)

---

## 🆘 Solución de Problemas Rápida

### Error: "Cannot read properties of null"
```bash
cd ecommerce-web
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

### Error: "401 Unauthorized"
```bash
# Verifica el token en localStorage
# Abre la consola del navegador (F12) y ejecuta:
localStorage.getItem('auth-storage')
```

Si es null o inválido, vuelve a hacer login.

### Error: "Module not found"
```bash
cd ecommerce-web
npm install @radix-ui/react-label @radix-ui/react-select @radix-ui/react-slot @radix-ui/react-alert-dialog
```

---

## 📚 Siguientes Pasos

Después de verificar que todo funciona:

1. **Lee la documentación completa**: [MODULO_PRODUCTOS.md](./MODULO_PRODUCTOS.md)
2. **Personaliza el diseño**: [DISEÑO_UI_PRODUCTOS.md](./DISEÑO_UI_PRODUCTOS.md)
3. **Aprende con ejemplos**: [EJEMPLOS_USO_PRODUCTOS.md](./EJEMPLOS_USO_PRODUCTOS.md)
4. **Agrega tus campos personalizados**
5. **Implementa búsqueda y filtros**

---

## 📊 Campos del Formulario - Cheat Sheet

### Campos Requeridos (*)
- SKU
- Nombre
- Precio

### Campos Opcionales
- Descripción
- Categoría
- Precio de Comparación
- Precio de Costo
- Cantidad en Stock
- Alerta de Stock Bajo
- Peso
- Meta Título
- Meta Descripción

### Estados Disponibles
- **Borrador**: Producto en desarrollo
- **Activo**: Visible para clientes
- **Inactivo**: No visible
- **Archivado**: Producto descontinuado

---

## 🎨 Componentes Creados

### Componentes UI
- ✅ Form (formularios)
- ✅ Label (etiquetas)
- ✅ Textarea (áreas de texto)
- ✅ Select (selectores)
- ✅ AlertDialog (diálogos de confirmación)

### Componentes de Productos
- ✅ ProductForm (formulario principal)
- ✅ DeleteProductDialog (eliminación)

### Páginas
- ✅ Lista de productos (actualizada)
- ✅ Crear producto
- ✅ Editar producto

---

## 💡 Tips Rápidos

### Crear producto rápido desde el código
```typescript
import productsApi from '@/lib/api/products.api';

await productsApi.create({
  sku: 'PROD-001',
  name: 'Producto Test',
  price: 99.99,
  status: 'ACTIVE',
});
```

### Validar antes de enviar
El formulario ya tiene validación automática con Zod. Los errores se muestran en tiempo real.

### Campos numéricos
Usa `type="number"` y `step="0.01"` para decimales.

### Estados visuales
- Verde = Activo
- Amarillo = Borrador
- Rojo = Inactivo

---

## 🎉 ¡Todo Listo!

Ahora tienes un módulo completo de gestión de productos funcionando.

**Tiempo total de setup: ~5 minutos**

Para más información, consulta la documentación completa en:
- [README_MODULO_PRODUCTOS.md](./README_MODULO_PRODUCTOS.md)

**¡Feliz desarrollo! 🚀**
