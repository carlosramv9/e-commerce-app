export interface PermissionDef {
  key: string;
  name: string;
  description?: string;
  module: string;
  action: string;
}

export const ALL_PERMISSIONS: PermissionDef[] = [
  // dashboard
  { key: 'dashboard:view', name: 'Ver dashboard', module: 'dashboard', action: 'view' },
  // pos
  { key: 'pos:access', name: 'Acceder al POS', module: 'pos', action: 'access' },
  // products
  { key: 'products:view',   name: 'Ver productos',      module: 'products', action: 'view'   },
  { key: 'products:create', name: 'Crear productos',    module: 'products', action: 'create' },
  { key: 'products:edit',   name: 'Editar productos',   module: 'products', action: 'edit'   },
  { key: 'products:delete', name: 'Eliminar productos', module: 'products', action: 'delete' },
  // categories
  { key: 'categories:view',   name: 'Ver categorías',      module: 'categories', action: 'view'   },
  { key: 'categories:create', name: 'Crear categorías',    module: 'categories', action: 'create' },
  { key: 'categories:edit',   name: 'Editar categorías',   module: 'categories', action: 'edit'   },
  { key: 'categories:delete', name: 'Eliminar categorías', module: 'categories', action: 'delete' },
  // orders
  { key: 'orders:view',   name: 'Ver ventas',    module: 'orders', action: 'view'   },
  { key: 'orders:create', name: 'Crear ventas',  module: 'orders', action: 'create' },
  { key: 'orders:edit',   name: 'Editar ventas', module: 'orders', action: 'edit'   },
  // customers
  { key: 'customers:view',   name: 'Ver clientes',      module: 'customers', action: 'view'   },
  { key: 'customers:create', name: 'Crear clientes',    module: 'customers', action: 'create' },
  { key: 'customers:edit',   name: 'Editar clientes',   module: 'customers', action: 'edit'   },
  { key: 'customers:delete', name: 'Eliminar clientes', module: 'customers', action: 'delete' },
  // coupons
  { key: 'coupons:view',   name: 'Ver cupones',      module: 'coupons', action: 'view'   },
  { key: 'coupons:create', name: 'Crear cupones',    module: 'coupons', action: 'create' },
  { key: 'coupons:edit',   name: 'Editar cupones',   module: 'coupons', action: 'edit'   },
  { key: 'coupons:delete', name: 'Eliminar cupones', module: 'coupons', action: 'delete' },
  // users
  { key: 'users:view',   name: 'Ver usuarios',      module: 'users', action: 'view'   },
  { key: 'users:create', name: 'Crear usuarios',    module: 'users', action: 'create' },
  { key: 'users:edit',   name: 'Editar usuarios',   module: 'users', action: 'edit'   },
  { key: 'users:delete', name: 'Eliminar usuarios', module: 'users', action: 'delete' },
  // roles
  { key: 'roles:view',   name: 'Ver roles',      module: 'roles', action: 'view'   },
  { key: 'roles:create', name: 'Crear roles',    module: 'roles', action: 'create' },
  { key: 'roles:edit',   name: 'Editar roles',   module: 'roles', action: 'edit'   },
  { key: 'roles:delete', name: 'Eliminar roles', module: 'roles', action: 'delete' },
  // reports
  { key: 'reports:view', name: 'Ver reportes', module: 'reports', action: 'view' },
];

export const MODULES_ORDER = [
  'dashboard', 'pos', 'products', 'categories', 'orders',
  'customers', 'coupons', 'users', 'roles', 'reports',
];
