# SaludNeurofuncional

Landing page base para una fisioterapeuta o terapeuta física con:

- Secciones informativas sobre enfoque, servicios y proceso de atención.
- Formulario para agendar citas.
- Apertura del evento en Google Calendar.
- Descarga de respaldo `.ics`.

## Archivos principales

- `index.html`
- `styles.css`
- `script.js`

## Uso rápido

Abre `index.html` en el navegador o sirve esta carpeta con cualquier servidor estático.

## Validación local

Con Node 20 o superior:

```bash
node scripts/validate-repo.mjs
```

También puedes usar:

```bash
npm run validate
```

## Automatización en GitHub

Se agregaron workflows en `.github/workflows/` para:

- Validar la estructura básica del repo y revisar patrones comunes de secretos.
- Ejecutar Gitleaks en `push`, `pull_request` y una corrida semanal.
- Ejecutar CodeQL sobre JavaScript y workflows de GitHub Actions.

Si quieres que estos checks sean obligatorios antes de mergear a `main`, activa una ruleset o branch protection rule en GitHub y marca como requeridos:

- `Repository Validation`
- `Secret Scan`
- `CodeQL / Analyze (javascript-typescript)`
- `CodeQL / Analyze (actions)`

## Siguiente mejora recomendada

Si quieres que la cita se guarde automáticamente en el calendario real del profesional, el siguiente paso es integrar un backend con Google Calendar API o una herramienta de reservas como Cal.com o Calendly.
