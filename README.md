# SaludNeurofuncional

Landing page base para una fisioterapeuta o terapeuta fisica con:

- Secciones informativas sobre enfoque, servicios y proceso de atencion.
- Formulario local que abre Google Calendar y genera un respaldo `.ics`.
- Configuracion publica para migrar despues a una agenda externa.
- Base lista para publicar en Cloudflare Pages.

## Archivos principales

- `index.html`
- `styles.css`
- `script.js`
- `site-config.js`
- `wrangler.jsonc`
- `DEPLOYMENT.md`

## Uso rapido

Para ver la landing localmente, abre `index.html` o sirve la carpeta con cualquier servidor estatico.

## Configuracion del sitio

Edita `site-config.js` para personalizar:

- nombre y marca
- direccion o texto del consultorio
- numero de WhatsApp
- modo de agenda

Modos de agenda soportados:

- `form`: deja el formulario actual y genera evento de Google Calendar en el navegador
- `external`: oculta el formulario y abre una agenda externa como Cal.com o Calendly

## Build para Cloudflare Pages

Genera la carpeta lista para desplegar:

```bash
npm run build
```

Salida:

- `dist/index.html`
- `dist/styles.css`
- `dist/script.js`
- `dist/site-config.js`
- `dist/_headers`

## Publicacion

El flujo recomendado de despliegue esta en [DEPLOYMENT.md](C:/Users/ramon/Documents/EdisonPage/SaludNeurofuncional/DEPLOYMENT.md).

Resumen corto:

```bash
npx wrangler login
npx wrangler pages project create salud-neurofuncional --production-branch main
npm run build
npx wrangler pages deploy dist
```

## Validacion local

Con Node 20 o superior:

```bash
node scripts/validate-repo.mjs
```

O con:

```bash
npm run validate
```

La validacion ahora tambien confirma que el build a `dist/` funcione.

## Automatizacion en GitHub

Se agregaron workflows en `.github/workflows/` para:

- Validar estructura del repo y build local.
- Escanear secretos con Gitleaks.
- Ejecutar CodeQL sobre JavaScript y workflows.

Si quieres bloquear merges a `main`, marca como requeridos:

- `Repository Validation`
- `Secret Scan`
- `CodeQL / Analyze (javascript-typescript)`
- `CodeQL / Analyze (actions)`

## Siguiente paso recomendado

1. Publicar la landing en Cloudflare Pages.
2. Configurar dominio y SSL.
3. Cambiar `site-config.js` a modo `external` cuando tengas la URL de Cal.com o Calendly.
4. Conectar despues el webhook de reservas con WhatsApp oficial.
