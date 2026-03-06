# Paradise Point — Plan de Refactor

This is an executable plan for an AI agent. Follow each phase in order. Each step has the exact current state, target state, and files involved. Do NOT skip steps. Do NOT improvise changes beyond what's described. After each phase, verify the app builds (`npm run build`).

## Context

Paradise Point is a Next.js 16 vacation rental site with admin panel, Prisma + PostgreSQL, deployed on Vercel. The main issues are:

1. **Calendar status string inconsistency**: Reservation API routes write `reservado`/`disponible` to the `Day` model, but the Calendar API, Calendar component, CalendarBooking component, DayCell component, and admin calendario page all expect `available`/`inquiry`/`reserved`. This means days marked by reservations appear available in the calendar.
2. **Dead user auth system**: The `User` model, `/api/auth/*` routes, `/login` page, `/registro` page, and auth UI in the Navbar are unused — the real flow is WhatsApp-based with admin-only management.
3. **Unprotected calendar API**: `POST /api/calendar` has no auth, anyone can modify calendar data.
4. **Legacy/debug routes**: `/api/admin/check` and `/api/test-env` should be removed.
5. **Dashboard metrics use wrong status strings**: Metrics route filters by `reservado`/`disponible` which are the broken strings.
6. **Client model needs enrichment** for future marketing use, and Reservation needs a proper foreign key to Client.

---

## Phase 1: Fix calendar status inconsistency

This is the critical bug. The standard strings are `available`, `inquiry`, `reserved` (already used by the Calendar API validation, Calendar component, CalendarBooking, DayCell, and admin calendario page). The reservation routes must be updated to use these same strings.

### Step 1.1: Fix `app/api/admin/reservations/route.js` (POST handler)

**Current** (lines 138-143): writes `'reservado'` to Day model when creating a reservation.

```javascript
await prisma.day.upsert({
  where: { date },
  update: { status: 'reservado' },
  create: { date, status: 'reservado' }
})
```

**Change to:**

```javascript
await prisma.day.upsert({
  where: { date },
  update: { status: 'reserved' },
  create: { date, status: 'reserved' }
})
```

### Step 1.2: Fix `app/api/admin/reservations/[id]/route.js` (PUT handler)

**Current** (line 84): writes `'disponible'` when clearing old dates.

```javascript
data: { status: 'disponible' }
```

**Change to** (appears twice in this file — line 84 in PUT, line 194 in DELETE):

```javascript
data: { status: 'available' }
```

**Current** (lines 117-120): writes `'reservado'` when setting new dates in PUT.

```javascript
await prisma.day.upsert({
  where: { date },
  update: { status: 'reservado' },
  create: { date, status: 'reservado' }
})
```

**Change to:**

```javascript
await prisma.day.upsert({
  where: { date },
  update: { status: 'reserved' },
  create: { date, status: 'reserved' }
})
```

### Step 1.3: Fix `app/api/admin/reservations/[id]/route.js` (DELETE handler)

**Current** (line 194): writes `'disponible'` when clearing dates on deletion.

```javascript
data: { status: 'disponible' }
```

**Change to:**

```javascript
data: { status: 'available' }
```

### Step 1.4: Fix `app/api/admin/metrics/route.js`

**Current** (lines 56-60): filters by `'reservado'` and `'disponible'`.

```javascript
const reservedDays = daysInMonth.filter(d => d.status === 'reservado').length
const ocupacionMes = totalDays > 0 ? Math.round((reservedDays / totalDays) * 100) : 0
const diasDisponibles = daysInMonth.filter(d => d.status === 'disponible').length
```

**Change to:**

```javascript
const reservedDays = daysInMonth.filter(d => d.status === 'reserved').length
const ocupacionMes = totalDays > 0 ? Math.round((reservedDays / totalDays) * 100) : 0
const diasDisponibles = daysInMonth.filter(d => d.status === 'available').length
```

### Step 1.5: Verify consistency

After these changes, the ONLY valid status strings in the entire codebase should be: `available`, `inquiry`, `reserved`. No file should contain `'reservado'` or `'disponible'` as a Day status (the word `señado` is a Reservation status, not a Day status — leave it alone). Run a search for `reservado` and `disponible` to confirm only Reservation status (`señado`) remains.

Note: Existing data in the database may have `reservado`/`disponible` values. A data migration script should be run to update them. Create a one-time API route or script. Details below.

### Step 1.6: Database migration script

Create file `app/api/admin/migrate-statuses/route.js`:

```javascript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST() {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      jwt.verify(token.value, JWT_SECRET)
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const updated = await prisma.$transaction([
      prisma.day.updateMany({
        where: { status: 'reservado' },
        data: { status: 'reserved' }
      }),
      prisma.day.updateMany({
        where: { status: 'disponible' },
        data: { status: 'available' }
      }),
      prisma.day.updateMany({
        where: { status: 'consulta' },
        data: { status: 'inquiry' }
      })
    ])

    return NextResponse.json({
      migrated: {
        reservado_to_reserved: updated[0].count,
        disponible_to_available: updated[1].count,
        consulta_to_inquiry: updated[2].count
      }
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 })
  }
}
```

This route should be called once after deployment, then can be deleted. It requires admin auth.

---

## Phase 2: Protect `POST /api/calendar` with admin auth

### Step 2.1: Add auth to `app/api/calendar/route.js`

The GET remains public (visitors need to see calendar). The POST must require admin JWT.

**Current imports (line 1-2):**

```javascript
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
```

**Change to:**

```javascript
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
```

**Current POST handler start (line 34):**

```javascript
export async function POST(request) {
  if (!prisma) {
```

**Insert admin verification at the beginning of the POST function, after the prisma check (after line 40):**

```javascript
const cookieStore = await cookies()
const token = cookieStore.get('admin_token')
if (!token) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
try {
  jwt.verify(token.value, JWT_SECRET)
} catch {
  return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
}
```

This works because the `Calendar` component (used in admin) does `fetch('/api/calendar', ...)` and the `admin_token` cookie is automatically sent with same-origin requests.

---

## Phase 3: Remove dead code

### Step 3.1: Delete files

Delete the following files and directories:

- `app/api/auth/login/route.js`
- `app/api/auth/logout/route.js`
- `app/api/auth/me/route.js`
- `app/api/auth/register/route.js`
- `app/api/auth/` (the directory itself, if empty after deleting routes)
- `app/login/page.jsx`
- `app/registro/page.jsx`
- `app/api/admin/check/route.js`
- `app/api/test-env/route.js`

### Step 3.2: Clean up `components/Navbar.jsx`

Remove the user auth state and logic. The Navbar should NOT have login/register buttons or auth checks.

**Remove these state variables** (lines 10-11):

```javascript
const [isAuthenticated, setIsAuthenticated] = useState(false)
const [userName, setUserName] = useState('')
```

**Remove the entire `useEffect` that checks auth** (lines 14-28):

```javascript
useEffect(() => {
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setIsAuthenticated(true)
        setUserName(data.name || '')
      }
    } catch (error) {
      setIsAuthenticated(false)
    }
  }
  checkAuth()
}, [pathname])
```

**Remove the entire desktop auth buttons section** (lines 118-151) — the `<div className="ml-4 flex items-center gap-2 border-l border-white/30 pl-4">` block and everything inside it.

**Remove the entire mobile auth buttons section** (lines 194-229) — the `<div className="border-t border-white/30 mt-2 pt-2">` block and everything inside it.

The Navbar should only have navigation links: Comodidades, Precios, Calendario, Galería, Reglas. No auth UI.

### Step 3.3: Remove `User` model from Prisma schema

**File:** `prisma/schema.prisma`

**Delete** the entire User model (lines 17-24):

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Important:** After this deletion, create a new migration:

```bash
npx prisma migrate dev --name remove_user_model
```

If running on Vercel with an existing database, the build script already runs `prisma migrate deploy`, so this migration will be applied automatically on next deploy.

---

## Phase 4: Enrich Client model and link to Reservation

### Step 4.1: Update Prisma schema

**Current Client model** (lines 51-59 of `prisma/schema.prisma`):

```prisma
model Client {
  id          String   @id @default(uuid())
  name        String
  email       String   @unique
  phone       String
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Change to:**

```prisma
model Client {
  id            String        @id @default(uuid())
  name          String
  email         String        @unique
  phone         String
  instagram     String?
  canUsePhotos  Boolean       @default(false)
  newsletter    Boolean       @default(false)
  referredBy    String?
  notes         String?
  reservations  Reservation[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}
```

**Current Reservation model** (lines 36-49):

```prisma
model Reservation {
  id          String   @id @default(uuid())
  checkIn     DateTime
  checkOut    DateTime
  clientName  String
  clientEmail String
  clientPhone String
  totalAmount Int
  paidAmount  Int      @default(0)
  status      String
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Change to:**

```prisma
model Reservation {
  id          String   @id @default(uuid())
  checkIn     DateTime
  checkOut    DateTime
  clientId    String
  client      Client   @relation(fields: [clientId], references: [id])
  totalAmount Int
  paidAmount  Int      @default(0)
  status      String
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Note: `clientName`, `clientEmail`, `clientPhone` are REMOVED from Reservation. The client data lives in the Client model.

### Step 4.2: Create migration

```bash
npx prisma migrate dev --name link_reservation_to_client
```

**IMPORTANT:** If there is existing data, this migration will fail because:
1. Existing reservations have no `clientId`
2. `clientName`/`clientEmail`/`clientPhone` columns would be dropped

Prisma will warn about this. The approach is:

1. First, create a migration that ADDS `clientId` as optional:
   - Manually edit the migration SQL before applying, OR
   - Use a two-step migration approach

**Recommended approach for existing data:** Write a custom migration:

```bash
npx prisma migrate dev --name link_reservation_to_client --create-only
```

Then edit the generated SQL file to:

```sql
-- Step 1: Add clientId column as nullable
ALTER TABLE "Reservation" ADD COLUMN "clientId" TEXT;

-- Step 2: Populate clientId from existing client data
UPDATE "Reservation" r
SET "clientId" = c.id
FROM "Client" c
WHERE c.email = r."clientEmail";

-- Step 3: For reservations without a matching client, create clients
INSERT INTO "Client" (id, name, email, phone, "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  r."clientName",
  r."clientEmail",
  r."clientPhone",
  NOW(),
  NOW()
FROM "Reservation" r
WHERE r."clientId" IS NULL
AND r."clientEmail" IS NOT NULL
GROUP BY r."clientName", r."clientEmail", r."clientPhone"
ON CONFLICT (email) DO NOTHING;

-- Step 4: Re-populate clientId for newly created clients
UPDATE "Reservation" r
SET "clientId" = c.id
FROM "Client" c
WHERE c.email = r."clientEmail"
AND r."clientId" IS NULL;

-- Step 5: Make clientId required
ALTER TABLE "Reservation" ALTER COLUMN "clientId" SET NOT NULL;

-- Step 6: Add foreign key
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 7: Drop old columns
ALTER TABLE "Reservation" DROP COLUMN "clientName";
ALTER TABLE "Reservation" DROP COLUMN "clientEmail";
ALTER TABLE "Reservation" DROP COLUMN "clientPhone";

-- Step 8: Add Client new columns
ALTER TABLE "Client" ADD COLUMN "instagram" TEXT;
ALTER TABLE "Client" ADD COLUMN "canUsePhotos" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Client" ADD COLUMN "newsletter" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Client" ADD COLUMN "referredBy" TEXT;
```

Then apply with:

```bash
npx prisma migrate dev
```

### Step 4.3: Update `app/api/admin/reservations/route.js` (POST)

The reservation creation now needs to find-or-create a Client and link it.

**Current POST handler** creates reservation with inline client data and then upserts client separately. Change the flow to:

1. Upsert Client first, get the client id
2. Create Reservation with `clientId` instead of `clientName`/`clientEmail`/`clientPhone`

**Replace the POST handler body** (keep the auth check and validation). The form still sends `clientName`, `clientEmail`, `clientPhone` — but now we use them to find/create a Client and link via `clientId`.

```javascript
// Find or create client
const client = await prisma.client.upsert({
  where: { email: clientEmail },
  update: {
    name: clientName,
    phone: clientPhone
  },
  create: {
    email: clientEmail,
    name: clientName,
    phone: clientPhone
  }
})

// Create reservation linked to client
const reservation = await prisma.reservation.create({
  data: {
    checkIn: new Date(checkIn),
    checkOut: new Date(checkOut),
    clientId: client.id,
    totalAmount: parseInt(totalAmount),
    paidAmount: parseInt(paidAmount) || 0,
    status: status || 'señado',
    notes: notes || ''
  },
  include: {
    client: true
  }
})
```

### Step 4.4: Update `app/api/admin/reservations/route.js` (GET)

Add `include: { client: true }` to both findMany calls so the response includes client data.

### Step 4.5: Update `app/api/admin/reservations/[id]/route.js` (PUT)

Same pattern: upsert Client first, then update Reservation with `clientId`. Remove the separate client upsert at the end (it was duplicated logic).

```javascript
const client = await prisma.client.upsert({
  where: { email: clientEmail },
  update: { name: clientName, phone: clientPhone },
  create: { email: clientEmail, name: clientName, phone: clientPhone }
})

const reservation = await prisma.reservation.update({
  where: { id },
  data: {
    checkIn: new Date(checkIn),
    checkOut: new Date(checkOut),
    clientId: client.id,
    totalAmount: parseInt(totalAmount),
    paidAmount: parseInt(paidAmount),
    status,
    notes: notes || ''
  },
  include: { client: true }
})
```

### Step 4.6: Update `app/api/admin/reservations/[id]/route.js` (DELETE)

No change needed for client handling — just include client in the initial findUnique if desired.

### Step 4.7: Update `app/api/admin/metrics/route.js`

The `proximasReservas` query should include client data:

```javascript
const proximasReservas = await prisma.reservation.findMany({
  // ... existing where/orderBy/take ...
  include: { client: true }
})
```

### Step 4.8: Update `app/admin/reservas/page.jsx`

The frontend form still collects `clientName`, `clientEmail`, `clientPhone` (the API handles the mapping). But the data coming BACK from the API now has `reservation.client.name` instead of `reservation.clientName`.

**Update all references in the table and form:**

Where the code reads `reserva.clientName`, change to `reserva.client.name`.
Where it reads `reserva.clientEmail`, change to `reserva.client.email`.
Where it reads `reserva.clientPhone`, change to `reserva.client.phone`.

**In `openModal` when editing** (line 127-137), update:

```javascript
clientName: reserva.client.name,
clientEmail: reserva.client.email,
clientPhone: reserva.client.phone,
```

**In `filterReservas`** (lines 61-66), update:

```javascript
const filtered = reservas.filter(r =>
  r.client.name.toLowerCase().includes(term) ||
  r.client.email.toLowerCase().includes(term) ||
  r.client.phone.includes(term)
)
```

### Step 4.9: Update `app/admin/dashboard/page.jsx`

If the dashboard displays upcoming reservations with client names, update to use `reservation.client.name` etc.

### Step 4.10: Update `app/api/admin/clients/route.js`

Include reservation count for each client:

```javascript
const clients = await prisma.client.findMany({
  orderBy: { createdAt: 'desc' },
  include: {
    _count: {
      select: { reservations: true }
    }
  }
})
```

### Step 4.11: Update `app/admin/clientes/page.jsx`

Show reservation count per client in the table. Add a column "Reservas" showing `cliente._count.reservations`.

---

## Phase 5: Extract shared auth helper

The `verifyAdmin()` function is duplicated across 3+ API route files with the same code. Extract it.

### Step 5.1: Create `lib/auth.js`

```javascript
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function verifyAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')

  if (!token) return null

  try {
    return jwt.verify(token.value, JWT_SECRET)
  } catch {
    return null
  }
}
```

### Step 5.2: Replace all inline `verifyAdmin` definitions

Update these files to import from `@/lib/auth`:

- `app/api/admin/reservations/route.js` — remove local `verifyAdmin` + JWT import + JWT_SECRET constant
- `app/api/admin/reservations/[id]/route.js` — same
- `app/api/admin/clients/route.js` — remove inline JWT check, use `verifyAdmin()`
- `app/api/admin/metrics/route.js` — remove inline JWT check, use `verifyAdmin()`
- `app/api/calendar/route.js` — use `verifyAdmin()` in POST (added in Phase 2)
- `app/api/admin/migrate-statuses/route.js` — use `verifyAdmin()` (added in Phase 1)

Each file changes from:

```javascript
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

async function verifyAdmin() { ... }
```

To:

```javascript
import { verifyAdmin } from '@/lib/auth'
```

For files that had inline JWT verification (clients, metrics), change from the full JWT check block to:

```javascript
const admin = await verifyAdmin()
if (!admin) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

---

## Verification checklist

After completing all phases, verify:

1. `npm run build` succeeds with no errors
2. Search the codebase:
   - No occurrences of `'reservado'` or `'disponible'` as Day status strings (only Reservation statuses like `señado`/`pagado`/`cancelado` remain as Spanish strings)
   - No references to `/api/auth/` in any non-deleted file
   - No imports from deleted files
3. The following routes should NO LONGER exist:
   - `/api/auth/login`
   - `/api/auth/logout`
   - `/api/auth/me`
   - `/api/auth/register`
   - `/api/admin/check`
   - `/api/test-env`
   - `/login`
   - `/registro`
4. The following routes should still work:
   - `GET /api/calendar` — public, returns calendar data
   - `POST /api/calendar` — admin only, updates day status
   - `POST /api/admin/login` — admin login
   - `POST /api/admin/logout` — admin logout
   - `GET /api/admin/me` — admin session check
   - `GET/POST /api/admin/reservations` — admin CRUD
   - `PUT/DELETE /api/admin/reservations/[id]` — admin CRUD
   - `GET /api/admin/clients` — client list with reservation count
   - `GET /api/admin/metrics` — dashboard metrics
5. Navbar shows only navigation links, no auth UI
6. `User` model is removed from schema

---

## Files changed summary

| File | Action |
|------|--------|
| `app/api/admin/reservations/route.js` | Fix status strings, link to Client via clientId |
| `app/api/admin/reservations/[id]/route.js` | Fix status strings, link to Client via clientId |
| `app/api/admin/metrics/route.js` | Fix status strings, include client in queries |
| `app/api/calendar/route.js` | Add admin auth to POST |
| `app/api/admin/clients/route.js` | Include reservation count, use shared auth |
| `app/api/admin/migrate-statuses/route.js` | NEW — one-time migration |
| `components/Navbar.jsx` | Remove auth UI |
| `prisma/schema.prisma` | Remove User, enrich Client, link Reservation→Client |
| `app/admin/reservas/page.jsx` | Use `reserva.client.*` instead of `reserva.clientName` etc |
| `app/admin/clientes/page.jsx` | Show reservation count per client |
| `app/admin/dashboard/page.jsx` | Use `reservation.client.*` if showing client names |
| `lib/auth.js` | NEW — shared verifyAdmin helper |
| `app/api/auth/*` | DELETE all files |
| `app/login/page.jsx` | DELETE |
| `app/registro/page.jsx` | DELETE |
| `app/api/admin/check/route.js` | DELETE |
| `app/api/test-env/route.js` | DELETE |

---

## Execution order

1. Phase 1 (status strings) — can be done independently
2. Phase 2 (calendar auth) — can be done independently
3. Phase 3 (dead code removal) — can be done independently
4. Phase 5 (shared auth helper) — do AFTER phases 2 and 3, BEFORE phase 4
5. Phase 4 (Client-Reservation link) — do LAST, depends on all previous phases

Run `npm run build` after each phase to catch errors early.
