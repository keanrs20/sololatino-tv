# SoloLatino TV

App para Samsung Smart TV (Tizen) basada en [SoloLatino.net](https://sololatino.net): películas, series, animes y doramas.

## Instalación con TizenBrew

1. Instala [TizenBrew](https://github.com/reisxd/TizenBrew) en tu Samsung Smart TV (requiere modo desarrollador).
2. Abre **Module Manager** dentro de TizenBrew.
3. Selecciona **"Add GitHub module"** y escribe:

   ```
   keanrs20/sololatino-tv
   ```

4. El módulo aparecerá como **SoloLatino TV**. Ábrelo con Enter/OK.

> El repo debe permanecer **público** (TizenBrew lo sirve vía jsDelivr).

## Controles

| Botón | Acción |
|---|---|
| Flechas / D-pad | Navegar |
| OK / Enter | Seleccionar |
| Rojo (Back) | Cerrar reproductor / modal / volver |
| Media keys | Reproductores HTML5 |

## Notas técnicas

- Es un módulo de tipo `app` para TizenBrew: se sirve en `http://127.0.0.1:8081/module/keanrs20/sololatino-tv/index.html`.
- El contenido se carga directamente desde sololatino.net (con fallbacks por proxy CORS).
