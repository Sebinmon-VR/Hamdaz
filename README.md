# hamdaz.com

The Hamdaz Technologies website. It's a static site with a real-time 3D AI processor scene, scroll-driven motion and all the original hamdaz.com content. It needs no WordPress, no database and no build dependencies. Upload the files to any web host.

The design pairs a dark, cinematic 3D scene at the top of every page with a light, editorial content sheet that rises over it: ink-navy type on warm paper, hairline rules and numbered sections, with short headlines and one-sentence copy. The logo's cyan and pink are used only as small accents.

## What's in it

- **Home hero:** one screen that plays like a short film (`assets/js/heroes/glass.js`, played by `assets/js/stage.js`): the headline, then AI, Cloud, Data, Infrastructure and Security, each with its details as tags. A tech object made of iridescent glass floats over dark abstract photos (`assets/img/hero/`, Unsplash License) that dissolve into each other between frames, and turns to the cursor on hover. The rail on the right shows the frame playing, jumps to any frame and pauses the film; one scroll goes straight to the content, and the object breaks into the particles that form the people network. The previous chip hero is kept on the local branch `backup/chip-hero-2026-11-07`; `HERO` in `src/pages/home.mjs` switches back to it.
- **Services:** 38 services in 9 areas (`categories` in `src/data.mjs`): AI, data & automation; cybersecurity; cloud & infrastructure; ELV & security systems (MCC-certified CCTV, access control, gate barriers, ANPR, intercom, data centre); audio visual; networking & Wi-Fi; software development (custom software, ERP, LMS, CRM, mobile apps); industry solutions; staffing & outsourcing. The new AV, ELV, cybersecurity and staffing content comes from the 2026 company profiles. The services page has one section per area; the "What We Do" mega menu in the header lists every area and service.
- **A page for every service and area (SEO):** each service has its own page at its old WordPress address, `/service/<slug>/` (overview, what's included, how we deliver it, brands and sectors, FAQs, related services, contact), and each area has one at `/services/<area>/`. Their text (search titles and descriptions, H1s, overviews, benefits, process, brands, sectors and FAQs) is in `src/content/*.mjs`, written from the 2026 company profiles; `src/content/index.mjs` stops the build if a service or area has none. Pages carry structured data (Organization, the two offices as ProfessionalService, WebSite, Service, BreadcrumbList, FAQPage, Article) built in `src/blocks.mjs`.
- **Clients & projects** (`projects.html`): selected projects from the ELV profile (`src/content/projects.mjs`), the client and partner rows, sectors and credentials.
- **Insights** (`insights.html`, `/insights/<slug>/`): practical guides for buyers in the UAE (`articles` in `src/content/*.mjs`).
- **Careers** (`careers.html`, `job.html?id=<token>`): open roles and their application forms, live from the Hamdaz ERP. See [Careers](#careers) below.
- **Clients & partners:** moving rows of client names and partner brands on the home page (`clients` and `partners` in `src/data.mjs`); names only, so logo files can be added later.
- **Light theme below the hero:** the page content sits on a light sheet that overlaps the hero and the navy footer. The header turns white automatically whenever it is over the light sheet.
- **Colours:** the hero, one panel per page (Custom ChatGPT) and the footer use the logo's navy. Photos get a navy duotone so they match each other, and show full colour on hover.
- **Home sections:** Who We Are with the credentials (100+ technology brands, 24/7 support, MCC certified; ISO, ICV, ADNOC supplier), the main managed services as a list with a detail panel (point at one to see its image, summary and what it includes), a grid of AI products, a "find the right service" guide, a technology marquee, and a contact, offices and careers block.
- **Find the right service:** visitors pick a goal (for example "Move to the cloud") and see the services that fit, with WhatsApp and enquiry buttons that arrive pre-filled with that goal. The goals and their services are in `needs` in `src/data.mjs`; every service is listed under at least one goal.
- **Smooth scrolling** (Lenis) with GSAP ScrollTrigger: headlines rise in word by word, content fades up, numbers count.
- **One element per page, told as a story:** Home shows the AI chip, Who We Are a network of people (`assets/js/scenes.js`), What We Do a technology stack of four glass platforms (Security, Cloud, Data, AI), How We Do flowing ribbons of light, Contact the night-side Earth with the Abu Dhabi and India offices (with their local time) joined by a glowing arc (`heroes/globe.js`), and the 404 page a spark of light. The elements are in `assets/js/heroes/`; where each one sits is in `assets/js/heroes/framings.js`, and each page picks its element with `hero:` in `src/pages/*.mjs`.
- **Home page, chip to network** (`assets/js/stage.js`): the hero's AI chip sits on a dark layer behind the page. As the white sheet rises over the hero, the chip breaks up into particles (from its own shape) that stream down onto the sheet and settle as a people network drawn in ink (`assets/js/heroes/inknet.js`), beside the intro text. Further down, a dark section before Contact opens and the network's particles stream down into it, swirling into a spiral galaxy (`assets/js/heroes/galaxy.js`). Both streams follow the scroll (smoothed), so scrolling back up sends the particles back. A particle only shows once it has left its element, so no outline of the last element is ever drawn over the next section.
- **Page switches** (`assets/js/main.js`, the cover is in `src/layout.mjs`): a parallax wipe. A colour band and then a navy panel with the next page's name sweep up over the page; the next page opens covered, waits until its 3D element has drawn, then the panel lifts away as the page glides up into place.
- **Interaction details:** a custom cursor, magnetic buttons, rolling-text link hovers, and pages start loading as soon as a link is hovered.
- **Services page:** every service as a card, grouped by area; each card opens the service's own page. Old links to `services.html#<slug>` forward to that page.
- **Accessibility and fallbacks:** reduced-motion users get a calm static version. Without WebGL, the hero falls back to a CSS circuit-grid glow.

## Pages

| File | Original page |
| --- | --- |
| `index.html` | Home |
| `about.html` | Who We Are (About Us) |
| `services.html` | What We Do (Services) |
| `solutions.html` | How We Do (Products) |
| `contact.html` | Contact Us |
| `projects.html` | Clients & Projects (new) |
| `insights.html`, `insights/<slug>/` | Insights (new) |
| `careers.html`, `job.html?id=<token>` | Careers: open roles and one role with its application form (new) |
| `service/<slug>/` | One page per service (the old service pages) |
| `services/<area>/` | One page per service area (new) |
| `404.html` | Not found |

## Editing content

All text comes from the original hamdaz.com and lives in **`src/data.mjs`**. The HTML pages are generated from it, so edit the source and rebuild:

```bash
node build.mjs           # regenerate all pages and sitemap.xml
node build.mjs --serve   # rebuild and preview at http://localhost:8080
```

- **Header, menu, footer:** `src/layout.mjs`
- **Shared blocks (each page's 3D element, page hero, light sheet, services list, product cards, ChatGPT section, contact and careers):** `src/components.mjs`
- **Page layouts:** `src/pages/*.mjs`. A page module exports one page or a list of pages; pages in folders (`service/<slug>/index.html`) have their relative links rewritten by `build.mjs`, so the source always writes paths from the site root.
- **Service, area and insight text (SEO):** `src/content/*.mjs`; sections and structured data for those pages: `src/blocks.mjs`
- **Images:** pages use the WebP copies (`assets/img/**/*.webp`); the JPGs stay for social-card previews. The images for Custom Software, ERP and LMS are crops of other service photos until real ones are added.
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

Upload everything except `src/`, `docs/`, `build.mjs`, `package.json` and `README.md` to the web root (including the `service/`, `services/` and `insights/` folders). See `docs/SEO.md` for the search-engine set-up after launch.

On Apache hosting (cPanel and most shared hosts), the included `.htaccess` file:
- 301-redirects the old WordPress URLs (`/about-us`, `/services`, `/products`, `/contact-us`, `/product/<slug>/`) to the new pages; the old `/service/<slug>/` addresses are real pages again
- forces HTTPS, sets up the 404 page, and turns on compression and caching

## Careers

The open roles come live from the Hamdaz ERP (`hamdaz-2.0`, `app/hr/public.py`), so nothing is rebuilt when a job is posted. `assets/js/careers.js` fills both pages in the visitor's browser:

- `careers.html` lists `GET <ERP>/careers/openings`: every opening that is **open** and marked **publicly listed** in the ERP, and still before its closing date.
- `job.html?id=<token>` shows `GET <ERP>/apply/<token>/form`: the advert and the application questions HR set up for that role in the ERP (text, email, phone, number, date, choice, tick box and file questions, in the ERP's sections). The application is posted straight to the ERP (`POST <ERP>/apply/<token>`, files up to 15 MB each, at most 5) and lands in the ERP with the candidate's answers and score. Nothing is stored on this site and no cookies are sent.
- The ERP's address is `careers.api` in `src/data.mjs` (the ERP's `PUBLIC_BASE_URL`).
- **Share links:** set `CAREERS_URL=https://hamdaz.com/careers` on the ERP. The link HR copies for an opening then reads `https://hamdaz.com/careers/apply/<token>`, which `.htaccess` (and the dev server) redirects to `job.html?id=<token>`. Without it the ERP's link opens the ERP's own plain form page, which also works.
- If the ERP cannot be reached, both pages say so and offer the visitor to email their CV instead. `job.html` is `noindex`, since it is empty without a role.

## Contact form

The site has no server, so the form opens the visitor's email app or WhatsApp with the message pre-filled. To receive submissions directly, connect it to a form service such as Formspree or Web3Forms.
