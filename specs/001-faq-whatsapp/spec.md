# Feature Specification: Seccion FAQ con CTA a WhatsApp

**Feature Branch**: `001-faq-whatsapp`

**Created**: 2026-05-19

**Status**: Draft

**Input**: User description: "Agregar una seccion de preguntas frecuentes con acordeon y boton a WhatsApp"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Resolver dudas frecuentes (Priority: P1)

Como visitante del sitio, quiero revisar preguntas frecuentes sobre la atencion
para entender el servicio sin salir de la landing.

**Why this priority**: Reduce friccion antes del contacto y resolver dudas
basicas en la misma pagina agrega valor inmediato aun sin cambios al backend.

**Independent Test**: Puede probarse cargando la landing, desplazandose a la
seccion FAQ y abriendo/cerrando cada pregunta para confirmar que el contenido es
visible, comprensible y navegable sin afectar otras secciones.

**Acceptance Scenarios**:

1. **Given** que un visitante llega a la landing, **When** abre la seccion FAQ,
   **Then** ve una lista clara de preguntas relacionadas con atencion,
   valoracion y proceso de contacto.
2. **Given** que un visitante selecciona una pregunta, **When** activa su
   control, **Then** la respuesta asociada se expande y su estado visible queda
   claro.
3. **Given** que una respuesta esta abierta, **When** el visitante vuelve a
   activar el mismo control, **Then** la respuesta se colapsa sin recargar la
   pagina.

---

### User Story 2 - Contactar por WhatsApp desde la FAQ (Priority: P2)

Como visitante que aun tiene dudas despues de leer la FAQ, quiero abrir
WhatsApp desde esa misma seccion para pedir ayuda sin tener que buscar otro
canal.

**Why this priority**: La FAQ resuelve dudas comunes, pero el siguiente paso
natural es convertir la intencion en contacto directo sin romper el flujo.

**Independent Test**: Puede probarse configurando un numero valido de WhatsApp,
viendo la CTA dentro de la FAQ y confirmando que abre el destino correcto con un
mensaje base util.

**Acceptance Scenarios**:

1. **Given** que el sitio tiene numero de WhatsApp configurado, **When** el
   visitante pulsa la CTA de la FAQ, **Then** se abre WhatsApp en una nueva
   pestana o aplicacion con un mensaje precargado.
2. **Given** que el numero de WhatsApp no esta configurado, **When** el
   visitante llega a la FAQ, **Then** la CTA no se muestra y no aparece un
   enlace roto.

---

### User Story 3 - Mantener el contenido sin tocar flujos sensibles (Priority: P3)

Como editora del sitio, quiero actualizar preguntas, respuestas y copy de la CTA
en un punto claro del proyecto para mantener la informacion vigente sin tocar
logica sensible de formularios o webhooks.

**Why this priority**: Mantener el contenido sencillo de editar reduce errores y
evita mezclar cambios editoriales con integraciones operativas.

**Independent Test**: Puede probarse actualizando una pregunta, una respuesta y
el texto de la CTA en la fuente definida para el contenido, luego validando que
la landing refleja esos cambios sin romper la agenda ni los enlaces existentes.

**Acceptance Scenarios**:

1. **Given** que una editora modifica el contenido FAQ en la ubicacion
   documentada, **When** vuelve a cargar la landing, **Then** la nueva redaccion
   aparece en la seccion correcta.
2. **Given** que la editora solo cambia el contenido FAQ, **When** el sitio se
   valida, **Then** los flujos de agenda, branding y enlaces de WhatsApp
   existentes siguen funcionando.

---

### Edge Cases

- Que ocurre si una pregunta o respuesta supera la longitud visual esperada en
  movil?
- Como se comporta la CTA si falta el numero de WhatsApp o el mensaje base
  configurado?
- Que ocurre si el usuario navega con teclado o lector de pantalla y abre varias
  preguntas en la misma sesion?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render a dedicated FAQ section within the landing
  page with a visible title and introductory copy.
- **FR-002**: The system MUST present multiple FAQ items composed of a question
  and its corresponding answer.
- **FR-003**: Users MUST be able to expand and collapse each FAQ answer from an
  explicit interactive control.
- **FR-004**: The FAQ interaction MUST expose its current expanded or collapsed
  state to keyboard and assistive-technology users.
- **FR-005**: The system MUST display a WhatsApp call to action inside or
  immediately after the FAQ section when a valid WhatsApp destination is
  configured.
- **FR-006**: The system MUST hide or disable the FAQ WhatsApp call to action
  when no valid WhatsApp destination can be generated, without leaving broken
  links in the interface.
- **FR-007**: The FAQ content and CTA copy MUST be maintainable in a clearly
  documented content source without editing webhook or secret-handling code.
- **FR-008**: The system MUST preserve the existing appointment form, external
  booking flow, and current WhatsApp links outside the FAQ section.

### Key Entities *(include if feature involves data)*

- **FAQ Item**: Represents one frequently asked question with its visible prompt,
  answer text, display order, and interaction state.
- **FAQ CTA**: Represents the contact prompt shown with the FAQ, including its
  label, helper copy, and resolved WhatsApp destination when available.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can open and close any FAQ item in one
  interaction on desktop and mobile.
- **SC-002**: In manual validation, 100% of FAQ CTA clicks with a configured
  WhatsApp number open the intended destination without broken links.
- **SC-003**: When WhatsApp contact is not configured, the FAQ section shows no
  dead CTA and produces no validation errors related to the missing link.
- **SC-004**: A content editor can update at least one FAQ item and the FAQ CTA
  copy in under 10 minutes using the documented project files.

## Assumptions

- La primera version incluira preguntas frecuentes editoriales sobre proceso de
  atencion, valoracion, ubicacion o modalidad de contacto, no un sistema de
  soporte dinamico.
- El contenido seguira estando en espanol y se gestionara dentro del codigo del
  sitio, no desde un CMS externo.
- El numero y mensaje base de WhatsApp seguiran dependiendo de la configuracion
  publica ya existente en el proyecto.
- La feature debe respetar la arquitectura actual del frontend modular y no
  introducir nuevas dependencias para una interaccion simple.
