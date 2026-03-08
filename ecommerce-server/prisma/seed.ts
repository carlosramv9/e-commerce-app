import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecommerce.com' },
    update: {},
    create: {
      email: 'admin@ecommerce.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create Walk-in customer (default for POS anonymous sales)
  const walkInCustomer = await prisma.customer.upsert({
    where: { email: 'walkin@store.local' },
    update: {},
    create: {
      email: 'walkin@store.local',
      firstName: 'Cliente',
      lastName: 'General',
      phone: '0000000000',
      status: 'ACTIVE',
      type: 'NEW',
      createdById: admin.id,
    },
  });
  console.log('✅ Created Walk-in customer:', walkInCustomer.email);

  // Create default address for Walk-in customer
  let walkInAddress = await prisma.customerAddress.findFirst({
    where: {
      customerId: walkInCustomer.id,
      label: 'Store',
    },
  });

  if (!walkInAddress) {
    walkInAddress = await prisma.customerAddress.create({
      data: {
        customerId: walkInCustomer.id,
        label: 'Store',
        firstName: 'Cliente',
        lastName: 'General',
        phone: '0000000000',
        address1: 'Tienda Física',
        city: 'Local',
        state: 'N/A',
        zipCode: '00000',
        country: 'US',
        isDefault: true,
      },
    });
  }
  console.log('✅ Created Walk-in address');

  // Create categories
  const electronicsCategory = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and accessories',
      status: 'ACTIVE',
      sortOrder: 1,
      createdById: admin.id,
    },
  });

  const phonesCategory = await prisma.category.upsert({
    where: { slug: 'smartphones' },
    update: {},
    create: {
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Latest smartphones',
      parentId: electronicsCategory.id,
      status: 'ACTIVE',
      sortOrder: 1,
      createdById: admin.id,
    },
  });

  const clothingCategory = await prisma.category.upsert({
    where: { slug: 'clothing' },
    update: {},
    create: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Men and women clothing',
      status: 'ACTIVE',
      sortOrder: 2,
      createdById: admin.id,
    },
  });

  console.log('✅ Created categories');

  // Create products
  const product1 = await prisma.product.upsert({
    where: { sku: 'IPH-14-PRO-128' },
    update: {},
    create: {
      sku: 'IPH-14-PRO-128',
      name: 'iPhone 14 Pro 128GB',
      slug: 'iphone-14-pro-128gb',
      description: 'Latest iPhone with A16 Bionic chip',
      price: 999.99,
      comparePrice: 1099.99,
      costPrice: 750.00,
      categoryId: phonesCategory.id,
      status: 'ACTIVE',
      stock: 50,
      trackInventory: true,
      lowStockAlert: 10,
      metaTitle: 'iPhone 14 Pro - Buy Now',
      metaDescription: 'Get the latest iPhone 14 Pro with amazing features',
      createdById: admin.id,
    },
  });

  await prisma.productImage.createMany({
    data: [
      {
        productId: product1.id,
        url: '/images/iphone-14-pro-1.jpg',
        altText: 'iPhone 14 Pro front view',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        productId: product1.id,
        url: '/images/iphone-14-pro-2.jpg',
        altText: 'iPhone 14 Pro back view',
        sortOrder: 2,
        isPrimary: false,
      },
    ],
  });

  const product2 = await prisma.product.upsert({
    where: { sku: 'TSH-BLK-M' },
    update: {},
    create: {
      sku: 'TSH-BLK-M',
      name: 'Classic Black T-Shirt',
      slug: 'classic-black-tshirt',
      description: '100% cotton comfortable t-shirt',
      price: 29.99,
      comparePrice: 39.99,
      costPrice: 15.00,
      categoryId: clothingCategory.id,
      status: 'ACTIVE',
      stock: 100,
      trackInventory: true,
      lowStockAlert: 20,
      createdById: admin.id,
    },
  });

  console.log('✅ Created products');

  // Create customer
  const customer = await prisma.customer.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      status: 'ACTIVE',
      type: 'REGULAR',
      totalOrders: 1,
      totalSpent: 1089.99,
      createdById: admin.id,
    },
  });

  let address = await prisma.customerAddress.findFirst({
    where: {
      customerId: customer.id,
      label: 'Home',
    },
  });

  if (!address) {
    address = await prisma.customerAddress.create({
      data: {
        customerId: customer.id,
        label: 'Home',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        address1: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US',
        isDefault: true,
      },
    });
  }

  console.log('✅ Created customer and address');

  // Create sample order
  const orderNumber = `ORD-${Date.now()}`;
  const existingOrder = await prisma.order.findUnique({
    where: { orderNumber },
  });

  let order;
  if (!existingOrder) {
    order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        addressId: address.id,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        subtotal: 999.99,
        tax: 80.00,
        shippingCost: 10.00,
        discount: 0,
        total: 1089.99,
        createdById: admin.id,
        items: {
          create: [
            {
              productId: product1.id,
              productName: product1.name,
              productSku: product1.sku,
              quantity: 1,
              price: 999.99,
              discount: 0,
              total: 999.99,
            },
          ],
        },
      },
    });
  } else {
    order = existingOrder;
  }

  const existingPayment = await prisma.payment.findFirst({
    where: { orderId: order.id },
  });

  if (!existingPayment) {
    await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentMethod: 'CARD',
        transactionId: 'txn_' + Date.now(),
        amount: 1089.99,
        status: 'PAID',
      },
    });
  }

  console.log('✅ Created sample order');

  // Create sample coupons
  const coupon1 = await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      description: 'Descuento de bienvenida para nuevos clientes',
      type: 'PERCENTAGE',
      value: 10,
      scope: 'GLOBAL',
      autoApply: true,
      customerTypes: ['NEW'],
      isFirstPurchaseOnly: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
      isActive: true,
      createdById: admin.id,
    },
  });

  const coupon2 = await prisma.coupon.upsert({
    where: { code: 'VIP15' },
    update: {},
    create: {
      code: 'VIP15',
      description: 'Descuento exclusivo para clientes VIP',
      type: 'PERCENTAGE',
      value: 15,
      scope: 'GLOBAL',
      autoApply: true,
      customerTypes: ['VIP'],
      minPurchase: 100,
      startDate: new Date(),
      isActive: true,
      createdById: admin.id,
    },
  });

  const coupon3 = await prisma.coupon.upsert({
    where: { code: 'IPHONE50' },
    update: {},
    create: {
      code: 'IPHONE50',
      description: '$50 de descuento en iPhones',
      type: 'FIXED',
      value: 50,
      scope: 'PRODUCT',
      productId: product1.id,
      autoApply: false,
      customerTypes: [],
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      usageLimit: 100,
      isActive: true,
      createdById: admin.id,
    },
  });

  const coupon4 = await prisma.coupon.upsert({
    where: { code: 'ELECTRONICS20' },
    update: {},
    create: {
      code: 'ELECTRONICS20',
      description: '20% de descuento en Electrónicos',
      type: 'PERCENTAGE',
      value: 20,
      scope: 'CATEGORY',
      categoryId: electronicsCategory.id,
      autoApply: false,
      customerTypes: [],
      minPurchase: 500,
      maxDiscount: 200,
      startDate: new Date(),
      isActive: true,
      createdById: admin.id,
    },
  });

  console.log('✅ Created sample coupons');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
