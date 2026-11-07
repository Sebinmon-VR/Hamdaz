# hamdaz.com

The Hamdaz Technologies website. It's a static site with a real-time 3D AI processor scene, scroll-driven motion and all the original hamdaz.com content. It needs no WordPress, no database and no build dependencies. Upload the files to any web host.

The design pairs a dark, cinematic 3D scene at the top of every page with a light, editorial content sheet that rises over it: ink-navy type on warm paper, hairline rules and numbered sections, with short headlines and one-sentence copy. The logo's cyan and pink are used only as small accents.

## What's in it

- **Loading screen** with a percentage counter that tracks the loading of the 3D scene.
- **Home hero:** one screen that plays like a short film (`assets/js/heroes/glass.js`, played by `assets/js/stage.js`): the headline, then AI, Cloud, Data, Infrastructure and Security, each with its details as tags. A tech object made of iridescent glass floats over dark abstract photos (`assets/img/hero/`, Unsplash License) that dissolve into each other between frames, and turns to the cursor on hover. The rail on the right shows the frame playing, jumps to any frame and pauses the film; one scroll goes straight to the content, and the object breaks into the particles that form the people network. The previous chip hero is kept on the local branch `backup/chip-hero-2026-11-07`; `HERO` in `src/pages/home.mjs` switches back to it.
- **Services:** 35 services in 9 areas (`categories` in `src/data.mjs`): AI, data & automation; cybersecurity; cloud & infrastructure; ELV & security systems (MCC-certified CCTV, access control, gate barriers, ANPR, intercom, data centre); audio visual; networking & Wi-Fi; apps & business systems; industry solutions; staffing & outsourcing. The new AV, ELV, cybersecurity and staffing content comes from the 2026 company profiles. The services page has one section per area; the "What We Do" mega menu in the header lists every area and service.
- **Clients & partners:** moving rows of client names and partner brands on the home page (`clients` and `partners` in `src/data.mjs`); names only, so logo files can be added later.
- **Light theme below the hero:** the page content sits on a light sheet that overlaps the hero and the navy footer. The header turns white automatically whenever it is over the light sheet.
- **Colours:** the hero, one panel per page (Custom ChatGPT) and the footer use the logo's navy. Photos get a navy duotone so they match each other, and show full colour on hover.
- **Home sections:** Who We Are with key numbers, the main managed services as a list with a detail panel (point at one to see its image, summary and what it includes), a grid of AI products, a "find the right service" guide, a technology marquee, and a contact, offices and careers block.
- **Find the right service:** visitors pick a goal (for example "Move to the cloud") and see the services that fit, with WhatsApp and enquiry buttons that arrive pre-filled with that goal. The goals and their services are in `needs` in `src/data.mjs`; every one of the 20 services is listed under at least one goal.
- **Smooth scrolling** (Lenis) with GSAP ScrollTrigger: headlines rise in word by word, content fades up, numbers count.
- **One element per page, told as a story:** Home shows the AI chip, Who We Are a network of people (`assets/js/scenes.js`), What We Do a technology stack of four glass platforms (Security, Cloud, Data, AI), How We Do flowing ribbons of light, Contact the night-side Earth with the Abu Dhabi and India offices (with their local time) joined by a glowing arc (`heroes/globe.js`), and the 404 page a spark of light. The elements are in `assets/js/heroes/`; where each one sits is in `assets/js/heroes/framings.js`, and each page picks its element with `hero:` in `src/pages/*.mjs`.
- **Home page, chip to network** (`assets/js/stage.js`): the hero's AI chip sits on a dark layer behind the page. As the white sheet rises over the hero, the chip breaks up into particles (from its own shape) that stream down onto the sheet and settle as a people network drawn in ink (`assets/js/heroes/inknet.js`), beside the intro text. Further down, a dark section before Contact opens and the network's particles stream down into it, swirling into a spiral galaxy (`assets/js/heroes/galaxy.js`). Both streams follow the scroll (smoothed), so scrolling back up sends the particles back. A particle only shows once it has left its element, so no outline of the last element is ever drawn over the next section.
- **Page switches** (`assets/js/main.js`, the cover is in `src/layout.mjs`): a parallax wipe. A colour band and then a navy panel with the next page's name sweep up over the page; the next page opens covered, waits until its 3D element has drawn, then the panel lifts away as the page glides up into place.
- **Interaction details:** a custom cursor, magnetic buttons, rolling-text link hovers, and pages start loading as soon as a link is hovered.
- **Services page:** an index of all 20 services. Selecting one opens a pop-up with its original sub-services. Each one is deep-linkable (e.g. `services.html#generative-ai`), which matches the old `/service/<slug>/` URLs.
- **Accessibility and fallbacks:** reduced-motion users get a calm static version. Without WebGL, the hero falls back to a CSS circuit-grid glow.

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
- **Shared blocks (each page's 3D element, page hero, light sheet, services list, product cards, ChatGPT section, contact and careers):** `src/components.mjs`
- **Page layouts:** `src/pages/*.mjs`
- **Styles:** `assets/css/style.css`. The dark tokens (hero, header, menu, footer) are at the top; the light-theme tokens are scoped to `.content` further down.
- **Motion and interactions:** `assets/js/main.js`
- **3D elements:** `assets/js/earth.js` runs them (the file keeps its old name); the elements are in `assets/js/heroes/` (`chip.js`, `network.js`, `layers.js`, `waves.js`, `beacon.js`, `globe.js`, `spark.js`; the home page uses `logowin.js`, page also uses `inknet.js` and `galaxy.js`). The chip's board layout and camera framings (`presets()`) are in `assets/js/circuit.js`; its label positions are `ANCHORS` in `heroes/chip.js`.
- **Logo:** `assets/img/logo.svg` is the 2024 Hamdaz logo (the version on the company LinkedIn page), redrawn as a vector. `favicon.svg`, `favicon.png`, `apple-touch-icon.png` and the high-resolution `logo.png` used by search engines are made from it. If you have the original design file from the designer, replace `logo.svg` with it.

## Libraries (self-hosted in `assets/vendor/`)

| Library | Used for | Licence |
| --- | --- | --- |
| Three.js r160 | 3D scenes | MIT |
| GSAP 3.12.5 + ScrollTrigger | Scroll animations, pinning | GreenSock standard licence (free) |
| Lenis 1.1.13 | Smooth scrolling | MIT |

The night-Earth images (the Contact globe and the Custom ChatGPT panel) are NASA Black Marble (public domain), taken from the `three-globe` package (MIT). Fonts are Archivo, Inter and JetBrains Mono from Google Fonts. Icons are Lucide (ISC) and Simple Icons (CC0).

## Deploying

Upload everything except `src/`, `build.mjs`, `package.json` and `README.md` to the web root.

On Apache hosting (cPanel and most shared hosts), the included `.htaccess` file:
- 301-redirects the old WordPress URLs (`/about-us`, `/services`, `/products`, `/contact-us`, `/service/<slug>/`, `/product/<slug>/`) to the new pages
- forces HTTPS, sets up the 404 page, and turns on compression and caching

## Contact form

The site has no server, so the form opens the visitor's email app or WhatsApp with the message pre-filled. To receive submissions directly, connect it to a form service such as Formspree or Web3Forms.
