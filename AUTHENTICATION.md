# Sistema de Autenticación Unificado

## Descripción

El sistema ahora usa **un solo login** para todos los usuarios (`/login`). Los roles determinan qué puede hacer cada usuario:

- **admin**: Acceso completo al panel de administración (`/admin/*`)
- **user**: Acceso a funcionalidades de usuario regular

## Credenciales del Admin Actual

- **Email**: `admin@paradisepoint.com`
- **Password**: `admin123`
- **Role**: `admin`

## Cómo Funciona

### 1. Login Unificado (`/login`)
- Todos los usuarios (admin y regulares) usan la misma ruta de login
- El sistema verifica las credenciales contra la tabla `User`
- Genera un JWT con la información del usuario (incluyendo `role`)
- Redirige automáticamente según el rol:
  - `role=admin` → `/admin/dashboard`
  - `role=user` → `/`

### 2. Autenticación
- Se usa un **token JWT** almacenado en una cookie `token`
- El token contiene: `{ id, email, name, role }`
- Endpoints protegidos verifican el token usando `lib/auth.js`

### 3. Autorización
- Las rutas `/admin/*` verifican que `role === 'admin'`
- El `AdminLayout` redirige a `/login` si el usuario no es admin
- Los usuarios regulares no pueden acceder a rutas admin

## Crear Nuevos Admins

### Opción 1: Script Interactivo
```bash
node scripts/create-super-admin.js
```

### Opción 2: Desde Prisma Studio
```bash
npx prisma studio
```
1. Abrí la tabla `User`
2. Creá un nuevo usuario
3. Establecé `role = admin`
4. La contraseña debe estar hasheada con bcrypt

### Opción 3: Programáticamente
```javascript
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const hashedPassword = await bcrypt.hash('password123', 10)

await prisma.user.create({
  data: {
    email: 'nuevo@admin.com',
    name: 'Nuevo Admin',
    password: hashedPassword,
    role: 'admin'
  }
})
```

## Migración Completada

✅ Tabla `Admin` eliminada
✅ Tabla `User` ahora tiene campo `role` (enum: `admin` | `user`)
✅ Datos de admins migrados a `User`
✅ Sistema de cookies unificado (cookie `token`)
✅ Login unificado en `/login`
✅ Rutas `/admin/login` y `/api/admin/login` eliminadas

## Estructura de la Base de Datos

```prisma
enum UserRole {
  admin
  user
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  password  String   // bcrypt hash
  role      UserRole @default(user)
  lastLogin DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Endpoints API

### Autenticación
- `POST /api/auth/login` - Login unificado (admin y users)
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Info del usuario actual
- `POST /api/auth/register` - Registro de usuarios regulares

### Admin
- `GET /api/admin/me` - Info del admin (verifica role=admin)
- `GET /api/admin/reservations` - CRUD de reservas (solo admin)
- `GET /api/admin/clients` - Gestión de clientes (solo admin)
- `GET /api/admin/metrics` - Métricas del dashboard (solo admin)

## Seguridad

- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ JWT firmado con `JWT_SECRET` del `.env`
- ✅ Cookies `httpOnly` para prevenir XSS
- ✅ Verificación de roles en cada endpoint admin
- ✅ `credentials: 'include'` en todos los fetch del frontend

## Próximos Pasos (Opcional)

1. **Gestión de Usuarios**: Crear un CRUD en `/admin/usuarios` para que admins puedan:
   - Ver todos los usuarios
   - Cambiar roles
   - Desactivar usuarios
   - Resetear contraseñas

2. **Permisos Granulares**: Agregar más roles o permisos específicos:
   - `super_admin`: Puede gestionar otros admins
   - `editor`: Puede editar contenido pero no gestionar usuarios
   - `viewer`: Solo lectura

3. **Two-Factor Authentication (2FA)**: Agregar autenticación de dos factores para admins

4. **Logs de Auditoría**: Registrar acciones importantes (login, cambios de roles, etc.)

