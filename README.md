# Regla de Vida PWA

Pack completo para publicar la aplicación en GitHub Pages e instalarla en un teléfono.

## Versión 3.0 · Un único camino

La portada acompaña el reto semanal que el usuario propone. Descanso, inicio de la acción, respuesta ante la dificultad y regreso tras una caída son recursos del mismo recorrido.

- Reto editable de siete días desde su creación: propósito, situación, respuesta, mínimo, ayuda y plan para volver.
- Ocho propuestas inspiradas en la tradición ascética, con adaptaciones explícitas y un propósito completamente personal.
- Registro diario opcional: práctica, mínimo, regreso o descanso; notas sin puntos ni rachas.
- Diario semanal ligado al reto y archivo de semanas anteriores. Ajustar un reto conserva sus registros y una copia de su formulación anterior.
- Guía contextual con fuentes católicas, Evagrio, Casiano, Epicteto, Marco Aurelio e investigación de hábitos y autorregulación. Véase [FUENTES.md](FUENTES.md).
- Diseño móvil marfil y verde, brújula vectorial opaca, botones amplios y navegación Hoy / Semana / Diario / Guía.

El programa de siete días es una propuesta editorial, no un tratamiento validado ni una promesa de formar hábitos en una semana. Los retos no diagnostican ni puntúan la vida espiritual.

### Datos y compatibilidad

Se conserva la clave `reglaApp`, incluidos campos desconocidos, el frente anterior y todas las revisiones existentes. Antes de la primera escritura se intenta guardar una copia literal en `reglaApp.before-v3`. No se activa automáticamente un reto a partir del frente antiguo: se ofrece como borrador editable. No se recorta el historial nuevo a 24 entradas. Los campos anteriores con forma inesperada se conservan con prefijo `legacy`.

`camino-data.js` contiene las propuestas y fuentes; `camino.js`, el reto y su persistencia; `camino.css`, la interfaz. La navegación, las herramientas y la instalación reutilizan la base de `index.html`.

### Comprobaciones

`node tests/journey.cjs` usa Playwright en Chrome para verificar datos anteriores, creación, edición, archivo, registros, regreso, reflexión, botón atrás, búsquedas, anchuras de 320 a 900 px y funcionamiento sin conexión. `node scripts/build-icons.cjs` genera los iconos a partir de `icon.svg` con Sharp. Las imágenes de prueba se guardan fuera del control de versiones.

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
