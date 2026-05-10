Antes de descargar este repo, Recuerda a ver descargado primero el backend, para que el frontend se conecte al backend y que funcione muy bien

Paso 1 — Descargá el proyecto

Descarga el proyecto o bajalo en **ZIP**, descomprimilo y en la terminal metete en esa carpeta.


Paso 2 — Dependencias

Usá una **Node LTS estable** reciente (**20 o 22**, `node -v` para chequear) y luego ejecuta el comando
npm install, recuerda esta en la rais del repo cd /boxful-web


Paso 3 — Variables de entorno (este repo, solo frontend)

En la **raíz** del proyecto creá **`.env`** o **`.env.local`** (Next lee ambos; para local suele usarse `.env.local`).

Pegá esto (solo hace falta la URL del API; el backend en local suele ir en **3001** y el frontend en **3000**):

NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api

recuerda puedes cambiar el puerto si gustas desde el backend y aqui en el frontend puedes concetarlo 
Luego de hacer esta minima configuracion, ejecuta

npm run dev y Abrís **http://localhost:3000**.

Resumen rapido

Backend encendido, frontend funcionara muy bien, Descarga el repo, ejecuta npm install, configura el .env y listo ejecuta npm run dev listo


cada cuenta solo ve sus órdenes e historial; no hay modo admin ni datos compartidos entre usuarios en esta entrega.


