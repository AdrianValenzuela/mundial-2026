# ⚽ Álbum Mundial 2026 — Mi colección

Tracker del álbum **Panini FIFA World Cup 26™** (980 cromos) para llevar el registro de los cromos que tengo, los que me faltan y los repetidos, con % de completado.

**App:** https://adrianvalenzuela.github.io/mundial-2026/

## Estructura del álbum

- `00` — Logo Panini (foil)
- `FWC 1–19` — Especiales: emblema, mascotas, sedes y Museo FIFA (campeones 1930–2022)
- **48 selecciones × 20 cromos** (`MEX 1–20`, `ARG 1–20`, …), ordenadas por grupos A–L
  - Cromo 1: escudo (foil) · Cromo 13: foto del equipo · Resto: jugadores

## Uso

- **Toca un cromo** para sumar (+1). Los repetidos se marcan con ×2, ×3…
- **Mantén pulsado** (móvil) o **clic derecho** (PC) para restar.
- Filtros: **Todos / Faltan / Repes** y buscador de selecciones.
- **Listas para intercambios**: genera y copia la lista de faltas y de repes.
- **Respaldo**: exporta/importa tu progreso como JSON.

## Progreso público

El progreso del dueño se publica en `progress.json` (en este repo) y **cualquier visitante lo ve en modo solo lectura**.

- **Visitantes**: abren la web y ven la colección tal cual va, sin poder editarla.
- **Dueño**: pulsa 🔑 en la cabecera y conecta un token *fine-grained* de GitHub
  (permiso **Contents: Read and write** solo sobre este repo). El token se guarda
  únicamente en ese navegador; cada cambio se publica automáticamente (con indicador
  ☁️ Guardado / Guardando…). Al abrir la app se carga la versión más reciente
  (local o publicada), así que se puede editar desde varios dispositivos conectados.

## Desarrollo

HTML + CSS + JavaScript sin dependencias. Para probar en local:

```
python -m http.server 8123
# http://localhost:8123
```
