# Solución de Problemas - Frontend no consulta al Backend

## Problema

El frontend no está consultando nada, el dashboard no trae datos y los productos tampoco.

## Diagnóstico Paso a Paso

### 1. Verificar que el Backend esté Corriendo

```bash
cd ecommerce-server
npm run start:dev
```

Deberías ver:
```
✓ Nest application successfully started
✓ Listening on: http://localhost:3001
```

**Test manual:**
Abre el navegador en `http://localhost:3001/api`

Deberías ver algo como: `{"message":"E-Commerce API is running"}`

### 2. Verificar que el Frontend esté Corriendo

```bash
cd ecommerce-web
npm run dev
```

Deberías ver:
```
✓ Ready in 2s
✓ Local: http://localhost:3000
```

### 3. Verificar Autenticación

**Abre la consola del navegador (F12) y ejecuta:**

```javascript
// Verificar token en localStorage
console.log('Token:', localStorage.getItem('token'));

// Verificar auth storage
console.log('Auth Storage:', localStorage.getItem('auth-storage'));
```

**Si no hay token:**
1. Ve a `/login`
2. Ingresa credenciales válidas
3. Verifica que después del login tengas el token

### 4. Usar la Página de Diagnóstico

He creado una página especial para diagnosticar el problema:

1. Navega a: `http://localhost:3000/dashboard/test-api`
2. Click en "Ejecutar Tests"
3. Revisa los resultados

Esta página te dirá exactamente qué está fallando.

## Problemas Comunes y Soluciones

### ❌ Error: "Network Error" o "Failed to fetch"

**Causa:** El backend no está corriendo o está en un puerto diferente.

**Solución:**
```bash
# Terminal 1: Backend
cd ecommerce-server
npm run start:dev

# Verificar que esté en el puerto 3001
# Si está en otro puerto, actualiza la URL en el frontend
```

### ❌ Error: "401 Unauthorized"

**Causa:** No hay token de autenticación o el token expiró.

**Solución:**
```javascript
// Limpiar y hacer login de nuevo
localStorage.clear();
// Luego ve a /login y vuelve a iniciar sesión
```

### ❌ Error: "CORS"

**Causa:** Configuración de CORS incorrecta.

**Solución:**
Verifica en `ecommerce-server/src/main.ts` que CORS esté habilitado:
```typescript
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

### ❌ La página carga pero no muestra datos

**Causa:** Las llamadas API fallan silenciosamente.

**Solución:**
1. Abre las DevTools (F12)
2. Ve a la pestaña "Network"
3. Recarga la página
4. Busca peticiones a `localhost:3001/api/...`
5. Revisa el status code y la respuesta

**Status codes comunes:**
- `200`: OK - La petición funcionó
- `401`: No autorizado - Problema con el token
- `404`: No encontrado - Endpoint incorrecto
- `500`: Error del servidor - Problema en el backend

### ❌ Error: "Cannot read properties of null"

**Causa:** El componente intenta acceder a datos que aún no se cargaron.

**Solución:** Ya está manejado en los componentes con estados de `loading`.

## Checklist de Verificación

Marca cada item cuando lo hayas verificado:

- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 3000
- [ ] Bases de datos PostgreSQL corriendo
- [ ] Variables de entorno configuradas (`.env`)
- [ ] Token presente en localStorage
- [ ] Sin errores en consola del navegador (F12)
- [ ] Sin errores en terminal del backend
- [ ] CORS configurado correctamente
- [ ] Página de test-api muestra tests exitosos

## Pasos de Recuperación Completa

Si nada funciona, sigue estos pasos:

### 1. Limpiar Completamente

```bash
# Frontend
cd ecommerce-web
rm -rf node_modules .next
npm install

# Backend
cd ecommerce-server
rm -rf node_modules dist
npm install
```

### 2. Verificar Variables de Entorno

**Backend (.env):**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"
JWT_SECRET="tu-secret-key"
PORT=3001
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Reiniciar Base de Datos

```bash
cd ecommerce-server

# Eliminar y recrear base de datos
npx prisma migrate reset

# Aplicar migraciones
npx prisma migrate dev

# Seed de datos iniciales
npx prisma db seed
```

### 4. Reiniciar Todo

```bash
# Terminal 1: PostgreSQL
# Asegúrate que PostgreSQL esté corriendo

# Terminal 2: Backend
cd ecommerce-server
npm run start:dev

# Terminal 3: Frontend
cd ecommerce-web
npm run dev
```

### 5. Crear Usuario de Prueba

Si después de reset no tienes usuario:

```bash
cd ecommerce-server
npm run seed

# O manualmente con Prisma Studio
npx prisma studio
```

## Comandos de Debug Útiles

### Ver logs del backend
```bash
cd ecommerce-server
npm run start:dev
# Los logs aparecerán en la terminal
```

### Ver peticiones HTTP en el navegador
1. F12 → Network tab
2. Marca "Preserve log"
3. Recarga la página
4. Busca peticiones a `localhost:3001`

### Verificar base de datos
```bash
cd ecommerce-server
npx prisma studio
# Abre interfaz gráfica en http://localhost:5555
```

### Test manual del API
```bash
# Obtener token (reemplaza con tus credenciales)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}'

# Usar token para consultar productos
curl http://localhost:3001/api/products \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## Contacto y Soporte

Si después de seguir todos estos pasos el problema persiste:

1. Revisa los logs de la terminal del backend
2. Revisa la consola del navegador (F12)
3. Usa la página `/dashboard/test-api` para diagnóstico
4. Verifica que todos los servicios estén corriendo:
   - PostgreSQL
   - Backend (puerto 3001)
   - Frontend (puerto 3000)

## Scripts de Diagnóstico Rápido

Crea un archivo `check-system.sh`:

```bash
#!/bin/bash

echo "=== Verificando Sistema ==="

# Check if PostgreSQL is running
if pgrep -x postgres > /dev/null; then
    echo "✓ PostgreSQL está corriendo"
else
    echo "✗ PostgreSQL NO está corriendo"
fi

# Check if backend is running
if curl -s http://localhost:3001/api > /dev/null; then
    echo "✓ Backend está respondiendo en puerto 3001"
else
    echo "✗ Backend NO está respondiendo"
fi

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✓ Frontend está respondiendo en puerto 3000"
else
    echo "✗ Frontend NO está respondiendo"
fi

echo ""
echo "=== Fin de Verificación ==="
```

```bash
chmod +x check-system.sh
./check-system.sh
```

## Notas Importantes

1. **Siempre inicia el backend ANTES que el frontend**
2. **El token expira después de cierto tiempo** - vuelve a hacer login
3. **Los cambios en el código del backend requieren reiniciar el servidor**
4. **Los cambios en el código del frontend se actualizan automáticamente (hot reload)**
5. **Si cambias el schema de Prisma, ejecuta** `npx prisma migrate dev`

## Estado Esperado

Cuando todo funciona correctamente:

```
✓ Backend logs muestran peticiones entrantes
✓ Frontend muestra datos en dashboard y productos
✓ Network tab muestra status 200 en peticiones
✓ No hay errores en consola del navegador
✓ Página test-api muestra todos los tests en verde
```
