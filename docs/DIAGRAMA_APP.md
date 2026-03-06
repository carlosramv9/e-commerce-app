 Diagrama 1: Arquitectura General del Sistema                                                                                                           
  
  graph TB                                                                                                                                                     subgraph "Frontend - Next.js 16"                                                                                                                   
          AUTH[🔐 Autenticación]
          ADMIN[👨‍💼 Panel Admin]
          POS[💰 Punto de Venta]
          ECOMMERCE[🛍️ E-commerce Público]
      end

      subgraph "Backend - NestJS"
          API[API REST]
          AUTH_SVC[Auth Service]
          USER_SVC[Users Service]
          PROD_SVC[Products Service]
          CAT_SVC[Categories Service]
          ORDER_SVC[Orders Service]
          COUPON_SVC[Coupons Service]
          EMAIL_SVC[Email Service]
      end

      subgraph "Base de Datos"
          DB[(PostgreSQL + Prisma)]
      end

      AUTH --> API
      ADMIN --> API
      POS --> API
      ECOMMERCE --> API

      API --> AUTH_SVC
      API --> USER_SVC
      API --> PROD_SVC
      API --> CAT_SVC
      API --> ORDER_SVC
      API --> COUPON_SVC
      API --> EMAIL_SVC

      AUTH_SVC --> DB
      USER_SVC --> DB
      PROD_SVC --> DB
      CAT_SVC --> DB
      ORDER_SVC --> DB
      COUPON_SVC --> DB

      EMAIL_SVC -.->|Envía tickets| EXTERNAL[📧 Servicio Email]

  Diagrama 2: Flujo de Autenticación y Roles

  flowchart TD
      START([Usuario accede al sistema]) --> LOGIN[Pantalla de Login]
      LOGIN --> AUTH{Autenticar}

      AUTH -->|❌ Credenciales inválidas| LOGIN
      AUTH -->|✅ Válido| CHECK_ROLE{Verificar Rol}

      CHECK_ROLE -->|SUPER_ADMIN| FULL_ACCESS[Acceso completo a todo]
      CHECK_ROLE -->|ADMIN| ADMIN_ACCESS[Admin + POS]
      CHECK_ROLE -->|MANAGER| MANAGER_ACCESS[Productos + Órdenes + POS]
      CHECK_ROLE -->|STAFF| STAFF_ACCESS[Solo POS + Ver productos]

      FULL_ACCESS --> DASHBOARD[📊 Dashboard]
      ADMIN_ACCESS --> DASHBOARD
      MANAGER_ACCESS --> DASHBOARD
      STAFF_ACCESS --> POS_VIEW[💰 Solo POS]

      DASHBOARD --> MENU{Navegación}
      MENU --> USERS[👥 Usuarios]
      MENU --> PRODUCTS[📦 Productos]
      MENU --> CATEGORIES[🏷️ Categorías]
      MENU --> COUPONS[🎟️ Cupones]
      MENU --> ORDERS[📋 Órdenes]
      MENU --> POS[💰 POS]

  Diagrama 3: Flujo del Punto de Venta (POS)

  flowchart TD
      START([Iniciar Nueva Venta]) --> CART[🛒 Carrito Vacío]

      CART --> ADD_PROD{Agregar Producto}
      ADD_PROD -->|Búsqueda| SEARCH[Buscar por nombre/SKU]
      ADD_PROD -->|Escaneo| SCAN[Escanear código]

      SEARCH --> ADD_CART[Agregar al carrito]
      SCAN --> ADD_CART

      ADD_CART --> SHOW_CART[Mostrar carrito con subtotal]
      SHOW_CART --> MORE{¿Más productos?}

      MORE -->|Sí| ADD_PROD
      MORE -->|No| COUPON{¿Aplicar cupón?}

      COUPON -->|Sí| ENTER_CODE[Ingresar código]
      COUPON -->|No| SELECT_CUSTOMER

      ENTER_CODE --> VALIDATE{Validar cupón}
      VALIDATE -->|❌ Inválido| ERROR[Mostrar error]
      ERROR --> COUPON
      VALIDATE -->|✅ Válido| APPLY_DISCOUNT[Aplicar descuento]

      APPLY_DISCOUNT --> SELECT_CUSTOMER[Seleccionar Cliente]

      SELECT_CUSTOMER --> CUSTOMER_TYPE{Tipo de cliente}
      CUSTOMER_TYPE -->|Walk-in| DEFAULT[Cliente General]
      CUSTOMER_TYPE -->|Buscar| SEARCH_CUST[Buscar cliente existente]
      CUSTOMER_TYPE -->|Nuevo| CREATE_CUST[Crear cliente rápido]

      DEFAULT --> PAYMENT
      SEARCH_CUST --> PAYMENT
      CREATE_CUST --> PAYMENT

      PAYMENT[💳 Proceso de Pago] --> METHOD{Método de pago}
      METHOD -->|Efectivo| CASH[Calcular cambio]
      METHOD -->|Tarjeta| CARD[Registrar pago con tarjeta]
      METHOD -->|Otro| OTHER[Otro método]

      CASH --> CREATE_ORDER[Crear Orden en DB]
      CARD --> CREATE_ORDER
      OTHER --> CREATE_ORDER

      CREATE_ORDER --> SUCCESS[✅ Venta Completada]
      SUCCESS --> TICKET{Generar Ticket}

      TICKET --> PRINT{¿Imprimir o Email?}
      PRINT -->|Imprimir| PRINT_VIEW[Vista imprimible]
      PRINT -->|Email| EMAIL_FLOW

      EMAIL_FLOW{Tipo de cliente} -->|Registrado| USE_EMAIL[Usar email del cliente]
      EMAIL_FLOW -->|Walk-in| ASK_EMAIL[Solicitar email]

      USE_EMAIL --> SEND_EMAIL[Enviar email con ticket]
      ASK_EMAIL --> SEND_EMAIL

      PRINT_VIEW --> DONE
      SEND_EMAIL --> DONE([Nueva Venta])

      DONE --> CART

  Diagrama 4: Flujo de Gestión de Cupones

  flowchart TD
      START([Crear Cupón]) --> FORM[Formulario de Cupón]

      FORM --> BASIC[Información Básica]
      BASIC --> CODE[Código único]
      CODE --> TYPE{Tipo de descuento}

      TYPE -->|Porcentaje| PCT[% de descuento]
      TYPE -->|Monto fijo| FIXED[$X de descuento]

      PCT --> SCOPE
      FIXED --> SCOPE

      SCOPE{Alcance del cupón}
      SCOPE -->|Global| GLOBAL[Toda la orden]
      SCOPE -->|Producto| SELECT_PROD[Seleccionar producto]
      SCOPE -->|Categoría| SELECT_CAT[Seleccionar categoría]

      GLOBAL --> AUTO
      SELECT_PROD --> AUTO
      SELECT_CAT --> AUTO

      AUTO{¿Auto-aplicar?}
      AUTO -->|No| MANUAL[Cupón manual - requiere código]
      AUTO -->|Sí| AUTO_CONFIG[Configurar auto-aplicación]

      AUTO_CONFIG --> CUSTOMER_TYPES[Seleccionar tipos de cliente]
      CUSTOMER_TYPES --> VIP[VIP]
      CUSTOMER_TYPES --> REGULAR[Regular]
      CUSTOMER_TYPES --> NEW[Nuevos]
      CUSTOMER_TYPES --> WHOLESALE[Mayorista]

      VIP --> CONDITIONS
      REGULAR --> CONDITIONS
      NEW --> CONDITIONS
      WHOLESALE --> CONDITIONS

      CONDITIONS{Condiciones adicionales}
      CONDITIONS -->|Primera compra| FIRST[isFirstPurchaseOnly = true]
      CONDITIONS -->|Mínimo de órdenes| MIN_ORD[minOrders = X]
      CONDITIONS -->|Compra mínima| MIN_PURCH[minPurchase = $X]

      FIRST --> RESTRICTIONS
      MIN_ORD --> RESTRICTIONS
      MIN_PURCH --> RESTRICTIONS
      MANUAL --> RESTRICTIONS

      RESTRICTIONS[Restricciones]
      RESTRICTIONS --> LIMIT[Límite de usos total]
      RESTRICTIONS --> LIMIT_CUST[Límite por cliente]
      RESTRICTIONS --> DATES[Fecha inicio/fin]

      LIMIT --> SAVE
      LIMIT_CUST --> SAVE
      DATES --> SAVE[💾 Guardar Cupón]

      SAVE --> ACTIVE{Activar?}
      ACTIVE -->|Sí| ENABLED[Cupón activo]
      ACTIVE -->|No| DRAFT[Guardar como borrador]

  Diagrama 5: Flujo E-commerce Público con Cupones Automáticos (Fase 2)

  flowchart TD
      START([Cliente visita tienda]) --> BROWSE[Navegar productos]

      BROWSE --> LOGIN_CHECK{¿Está logueado?}
      LOGIN_CHECK -->|No| GUEST[Navegar como invitado]
      LOGIN_CHECK -->|Sí| LOGGED[Cliente autenticado]

      GUEST --> ADD_CART
      LOGGED --> CHECK_TYPE[Identificar tipo de cliente]

      CHECK_TYPE --> AUTO_COUPONS{¿Hay cupones<br/>auto-aplicables?}
      AUTO_COUPONS -->|Sí| SHOW_BANNER[🎉 Mostrar banner de descuento]
      AUTO_COUPONS -->|No| ADD_CART

      SHOW_BANNER --> ADD_CART[Agregar productos al carrito]

      ADD_CART --> CART_VIEW[Ver carrito]
      CART_VIEW --> MANUAL_COUPON{¿Aplicar cupón manual?}

      MANUAL_COUPON -->|Sí| ENTER_CODE[Ingresar código]
      MANUAL_COUPON -->|No| CHECKOUT

      ENTER_CODE --> VALIDATE{Validar}
      VALIDATE -->|Inválido| ERROR[Mostrar error]
      VALIDATE -->|Válido| APPLY[Aplicar descuento]

      ERROR --> MANUAL_COUPON
      APPLY --> CHECKOUT

      CHECKOUT[Proceso de Checkout]
      CHECKOUT --> AUTO_APPLY[Sistema aplica cupones automáticos]
      AUTO_APPLY --> SHOW_DISCOUNTS[Mostrar descuentos aplicados]

      SHOW_DISCOUNTS --> CUSTOMER_INFO{Cliente}
      CUSTOMER_INFO -->|Guest| ENTER_INFO[Ingresar datos + email]
      CUSTOMER_INFO -->|Logged| USE_INFO[Usar datos guardados]

      ENTER_INFO --> PAYMENT_METHOD
      USE_INFO --> PAYMENT_METHOD

      PAYMENT_METHOD[Método de pago] --> GATEWAY[Pasarela de pago]
      GATEWAY --> CONFIRM[Confirmar orden]

      CONFIRM --> SUCCESS[✅ Orden creada]
      SUCCESS --> EMAIL_RECEIPT[📧 Enviar ticket por email]
      SUCCESS --> UPDATE_CUSTOMER[Actualizar estadísticas cliente]

      UPDATE_CUSTOMER --> CHECK_UPGRADE{¿Califica para upgrade?}
      CHECK_UPGRADE -->|Sí| UPGRADE[Actualizar tipo de cliente]
      CHECK_UPGRADE -->|No| DONE

      UPGRADE --> DONE([Fin])
      EMAIL_RECEIPT --> DONE

  Diagrama 6: Sistema de Auditoría

  flowchart LR
      subgraph "Todas las operaciones de modificación"
          CREATE[Crear]
          UPDATE[Actualizar]
          DELETE[Eliminar]
      end

      subgraph "Middleware de Auditoría"
          CAPTURE[Capturar usuario autenticado]
          EXTRACT[Extraer userId del token JWT]
      end

      subgraph "Base de Datos"
          SAVE_CREATE[Guardar createdBy + createdAt]
          SAVE_UPDATE[Guardar updatedBy + updatedAt]
      end

      CREATE --> CAPTURE
      UPDATE --> CAPTURE
      DELETE --> CAPTURE

      CAPTURE --> EXTRACT
      EXTRACT --> SAVE_CREATE
      EXTRACT --> SAVE_UPDATE

      SAVE_CREATE --> AUDIT_LOG[(Log de Auditoría)]
      SAVE_UPDATE --> AUDIT_LOG

      AUDIT_LOG --> REPORTS[📊 Reportes de auditoría]
      AUDIT_LOG --> HISTORY[📜 Historial de cambios]