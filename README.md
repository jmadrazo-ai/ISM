# Inmobiliaria San Miguel

Plataforma estática de Inmobiliaria San Miguel (San Miguel de Allende, Gto.): sitio público para compradores y área de manejo para el equipo. HTML, CSS y JavaScript puros; no hay nada que compilar ni instalar.

**Estado: prototipo.** Precios, estatus de unidades, tiempos y el historial del área de manejo son datos de ejemplo. Antes de anunciar o enviar tráfico hay que cargar el inventario real y pasar la revisión legal.

## Qué contiene

| Ruta | Qué es |
|---|---|
| `index.html` | Inicio: buscador, desarrollos, línea de tiempo de compra |
| `propiedades.html` | Buscador con filtros, favoritos y comparador |
| `propiedad.html?id=…` | Ficha de cada propiedad |
| `desarrollos/punta-del-cielo.html` | Punta del Cielo: modelos, planos y unidades |
| `desarrollos/terraviva.html` | Terraviva Picachos: plano de lotificación interactivo |
| `san-miguel.html` | Guía "Vivir en San Miguel" |
| `creditos.html` | Créditos de fotografía |
| `admin/` | Área de manejo: conversión, prospectos, inventario, demanda |
| `js/data.js` | Inventario y contenido. Cada dato está marcado VERIFICADO o EJEMPLO |
| `js/store.js` | Capa de datos (hoy guarda en el navegador de cada visitante) |
| `css/base.css` | Sistema de diseño: colores, tipografías y proporciones |

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub y sube el contenido de esta carpeta (los archivos deben quedar en la raíz del repositorio, no dentro de una subcarpeta).
2. En el repositorio: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. En uno o dos minutos el sitio queda en `https://<usuario>.github.io/<repositorio>/`.

Todas las rutas son relativas, así que funciona igual en esa subcarpeta que en un dominio propio. El archivo `.nojekyll` evita que GitHub procese el sitio.

## Verlo en tu computadora

```bash
python3 -m http.server 5199
```

y abre `http://localhost:5199`. Hace falta un servidor (no sirve abrir el archivo con doble clic) porque el sitio usa módulos de JavaScript.

## Antes de publicarlo en serio

- **El área de manejo no tiene contraseña.** En GitHub Pages cualquiera que conozca la liga `/admin/` puede abrirla. Hoy solo muestra datos de ejemplo guardados en el navegador de quien la abre, pero no debe usarse con datos reales sin acceso protegido.
- **Los prospectos no llegan a nadie.** El formulario de contacto guarda en el navegador del visitante. Para recibirlos hace falta conectar una base de datos o un servicio de formularios.
- **Datos de ejemplo a la vista.** Los precios publicados no son los reales salvo donde `js/data.js` dice VERIFICADO.
- **Fotos de la ciudad:** están enlazadas a Unsplash, no copiadas. Conviene alojar copias propias.
- **Buscadores:** `robots.txt`, `sitemap.xml` y las ligas canónicas apuntan a `www.inmobiliariasanmiguel.mx`, un dominio de ejemplo. Hay que cambiarlo por el dominio definitivo.
- **GitHub Pages en plan gratuito exige repositorio público:** el código y este archivo quedan visibles para cualquiera.
