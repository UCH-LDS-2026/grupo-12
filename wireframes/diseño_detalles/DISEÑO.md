# Design System: The Structural Blueprint

## 1. Overview & Creative North Star: "Architectural Skeletalism"
This design system is built on the philosophy of **Architectural Skeletalism**. In high-end digital product design, the "low-fidelity" stage is not an excuse for lack of polish—it is an opportunity to define spatial relationships and structural integrity without the distraction of decorative "skin." 

Our Creative North Star is the **Architectural Blueprint**: precise, intentional, and authoritative. We break the "generic wireframe" mold by utilizing extreme typographic scale, intentional asymmetry, and tonal depth. By removing color, we force the user to experience the product through hierarchy, flow, and volume. This system is designed to feel like a high-end editorial draft—raw but sophisticated.

---

## 2. Colors: Tonal Architecture
We move beyond "black and white" into a sophisticated grayscale spectrum. We use a Material Design-inspired logic to define depth and importance through luminosity rather than hue.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. Boundaries must be defined solely through background color shifts.
*   **Action:** To separate a header from a body, transition from `surface` (#f9f9f9) to `surface_container_low` (#f3f3f3). This creates a "soft edge" that feels premium and integrated.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, fine paper sheets.
*   **Lowest Tier:** `surface_container_lowest` (#ffffff) — Reserved for primary interactive cards or floating elements.
*   **Mid Tier:** `surface` (#f9f9f9) — The primary canvas.
*   **High Tier:** `surface_container_highest` (#e2e2e2) — Reserved for "recessed" areas like search bars or footer backgrounds.

### Signature Textures & Gradients
Even in wireframes, "flat" can feel "dead." 
*   **Tonal Gradients:** For primary CTAs, use a subtle vertical gradient from `primary` (#000000) to `primary_container` (#3b3b3b). This adds a "machined" look that signals interactivity without needing color.
*   **Glassmorphism:** Use `surface_container_lowest` with a 70% opacity and a 20px backdrop-blur for floating navigation bars. This allows the structural content to bleed through, maintaining a sense of place.

---

## 3. Typography: The Editorial Voice
Typography is the primary driver of this system. We use **Inter** for its neutral, Swiss-inspired clarity, but we apply it with aggressive scale to create an editorial feel.

*   **Display (lg/md/sm):** Used for "Hero" moments. Use `display-lg` (3.5rem) with tight letter spacing (-0.02em) to create an authoritative impact.
*   **Headlines:** Your structural anchors. `headline-lg` (2rem) defines the start of a new cognitive journey.
*   **Body (lg/md/sm):** The workhorse. `body-md` (0.875rem) is the standard for information density.
*   **Labels:** Use `label-sm` (0.6875rem) in uppercase with +0.05em tracking for secondary metadata or "overlines" above headlines.

**Hierarchy Note:** Always pair a `display` font with a `body-sm` metadata label to create high-contrast "tension" in the layout.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows and borders are replaced by **Tonal Layering**.

*   **The Layering Principle:** To "lift" a component, do not add a shadow. Instead, place a `surface_container_lowest` (#ffffff) card on a `surface_container` (#eeeeee) background. The 10% shift in luminosity is enough to signify depth to the eye.
*   **Ambient Shadows:** If a floating action button (FAB) or modal requires a shadow, it must be "Ambient."
    *   *Spec:* `0px 20px 40px rgba(26, 28, 28, 0.06)`. 
    *   Never use pure black shadows; use a tinted version of `on_surface`.
*   **The "Ghost Border" Fallback:** If a container must sit on a background of the same color, use a 1px border using `outline_variant` (#c6c6c6) at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Refined Primitives

### Buttons
*   **Primary:** Solid `primary` (#000000) with `on_primary` (#e2e2e2) text. Corner radius: `md` (0.375rem).
*   **Secondary:** `surface_container_high` (#e8e8e8) background. No border.
*   **Tertiary:** Ghost style. No background, no border. Underline only on hover/active states.

### Cards & Lists
*   **The "No-Divider" Rule:** Forbid 1px horizontal lines between list items. Use **Vertical White Space** (1.5rem gap) or alternating tonal shifts (`surface` to `surface_container_low`).
*   **Media Placeholders:** Use a simple diagonal cross-hatch within a `surface_variant` (#e2e2e2) box to represent images.

### Input Fields
*   **Structure:** Minimalist. Only a bottom stroke using `outline` (#777777). 
*   **Active State:** The stroke thickness increases to 2px, and the label shifts to `primary` (#000000).

### Additional Component: The "Contextual Slab"
A full-width horizontal container using `surface_dim` (#dadada) to group related functions (like a toolbar or filter bar). It provides a heavy structural anchor for the page.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical margins. A 24px left margin and a 48px right margin can create a modern, editorial rhythm.
*   **Do** lean into white space. If a screen feels "busy," increase the vertical spacing between sections by 2x.
*   **Do** use `primary` (#000000) for focus points and `secondary` (#5e5e5e) for supportive structure.

### Don't:
*   **Don't** use standard "wireframe" blue for links. Use a bold underline or an icon.
*   **Don't** use 100% black text (#000000) for long-form body copy; use `on_surface_variant` (#474747) to reduce eye strain.
*   **Don't** use sharp corners for everything. Follow the `Roundedness Scale` (Default: 0.25rem) to soften the "brutalist" feel into something premium.

---
*Document Version: 1.0.0 | Prepared for Junior Design Team*