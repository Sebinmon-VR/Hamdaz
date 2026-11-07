# SEO for hamdaz.com

This file covers what the code already does for search, what to check before launch, and the work that happens outside the code.

## Done in the site (on-site)

- **One page per service** at the old WordPress addresses (`/service/<slug>/`, 38 pages), so links and rankings the old site earned land on a real page again. Each one has an overview, what's included, the delivery process, brands and sectors, FAQs, related services and a contact block.
- **One page per service area** at `/services/<area>/` (9 pages), aimed at broader searches such as "CCTV installation Abu Dhabi" or "cybersecurity company Abu Dhabi".
- **Clients & Projects** (`/projects.html`) and **Insights** (`/insights.html` plus 3 guides).
- **Titles and descriptions:** every page has its own, keyword-led and with a location (checked for duplicates and length on each build check).
- **One H1 per page**, breadcrumbs on every inner page, internal links from the menu, footer, services page, home page and related services.
- **Structured data (JSON-LD):** Organization (with credentials), the Abu Dhabi and Kozhikode offices as ProfessionalService, WebSite, Service (with what's included), BreadcrumbList, FAQPage, CollectionPage, Article.
- **Sitemap** (`sitemap.xml`, 57 URLs) and `robots.txt` (which also keeps `/docs/` out of search).
- **Speed:** images served as WebP (7.6 MB → 3.5 MB for the service, product and hero photos); no loading screen holds back the first paint.
- **Social cards:** each service page uses its own photo as the share image.

## Check before launch

- [ ] **Main phone number.** The site and the structured data use **+971 2 626 5780** as the main number (it is the one in the 2026 profiles); +971 2 309 0211 still shows beside it. Pick one main number and use it everywhere: website, Google Business Profile, LinkedIn and directories.
- [ ] **Address spelling.** The site now says "Millennium Tower" (as in the profiles). Use exactly the same address everywhere: *Office 22, 2nd Floor, Millennium Tower, Hamdan Street, Abu Dhabi, PO Box 5758*.
- [ ] **Read the new page text.** The service, area and insight text in `src/content/*.mjs` was drafted from the AV, ELV and Cybersecurity profiles and the existing site text. Have someone in each team read their pages, especially the FAQs and the three Insight guides, before they go live.
- [ ] **New service photos.** Custom Software & Web, ERP and LMS use crops of other photos for now. Replace `assets/img/svc/<slug>.jpg` and `.webp` with real ones (1000 × 667).
- [ ] **Project details.** Tawazun Industrial Park, Al Lul, Donaldson and Liwa University have no location in the profile; add them in `src/content/projects.mjs` if known.
- [ ] **Client logos.** Only use client names and logos you have permission to show.

## After launch (off-site)

### 1. Google Search Console and Bing
1. Add the property for `hamdaz.com` (Domain property, verified by a DNS TXT record at the domain registrar).
2. Submit `https://hamdaz.com/sitemap.xml`.
3. Use **URL Inspection → Request indexing** for the home page, the 9 area pages and the top service pages (CCTV, access control, managed SOC, meeting rooms, ERP).
4. Check **Pages** after 1–2 weeks: the old `/service/<slug>/` URLs should show as indexed, and old `/about-us/`, `/contact-us/` as redirects.
5. In **Bing Webmaster Tools**, import the site from Search Console (one click).

### 2. Google Business Profile (the biggest win for "near me" and Abu Dhabi searches)
1. Claim or create the profile for the Abu Dhabi office with the exact name, address and phone above.
2. Primary category: something like *Computer support and services* or *Security system installer*; add the others that fit (e.g. *Audio visual consultant*, *Network installation*). Pick from Google's list.
3. Add the services (one per area page), opening hours, the website link, the logo and real photos (office, team, installations).
4. Ask satisfied clients for Google reviews and reply to every review.
5. Post updates (projects, new guides) once or twice a month.
6. Do the same for the Kozhikode office if it serves clients directly.

### 3. Consistent listings (citations)
Use the same name, address and phone on:
- LinkedIn company page (add the website, address, phone, specialities).
- UAE business directories: e.g. Yellow Pages UAE, Connect.ae, 2GIS, and the Abu Dhabi Chamber member directory if a member.
- Apple Business Connect (Apple Maps) and Bing Places.

### 4. Partner and certification listings (strong, relevant links)
- Ask each technology partner to list Hamdaz in their **partner locator** with a link to the matching service page: e.g. Microsoft, Cisco, Fortinet, Extron, Crestron, Q-SYS, Hikvision, Axis, Milestone, Genetec, HID, Nutanix, Veeam.
- Check whether MCC, ICV or ADNOC publish lists of approved suppliers or contractors that can link to the site.

### 5. Content, monthly
- Add one practical guide a month to `src/content/*.mjs` (`articles`), answering real client questions (e.g. "Teams Rooms vs Zoom Rooms", "How long CCTV recordings must be kept", "What a managed SOC costs to run").
- Turn finished projects into short case studies on the Clients & Projects page, with the client's permission.

### 6. Measure
- Search Console **Performance**: track clicks for searches such as *CCTV installation Abu Dhabi*, *MCC approved CCTV*, *access control Abu Dhabi*, *AV integrator Abu Dhabi*, *managed SOC UAE*, *structured cabling Abu Dhabi*, *ERP implementation UAE*.
- PageSpeed Insights for the home page and one service page every few months.

## Later

- **Arabic version:** an `/ar/` copy of the key pages with `hreflang` links would reach Arabic searches in the UAE. The build can support this once the Arabic text is ready.
