# Sistema de Gestión de Pedidos - Pedidos360

Sistema web para la administración de pedidos, productos, usuarios y reportes. Desarrollado con Next.js 14, React, TypeScript, TailwindCSS y Supabase.

**🌐 Aplicación en vivo:** [https://pedidos360.vercel.app](https://pedidos360-9n2tsywvm-andresgiraldo19-3057s-projects.vercel.app?_vercel_share=2AGMosRkcFy5gjqB7KxIUEbUgU3NmC7j)

## 🔑 Credenciales de Prueba

Para facilitar la evaluación del sistema, se proporcionan las siguientes credenciales de acceso:

### 👑 Administrador
```
Email: admin@gmail.com
Contraseña: 12345
```
**Acceso a:** Panel Master, gestión de usuarios, productos, pedidos, reportes e historial.

### 👔 Empleado
```
Email: carlos@gmail.com
Contraseña: 12345
```
**Acceso a:** Gestión de pedidos, inventario, reportes e historial.

### 🛒 Cliente
```
Email: pepe@gmail.com
Contraseña: 12345
```
**Acceso a:** Catálogo de productos, creación de pedidos, seguimiento de pedidos.

> ⚠️ **Nota:** Estas son credenciales de demostración. En producción, usar credenciales seguras.

## 📋 Descripción del Proyecto

Pedidos360 es una aplicación web de administración que permite gestionar pedidos, productos, usuarios y generar reportes con visualizaciones gráficas. El sistema cuenta con tres roles de usuario diferenciados (Admin, Empleado y Cliente), cada uno con permisos y funcionalidades específicas.

## 🚀 Tecnologías Utilizadas

- **Frontend:**
  - Next.js 14 (App Router)
  - React 18
  - TypeScript
  - TailwindCSS
  - Shadcn/ui (Componentes UI)
  - Recharts (Gráficas)
  - Lucide React (Iconos)

- **Backend:**
  - Next.js API Routes
  - Supabase (Base de datos PostgreSQL)
  - Supabase Auth (Autenticación)

- **Otras herramientas:**
  - jsPDF (Generación de reportes PDF)
  - jsPDF-AutoTable (Tablas en PDF)

## 👥 Roles del Sistema

### 🔴 ADMIN
Tiene acceso completo a todas las funcionalidades:
- Gestión completa de pedidos (ver, modificar estados)
- Acceso al panel Master para CRUD de:
  - Empleados
  - Clientes
  - Productos
- Visualización de reportes y gráficas
- Acceso al historial de pedidos

### 🟡 EMPLEADO (USER)
Acceso a funcionalidades operativas:
- Gestión de pedidos activos
- Cambio de estados de pedidos
- Visualización de inventario
- Generación de reportes
- Acceso al historial de pedidos

### 🟢 CLIENTE
Acceso limitado enfocado en compras:
- Visualización del catálogo de productos
- Creación de pedidos
- Seguimiento de sus propios pedidos

## 📦 Funcionalidades Principales

### Autenticación
- Sistema de login con email y contraseña
- Redirección automática según rol de usuario
- Sesiones persistentes con Supabase Auth

### Gestión de Pedidos
- Visualización de pedidos activos en tiempo real
- Sistema de estados: Pendiente → Confirmado → Preparando → Listo → Entregado
- Posibilidad de cancelar pedidos
- Historial completo de pedidos entregados y cancelados
- Información detallada: cliente, productos, total, dirección de entrega

### Panel Master (Solo Admin)
Sistema centralizado con 3 pestañas:
- **Empleados:** Ver, editar y eliminar empleados
- **Clientes:** Ver, editar y eliminar clientes  
- **Productos:** CRUD completo (crear, ver, editar, eliminar productos)

### Gestión de Inventario
- Visualización de productos con stock disponible
- Información de precios y categorías
- Control de inventario en tiempo real

### Reportes y Gráficas
Sistema de reportes con 3 tipos:
1. **Reporte de Pedidos:**
   - Tabla con todos los pedidos del sistema
   - Gráfica de línea: Evolución de pedidos por día (últimos 10 días)
   
2. **Reporte de Productos:**
   - Tabla con productos, stock y cantidad vendida
   - Gráfica de barras: Top 10 productos por stock
   
3. **Reporte de Clientes:**
   - Tabla con clientes y cantidad de pedidos realizados
   - Gráfica de línea: Clientes registrados por día (últimos 10 días)

- Exportación de reportes a PDF

### Catálogo de Productos (Clientes)
- Visualización de productos disponibles
- Sistema de carrito de compras
- Proceso de checkout con información de entrega

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta en Supabase

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd pedidos360
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto con las siguientes variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key
```

**¿Dónde obtener estas claves?**
1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Settings → API
3. Copia las keys correspondientes

### 4. Configurar la Base de Datos

Ejecuta las siguientes sentencias SQL en Supabase SQL Editor:
```sql
-- Tabla de usuarios
create table public.users (
  id uuid not null,
  email text not null,
  name text not null,
  phone text null,
  address text null,
  role text not null,
  created_at timestamp with time zone null default now(),
  constraint users_pkey primary key (id),
  constraint users_id_fkey foreign key (id) references auth.users (id) on delete cascade,
  constraint users_role_check check (
    role = any (array['client'::text, 'employee'::text, 'admin'::text])
  )
);

-- Tabla de productos
create table public.products (
  id uuid not null default gen_random_uuid(),
  name text not null,
  description text null,
  price numeric(10, 2) not null,
  image text null,
  category text null,
  stock integer not null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint products_pkey primary key (id)
);

-- Tabla de pedidos
create table public.orders (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  status text not null default 'pending',
  total numeric(10, 2) not null,
  payment_method text not null,
  delivery_address text not null,
  notes text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint orders_pkey primary key (id),
  constraint orders_user_id_fkey foreign key (user_id) references users (id) on delete cascade
);

-- Tabla de items de pedido
create table public.order_items (
  id uuid not null default gen_random_uuid(),
  order_id uuid not null,
  product_id uuid not null,
  quantity integer not null,
  price numeric(10, 2) not null,
  created_at timestamp with time zone null default now(),
  constraint order_items_pkey primary key (id),
  constraint order_items_order_id_fkey foreign key (order_id) references orders (id) on delete cascade,
  constraint order_items_product_id_fkey foreign key (product_id) references products (id) on delete cascade
);
```

### 5. Configurar políticas RLS (Row Level Security)
```sql
-- Habilitar RLS
alter table users enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Políticas de ejemplo (ajustar según necesidades)
create policy "Public products are viewable by everyone"
  on products for select
  using (true);

create policy "Users can view their own data"
  on users for select
  using (auth.uid() = id);
```

### 6. Ejecutar el proyecto
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto
```
pedidos360/
├── app/
│   ├── admin/          # Páginas del administrador
│   │   └── master/     # Panel Master CRUD
│   ├── empleado/       # Páginas del empleado
│   │   ├── pedidos/
│   │   ├── historial-pedidos/
│   │   ├── inventario/
│   │   └── reportes/
│   ├── catalogo/       # Catálogo para clientes
│   ├── auth/           # Autenticación
│   └── api/            # API Routes
│       ├── master/     # CRUD de usuarios y productos
│       └── reports/    # Generación de reportes
├── components/
│   ├── ui/             # Componentes de Shadcn/ui
│   ├── admin-header.tsx
│   ├── employee-header.tsx
│   └── ...
├── lib/
│   └── supabase/       # Configuración de Supabase
│       ├── client.ts   # Cliente para el browser
│       ├── server.ts   # Cliente para el servidor
│       └── admin.ts    # Cliente admin con service_role
└── public/             # Archivos estáticos
```

## 🔒 Seguridad

- Las contraseñas son hasheadas por Supabase Auth
- Row Level Security (RLS) en todas las tablas
- Service Role Key solo en servidor (nunca expuesta al cliente)
- Validación de roles en cada página
- Tokens JWT para autenticación

## 📊 Base de Datos

El sistema utiliza PostgreSQL a través de Supabase con las siguientes tablas principales:

- **users:** Información de usuarios con roles
- **products:** Catálogo de productos
- **orders:** Pedidos realizados
- **order_items:** Detalles de productos en cada pedido

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio de GitHub con Vercel
2. Configurar variables de entorno en Vercel
3. Deploy automático

**Aplicación desplegada:** ([https://pedidos360.vercel.app](https://pedidos360-ot8r5cpax-andresgiraldo19-3057s-projects.vercel.app/)

### Variables de entorno en producción:
Asegúrate de agregar todas las variables del `.env.local` en la configuración de tu plataforma de deployment.

## 👨‍💻 Desarrollo

### Comandos disponibles
```bash
npm run dev      # Ejecutar en desarrollo
npm run build    # Compilar para producción
npm run start    # Ejecutar en producción
npm run lint     # Ejecutar linter
```

## 📝 Notas Adicionales

- El sistema usa Next.js App Router (no Pages Router)
- No se utiliza Prisma, las queries se hacen directamente con Supabase Client
- Los componentes UI usan la convención de Shadcn/ui
- El proyecto usa npm (no yarn)

## 🐛 Troubleshooting

### Error: "Invalid API key"
- Verifica que las claves de Supabase en `.env.local` sean correctas
- Reinicia el servidor de desarrollo

### Error: "User not found"
- Verifica que el usuario exista en la tabla `users` y en `auth.users`
- Confirma que el rol del usuario sea válido

### Gráficas no se muestran
- Verifica que haya datos en la base de datos
- Revisa la consola del navegador para errores

## 📄 Licencia

Este proyecto fue desarrollado como parte del curso de Análisis y Diseño 2 de la Universidad de Antioquia.

## ✨ Equipo de Desarrollo

**Desarrolladores:**
- Andrés Giraldo Arismendy
- Santiago Rendón Rivera
- Luis Felipe Castañeda Velázquez
- Edwin Daniel Martínez Gaviria

**Profesor:**
- Juan Pablo Arango

**Institución:** Universidad de Antioquia  
**Curso:** Análisis y Diseño de Sistemas 2  
**Año:** 2025

---

**Repositorio:** [https://github.com/tu-usuario/pedidos360](https://github.com/Agiras2/Pedidos360.git) 
**Demo en vivo:** [https://pedidos360.vercel.app](https://pedidos360-ot8r5cpax-andresgiraldo19-3057s-projects.vercel.app/)



