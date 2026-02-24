/**
 * Script de verificación e2e manual del sistema e-commerce
 * Crea datos de prueba y verifica que todos los endpoints funcionen
 */

const BASE_URL = 'http://localhost:3001/api';
let authToken = '';
let createdIds = {
  user: '',
  category: '',
  product: '',
  customer: '',
  coupon: '',
  order: ''
};

// Helper para hacer requests
async function request(endpoint, method = 'GET', body = null, useAuth = false) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (useAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`${response.status}: ${JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    console.error(`❌ Error en ${method} ${endpoint}:`, error.message);
    throw error;
  }
}

console.log('🚀 Iniciando verificación del sistema e-commerce...\n');

// 1. Crear usuario admin
console.log('📝 1. Creando usuario administrador...');
try {
  const registerData = {
    email: 'admin@test.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'Test'
  };

  const user = await request('/auth/register', 'POST', registerData);
  createdIds.user = user.user.id;
  console.log('✅ Usuario creado:', user.user.email);
} catch (error) {
  // Si ya existe, intentar login
  console.log('ℹ️  Usuario ya existe, intentando login...');
}

// 2. Login
console.log('\n🔐 2. Iniciando sesión...');
try {
  const loginData = {
    email: 'admin@test.com',
    password: 'admin123'
  };

  const authResponse = await request('/auth/login', 'POST', loginData);
  authToken = authResponse.accessToken;
  console.log('✅ Login exitoso. Token obtenido.');
  console.log('   User role:', authResponse.user.role);
} catch (error) {
  console.error('❌ Error en login. Abortando...');
  process.exit(1);
}

// 3. Crear categoría
console.log('\n📁 3. Creando categoría de prueba...');
try {
  const categoryData = {
    name: 'Electrónica',
    slug: 'electronica',
    description: 'Productos electrónicos',
    status: 'ACTIVE',
    sortOrder: 0
  };

  const category = await request('/categories', 'POST', categoryData, true);
  createdIds.category = category.id;
  console.log('✅ Categoría creada:', category.name);
} catch (error) {
  console.log('ℹ️  La categoría podría ya existir');
}

// 4. Obtener categorías
console.log('\n📋 4. Obteniendo lista de categorías...');
try {
  const categories = await request('/categories', 'GET', null, true);
  console.log(`✅ Se encontraron ${categories.length} categorías`);
  if (!createdIds.category && categories.length > 0) {
    createdIds.category = categories[0].id;
  }
} catch (error) {
  console.error('❌ Error obteniendo categorías');
}

// 5. Crear producto
console.log('\n📦 5. Creando producto de prueba...');
try {
  const productData = {
    sku: 'TEST-001',
    name: 'Laptop Test',
    slug: 'laptop-test',
    description: 'Laptop de prueba',
    categoryId: createdIds.category,
    price: 15000,
    comparePrice: 18000,
    costPrice: 12000,
    stock: 50,
    trackInventory: true,
    lowStockAlert: 10,
    status: 'ACTIVE'
  };

  const product = await request('/products', 'POST', productData, true);
  createdIds.product = product.id;
  console.log('✅ Producto creado:', product.name);
} catch (error) {
  console.log('ℹ️  El producto podría ya existir');
}

// 6. Obtener productos
console.log('\n📦 6. Obteniendo lista de productos...');
try {
  const products = await request('/products', 'GET', null, true);
  console.log(`✅ Se encontraron ${products.data.length} productos`);
  if (!createdIds.product && products.data.length > 0) {
    createdIds.product = products.data[0].id;
  }
} catch (error) {
  console.error('❌ Error obteniendo productos');
}

// 7. Crear cliente
console.log('\n👤 7. Creando cliente de prueba...');
try {
  const customerData = {
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@test.com',
    phone: '5551234567',
    type: 'VIP',
    status: 'ACTIVE'
  };

  const customer = await request('/customers', 'POST', customerData, true);
  createdIds.customer = customer.id;
  console.log('✅ Cliente creado:', `${customer.firstName} ${customer.lastName}`);
} catch (error) {
  console.log('ℹ️  El cliente podría ya existir');
}

// 8. Obtener clientes
console.log('\n👥 8. Obteniendo lista de clientes...');
try {
  const customers = await request('/customers', 'GET', null, true);
  console.log(`✅ Se encontraron ${customers.data.length} clientes`);
  if (!createdIds.customer && customers.data.length > 0) {
    createdIds.customer = customers.data[0].id;
  }
} catch (error) {
  console.error('❌ Error obteniendo clientes');
}

// 9. Crear cupón con auto-aplicación
console.log('\n🎫 9. Creando cupón con auto-aplicación...');
try {
  const couponData = {
    code: 'VIP10',
    description: 'Descuento 10% para clientes VIP',
    type: 'PERCENTAGE',
    value: 10,
    scope: 'GLOBAL',
    autoApply: true,
    autoApplyCustomerTypes: ['VIP'],
    minPurchaseAmount: 1000,
    maxDiscount: 500,
    usageLimit: 100,
    active: true,
    validFrom: new Date().toISOString(),
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
  };

  const coupon = await request('/coupons', 'POST', couponData, true);
  createdIds.coupon = coupon.id;
  console.log('✅ Cupón creado:', coupon.code);
} catch (error) {
  console.log('ℹ️  El cupón podría ya existir');
}

// 10. Validar cupón
console.log('\n✅ 10. Validando cupón...');
try {
  const validationData = {
    code: 'VIP10',
    customerId: createdIds.customer,
    totalAmount: 5000
  };

  const validatedCoupon = await request('/coupons/validate', 'POST', validationData, true);
  console.log('✅ Cupón válido. Descuento:', validatedCoupon.value);
} catch (error) {
  console.error('❌ Error validando cupón');
}

// 11. Crear orden
console.log('\n🛒 11. Creando orden de prueba...');
try {
  const orderData = {
    customerId: createdIds.customer,
    items: [
      {
        productId: createdIds.product,
        quantity: 2,
        price: 15000
      }
    ],
    couponCode: 'VIP10',
    paymentMethod: 'CASH',
    shippingCost: 0,
    notes: 'Orden de prueba'
  };

  const order = await request('/orders', 'POST', orderData, true);
  createdIds.order = order.id;
  console.log('✅ Orden creada:', order.orderNumber);
  console.log(`   - Subtotal: $${order.subtotal}`);
  console.log(`   - Descuento: $${order.discountAmount}`);
  console.log(`   - Total: $${order.total}`);
} catch (error) {
  console.error('❌ Error creando orden');
}

// 12. Obtener órdenes
console.log('\n📊 12. Obteniendo lista de órdenes...');
try {
  const orders = await request('/orders', 'GET', null, true);
  console.log(`✅ Se encontraron ${orders.data.length} órdenes`);
} catch (error) {
  console.error('❌ Error obteniendo órdenes');
}

// 13. Obtener estadísticas del dashboard
console.log('\n📈 13. Obteniendo estadísticas del dashboard...');
try {
  const stats = await request('/dashboard/stats', 'GET', null, true);
  console.log('✅ Estadísticas obtenidas:');
  console.log(`   - Total Órdenes: ${stats.totalOrders}`);
  console.log(`   - Total Ingresos: $${stats.totalRevenue}`);
  console.log(`   - Total Clientes: ${stats.totalCustomers}`);
  console.log(`   - Total Productos: ${stats.totalProducts}`);
} catch (error) {
  console.error('❌ Error obteniendo estadísticas');
}

console.log('\n✨ ¡Verificación completada!\n');
console.log('📋 Resumen de IDs creados:');
console.log('   - Usuario:', createdIds.user || 'Ya existía');
console.log('   - Categoría:', createdIds.category);
console.log('   - Producto:', createdIds.product);
console.log('   - Cliente:', createdIds.customer);
console.log('   - Cupón:', createdIds.coupon || 'Ya existía');
console.log('   - Orden:', createdIds.order);
console.log('\n🎯 Credenciales de acceso:');
console.log('   Email: admin@test.com');
console.log('   Password: admin123');
console.log('\n🌐 Accede al sistema en: http://localhost:3000/login');
