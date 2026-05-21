# Data Model: FAQ + WhatsApp CTA

## FAQSectionConfig

Represents the public configuration block for the FAQ section.

**Fields**:
- `eyebrow`: Short label shown above the FAQ title
- `title`: Main section heading
- `intro`: Supporting explanatory copy
- `ctaLabel`: Visible CTA text for WhatsApp contact
- `ctaHelper`: Optional helper text placed near the CTA
- `items`: Ordered list of FAQ items

**Validation Rules**:
- Text fields should be non-empty strings when the FAQ is enabled.
- `items` should contain at least one valid FAQ item for the section to render.
- CTA text may be present even when WhatsApp is disabled; the CTA remains hidden
  unless a valid destination can be resolved.

## FAQItem

Represents one question-and-answer pair shown in the accordion.

**Fields**:
- `id`: Stable identifier for DOM attributes and interaction state
- `question`: User-facing question text
- `answer`: User-facing answer text
- `order`: Display order in the rendered list

**Validation Rules**:
- `id` must be unique within the FAQ list.
- `question` and `answer` must be non-empty strings.
- Order must remain deterministic so keyboard navigation and content review are
  predictable.

## FAQInteractionState

Represents the runtime state of an FAQ item in the browser.

**States**:
- `collapsed`: Answer is hidden and control reports a collapsed state
- `expanded`: Answer is visible and control reports an expanded state

**Transitions**:
- `collapsed -> expanded`: User activates the item's control by click, tap, or keyboard
- `expanded -> collapsed`: User activates the same control again

**Rules**:
- Each item must expose its expanded/collapsed state to assistive technologies.
- Multiple items may remain expanded simultaneously unless the implementation
  deliberately constrains the behavior during delivery.
