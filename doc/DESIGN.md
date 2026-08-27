# Reference-Site UI/UX Reverse-Engineering Specification

Reference: [ashwiiniidongare.com](https://ashwiiniidongare.com/)

This document describes the visual language, layout, responsive behavior, and animation system of the reference site. It is intended as a design and implementation brief for improving the REALSPACE project.

No source-code changes are implied by this document.

## 1. Overall visual direction

The visual language is:

- premium residential interiors
- warm white backgrounds
- black or charcoal body text
- mustard/yellow accent color
- large architectural/interior photography
- spacious, editorial-style sections
- alternating image/text layouts
- soft card shadows and restrained borders
- decorative curved background overlays
- full-bleed background imagery

The site feels more like a portfolio brochure than a highly interactive product site.

## 2. Typography and fonts

The site loads these Google font families:

- Roboto
- Roboto Slab
- Josefin Sans
- Raleway
- Nunito
- Chivo

Primary observed styling:

| Role | Font | Approximate styling |
|---|---|---|
| Main headings | Josefin Sans | 30px desktop, semi-bold/600 |
| Large section headings | Josefin Sans | 30–40px, sometimes 800 |
| Body copy | Raleway or Arial | 14–15px, medium/500 |
| Some headings | Roboto | approximately 30px |
| Small footer/caption text | Roboto | 7–9px, uppercase/letter-spaced |
| Testimonial name/accent | Chivo | accent-colored |

Typical line heights:

- paragraphs: approximately `1.5`
- larger descriptive sections: approximately `1.8`
- card descriptions: approximately `1.5–1.6`

Recommended implementation:

```css
--font-heading: "Josefin Sans", sans-serif;
--font-body: "Raleway", sans-serif;
--font-ui: "Roboto", sans-serif;
```

## 3. Heading hierarchy

The semantic hierarchy is somewhat inconsistent, but the visual hierarchy is:

1. Hero heading / brand statement
2. Major section headings: Welcome, Residential Interior Design, Key Features, Features & Benefits, Crafting State-Of-The-Art Interior, Meet Our Founder, Foundation, Our Team of Experts, Reach Us
3. Supporting subsection headings
4. Feature/card titles such as 3D Visualization, Turnkey Projects, EXECUTION, and ONSITE SUPERVISION

Recommended Next.js hierarchy:

```text
<h1>Interiors by Ashwiinii Dongare</h1>
<h2>Welcome...</h2>
<h2>Residential Interior Design</h2>
<h2>Key Features</h2>
<h2>Features & Benefits</h2>
<h2>Crafting State-Of-The-Art Interior</h2>
<h2>Meet Our Founder</h2>
<h2>Foundation</h2>
<h2>Our Team of Experts</h2>
<h2>Reach Us</h2>
<h3>3D Visualization</h3>
<h3>Turnkey Projects</h3>
```

## 4. Header and navbar

### Directly observed/source-confirmed

The site uses OceanWP's responsive header system.

- desktop navigation is hidden below approximately 959px
- a mobile-menu icon appears below that breakpoint
- responsive and sticky-logo support exists
- transparent-header classes exist
- mobile navigation uses an OceanWP side-panel/Sidr-style system

The logo is a transparent PNG approximately 409×142 pixels:

`cropped-2-removebg-preview.png`

### Likely desktop appearance

- logo on the left
- horizontal navigation on the right
- transparent or light header near the hero
- generous horizontal padding

### Scroll state

Sticky-header support exists in the theme, but the delivered homepage markup did not clearly expose an active `is-sticky` state. The exact before/after-scroll appearance is therefore uncertain.

Recommended implementation assumption:

- desktop: transparent header over hero
- after scrolling: solid white header with dark logo/navigation
- mobile: compact white header with logo and hamburger menu

Treat the scroll-state details as uncertain until validated in a live browser.

## 5. Hero section

The hero uses a large interior image featuring a teal-blue paneled wall, keyboard/piano, framed artwork, shelving, bedroom furniture, and strong sunlight.

The background is configured approximately as:

```css
background-size: cover;
background-repeat: no-repeat;
background-position: -1px 0;
```

Desktop spacing:

```css
padding: 240px 0 240px;
```

Tablet spacing:

```css
padding: 100px 30px;
```

Mobile spacing:

```css
padding: 80px 20px;
```

The hero also uses a decorative curved shape overlay with:

- `background-size: cover`
- partial horizontal offset on desktop
- approximately `opacity: 0.44`
- `mix-blend-mode: screen`
- 0.3-second background, border-radius, and opacity transitions

The overlay is mostly white with a thin mustard curved line. It acts as subtle architectural decoration.

Recommended Next.js structure:

```jsx
<motion.section className="hero">
  <motion.div className="heroBackground" />
  <div className="heroOverlay" />
  <div className="heroContent">...</div>
</motion.section>
```

Use an absolutely positioned `<Image fill />` with `object-fit: cover`, or a CSS background if art direction is unnecessary.

## 6. Background images and section transitions

Major sections use full-width background images with overlays.

Observed patterns include:

### Interior feature section

- residential interior background image
- warm beige/tan fallback color
- brown/dark overlay
- approximately 0.79 opacity
- minimum height around 400px
- white heading and body copy

### Portfolio/testimonial section

- full-width interior background image
- pale gray overlay around 0.7 opacity
- centered content
- fixed background attachment on desktop

### Footer/contact section

- dark interior background image
- charcoal overlay around 0.78 opacity
- white contact information
- approximately 60px vertical padding desktop and 40px mobile

### Section transition style

The site uses:

- alternating white and image-backed sections
- background overlays
- curved/tilt Elementor shape dividers
- fixed desktop backgrounds
- generous vertical padding

One section explicitly includes top and bottom tilt shape dividers, creating a soft angled transition between major blocks.

Recommended animation treatment:

- animate section content rather than entire backgrounds
- keep background images mostly static
- optionally animate decorative shape opacity or vertical offset slightly
- avoid dramatic wipes unless live validation confirms them

## 7. Scroll animations

The delivered Elementor markup contains these entrance animations:

- `fadeIn`
- `fadeInUp`
- `fadeInLeft`
- `fadeInRight`
- `pulse`

Several elements use delays of 100ms, 200ms, 300ms, and 500ms. `elementor-invisible` classes indicate that elements are hidden before entrance animation.

### Fade-in-up content

1. Trigger: element enters the viewport
2. Change: opacity 0 → 1 and vertical position moves upward into place
3. Style: short, soft ease-out reveal
4. Likely technique: Elementor entrance animation plus viewport detection
5. Framer Motion:

```jsx
const revealUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" }
  }
};
```

### Fade-in-left/right columns

1. Trigger: section or column enters the viewport
2. Change: opacity increases while content moves horizontally 20–40px
3. Style: restrained editorial reveal
4. Likely technique: Elementor animation classes
5. Framer Motion:

```jsx
const revealLeft = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" }
  }
};
```

### Delayed stagger

1. Trigger: parent section enters the viewport
2. Change: cards or text blocks appear sequentially
3. Style: 100–500ms stagger/delay
4. Likely technique: individual Elementor animation delays
5. Framer Motion: use `staggerChildren: 0.12` or explicit delays

### Fade-in-only blocks

1. Trigger: block enters the viewport
2. Change: opacity 0 → 1 with little or no translation
3. Style: subtle
4. Likely technique: Elementor `fadeIn`
5. Framer Motion:

```jsx
initial={{ opacity: 0 }}
whileInView={{ opacity: 1 }}
viewport={{ once: true, amount: 0.2 }}
transition={{ duration: 0.6 }}
```

### Pulse

One element is configured with `pulse`.

1. Trigger: probably page load or viewport entry
2. Change: subtle scale/opacity pulsing
3. Style: stock Elementor pulse animation
4. Certainty: low
5. Recommendation: use sparingly, probably on an icon or decoration rather than an entire content section

## 8. Image reveal animations

There is evidence for Elementor entrance animations on image-containing sections, but no confirmed custom masked image-reveal system.

Likely behavior:

- image or image column fades/slides into view
- no confirmed clip-path wipe
- no confirmed expanding mask
- no confirmed SVG path reveal

Recommended reproduction:

```jsx
<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{ duration: 0.75, ease: "easeOut" }}
>
  <Image ... />
</motion.div>
```

An optional subtle image scale can be added:

```jsx
initial={{ opacity: 0, scale: 1.04 }}
animate={{ opacity: 1, scale: 1 }}
```

Do not assume the original site uses this scale effect.

## 9. Parallax

Multiple desktop sections use:

```css
background-attachment: fixed;
```

This applies to the hero, interior feature backgrounds, portfolio/testimonial backgrounds, footer, and other image-backed sections.

This is classic CSS background parallax rather than confirmed JavaScript scroll-transform parallax.

The fixed attachment rules are inside a `min-width: 1025px` media query. Therefore:

- desktop: fixed-background parallax
- tablet/mobile: likely normal scrolling backgrounds
- mobile: do not rely on `background-attachment: fixed`

Framer Motion equivalent:

```jsx
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ["start end", "end start"]
});

const y = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);
```

Enable this only on desktop and disable it for touch/mobile layouts.

## 10. Carousel

The homepage includes a two-image carousel with:

- one slide visible
- arrow navigation
- fade effect
- autoplay enabled
- 4-second autoplay interval
- 500ms transition speed
- infinite looping
- pause on hover
- pause on interaction

The source exposes “Previous” and “Next” controls.

Recommended Framer Motion implementation:

```jsx
<AnimatePresence mode="wait">
  <motion.div
    key={activeIndex}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Image ... />
  </motion.div>
</AnimatePresence>
```

Use a 4000ms interval and pause it while hovered or while the user is interacting with controls.

## 11. Hover effects

Feature/icon cards use:

- yellow icon color
- brighter/darker yellow hover color
- approximately 35px desktop card padding
- slight rounded corners
- hover shadow around `0 5px 50px rgba(0,0,0,0.1)`

Some white content cards use a smaller hover shadow around `0 4px 8px rgba(0,0,0,0.1)`.

Confirmed behavior is primarily shadow and icon-color change. Card translation or image zoom is not confirmed.

Recommended implementation:

```jsx
<motion.article
  whileHover={{
    y: -3,
    boxShadow: "0 5px 30px rgba(0,0,0,0.10)"
  }}
  transition={{ duration: 0.25 }}
/>
```

The vertical lift is optional; the original CSS confirms the shadow but not a transform.

## 12. Buttons and controls

The homepage relies more on navigation links, carousel arrows, icon boxes, contact links, and gallery links than on large CTA buttons.

Accent colors:

- approximately `#f7c933`
- approximately `#ffbb00`
- approximately `#fed45c`

Recommended buttons:

- dark text on mustard background
- slight darkening on hover
- 0.2–0.3 second transition
- modest 3–5px corner radius
- avoid excessive pill-shaped controls

Carousel controls should be minimal, vertically centered over the image, keyboard accessible, and visible over both light and dark imagery.

## 13. Gallery and lightbox

The site has a separate [Gallery page](https://ashwiiniidongare.com/gallery/) and uses portfolio/gallery plugins.

The delivered assets and plugin CSS indicate support for:

- image galleries
- carousel behavior
- lightbox viewing
- previous/next image navigation

Exact gallery hover behavior was not reliably observable. Treat these as uncertain:

- image darkening on hover
- zoom icon appearance
- caption slide-up
- hover scaling

Recommended reproduction:

```jsx
<motion.div whileHover={{ scale: 1.02 }}>
  <Image ... />
</motion.div>
```

Open images in a modal with a dark translucent backdrop, centered image, close control, previous/next controls, and a fade-in transition.

## 14. Responsive behavior

The main responsive breakpoints are:

- desktop: above 1024px
- tablet: 768–1024px
- mobile: below 768px

### Desktop

- two-column layouts
- large hero padding
- full-width background imagery
- fixed background attachment/parallax
- horizontal feature cards
- 1040–1163px content containers
- image/text compositions near 50/50 or 46/54 splits

### Tablet

- hero padding reduces substantially
- columns often become full width
- heading sizes reduce slightly
- horizontal layouts begin stacking
- content receives approximately 30–50px horizontal padding

### Mobile

- hero padding becomes approximately 80px vertical and 20px horizontal
- most columns become full width
- feature cards stack vertically
- icon boxes become centered
- desktop navigation is replaced with mobile menu
- text remains mostly left-aligned except for feature cards/footer
- background positioning resets toward `0 0`
- fixed background behavior is disabled or avoided
- section padding reduces to approximately 40–80px
- card padding reduces to approximately 24px

Approximate mobile heading sizes:

- hero/main headings: 1.5–1.8em
- section headings: 1.5–2.5rem
- card headings: approximately 20px

## 15. Page transitions

No evidence of a custom SPA-style route transition was found.

Likely behavior:

- normal browser navigation between pages
- gallery opens in a lightbox
- no confirmed full-screen page wipe
- no confirmed shared-layout transition between routes

If implementing route transitions in Next.js, keep them subtle:

```jsx
<motion.main
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.35 }}
>
  {children}
</motion.main>
```

## 16. Directly observed versus inferred

### Directly observed/source-confirmed

- interior photography dominates the page
- hero uses a teal interior image
- hero uses a thin curved mustard decorative overlay
- background images use `cover`
- desktop sections use fixed background attachment
- typography uses Josefin Sans, Raleway, Roboto, and related Google fonts
- responsive breakpoints exist around 1024px and 767px
- cards use yellow icons and hover shadows
- Elementor entrance animations include fade, directional fade, delays, and pulse
- carousel uses fade, autoplay, 4-second interval, 500ms transition, infinite looping, and pause-on-hover
- mobile navigation is provided by OceanWP's mobile menu system

### Likely technical implementation

- Elementor viewport detection triggers entrance animations
- CSS background attachment provides desktop parallax
- carousel is Elementor's Swiper integration
- image galleries use a WordPress portfolio/lightbox plugin
- header behavior is controlled by OceanWP responsive-header classes
- section transitions use Elementor shape dividers and background overlays

### Uncertain assumptions

- exact desktop header appearance after scrolling
- whether the header shrinks or changes logo size
- exact hover behavior of gallery images
- whether images scale on hover
- whether the hero has an independent entrance animation
- whether the `pulse` configuration is visibly user-facing
- whether mobile image crops use custom art-directed assets
- exact navigation labels and anchor behavior
- whether a custom page transition exists outside the homepage

## 17. Implementation brief for Claude.ai

> Reproduce a premium residential interior-design portfolio homepage using Josefin Sans headings, Raleway body copy, warm white surfaces, charcoal text, and mustard-yellow accents. Use large full-bleed interior photography with `object-fit: cover`, dark or pale overlays, alternating image/text sections, curved decorative SVG/PNG overlays, and generous vertical whitespace. Implement viewport-triggered fade, fade-up, fade-left, and fade-right reveals with 100–500ms stagger delays. Add desktop-only fixed-background parallax, but disable it on mobile. Build a single-slide fading autoplay carousel with a 4-second interval, 500ms transition, infinite looping, arrow controls, and pause-on-hover. Use restrained card hover shadows and subtle icon-color changes. Use a transparent desktop hero header that becomes solid on scroll only if confirmed during live browser validation. Stack all content and center feature cards below 768px. Keep route transitions subtle and avoid excessive animation.
