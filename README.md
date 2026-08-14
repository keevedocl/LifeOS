# LifeOS

PWA de productividad y gamificación personal.

## V2 incluye

- Dashboard visual estilo plataforma educativa moderna.
- Nombre y apodo personalizables: LifeOS puede llamarte como tú quieras.
- Horario semanal ordenado automáticamente.
- Recordatorios configurables por clase.
- Objetivos con XP.
- Modo Enfoque con XP según duración.
- Rachas, niveles y progreso.
- LifeOS Store con skins/temas, efectos y avatares.
- Rarezas y costos en XP.
- Configuración de notificaciones, resúmenes, animaciones y apariencia.
- Exportación del horario a PDF.
- PWA + Service Worker.
- Todos los archivos están en la raíz para facilitar una subida simple a GitHub.

## Probar localmente

```bash
python3 -m http.server 8000
```

Abre `http://localhost:8000`.

## GitHub Pages

Sube todos los archivos de esta carpeta al repositorio. En Settings > Pages selecciona `Deploy from a branch`, rama `main`, carpeta `/ (root)`.

## Notificaciones

La base de notificaciones web está incluida. Para notificaciones fiables en iPhone incluso cuando la app está cerrada, la siguiente fase debe añadir Web Push y un backend.