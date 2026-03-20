# Desplegar Frontend en Vercel

## Opción 1: Desde v0 (Recomendado)

Si estás en v0.app:

1. Haz clic en el botón **"Publish"** (esquina superior derecha)
2. Vercel desplegará automáticamente desde `frontend/`
3. Tu app estará en: `https://puzzle-bfs-frontend.vercel.app`

---

## Opción 2: Desde Vercel Dashboard

### Paso 1: Conectar GitHub

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en **"Add New"** → **"Project"**
3. Autoriza Vercel a acceder a GitHub
4. Selecciona el repositorio `puzzle-bfs`

### Paso 2: Configuración

Vercel detectará automáticamente Next.js, pero verifica:

| Campo | Valor |
|-------|-------|
| **Project Name** | `puzzle-bfs-frontend` |
| **Framework** | `Next.js` |
| **Root Directory** | `frontend` |
| **Environment** | Deja en blanco (usaremos default) |

### Paso 3: Agregar Variable de Entorno

Antes de desplegar, agrega la variable:

1. En Vercel Dashboard → **Settings** → **Environment Variables**
2. Agrega:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://puzzle-bfs-backend.onrender.com` (o tu URL de Render)
   - **Environments:** `Production`, `Preview`, `Development`

### Paso 4: Desplegar

Haz clic en **"Deploy"**

Espera 1-2 minutos. Tu frontend estará en:
```
https://puzzle-bfs-frontend.vercel.app
```

---

## Vercel + Render (Recomendado)

Este es el setup ideal:

```
┌─────────────────────────────────────┐
│   Vercel (Frontend - Gratis)       │
│   https://puzzle-bfs.vercel.app    │
└────────────────┬────────────────────┘
                 │ NEXT_PUBLIC_API_URL
                 ↓
┌─────────────────────────────────────┐
│  Render (Backend - $12/mes)         │
│  https://puzzle-bfs.onrender.com   │
└─────────────────────────────────────┘
```

**Ventajas:**
- ✅ Frontend gratis en Vercel
- ✅ Backend en Render (affordable)
- ✅ Despliegues automáticos con Git
- ✅ CDN global en el frontend
- ✅ Escala automáticamente

---

## Despliegues Automáticos

Una vez conectado a GitHub:
- Cualquier push a `main` despliega automáticamente
- Puedes ver el estado en Vercel Dashboard
- Los logs están disponibles para debugging

---

## Solución de Problemas

### El build falla

Verifica en **Deployments** → **Build Logs**:
- ¿Faltan dependencias en `package.json`?
- ¿El `.env.example` está correcto?

### Errores en la aplicación

1. Abre **Settings** → **Function Logs**
2. Verifica si hay errores de conexión al backend
3. Asegúrate que `NEXT_PUBLIC_API_URL` es correcta

### Variables de entorno no se aplican

1. Agrega las variables en **Settings** → **Environment Variables**
2. Haz un nuevo deploy manualmente o fuerza un rebuild
3. Las variables están disponibles solo para nuevos deploys

---

## Dominios Personalizados

Para usar tu propio dominio en Vercel:

1. **Settings** → **Domains**
2. Agrega tu dominio
3. Configura DNS con tu registrador

Ejemplo: `puzzle-bfs.tudominio.com`
