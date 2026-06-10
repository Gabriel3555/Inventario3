# 🚀 Cómo iniciar el Sistema de Inventario en Windows (paso a paso)

Esta guía está pensada para alguien que **nunca ha usado Docker**. Solo sigue los pasos en orden.

---

## ¿Qué vamos a hacer?

El proyecto tiene 3 partes que se inician solas con un único comando:

| Parte | Qué es | Puerto |
|---|---|---|
| Frontend | La página web que usas en el navegador | 2200 |
| Backend | El servidor que procesa los datos | 6000 |
| MySQL | La base de datos | 3000 |

Tú solo necesitas usar el navegador en el puerto **2200**. Lo demás funciona solo.

---

## Paso 1: Instalar Docker Desktop

1. Entra a <https://www.docker.com/products/docker-desktop/>
2. Haz clic en **Download for Windows** y descarga el instalador.
3. Abre el archivo descargado (`Docker Desktop Installer.exe`) y dale **siguiente** a todo.
   - Si te pregunta por **WSL 2**, deja la casilla marcada (es lo recomendado).
4. Al terminar, **reinicia la computadora** (importante).
5. Después de reiniciar, abre **Docker Desktop** desde el menú de inicio.
   - La primera vez puede pedirte aceptar términos y crear cuenta: puedes saltarte la cuenta (botón "Skip" o "Continuar sin iniciar sesión").
6. Espera a que en la esquina inferior izquierda de Docker Desktop aparezca el ícono de la ballena en **verde** (dice "Engine running"). Eso significa que está listo.

> ⚠️ **Docker Desktop debe estar abierto y en verde** cada vez que quieras usar el sistema. Si está cerrado, nada va a funcionar.

---

## Paso 2: Tener el proyecto en tu computadora

Si te pasaron el proyecto en un ZIP, descomprímelo en un lugar fácil de encontrar, por ejemplo:

```
C:\Proyectos\Inventario-Emiliani
```

Dentro de esa carpeta debe estar el archivo `docker-compose.yml` (junto a las carpetas `backend` y `frontend`). Si no lo ves, estás en la carpeta equivocada.

---

## Paso 3: Abrir una terminal en la carpeta del proyecto

La forma más fácil:

1. Abre la carpeta del proyecto en el **Explorador de archivos**.
2. Haz clic en la barra de dirección (donde aparece la ruta), escribe `cmd` y presiona **Enter**.
3. Se abre una ventana negra (la terminal) ya ubicada en la carpeta correcta.

---

## Paso 4: Iniciar todo el sistema

En la terminal, escribe este comando y presiona **Enter**:

```
docker compose up -d --build
```

¿Qué hace? Descarga lo necesario, construye el proyecto y lo deja corriendo en segundo plano.

- ⏳ **La primera vez tarda entre 5 y 15 minutos** (descarga muchas cosas). Las siguientes veces es mucho más rápido.
- Verás muchas líneas de texto: es normal. Al final debe decir algo como:

```
 ✔ Container inventario-mysql     Healthy
 ✔ Container inventario-backend   Started
 ✔ Container inventario-frontend  Started
```

Después de eso, **espera 1 minuto más** (el backend tarda un poco en arrancar internamente).

---

## Paso 5: Usar el sistema

1. Abre tu navegador (Chrome, Edge, etc.).
2. Entra a: **<http://localhost:2200>**
3. La primera vez no hay usuarios: haz clic en **Registrarse**, crea tu cuenta con rol **Administrador** y listo.

> 💡 El **primer usuario** que se registra puede ser Administrador. Después, las demás cuentas se crean desde el módulo de Usuarios (solo el admin puede).

---

## ⚠️ Importante: los datos se borran al reiniciar

El sistema está configurado en modo **`create-drop`**: cada vez que se apaga el backend, **la base de datos se borra y se crea limpia de nuevo**.

Esto es a propósito, para evitar problemas con tablas viejas o datos corruptos. Pero ten en cuenta:

- Cada vez que reinicies con `docker compose down` / `up`, tendrás que **registrar el usuario de nuevo** y los productos/ventas desaparecen.
- Si algún día quieres que los datos **se conserven**, abre el archivo `docker-compose.yml` y cambia esta línea:

```yaml
SPRING_JPA_HIBERNATE_DDL_AUTO: create-drop
```

por:

```yaml
SPRING_JPA_HIBERNATE_DDL_AUTO: update
```

y reinicia (Paso 7 y luego Paso 4).

---

## Paso 6: Ver si todo está corriendo (opcional)

```
docker compose ps
```

Debes ver 3 contenedores con estado `Up` / `running`:
`inventario-mysql`, `inventario-backend`, `inventario-frontend`.

Para ver los mensajes internos del backend (útil si algo falla):

```
docker compose logs backend
```

---

## Paso 7: Apagar el sistema

Cuando termines de usarlo:

```
docker compose down
```

Para volver a encenderlo otro día: abre Docker Desktop, espera el verde, y repite el **Paso 4** (ya no tardará tanto).

---

## 🔧 Problemas comunes y soluciones

### "error during connect" o "cannot connect to the Docker daemon"
Docker Desktop no está abierto. Ábrelo, espera a que la ballena esté en verde y vuelve a intentar.

### "port is already allocated" (puerto ocupado)
Otro programa está usando el puerto 2200, 6000 o 3000. Soluciones:
- Cierra el otro programa, **o**
- Edita `docker-compose.yml` y cambia el número de la **izquierda** del puerto. Por ejemplo, cambiar `"2200:80"` por `"2300:80"` y entonces entrarías por `http://localhost:2300`.

### La página carga pero dice "Error al cargar" o no deja iniciar sesión
El backend todavía está arrancando. Espera 1–2 minutos y recarga la página (F5). Si sigue igual, revisa los logs: `docker compose logs backend`.

### Hice cambios al código y no se reflejan
Hay que reconstruir:

```
docker compose down
docker compose up -d --build
```

### Quiero borrar TODO y empezar de cero (incluida la base de datos)

```
docker compose down -v
docker compose up -d --build
```

(la `-v` borra también el volumen de la base de datos)

### ¿Errores de CORS?
No deberías ver ninguno: la página se comunica con el backend a través del mismo origen (nginx hace de intermediario) y, además, el backend acepta peticiones desde cualquier origen. Si en la consola del navegador (F12) aparece algo de "CORS", casi seguro el backend está caído o arrancando: revisa `docker compose ps` y los logs.

---

## Resumen rápido (chuleta)

| Acción | Comando |
|---|---|
| Encender todo | `docker compose up -d --build` |
| Ver estado | `docker compose ps` |
| Ver logs del backend | `docker compose logs backend` |
| Apagar | `docker compose down` |
| Borrar todo y empezar de cero | `docker compose down -v` |
| Usar la aplicación | abrir <http://localhost:2200> |
