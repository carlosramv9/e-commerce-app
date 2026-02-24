# E-Commerce Full Stack Application

Complete e-commerce admin panel with backend API and frontend dashboard.

## 🚀 Quick Start

**Opción más rápida (con Docker):**
```bash
# Windows
setup.bat

# macOS/Linux
chmod +x setup.sh && ./setup.sh
```

Ver **[QUICK_START.md](QUICK_START.md)** para inicio rápido.

## 📋 Documentación

- **[QUICK_START.md](QUICK_START.md)** - Inicio rápido en 5 minutos
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Guía completa de migración de base de datos
- **[SETUP_DATABASE.md](SETUP_DATABASE.md)** - Configuración detallada de PostgreSQL
- **[TEST_REPORT.md](TEST_REPORT.md)** - Reporte de tests unitarios (53 tests pasando)

## Tech Stack

### Backend
- **NestJS 11** - Node.js framework
- **PostgreSQL** - Database
- **Prisma ORM** - Database toolkit
- **JWT** - Authentication
- **Swagger** - API documentation
- **TypeScript** - Type safety

### Frontend
- **Next.js 16** - React framework
- **React 19** - UI library
- **Tailwind CSS v4** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **TypeScript** - Type safety

## Features

### Backend API
- ✅ JWT Authentication with role-based access control
- ✅ Users management (SUPER_ADMIN, ADMIN, MANAGER, STAFF)
- ✅ Categories (hierarchical support)
- ✅ Products with images and stock management
- ✅ Customers with addresses
- ✅ Orders with status workflow
- ✅ Payments tracking
- ✅ Dashboard statistics
- ✅ Swagger API documentation

### Frontend Admin Panel
- ✅ Login/Authentication
- ✅ Dashboard with statistics
- ✅ Products management
- ✅ Responsive design
- ✅ Dark mode support (CSS ready)
- ✅ Protected routes

## Project Structure

```
e-commerce-app/
├── ecommerce-server/          # NestJS Backend
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Seed data
│   └── src/
│       ├── common/            # Shared utilities, guards, decorators
│       ├── config/            # Configuration modules
│       ├── database/          # Prisma service
│       └── modules/           # Feature modules
│           ├── auth/          # Authentication
│           ├── users/         # Admin users
│           ├── categories/    # Product categories
│           ├── products/      # Products & images
│           ├── customers/     # Customer management
│           ├── orders/        # Order management
│           └── dashboard/     # Statistics
│
└── ecommerce-web/             # Next.js Frontend
    ├── app/
    │   ├── (auth)/           # Auth pages
    │   └── (dashboard)/      # Dashboard pages
    ├── components/
    │   ├── ui/               # UI components
    │   └── layout/           # Layout components
    └── lib/
        ├── api/              # API client
        ├── store/            # Zustand stores
        ├── hooks/            # Custom hooks
        └── utils/            # Utilities

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database

### Backend Setup

1. Navigate to backend directory:
```bash
cd ecommerce-server
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment variables:
```bash
# Edit .env file
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_db?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

4. Run Prisma migrations:
```bash
npx prisma migrate dev --name init
```

5. Seed the database (creates admin user and sample data):
```bash
npx prisma db seed
```

6. Start the development server:
```bash
pnpm run start:dev
```

Backend will run on: **http://localhost:3001**
API Documentation: **http://localhost:3001/api/docs**

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd ecommerce-web
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment variables:
```bash
# .env.local is already configured
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

4. Start the development server:
```bash
pnpm run dev
```

Frontend will run on: **http://localhost:3000**

## Default Credentials

After seeding the database, use these credentials to login:

**Admin User:**
- Email: `admin@ecommerce.com`
- Password: `admin123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Users (Protected - Admin only)
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Categories (Public for GET)
- `GET /api/categories` - List all categories
- `GET /api/categories/tree` - Get hierarchical tree
- `POST /api/categories` - Create category
- `PATCH /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Products (Public for GET)
- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/images` - Add product image
- `PATCH /api/products/:id/stock` - Update stock

### Orders (Protected)
- `GET /api/orders` - List all orders
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/status` - Update order status

### Customers (Protected)
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer details

### Dashboard (Protected)
- `GET /api/dashboard/stats` - Get dashboard statistics

## Database Schema

### Main Entities
- **Users** - Admin users with role-based access
- **Customers** - E-commerce customers
- **CustomerAddresses** - Customer shipping addresses
- **Categories** - Hierarchical product categories
- **Products** - Product catalog
- **ProductImages** - Product images
- **Orders** - Customer orders
- **OrderItems** - Order line items
- **Payments** - Payment records

## Development Commands

### Backend
```bash
pnpm run start:dev      # Start development server
pnpm run build          # Build for production
pnpm run start:prod     # Start production server
pnpm run lint           # Run ESLint
pnpm run test           # Run tests
pnpm run test:watch     # Run tests in watch mode
pnpm run test:cov       # Run tests with coverage
```

## 🧪 Testing

**Estado:** ✅ **53/53 tests passing**

El backend incluye tests unitarios completos para todos los servicios principales:

```bash
cd ecommerce-server

# Ejecutar todos los tests
pnpm test

# Ver cobertura
pnpm test:cov

# Modo watch
pnpm test:watch
```

**Cobertura:**
- AuthService: 100% ✅
- UsersService: 92% ✅
- CategoriesService: 86% ✅
- ProductsService: 70% ✅
- OrdersService: 100% ✅

Ver **[TEST_REPORT.md](TEST_REPORT.md)** para detalles completos.

### Frontend
```bash
pnpm run dev            # Start development server
pnpm run build          # Build for production
pnpm run start          # Start production server
pnpm run lint           # Run ESLint
```

### Database
```bash
npx prisma migrate dev              # Create migration
npx prisma migrate deploy           # Deploy migrations
npx prisma db seed                  # Seed database
npx prisma studio                   # Open Prisma Studio GUI
npx prisma generate                 # Generate Prisma Client
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control (RBAC)
- Protected API routes
- Input validation with class-validator
- SQL injection prevention (Prisma)
- XSS protection (React auto-escaping)
- CORS configuration

## Testing

Access Swagger documentation at `http://localhost:3001/api/docs` to test all API endpoints interactively.

## Production Deployment

### Backend
1. Set environment variables
2. Run `pnpm run build`
3. Run migrations: `npx prisma migrate deploy`
4. Start: `pnpm run start:prod`

### Frontend
1. Set environment variables
2. Run `pnpm run build`
3. Start: `pnpm run start`

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
