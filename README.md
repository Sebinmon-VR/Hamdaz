# hamdaz.com

The Hamdaz Technologies website. It's a static site with a real-time 3D Earth, scroll-driven motion and all the original hamdaz.com content. It needs no WordPress, no database and no build dependencies. Upload the files to any web host.

The design pairs a dark, cinematic 3D Earth at the top of every page with a light, editorial content sheet that rises over it: ink-navy type on warm paper, hairline rules and numbered sections, with short headlines and one-sentence copy. The logo's cyan and pink are used only as small accents.

## What's in it

- **Loading screen** with a percentage counter that tracks the real loading of the 3D Earth.
- **Home hero:** a night-side 3D Earth rendered with Three.js, using NASA Black Marble city lights. As you scroll, the camera pulls back from the planet's edge to the whole globe, with the Abu Dhabi and India offices joined by an animated arc and live local-time labels.
- **Light theme below the hero:** the page content sits on a light sheet that overlaps the hero and the navy footer. The header turns white automatically whenever it is over the light sheet.
- **Colours:** the hero, one panel per page (Custom ChatGPT) and the footer use the logo's navy. Photos get a navy duotone so they match each other, and show full colour on hover.
- **Home sections:** Who We Are with key numbers, an index of services where the service image follows the cursor, a grid of AI products, a "find the right service" guide, a technology marquee, and a contact, offices and careers block.
- **Find the right service:** visitors pick a goal (for example "Move to the cloud") and see the services that fit, with WhatsApp and enquiry buttons that arrive pre-filled with that goal. The goals and their services are in `needs` in `src/data.mjs`; every one of the 20 services is listed under at least one goal.
- **Smooth scrolling** (Lenis) with GSAP ScrollTrigger: headlines rise in word by word, content fades up, numbers count.
- **Inner page 3D scenes** (`assets/js/scenes.js`): Who We Are shows a network of people, What We Do shows 20 service blocks, How We Do shows a data wave with an AI core. Contact and 404 keep the 3D Earth.
- **Page-switch circuit** (`assets/js/morph.js`): clicking a link breaks the page's 3D object and its title into contact pads. Glowing traces then route across the screen like a circuit board, with a signal pulse at each head, and the pulses land as the pads of the next page's object and title before melting into the real ones. The rest of the page dissolves into the next with the browser's built-in page transitions (cross-document View Transitions in Chrome, Edge and Safari 18.2+; other browsers simply switch pages). The circuit runs entirely on the arriving page, starting once the browser's transition is under way, so it is never interrupted by the page load.
- **Interaction details:** a custom cursor, magnetic buttons, rolling-text link hovers, and pages start loading as soon as a link is hovered.
- **Services page:** an index of all 20 services. Selecting one opens a pop-up with its original sub-services. Each one is deep-linkable (e.g. `services.html#generative-ai`), which matches the old `/service/<slug>/` URLs.
- **Accessibility and fallbacks:** reduced-motion users get a calm static version. Without WebGL, the hero falls back to a CSS planet glow.

## Pages

| File | Original page |
| --- | --- |
| `index.html` | Home |
| `about.html` | Who We Are (About Us) |
| `services.html` | What We Do (Services) |
| `solutions.html` | How We Do (Products) |
| `contact.html` | Contact Us |
| `404.html` | Not found |

## Editing content

All text comes from the original hamdaz.com and lives in **`src/data.mjs`**. The HTML pages are generated from it, so edit the source and rebuild:

```bash
node build.mjs           # regenerate all pages and sitemap.xml
node build.mjs --serve   # rebuild and preview at http://localhost:8080
```

- **Header, menu, footer, loader:** `src/layout.mjs`
- **Shared blocks (globe, page hero, light sheet, services list, product cards, ChatGPT section, contact and careers):** `src/components.mjs`
- **Page layouts:** `src/pages/*.mjs`
- **Styles:** `assets/css/style.css`. The dark tokens (hero, header, menu, footer) are at the top; the light-theme tokens are scoped to `.content` further down.
- **Motion and interactions:** `assets/js/main.js`
- **3D Earth:** `assets/js/earth.js`. Camera framings are in `presets()` and office positions are in `OFFICES`.
- **Logo:** `assets/img/logo.svg` is the 2024 Hamdaz logo (the version on the company LinkedIn page), redrawn as a vector. `favicon.svg`, `favicon.png`, `apple-touch-icon.png` and the high-resolution `logo.png` used by search engines are made from it. If you have the original design file from the designer, replace `logo.svg` with it.

## Libraries (self-hosted in `assets/vendor/`)

| Library | Used for | Licence |
| --- | --- | --- |
| Three.js r160 | 3D Earth | MIT |
| GSAP 3.12.5 + ScrollTrigger | Scroll animations, pinning | GreenSock standard licence (free) |
| Lenis 1.1.13 | Smooth scrolling | MIT |

Earth imagery is NASA Black Marble (public domain), taken from the `three-globe` package (MIT). Fonts are Archivo, Inter and JetBrains Mono from Google Fonts. Icons are Lucide (ISC) and Simple Icons (CC0).

## Deploying

Upload everything except `src/`, `build.mjs`, `package.json` and `README.md` to the web root.

On Apache hosting (cPanel and most shared hosts), the included `.htaccess` file:
- 301-redirects the old WordPress URLs (`/about-us`, `/services`, `/products`, `/contact-us`, `/service/<slug>/`, `/product/<slug>/`) to the new pages
- forces HTTPS, sets up the 404 page, and turns on compression and caching

## Contact form

The site has no server, so the form opens the visitor's email app or WhatsApp with the message pre-filled. To receive submissions directly, connect it to a form service such as Formspree or Web3Forms.
