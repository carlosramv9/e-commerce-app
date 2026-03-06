# Ejemplos de Uso del Módulo de Productos

Este documento contiene ejemplos prácticos de cómo usar los componentes del módulo de productos.

## Tabla de Contenidos
1. [Crear un Producto](#1-crear-un-producto)
2. [Editar un Producto](#2-editar-un-producto)
3. [Eliminar un Producto](#3-eliminar-un-producto)
4. [Validaciones Personalizadas](#4-validaciones-personalizadas)
5. [Agregar Campos al Formulario](#5-agregar-campos-al-formulario)
6. [Búsqueda y Filtros](#6-búsqueda-y-filtros)
7. [Subir Imágenes](#7-subir-imágenes)

---

## 1. Crear un Producto

### Desde la UI

1. Navega a `/dashboard/products`
2. Click en "Crear Producto"
3. Completa el formulario:
   - **SKU**: LAPTOP-001
   - **Nombre**: Laptop Dell XPS 15
   - **Precio**: 1299.99
   - **Categoría**: Tecnología
   - **Estado**: Activo
4. Click en "Crear Producto"

### Desde el código (API)

```typescript
import productsApi from '@/lib/api/products.api';

const crearProducto = async () => {
  try {
    const nuevoProducto = await productsApi.create({
      sku: 'LAPTOP-001',
      name: 'Laptop Dell XPS 15',
      description: 'Laptop de alto rendimiento con procesador Intel i7',
      price: 1299.99,
      comparePrice: 1499.99,
      costPrice: 900.00,
      categoryId: 'cat-tech-123',
      trackInventory: true,
      quantity: 10,
      lowStockAlert: 3,
      weight: 2.5,
      metaTitle: 'Laptop Dell XPS 15 - Alta Gama',
      metaDescription: 'Compra la mejor laptop para profesionales',
      status: 'ACTIVE',
    });

    console.log('Producto creado:', nuevoProducto);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 2. Editar un Producto

### Actualización parcial

```typescript
import productsApi from '@/lib/api/products.api';

const actualizarPrecio = async (productId: string) => {
  try {
    const productoActualizado = await productsApi.update(productId, {
      price: 1199.99,  // Solo actualiza el precio
      comparePrice: 1399.99,
    });

    console.log('Precio actualizado:', productoActualizado);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Actualización completa

```typescript
const actualizarProductoCompleto = async (productId: string) => {
  try {
    const productoActualizado = await productsApi.update(productId, {
      name: 'Laptop Dell XPS 15 2024',
      description: 'Nueva versión con mejores especificaciones',
      price: 1399.99,
      quantity: 15,
      status: 'ACTIVE',
    });

    console.log('Producto actualizado:', productoActualizado);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Cambiar estado

```typescript
const cambiarEstado = async (productId: string, nuevoEstado: string) => {
  try {
    await productsApi.update(productId, {
      status: nuevoEstado as 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED',
    });

    console.log('Estado actualizado');
  } catch (error) {
    console.error('Error:', error);
  }
};

// Uso
cambiarEstado('prod-123', 'INACTIVE');
```

---

## 3. Eliminar un Producto

### Con diálogo de confirmación (Recomendado)

```typescript
import { DeleteProductDialog } from '@/components/products/delete-product-dialog';

// En tu componente
<DeleteProductDialog
  productId={product.id}
  productName={product.name}
  onDeleted={() => {
    // Recargar lista de productos
    fetchProducts();
  }}
/>
```

### Sin diálogo (No recomendado)

```typescript
const eliminarProducto = async (productId: string) => {
  if (!confirm('¿Estás seguro?')) return;

  try {
    await productsApi.delete(productId);
    console.log('Producto eliminado');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 4. Validaciones Personalizadas

### Agregar validación personalizada

```typescript
import * as z from 'zod';

const productFormSchema = z.object({
  sku: z.string()
    .min(1, 'SKU es requerido')
    .regex(/^[A-Z0-9-]+$/, 'SKU debe contener solo letras mayúsculas, números y guiones'),

  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),

  price: z.coerce.number()
    .min(0.01, 'El precio debe ser mayor a 0')
    .max(999999, 'El precio es demasiado alto'),

  comparePrice: z.coerce.number()
    .optional()
    .refine((val) => {
      // Validar que comparePrice sea mayor que price
      return !val || val > form.getValues('price');
    }, 'El precio de comparación debe ser mayor al precio de venta'),

  email: z.string()
    .email('Email inválido')
    .optional(),
});
```

### Validación asíncrona (verificar SKU único)

```typescript
const verificarSKUUnico = async (sku: string, productId?: string) => {
  try {
    const response = await productsApi.getAll({ search: sku });
    const productos = response.data;

    // Si existe otro producto con el mismo SKU
    const existe = productos.some(p =>
      p.sku === sku && p.id !== productId
    );

    return !existe;
  } catch {
    return true;
  }
};

// En el formulario
const form = useForm({
  resolver: zodResolver(productFormSchema),
  mode: 'onChange',
});

// Agregar validación onBlur
<FormField
  control={form.control}
  name="sku"
  render={({ field }) => (
    <FormItem>
      <FormLabel>SKU *</FormLabel>
      <FormControl>
        <Input
          {...field}
          onBlur={async (e) => {
            const esUnico = await verificarSKUUnico(e.target.value, productId);
            if (!esUnico) {
              form.setError('sku', {
                message: 'Este SKU ya existe'
              });
            }
          }}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## 5. Agregar Campos al Formulario

### Ejemplo: Agregar campo "Marca"

**Paso 1: Actualizar el schema**

```typescript
const productFormSchema = z.object({
  // ... campos existentes
  brand: z.string().min(1, 'Marca es requerida'),
});
```

**Paso 2: Actualizar valores por defecto**

```typescript
const form = useForm<ProductFormValues>({
  resolver: zodResolver(productFormSchema),
  defaultValues: {
    // ... valores existentes
    brand: product?.brand || '',
  },
});
```

**Paso 3: Agregar campo al formulario**

```tsx
<Card className="p-6">
  <h2 className="text-lg font-semibold mb-4">Información Básica</h2>

  <div className="space-y-4">
    {/* Campos existentes */}

    {/* Nuevo campo */}
    <FormField
      control={form.control}
      name="brand"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Marca *</FormLabel>
          <FormControl>
            <Input placeholder="Ej: Dell, HP, Apple" {...field} />
          </FormControl>
          <FormDescription>
            Marca del fabricante
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
</Card>
```

**Paso 4: Actualizar interfaz TypeScript**

```typescript
// En lib/api/products.api.ts
export interface CreateProductDto {
  // ... campos existentes
  brand?: string;
}
```

### Ejemplo: Agregar campo Select de Proveedor

```tsx
<FormField
  control={form.control}
  name="supplierId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Proveedor</FormLabel>
      <Select
        onValueChange={field.onChange}
        defaultValue={field.value}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar proveedor" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {suppliers.map((supplier) => (
            <SelectItem key={supplier.id} value={supplier.id}>
              {supplier.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Ejemplo: Agregar campo Checkbox

```tsx
<FormField
  control={form.control}
  name="isFeatured"
  render={({ field }) => (
    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <FormLabel className="text-base">
          Producto Destacado
        </FormLabel>
        <FormDescription>
          Mostrar en la página principal
        </FormDescription>
      </div>
      <FormControl>
        <input
          type="checkbox"
          checked={field.value}
          onChange={field.onChange}
          className="h-4 w-4"
        />
      </FormControl>
    </FormItem>
  )}
/>
```

---

## 6. Búsqueda y Filtros

### Agregar búsqueda en la lista

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import productsApi from '@/lib/api/products.api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await productsApi.getAll({
          search,
          page: 1,
          limit: 20,
        });
        setProducts(response.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [search]);

  return (
    <div>
      <Input
        placeholder="Buscar productos..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table>
          {/* Tabla de productos */}
        </Table>
      )}
    </div>
  );
}
```

### Agregar filtros por categoría y estado

```tsx
import { Select } from '@/components/ui/select';

const [filters, setFilters] = useState({
  categoryId: '',
  status: '',
  inStock: undefined,
});

const fetchProducts = async () => {
  const response = await productsApi.getAll({
    ...filters,
    search,
  });
  setProducts(response.data);
};

// En el JSX
<div className="flex gap-4 mb-4">
  <Input
    placeholder="Buscar..."
    onChange={(e) => setSearch(e.target.value)}
  />

  <Select
    onValueChange={(value) =>
      setFilters({ ...filters, categoryId: value })
    }
  >
    <SelectTrigger>
      <SelectValue placeholder="Categoría" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="">Todas</SelectItem>
      {categories.map(cat => (
        <SelectItem key={cat.id} value={cat.id}>
          {cat.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  <Select
    onValueChange={(value) =>
      setFilters({ ...filters, status: value })
    }
  >
    <SelectTrigger>
      <SelectValue placeholder="Estado" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="">Todos</SelectItem>
      <SelectItem value="ACTIVE">Activo</SelectItem>
      <SelectItem value="DRAFT">Borrador</SelectItem>
      <SelectItem value="INACTIVE">Inactivo</SelectItem>
    </SelectContent>
  </Select>
</div>
```

---

## 7. Subir Imágenes

### Agregar formulario de subida de imágenes

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import productsApi from '@/lib/api/products.api';
import { toast } from 'sonner';

export function ProductImageUpload({ productId }: { productId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', file.name);
      formData.append('isPrimary', 'false');

      await productsApi.addImage(productId, formData);
      toast.success('Imagen subida correctamente');
      setFile(null);
    } catch (error) {
      toast.error('Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      {file && (
        <div className="flex items-center gap-4">
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="w-32 h-32 object-cover rounded"
          />
          <Button
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Subiendo...' : 'Subir Imagen'}
          </Button>
        </div>
      )}
    </div>
  );
}
```

### Galería de imágenes

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import productsApi, { ProductImage } from '@/lib/api/products.api';
import { FiTrash2 } from 'react-icons/fi';

export function ProductImageGallery({ productId }: { productId: string }) {
  const [images, setImages] = useState<ProductImage[]>([]);

  useEffect(() => {
    const loadProduct = async () => {
      const product = await productsApi.getById(productId);
      setImages(product.images || []);
    };
    loadProduct();
  }, [productId]);

  const handleDelete = async (imageId: string) => {
    try {
      await productsApi.removeImage(productId, imageId);
      setImages(images.filter(img => img.id !== imageId));
      toast.success('Imagen eliminada');
    } catch (error) {
      toast.error('Error al eliminar imagen');
    }
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {images.map((image) => (
        <div key={image.id} className="relative group">
          <img
            src={image.url}
            alt={image.altText || 'Producto'}
            className="w-full h-32 object-cover rounded"
          />
          <Button
            variant="danger"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
            onClick={() => handleDelete(image.id)}
          >
            <FiTrash2 />
          </Button>
          {image.isPrimary && (
            <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
              Principal
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## Integración Completa

### Página completa con todos los features

```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DeleteProductDialog } from '@/components/products/delete-product-dialog';
import productsApi, { Product } from '@/lib/api/products.api';
import categoriesApi, { Category } from '@/lib/api/categories.api';
import { formatCurrency } from '@/lib/utils/format';
import { FiPlus, FiEdit2, FiDownload } from 'react-icons/fi';
import { toast } from 'sonner';

export default function ProductsPageComplete() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productsApi.getAll({
        search,
        categoryId: categoryFilter || undefined,
        status: statusFilter || undefined,
      });
      setProducts(response.data);
    } catch (error) {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      const cats = await categoriesApi.getAll();
      setCategories(cats);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [search, categoryFilter, statusFilter]);

  const handleExport = () => {
    // Implementar exportación CSV
    const csv = products.map(p =>
      `${p.sku},${p.name},${p.price},${p.quantity}`
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'productos.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Productos</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <FiDownload className="mr-2" />
            Exportar
          </Button>
          <Link href="/dashboard/products/new">
            <Button>
              <FiPlus className="mr-2" />
              Crear Producto
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="ACTIVE">Activo</SelectItem>
                <SelectItem value="DRAFT">Borrador</SelectItem>
                <SelectItem value="INACTIVE">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {products.length} producto{products.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8">Cargando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.sku}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      {product.category?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(product.price)}
                    </TableCell>
                    <TableCell>
                      <span className={product.quantity < 10 ? 'text-red-500' : ''}>
                        {product.quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === 'ACTIVE' ? 'success' :
                          product.status === 'DRAFT' ? 'warning' :
                          'danger'
                        }
                      >
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/dashboard/products/${product.id}/edit`)
                          }
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </Button>
                        <DeleteProductDialog
                          productId={product.id}
                          productName={product.name}
                          onDeleted={fetchProducts}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && products.length === 0 && (
            <p className="text-center py-8 text-gray-500">
              No se encontraron productos
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Conclusión

Estos ejemplos cubren los casos de uso más comunes del módulo de productos. Para funcionalidades más avanzadas o personalizadas, consulta la documentación de cada componente y API.
