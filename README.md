# Regla de Vida PWA

Pack completo para publicar la aplicación en GitHub Pages e instalarla en un teléfono.

## Versión 2.0

- Nuevo icono sencillo: una brújula moderna que orienta la vida hacia el bien, en petróleo, marfil y verde agua.
- Recuperación segura si el almacenamiento local contiene datos dañados.
- Navegación y paneles más accesibles mediante teclado y lectores de pantalla.
- Actualización más fiable de la aplicación instalada, conservando el funcionamiento sin conexión.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube todos los archivos de esta carpeta a la raíz del repositorio, manteniendo exactamente sus nombres.
3. En GitHub abre **Settings**, después **Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Elige la rama `main` y la carpeta `/ (root)`, y guarda.
6. Abre la dirección que GitHub mostrará cuando termine la publicación.

La instalación como app solo funciona desde una dirección HTTPS, como la proporcionada por GitHub Pages. No se activa al abrir `index.html` directamente desde una carpeta del teléfono.

## Instalar en Android

1. Abre la página publicada con Chrome.
2. Pulsa **Instalar en este teléfono** dentro de la app, o abre el menú de Chrome y elige **Instalar aplicación**.

## Instalar en iPhone o iPad

1. Abre la página publicada con Safari.
2. Pulsa el botón **Compartir**.
3. Elige **Añadir a pantalla de inicio**.

## Datos personales

El frente actual, el arma, la pregunta y las revisiones se guardan únicamente en el navegador del dispositivo mediante almacenamiento local. No se envían a ningún servidor.

## Actualizaciones

Cuando cambies los archivos publicados, aumenta el número de la constante `CACHE` en `service-worker.js`, por ejemplo de `regla-de-vida-v1` a `regla-de-vida-v2`. Así los teléfonos instalados descargarán la nueva versión.
