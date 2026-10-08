# 78° North — Arctic Trip 2026

25 September–9 October 2026 · 15 days · 13 overnight stays.

Two adult men travel together until 6 October. One traveller stays in Oslo for two additional nights, departs on 8 October and arrives in Hong Kong on 9 October.

Route: Guangzhou → Amsterdam → Oslo → Longyearbyen (Svalbard) → Tromsø → Senja → Oslo → Bangkok → Hong Kong.

## Website

- [Original website — now entirely in English](https://mtysgithub.github.io/arctic-trip-2026/)
- [Chinese backup](https://mtysgithub.github.io/arctic-trip-2026/zh.html)
- [Complete English travel plan](TRAVEL_PLAN_EN.md)

The original URL now opens the full English itinerary directly. The Chinese page is retained separately at `zh.html`. The previously shared `en.html` URL remains an English alias.

The plan includes all 15 days, 8 activities, 20 booking-board entries, budget, 16 expense entries, packing list and safety notes. Dates, amounts and the fixed exchange-rate snapshot are retained from the plan checked on 25 September 2026. Payment statuses describe that snapshot rather than a post-trip reconciliation.

## Checklists

The English page supports itinerary filters, booking and packing checklists, and budget controls. Checklist ticks are saved in the current browser.

The Chinese backup retains the original main site, shared GitHub task board and its link to the existing Chinese environment monitoring dashboard. Shared tasks are available at https://github.com/mtysgithub/arctic-trip-2026/issues.

## Files

- `index.html`: complete English itinerary at the original URL
- `zh.html`: Chinese backup of the original site
- `en.html`: English alias for compatibility
- `TRAVEL_PLAN_EN.md`: complete English plan readable on GitHub
- `assets/arctic-en.js` and `assets/arctic-en.css`: English assets
- `english-source/`: editable English component, styles and export script
- `environment-monitor.html`: existing Chinese environment dashboard
- `.github/workflows/publish.yml`: publishes `main` to `gh-pages`

## Rebuild

```sh
cd english-source
npm install
npm run build
```

The build generates both English HTML entry points, their assets and `TRAVEL_PLAN_EN.md` from the same itinerary data. It preserves the Chinese backup. Commit source and generated files together. GitHub Actions publishes changes pushed to `main`.
