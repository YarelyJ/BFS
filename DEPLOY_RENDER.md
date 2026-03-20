# Despliegue en Render y Vercel

## Backend en Render

### Paso 1: Preparar el Repositorio

Sube tu proyecto a GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/puzzle-bfs.git
git push -u origin main
```

### Paso 2: Conectar en Render

1. Abre [render.com](https://render.com) y crea una cuenta
2. Haz clic en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio `puzzle-bfs`

### Paso 3: Configurar el Backend

**Rellena los campos así:**

| Campo | Valor |
|-------|-------|
| **Name** | `puzzle-bfs-backend` |
| **Environment** | `Docker` |
| **Region** | `Ohio` (o tu preferencia) |
| **Branch** | `main` |
| **Root Directory** | `backend` |

### Paso 4: Variables de Entorno (opcional)

En Render, ve a **Environment** (si necesitas variables):

```
PYTHON_VERSION = 3.11
```

### Paso 5: Desplegar

Haz clic en **"Deploy"** 

**Espera 3-5 minutos.** Tu backend estará disponible en:
```
https://puzzle-bfs-backend.onrender.com
```

---

## Frontend en Vercel

### Paso 1: Conectar GitHub en Vercel

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta
2. Haz clic en **"Add New..."** → **"Project"**
3. Importa tu repositorio `puzzle-bfs`

### Paso 2: Configurar el Frontend

**Rellena los campos así:**

| Campo | Valor |
|-------|-------|
| **Project Name** | `puzzle-bfs-frontend` |
| **Framework Preset** | `Next.js` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` |

### Paso 3: Variables de Entorno

En **Environment Variables**, agrega:

```
NEXT_PUBLIC_API_URL = https://puzzle-bfs-backend.onrender.com
```

**Nota:** Si no pones esta variable, el frontend funciona con cálculo local.

### Paso 4: Desplegar

Haz clic en **"Deploy"**

**Espera 2-3 minutos.** Tu frontend estará disponible en:
```
https://puzzle-bfs-frontend.vercel.app
```

---

## Verificar la Conexión

### Test del Backend

En tu navegador, abre:
```
https://puzzle-bfs-backend.onrender.com/health
```

Deberías ver:
```json
{
  "status": "ok",
  "servicio": "Puzzle Lineal BFS API"
}
```

### Test del Frontend

Abre:
```
https://puzzle-bfs-frontend.vercel.app
```

Si ingresaste la variable `NEXT_PUBLIC_API_URL`, verás un indicador verde que dice "Datos en tiempo real desde la API".

Si no, verás "Cálculo local" (funciona igual de bien).

---

## Despliegues Posteriores

Cualquier push a `main` en GitHub desplegará automáticamente:
- **Backend en Render**
- **Frontend en Vercel**

---

## Solución de Problemas

### El frontend no se conecta al backend

1. Verifica que `NEXT_PUBLIC_API_URL` está en Vercel (Settings → Environment Variables)
2. Verifica que el backend en Render está corriendo (visita la URL del health check)
3. Reconstruye el frontend en Vercel después de agregar la variable

### El backend falla al iniciar

1. En Render, abre **Logs** para ver el error
2. Verifica que `requirements.txt` tiene todas las dependencias
3. Asegúrate de que el Dockerfile está en `backend/Dockerfile`

### Pasos muy lentos

Es normal en los primeros despliegues (Render inicia máquinas virtuales). Después será más rápido.

---

## Estadísticas de Costo

| Servicio | Precio |
|----------|--------|
| **Render Web Service** | Gratis (3 meses), luego $12/mes |
| **Vercel Frontend** | Gratis para siempre |
| **Total** | Gratis o $12/mes |

**Tip:** Usa el Free Tier de Render para proyectos personales.
