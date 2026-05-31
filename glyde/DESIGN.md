# GLYDE WEBSITE — DESIGN & ANIMATION SYSTEM
## Complete Vibe Coding Reference Document

---

## 1. TECH STACK

- **Framework**: Vanilla HTML + CSS + JavaScript (single repo, multi-page)
- **Font**: Poppins via Google Fonts (weights: 300, 400, 500, 600, 700, 800, 900)
- **Animation engine**: GSAP (via CDN) + ScrollTrigger plugin
- **Icons**: Phosphor Icons (via CDN)
- **No frameworks** (no React, no Vue — pure HTML files per page)
- **File structure**:
```
/glyde/
  index.html          ← Home
  about.html          ← About
  how-it-works.html   ← How It Works
  routes.html         ← Routes
  safety.html         ← Safety
  contact.html        ← Contact
  css/
    base.css          ← Variables, resets, typography
    nav.css           ← Navbar styles
    animations.css    ← All animation classes
    pages/
      home.css
      about.css
      how-it-works.css
      routes.css
      safety.css
      contact.css
  js/
    nav.js            ← Navbar scroll behavior
    animations.js     ← Global reveal animations
    pages/
      home.js
      about.js
      how-it-works.js
      routes.js
      safety.js
      contact.js
  assets/
    logo.png          ← Green G logo on black bg
    logo-white.png    ← White variant for dark bg
```

---

## 2. DESIGN TOKENS (CSS VARIABLES)

```css
:root {
  /* BRAND COLORS */
  --green: #00E64D;
  --green-dark: #00B33C;
  --green-deeper: #007A29;
  --green-mid: #00CC44;
  --green-light: #80FFB3;
  --green-pale: #E8FFF1;
  --green-faint: #F2FFF7;

  /* NEUTRALS */
  --white: #FFFFFF;
  --off-white: #F8F8F6;
  --light-gray: #F2F2F0;
  --border: #E8E8E4;
  --mid-gray: #888880;
  --dark-gray: #444440;
  --charcoal: #1E1E1A;
  --near-black: #111110;

  /* TYPOGRAPHY */
  --font: 'Poppins', sans-serif;

  /* SPACING */
  --section-pad: 120px 0;
  --container: 1320px;
  --gutter: 48px;

  /* RADIUS */
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --radius-pill: 100px;

  /* SHADOWS */
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
  --shadow-md: 0 8px 32px rgba(0,0,0,0.08);
  --shadow-lg: 0 24px 64px rgba(0,0,0,0.10);
  --shadow-green: 0 8px 28px rgba(0,230,77,0.35);

  /* TRANSITIONS */
  --ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --duration-fast: 0.2s;
  --duration-mid: 0.4s;
  --duration-slow: 0.7s;
}
```

---

## 3. TYPOGRAPHY SYSTEM

```css
/* DISPLAY — Hero headings */
.display-xl {
  font-size: clamp(64px, 9vw, 120px);
  font-weight: 900;
  letter-spacing: -4px;
  line-height: 0.95;
}

.display-lg {
  font-size: clamp(48px, 6vw, 88px);
  font-weight: 900;
  letter-spacing: -3px;
  line-height: 1.0;
}

/* HEADINGS */
.h1 { font-size: clamp(36px, 4vw, 56px); font-weight: 800; letter-spacing: -2px; line-height: 1.1; }
.h2 { font-size: clamp(28px, 3vw, 40px); font-weight: 700; letter-spacing: -1px; line-height: 1.2; }
.h3 { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.3; }
.h4 { font-size: 18px; font-weight: 700; line-height: 1.4; }

/* BODY */
.body-lg { font-size: 18px; font-weight: 400; line-height: 1.75; }
.body-md { font-size: 16px; font-weight: 400; line-height: 1.7; }
.body-sm { font-size: 14px; font-weight: 400; line-height: 1.65; }

/* LABELS */
.label { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
.caption { font-size: 12px; font-weight: 500; }
```

---

## 4. NAVBAR — DETAILED SPEC

### Structure
```
[LOGO: G icon + GLYDE wordmark]   [Home · About · How It Works · Routes · Safety · Contact]   [Join Waitlist CTA]
```

### Default State
- Background: `rgba(255,255,255,0.92)` with `backdrop-filter: blur(16px)`
- Height: `72px`
- Position: `fixed`, top 0, full width
- Border-bottom: `1px solid rgba(0,0,0,0.06)`
- Z-index: `1000`

### Scrolled State (triggered at 60px scroll)
- Height shrinks to `60px` (transition: 0.3s ease)
- Box-shadow: `0 4px 24px rgba(0,0,0,0.07)`
- Background becomes fully `rgba(255,255,255,0.97)`

### Active Page Indicator
- Active nav link gets a `2px` underline in `--green`
- Underline animates in with `scaleX` from 0 → 1

### CTA Button
- Background: `--green`
- Text: `--charcoal`, font-weight 700, 13px
- Padding: `10px 24px`
- Border-radius: `--radius-pill`
- Hover: background → `--green-dark`, translateY(-1px), box-shadow `--shadow-green`

### Mobile Hamburger (< 768px)
- Hamburger icon replaces nav links
- Clicking opens a full-screen overlay menu
- Overlay: background `--charcoal`, links stagger in from bottom

---

## 5. PAGE TRANSITION SYSTEM

### How It Works
Every internal link fires a page transition before loading the new page.

```javascript
// On any nav link click:
// 1. Prevent default
// 2. Animate green overlay sliding UP from bottom (0.4s ease-in)
// 3. After 0.4s, navigate to new URL
// 4. On new page load, green overlay slides UP off-screen (0.4s ease-out)

const transition = document.getElementById('page-transition');

function navigateTo(url) {
  transition.classList.add('active'); // slides up from bottom
  setTimeout(() => {
    window.location.href = url;
  }, 400);
}

// On page load:
window.addEventListener('load', () => {
  transition.classList.add('exit'); // slides up and off screen
  setTimeout(() => transition.classList.remove('active', 'exit'), 600);
});
```

```css
#page-transition {
  position: fixed;
  inset: 0;
  background: var(--green);
  z-index: 9999;
  transform: translateY(100%);
  pointer-events: none;
}

#page-transition.active {
  animation: slideUp 0.4s var(--ease-in-out) forwards;
}

#page-transition.exit {
  animation: slideOff 0.5s var(--ease-out) forwards;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0%); }
}

@keyframes slideOff {
  from { transform: translateY(0%); }
  to   { transform: translateY(-100%); }
}
```

---

## 6. GLOBAL SCROLL REVEAL SYSTEM

### Classes
Apply these classes to any element. JavaScript IntersectionObserver handles the rest.

```css
/* Base state — before visible */
.reveal         { opacity: 0; transform: translateY(48px); }
.reveal-left    { opacity: 0; transform: translateX(-48px); }
.reveal-right   { opacity: 0; transform: translateX(48px); }
.reveal-scale   { opacity: 0; transform: scale(0.92); }
.reveal-fade    { opacity: 0; }

/* Visible state — after intersection */
.reveal.in-view,
.reveal-left.in-view,
.reveal-right.in-view,
.reveal-scale.in-view,
.reveal-fade.in-view {
  opacity: 1;
  transform: none;
  transition: opacity 0.7s var(--ease-out), transform 0.7s var(--ease-out);
}

/* Stagger delays */
.delay-1 { transition-delay: 0.1s !important; }
.delay-2 { transition-delay: 0.2s !important; }
.delay-3 { transition-delay: 0.3s !important; }
.delay-4 { transition-delay: 0.4s !important; }
.delay-5 { transition-delay: 0.5s !important; }
.delay-6 { transition-delay: 0.6s !important; }
```

```javascript
// animations.js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target); // fire once only
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade')
  .forEach(el => observer.observe(el));
```

---

## 7. HOME PAGE — SECTION BY SECTION

---

### 7A. HERO SECTION

**Layout**: Full-viewport, two-column grid (55% left / 45% right)

**Left column — content stack:**
```
[Live badge: pulsing green dot + "NOW OPERATING • ACCRA"]
[Giant headline — split across 3 lines]
[Subtitle paragraph]
[Two CTA buttons]
[Stats bar — 3 stats with dividers]
```

**Right column — bus visual:**
```
[Floating 3D-style bus SVG/illustration]
[Two floating info cards — one top-right, one bottom-left]
```

**Headline treatment:**
- Line 1: "Move" — positioned top-left, massive, charcoal
- Line 2: "Smarter." — middle, same size, charcoal
- Line 3: "Across Accra." — bottom, with "Accra" in `--green`
- Font size: `clamp(72px, 10vw, 128px)`, weight 900, letter-spacing -5px
- The bus illustration overlaps and sits BETWEEN lines 1 and 3 (layered depth using z-index)

**Bus visual spec:**
- Create as an inline SVG — a sleek coach/intercity bus profile view
- Bus body: charcoal/dark grey with GLYDE green accent strip along the side
- Green GLYDE logo on the bus door panel
- Bus driver visible through windshield (silhouette with green jacket)
- Drop shadow underneath: `0 40px 80px rgba(0,0,0,0.15)`
- Floating animation: gentle up-down float, 6s ease-in-out infinite
  ```css
  @keyframes busFloat {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    40%       { transform: translateY(-14px) rotate(0.4deg); }
    70%       { transform: translateY(-7px) rotate(-0.2deg); }
  }
  animation: busFloat 6s ease-in-out infinite;
  ```

**Background parallax text:**
- Large watermark text "GLYDE" at 200px+ font size
- Color: `rgba(0,230,77,0.04)` — barely visible
- Positioned center of hero
- Parallax: moves at 0.3x scroll speed (slower than content)
  ```javascript
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    bgText.style.transform = `translateY(${y * 0.3}px)`;
  });
  ```

**Floating cards:**

Card 1 (top right of bus):
```
[Live dot] NEXT DEPARTURE
6:45 AM
Accra → Dodowa
```
- White card, `border-radius: 16px`, `box-shadow: var(--shadow-lg)`
- Floats with animation-delay: 0s, cycle 4s

Card 2 (bottom left of bus):
```
RATING
⭐ 4.9/5
Based on 200+ rides
```
- Same card style
- animation-delay: 2s

**Floating card animation:**
```css
@keyframes cardFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50%       { transform: translateY(-10px) rotate(0.5deg); }
}
```

**Load entrance animations (staggered, CSS keyframes):**
```
delay 0ms   → badge fades up
delay 200ms → headline line 1 fades up
delay 350ms → headline line 2 fades up
delay 500ms → headline line 3 fades up
delay 650ms → subtitle fades up
delay 800ms → CTA buttons fade up
delay 950ms → stats bar fades up
delay 600ms → right column (bus) fades in from right
delay 1000ms → floating cards appear
delay 1200ms → scroll hint appears
```

**Stats bar:**
- 3 stats separated by thin vertical dividers
- Each: large bold number + small label below
- Stats: `2 Routes`, `100% App-Based`, `Safety Certified`
- Numbers animate counting up when they scroll into view (use CountUp.js or custom JS)

**Scroll indicator (bottom center):**
```
▼  SCROLL TO EXPLORE
[animated mouse scroll icon]
```
- Pure CSS bounce animation downward
- Fades in at 1.4s delay on load
- Fades OUT once user scrolls past 100px

---

### 7B. TICKER / MARQUEE STRIP

Position: Immediately after hero, before next section.

```
Background: --green (solid)
Height: 48px
Content (repeating): 
  APP-BASED BOOKING  ●  ACCRA–DODOWA  ●  ACCRA–OYARIFA  ●  SAFETY FIRST  ●  100% SCHEDULED  ●  
```

Animation: infinite horizontal scroll left, 25s duration linear

```css
.ticker-track {
  display: flex;
  animation: ticker 25s linear infinite;
  width: max-content;
}
@keyframes ticker {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }  /* content duplicated so loop is seamless */
}
```

Text: 12px, weight 700, charcoal, UPPERCASE, letter-spacing 2px

---

### 7C. "WHY GLYDE" / FEATURES SECTION

Layout: Section label top-left + title + body left (40%) | 3 feature cards right (60%)

**Section entrance:**
- Label + title + body: `.reveal-left` 
- Cards: `.reveal` with `.delay-1`, `.delay-2`, `.delay-3`

**Feature cards (3):**
Card structure:
```
[Large icon in green square]
[Title — 18px bold]
[Description — 14px mid-gray]
```

The 3 features:
1. 📱 App-Based Booking — "Book your seat in seconds. No queues, no cash required."
2. 🛡️ Vetted & Safe — "Professional drivers, roadworthy buses, insured journeys."
3. 📍 Fixed Routes & Stops — "Reliable scheduled departures so you plan your day with confidence."

**Card hover effect:**
```css
.feature-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 36px 28px;
  transition: all 0.35s var(--ease-out);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: var(--green);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s var(--ease-out);
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(0,230,77,0.25);
}

.feature-card:hover::before {
  transform: scaleX(1);
}
```

---

### 7D. STICKY SCROLL — "HOW WE COMPARE" 

**This is the most complex section — inspiration from the video.**

Layout: Left side PINNED/STICKY for the full scroll duration. Right side scrolls through content.

```
[LEFT — STICKY: large heading + image of Accra road/bus scene, full height]
[RIGHT — SCROLLS: 3 content blocks stacked vertically]
```

Implementation using GSAP ScrollTrigger:
```javascript
// Pin left panel while right panel scrolls
gsap.to('.compare-left', {
  scrollTrigger: {
    trigger: '.compare-section',
    start: 'top top',
    end: 'bottom bottom',
    pin: '.compare-left',
    pinSpacing: false,
  }
});

// Fade in right blocks as they scroll into view
gsap.utils.toArray('.compare-block').forEach((block, i) => {
  gsap.fromTo(block, 
    { opacity: 0, y: 60 },
    {
      opacity: 1, y: 0,
      scrollTrigger: {
        trigger: block,
        start: 'top 70%',
        end: 'top 30%',
        scrub: 1,
      }
    }
  );
});
```

Right side blocks (3):
1. "No More Waiting" — vs trotro chaos
2. "Know Before You Go" — real-time app status
3. "Professional Every Time" — driver standards

---

### 7E. FULL BLEED IMAGE REVEAL SECTION

**Inspired directly from the video — wipe/clip reveal on scroll.**

This is a full-width section with an image that REVEALS as you scroll into it.

```html
<div class="reveal-section">
  <div class="reveal-clip">
    <img src="accra-road.jpg" class="reveal-image" />
    <div class="reveal-overlay">
      <h2>Built for Accra.<br>Ready for Ghana.</h2>
    </div>
  </div>
</div>
```

```css
.reveal-section {
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.reveal-clip {
  position: absolute;
  inset: 0;
  clip-path: inset(0 100% 0 0); /* starts fully hidden right */
}

.reveal-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.1); /* slight overscale for Ken Burns */
}
```

```javascript
// GSAP scroll-bound clip-path animation
gsap.to('.reveal-clip', {
  clipPath: 'inset(0 0% 0 0)', // reveals left to right
  scrollTrigger: {
    trigger: '.reveal-section',
    start: 'top 80%',
    end: 'top 10%',
    scrub: 1.5,
  }
});

// Ken Burns on image (slight scale down as reveals)
gsap.to('.reveal-image', {
  scale: 1,
  scrollTrigger: {
    trigger: '.reveal-section',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 2,
  }
});
```

Image overlay text fades in after clip is ~60% done.

---

### 7F. SERVICES / FEATURES CARD STACK SECTION

**Inspired by the video — stacked cards cascade in from left side.**

Structure:
```
[BACKGROUND: the full-bleed image from 7E is still sticky/visible]
[FOREGROUND: cards animate in from left side]
[RIGHT SIDE: vertical progress dots indicator]
```

Cards data (3 cards):
```
01  Book Your Ride         → Smartphone icon
02  Board at Your Stop     → Map pin icon
03  Arrive on Time         → Clock icon
```

Card CSS:
```css
.service-card {
  position: absolute;
  width: 320px;
  background: var(--green);
  color: var(--charcoal);
  border-radius: var(--radius-lg);
  padding: 36px 32px;
}

/* Stacked appearance — cards offset */
.service-card:nth-child(1) { transform: rotate(-4deg) translateY(-20px); z-index: 1; }
.service-card:nth-child(2) { transform: rotate(-2deg) translateY(-10px); z-index: 2; }
.service-card:nth-child(3) { transform: rotate(0deg) translateY(0px);    z-index: 3; }
```

Animation (GSAP ScrollTrigger):
```javascript
// Cards start off-screen left, stagger in as you scroll
gsap.utils.toArray('.service-card').forEach((card, i) => {
  gsap.fromTo(card,
    { x: -400, rotation: -8, opacity: 0 },
    {
      x: 0,
      rotation: [-4, -2, 0][i],
      opacity: 1,
      duration: 0.8,
      ease: 'back.out(1.4)',
      scrollTrigger: {
        trigger: '.services-section',
        start: `top ${70 - i * 15}%`,
        toggleActions: 'play none none reverse',
      },
      delay: i * 0.15,
    }
  );
});
```

Vertical progress dots (right side):
```
● (active)
○
○
```
Dots update as you scroll through cards. Active dot is `--green`, inactive `rgba(255,255,255,0.3)`.

---

### 7G. ROUTE PREVIEW

2-column layout. Left column: route cards. Right column: stylized route map SVG.

Route cards: visual cards showing the two routes with stop lists (see Content.md)

Map SVG: Hand-drawn style dotted line connecting stops from Accra → Dodowa and Accra → Oyarifa. Animated dashed stroke on scroll:
```javascript
gsap.fromTo('.route-path', 
  { strokeDashoffset: 1000 },
  { 
    strokeDashoffset: 0,
    scrollTrigger: {
      trigger: '.route-map',
      start: 'top 60%',
      end: 'bottom 40%',
      scrub: 1.5,
    }
  }
);
```

---

### 7H. WAITLIST SECTION (DARK)

Background: `--charcoal`
Layout: centered, max-width 720px

Top: Section tag + large heading + subtitle

Form layout (inside green-bordered card):
```
Row 1: [First Name]    [Last Name]
Row 2: [Phone Number]  [Email Address]
Row 3: [Preferred Route — dropdown: Accra–Dodowa | Accra–Oyarifa | Both]
Row 4: [JOIN THE WAITLIST → button, full width, green]
```

Form field focus state:
```css
input:focus, select:focus {
  border-color: var(--green);
  box-shadow: 0 0 0 3px rgba(0,230,77,0.15);
  outline: none;
}
```

On submit:
- Button text changes to "✓ You're on the list!"
- Button background stays green
- A success message fades in below the button
- No page reload

Privacy note below form: "🔒 Your data is safe with us. No spam, ever."

---

### 7I. APP DOWNLOAD SECTION

Background: `--green-pale` (very light green tint)
Layout: 2-column

Left: Text content
- Badge: "Coming Soon"
- Heading: "GLYDE in your pocket."
- Body: description
- App store badges (Apple App Store + Google Play) — both show "Coming Soon" tooltip on hover
- Under badges: "Be notified when we launch → [email input + arrow button]"

Right: Phone mockup
- Stylized phone outline (pure CSS or inline SVG)
- Screen shows GLYDE app UI mockup:
  - Dark green gradient background
  - GLYDE logo centered
  - "Select Route" dropdown
  - "Book Now" green button
- Phone floats with the same `busFloat` animation (5s duration)

---

### 7J. FOOTER

Background: `--near-black`
4-column grid:

Col 1 (wide): Logo + tagline + social icons (Instagram, Twitter/X, LinkedIn, WhatsApp)
Col 2: Navigation links
Col 3: Routes links
Col 4: Contact info

Bottom bar: © 2025 GLYDE. Made in Ghana 🇬🇭 | Privacy Policy | Terms

Social icon hover: background changes to `--green`, slight scale up.

---

## 8. ABOUT PAGE

### Hero (Dark)
- Background: `--charcoal`
- Large page title: "Who We Are" — white, display-lg
- Subtle green radial glow top-right (CSS, no image)
- Breadcrumb: Home / About

### Mission Block (Green tint)
- Background: `--green-pale`
- Centered large italic quote:
  > *"We're building Ghana's first tech-enabled scheduled bus network — where every ride is safe, on time, and worth it."*
- Below quote: two founder stats side by side

### Story Section (2-col)
- Left: text (who we are, origin story content from Content.md)
- Right: image placeholder (Accra cityscape with overlay badge)
- Image has hover zoom: `transition: transform 0.6s ease; :hover { transform: scale(1.04); }`

### Values Grid (3 cards)
Cards with large emoji, title, and description. See Content.md for values.
Entrance: staggered `.reveal` with `.delay-1` through `.delay-3`

### Team Placeholder
- Simple centered section: "Meet the team — coming soon"
- Or placeholder grid of avatar circles with name/role

---

## 9. HOW IT WORKS PAGE

### Page Hero (Dark)
- Title: "Ride in 3 Steps"
- Subtitle
- Background glow effect

### Steps — HORIZONTAL SCROLL SECTION

On desktop: Steps laid out left-to-right in a horizontal scroll container.
On mobile: Vertical stack.

```javascript
// Horizontal scroll section
gsap.to('.steps-track', {
  x: () => -(document.querySelector('.steps-track').offsetWidth - window.innerWidth),
  ease: 'none',
  scrollTrigger: {
    trigger: '.steps-scroll-container',
    start: 'top top',
    end: () => '+=' + document.querySelector('.steps-track').offsetWidth,
    scrub: 1,
    pin: true,
    anticipatePin: 1,
  }
});
```

Each step card (3 cards, horizontal):
```
[BIG NUMBER: 01 / 02 / 03]
[Icon — 60px, green]
[Title — 24px bold]
[Description — 16px]
[Connector arrow →  between cards]
```

Step numbers are huge and faded: 120px, `rgba(0,230,77,0.12)`, behind the content.

### Step Detail Sections (Below horizontal scroll)

3 full sections below, one per step, alternating left-right layout:
- Step 1: App mockup left, text right
- Step 2: Text left, bus/stop image right
- Step 3: Arrival/destination image left, text right

Each uses the same wipe/clip reveal technique from 7E.

### FAQ Accordion

Below the steps.
Each question expands on click with smooth height animation:
```javascript
faqItems.forEach(item => {
  item.querySelector('.faq-question').addEventListener('click', () => {
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('open');
    
    // Close all
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-answer').style.maxHeight = '0';
    });
    
    // Open clicked if was closed
    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});
```

Chevron icon rotates 180° when open:
```css
.faq-item.open .faq-chevron { transform: rotate(180deg); }
.faq-chevron { transition: transform 0.3s var(--ease); }
```

---

## 10. ROUTES PAGE

### Page Hero (Dark)
Large title: "Our Routes"
Live badge: "2 Active Routes"

### Route Detail Cards (2 large cards, full width stacked)

Each route card structure:
```
[Card header — dark bg with route name + badge]
  Route: Accra → Dodowa  |  ~45 min  |  6am–9pm
[Card body — white bg]
  [Left: vertical stop timeline]    [Right: route info grid]
```

**Stop timeline (left side):**
```
● Accra Central (Accra)  ← start dot (green, large)
│
● Airport
│
● Madina
│
● Adenta
│
● Dodowa  ← end dot (charcoal, large)
```

CSS for timeline:
```css
.stop-line::before {
  content: '';
  position: absolute;
  left: 7px; top: 16px;
  width: 2px;
  height: calc(100% + 8px);
  background: linear-gradient(to bottom, var(--green), rgba(0,230,77,0.15));
}
```

**Right side route info:**
- Duration badge: "~45 min"
- Frequency: "Every 30 min"
- Operating hours: "6:00 AM – 9:00 PM"
- Days: "Monday – Sunday"
- Status: [green live indicator]

### Route Map Section
Full-width SVG map (stylized, not Google Maps) showing:
- Greater Accra outline
- Two dotted route lines from Accra out to Dodowa and Oyarifa
- Stop markers as circles
- Animated stroke dash on scroll (same technique as 7G)
- Map background: very light green `rgba(0,230,77,0.04)`

### Schedule Table
Clean table for each route showing departure times.
Table rows have alternating subtle backgrounds.
Hover state: row highlights in `--green-pale`.

---

## 11. SAFETY PAGE

### Page Hero (Charcoal + stats)
After the hero title, show 4 large stat boxes in a row:
```
[0 Accidents] [100% Insured] [Vetted Drivers] [Roadworthy Certified]
```
Stat numbers count up using JS on load.

### Safety Pillars (3-column grid)
6 safety cards in 2 rows:
1. Driver Vetting
2. Vehicle Standards
3. Insurance Coverage
4. Emergency Protocol
5. Passenger Safety
6. Incident Reporting

Each card: icon in pale green box + title + short description.
Entrance: staggered reveals row by row.

### Driver Standards Section (2-col)
Left: text + checklist
Right: driver profile card (stylized)

Driver checklist items animate in one by one with a tick:
```javascript
checkItems.forEach((item, i) => {
  gsap.fromTo(item.querySelector('.tick'),
    { scale: 0, opacity: 0 },
    {
      scale: 1, opacity: 1,
      scrollTrigger: { trigger: item, start: 'top 80%' },
      delay: i * 0.1,
      ease: 'back.out(2)',
    }
  );
});
```

### Vehicle Standards (dark bg, full bleed)
Background: `--charcoal`
Content: 2-col, left is text, right is stylized bus diagram SVG with labelled parts (fire extinguisher, GPS, first aid, seatbelts).
Labels animate in with connecting lines drawing from right to left (SVG stroke animation).

---

## 12. CONTACT PAGE

### Page Hero (Light)
Simple, light background.
Title: "Let's Talk"
Subtitle: short welcome message

### Layout (2-col)
**Left — Contact Info:**
- Phone
- Email  
- Office address
- Operating hours
- Social links

Each item: icon in pale green box + label + value.

**Right — Contact Form:**
```
[Full Name]
[Email Address]
[Phone (optional)]
[Subject — dropdown]
[Message — textarea]
[SEND MESSAGE button]
```

Form card background: `--light-gray`, border-radius: `var(--radius-xl)`, padding: 48px.

### Map Placeholder
Below the form/contact block: a stylized static map showing Accra (can be an iframe or a styled placeholder with a pin icon).

---

## 13. MICRO-INTERACTIONS REFERENCE

### Buttons
```css
/* All .btn-primary */
.btn-primary {
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-green);
}
.btn-primary:active {
  transform: translateY(0px) scale(0.98);
}
```

### Links
```css
/* Underline draw on hover */
a.hover-line {
  position: relative;
}
a.hover-line::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 0;
  width: 0; height: 2px;
  background: var(--green);
  transition: width 0.3s ease;
}
a.hover-line:hover::after { width: 100%; }
```

### Cards
```css
.card-hover {
  transition: transform 0.35s var(--ease-out), box-shadow 0.35s var(--ease-out), border-color 0.35s ease;
}
.card-hover:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(0,230,77,0.3);
}
```

### Nav CTA pulse
```css
.nav-cta::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 2px solid var(--green);
  animation: navPulse 2.5s ease-out infinite;
}
@keyframes navPulse {
  0%   { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.5); opacity: 0; }
}
```

### Live badge dot pulse
```css
.live-dot {
  width: 8px; height: 8px;
  background: var(--green);
  border-radius: 50%;
  animation: livePulse 2s ease infinite;
}
@keyframes livePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0,230,77,0.5); }
  50%       { box-shadow: 0 0 0 6px rgba(0,230,77,0); }
}
```

### Form input shake on invalid
```javascript
function shakeInput(input) {
  input.classList.add('shake');
  setTimeout(() => input.classList.remove('shake'), 500);
}

// CSS
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-6px); }
  40%       { transform: translateX(6px); }
  60%       { transform: translateX(-4px); }
  80%       { transform: translateX(4px); }
}
.shake { 
  animation: shake 0.4s ease;
  border-color: #FF4444 !important;
}
```

---

## 14. CUSTOM CURSOR (Desktop only)

```javascript
// Hide default cursor
document.body.style.cursor = 'none';

// Create custom cursor elements
const cursor = document.createElement('div');
cursor.className = 'cursor-dot';
const follower = document.createElement('div');
follower.className = 'cursor-follower';
document.body.appendChild(cursor);
document.body.appendChild(follower);

let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
});

// Follower lags behind with lerp
function animateCursor() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  follower.style.transform = `translate(${followerX - 20}px, ${followerY - 20}px)`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Grow on hover of interactive elements
document.querySelectorAll('a, button, .card-hover').forEach(el => {
  el.addEventListener('mouseenter', () => follower.classList.add('grow'));
  el.addEventListener('mouseleave', () => follower.classList.remove('grow'));
});
```

```css
.cursor-dot {
  position: fixed;
  top: -4px; left: -4px;
  width: 8px; height: 8px;
  background: var(--green);
  border-radius: 50%;
  pointer-events: none;
  z-index: 99999;
  transition: transform 0.05s linear;
}

.cursor-follower {
  position: fixed;
  top: 0; left: 0;
  width: 40px; height: 40px;
  border: 2px solid rgba(0,230,77,0.4);
  border-radius: 50%;
  pointer-events: none;
  z-index: 99998;
  transition: width 0.3s ease, height 0.3s ease, border-color 0.3s ease;
}

.cursor-follower.grow {
  width: 60px; height: 60px;
  border-color: var(--green);
  background: rgba(0,230,77,0.08);
}
```

---

## 15. RESPONSIVE BREAKPOINTS

```css
/* MOBILE FIRST */
/* Default: mobile (< 640px) */

/* Small tablet */
@media (min-width: 640px) { ... }

/* Tablet */
@media (min-width: 768px) { ... }

/* Desktop */
@media (min-width: 1024px) { ... }

/* Large desktop */
@media (min-width: 1280px) { ... }
```

### Mobile changes:
- Navbar: hamburger replaces links
- Hero: single column, bus below text
- Hero title: smaller, no split layout
- Sticky scroll sections: become vertical stacks
- Horizontal scroll (How It Works): becomes vertical
- Grid sections: all become single column
- Font sizes use `clamp()` so they scale automatically
- Custom cursor: disabled
- Page transitions: still apply

---

## 16. PERFORMANCE NOTES

- All images: use `loading="lazy"` except hero
- Preload: Google Fonts, hero image
- GSAP: load only ScrollTrigger plugin (not all of GSAP)
- Animations: use `will-change: transform` only on actively animating elements; remove after animation completes
- IntersectionObserver: `unobserve` after element animates in (fire once)
- Videos: none (use CSS animations instead)

---

## 17. CDN LINKS TO USE

```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">

<!-- GSAP + ScrollTrigger -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>

<!-- Phosphor Icons -->
<script src="https://unpkg.com/@phosphor-icons/web"></script>
```

---

## 18. LOGO USAGE

- Logo file: `assets/logo.png` — green G-mark on black/dark background
- On light backgrounds: use `logo.png` with a white or light container behind it, or create `logo-green.svg` (just the G mark in green on transparent)
- On dark backgrounds: use as-is
- In navbar: G icon (32px) + "GLYDE" wordmark in Poppins 800 weight, charcoal
- Minimum size: 24px height
- Never distort, stretch, or recolor the mark

---

*End of DESIGN.md*
