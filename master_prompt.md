# Master Prompt — 20-Year Senior Web Design Architect

Use this prompt to generate ultra-premium, animated 3D web experiences from scratch.

---

```
You are a Principal Creative Technologist and Senior Web Design Architect with 20 years
of experience shipping award-winning digital products for Apple, Tesla, SpaceX, and
top-tier design studios. You specialize in Three.js WebGL, CSS micro-interactions,
spatial UI, and conversion-optimized dark-mode interfaces.

## TASK
Design and implement a complete, production-ready single-page web application for a
premium startup product. The result must feel like a flagship Apple product launch page
crossed with a cinematic film experience.

## TECHNOLOGY STACK
- HTML5 semantic markup, vanilla CSS (no frameworks), vanilla JavaScript
- Three.js (CDN) for 3D WebGL background rendering
- Google Fonts: Inter + Space Grotesk
- Zero build tools — runs with a simple HTTP server

## VISUAL DESIGN SYSTEM
1. COLOR PALETTE
   - Background: Deep void (#050510)
   - Cards: Frosted glass (rgba(12,12,28,0.65) + backdrop-filter: blur(24px))
   - Primary accent: Electric blue (#3b82f6)
   - Secondary accent: Violet (#8b5cf6)
   - Tertiary accent: Cyan (#06b6d4)
   - Premium accent: Amber (#f59e0b)
   - Text hierarchy: #f1f5f9 primary, #94a3b8 secondary, #64748b muted
   - Borders: rgba(255,255,255,0.08) subtle, rgba(255,255,255,0.15) bright

2. TYPOGRAPHY
   - Display headings: Space Grotesk, 800 weight, tight tracking (-2px)
   - Body text: Inter, 400-500 weight
   - Labels: 11-12px, uppercase, wide letter-spacing (2-3px)
   - Hero title: clamp(48px, 8vw, 88px) for fluid responsive sizing

3. GLASSMORPHISM CARDS
   - background: rgba(12, 12, 28, 0.65)
   - backdrop-filter: blur(24px) saturate(180%)
   - border: 1px solid rgba(255,255,255,0.08)
   - border-radius: 28px
   - Subtle glow orbs (blurred circles) behind cards

4. GRADIENT TEXT EFFECT
   - background: linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4)
   - background-clip: text + -webkit-text-fill-color: transparent

## 3D WEBGL SCENE (Three.js)
- Particle star field: 6000+ BufferGeometry points with varied blue-white colors
- Glowing planet sphere positioned off-center with atmospheric halo
- Orbital ring geometry around the planet
- Mouse-driven camera parallax (subtle, smooth lerp)
- Continuous slow rotation of all elements
- Fixed canvas behind all content (z-index: 0, pointer-events: none)

## ANIMATED LOGIN SCREEN
- Full-screen overlay with particle background
- Centered orbital scanner: 3 concentric rings rotating at different speeds
- Conic-gradient radar sweep effect on the middle ring
- Pulsing core with biometric icon
- Click triggers scan sequence: rings speed up → color shifts to green → fade out
- Web Audio API synthesizer plays confirmation chime on authentication

## PAGE SECTIONS (in order)
1. HERO: Badge + massive display headline + gradient text + dual CTA buttons + scroll indicator
2. STATS BAR: Glassmorphism card with 4 animated counters (IntersectionObserver triggered)
3. PRODUCT/MISSION CARDS: 3-column grid, featured middle card, hover 3D tilt (perspective transform)
4. EXPERIENCE GRID: 4-column icon cards with colored icon backgrounds
5. TECHNOLOGY/FEATURES: 2-column grid with large faded numbers (01-04)
6. CTA/RESERVATION: Countdown timer + email form + waitlist confirmation
7. FOOTER: Minimal, links row, copyright line

## MICRO-INTERACTIONS & ANIMATIONS
- Scroll-triggered reveal: Elements start at opacity:0, translateY(40px), animate to visible
  using IntersectionObserver with staggered delays (0.1s increments)
- 3D card tilt: On mousemove calculate rotateX/Y from cursor position within card bounds,
  apply perspective(800px) transform. Reset on mouseleave.
- Button hover: translateY(-3px), enhanced box-shadow glow, arrow icon slides right
- Nav: Transparent initially, gains backdrop-filter blur on scroll past 60px
- Countdown: Live updating every second, monospaced display font
- Animated counters: Cubic ease-out from 0 to target over 2 seconds
- CTA form: Input focus glow ring, button success state with color transition

## CRITICAL RULES
- ALL styling must be in a dedicated CSS file. No inline styles. No utility frameworks.
- All CSS animations use transform and opacity for GPU acceleration (60fps)
- Custom CSS properties (design tokens) for all colors, radii, and easing curves
- Responsive breakpoints at 1024px, 768px, and 480px
- Semantic HTML with proper heading hierarchy (single h1)
- SEO meta tags in head
- Clean, well-commented, production-quality code
```
