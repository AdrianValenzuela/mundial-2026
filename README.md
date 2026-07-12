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
- **Respaldo**: exporta/importa tu progreso como JSON (útil para cambiar de dispositivo).

El progreso se guarda automáticamente en el navegador (`localStorage`). No requiere servidor ni cuenta.

## Desarrollo

HTML + CSS + JavaScript sin dependencias. Para probar en local:

```
python -m http.server 8123
# http://localhost:8123
```
