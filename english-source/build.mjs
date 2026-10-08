import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
mkdirSync(resolve(root, 'assets'), { recursive: true });
mkdirSync(resolve(here, '.cache'), { recursive: true });
const source = readFileSync(resolve(here, 'page.tsx'), 'utf8').replace('href="/zh"', 'href="./zh.html"');
await build({ stdin: { contents: source, loader: 'tsx', resolveDir: here }, outfile: resolve(here, '.cache/page.cjs'), bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic', external: ['react', 'react/jsx-runtime'] });
const require = createRequire(import.meta.url);
const { default: Home } = require('./.cache/page.cjs');
const rendered = renderToString(React.createElement(Home));
await build({ stdin: { contents: `import React from 'react'; import { hydrateRoot } from 'react-dom/client'; import Home from './page.tsx'; hydrateRoot(document.getElementById('root'), <Home/>);`, loader: 'tsx', resolveDir: here }, outfile: resolve(root, 'assets/arctic-en.js'), bundle: true, platform: 'browser', format: 'esm', jsx: 'automatic', minify: true, define: { 'process.env.NODE_ENV': '"production"' }, plugins: [{ name: 'relative-language-link', setup(b) { b.onLoad({ filter: /page\.tsx$/ }, () => ({ contents: source, loader: 'tsx' })); } }] });
const css = readFileSync(resolve(here, 'globals.css'), 'utf8').replace('@import "tailwindcss";', '') + '\n:root{--font-geist-sans:Arial;--font-geist-mono:ui-monospace}\n';
writeFileSync(resolve(root, 'assets/arctic-en.css'), css);
const html = `<!doctype html>\n<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Complete English itinerary for the 2026 Arctic trip: daily plans, activities, bookings, budget and packing list."><title>78° North | Arctic Trip 2026 — English Itinerary</title><link rel="icon" href="./favicon.svg"><link rel="stylesheet" href="./assets/arctic-en.css"><script type="module" src="./assets/arctic-en.js"></script></head><body><div id="root">${rendered}</div></body></html>\n`;
writeFileSync(resolve(root, 'index.html'), html);
writeFileSync(resolve(root, 'en.html'), html);

// Read the same data used by the page to generate a complete, readable itinerary.
const dataSource = readFileSync(resolve(here, 'page.tsx'), 'utf8').split('function useSaved')[0] + '\nexport { days, activities, bookings, costs, actualCosts, fxSnapshot, kit };';
await build({ stdin: { contents: dataSource, loader: 'tsx', resolveDir: here }, outfile: resolve(here, '.cache/data.cjs'), platform: 'node', format: 'cjs' });
const { days, activities, bookings, costs, actualCosts, fxSnapshot, kit } = require('./.cache/data.cjs');
const money = n => n.toLocaleString('en-GB', {minimumFractionDigits:2, maximumFractionDigits:2});
const cny = row => row[3] * fxSnapshot[row[4]];
const sum = actualCosts.reduce((n,r) => n+cny(r),0);
const paid = actualCosts.filter(r => r[5] === 'Paid').reduce((n,r) => n+cny(r),0);
const md = ['# 78° North — Arctic Trip 2026', '', '**25 September–9 October 2026 · 15 days · 13 overnight stays**', '', 'Two adults travel together until 6 October. One traveller stays in Oslo for two more nights, departs on 8 October and arrives in Hong Kong on 9 October.', '', 'Route: Guangzhou → Amsterdam → Oslo → Longyearbyen (Svalbard) → Tromsø → Senja → Oslo → Bangkok → Hong Kong.', '', 'This is an English translation of the itinerary snapshot checked on **25 September 2026**. Booking and payment statuses describe that snapshot; they are not a retrospective expense reconciliation.', '', '## Daily itinerary', ''];
days.forEach((d,i) => md.push(`### Day ${i+1} · ${d[0]} (${d[1]}) · ${d[2]}`, '', `**${d[3]}**`, '', d[4], '', `Timing/status: ${d[5]}`, '', `Note: ${d[6]}`, ''));
md.push('## Activities', '');
activities.forEach(a => md.push(`### ${a.date} · ${a.title} — ${a.subtitle}`, '', a.plan, '', `- Location: ${a.place}`, `- Time: ${a.time}`, `- Duration: ${a.duration}`, `- Operator/format: ${a.operator}`, `- Meeting point: ${a.meeting}`, `- Included: ${a.includes}`, `- Cost for two: ${a.price}`, `- Status: ${a.status}`, ...(a.link ? [`- Official link: ${a.link}`] : []), '', `Note: ${a.note}`, ''));
md.push('## Bookings', '');
bookings.forEach(b => md.push(`### ${b[2]}`, '', `Category: ${b[1]} · Status: ${b[5]}`, '', b[3], ...(b[4] ? ['', `Link: ${b[4]}`] : []), ''));
md.push('## Border requirements', '', 'Svalbard is outside the Schengen Area. The Oslo–Longyearbyen flight leaves Schengen; the return flight to Tromsø enters it again. The visa must permit a second entry.', '', 'Official guidance: https://www.udi.no/en/word-definitions/svalbard/', '', '## Budget (CNY)', '', 'The budget covers the main trip for two plus the solo extension. It excludes unrecorded fare differences and shopping. Dividing the total by two is only an arithmetic reference; 6–8 October is a solo segment.', '', '| Category | Low estimate | High estimate |', '| --- | ---: | ---: |');
costs.forEach(c => md.push(`| ${c[0]} | ¥${money(c[1])} | ¥${money(c[2])} |`));
md.push(`| **Total** | **¥${money(costs.reduce((s,c)=>s+c[1],0))}** | **¥${money(costs.reduce((s,c)=>s+c[2],0))}** |`, '', '### Recorded expenses', '', `Total recorded: **¥${money(sum)}**. Paid: **¥${money(paid)}**. Unpaid estimate: **¥${money(sum-paid)}**.`, '', `Fixed exchange-rate snapshot: ${fxSnapshot.date}; 1 USD = ¥${fxSnapshot.USD}; 1 NOK = ¥${fxSnapshot.NOK}. Paid foreign-currency entries use this snapshot; unpaid entries are provisional estimates.`, '', '| Recorded date | Category | Item | Original amount | CNY equivalent | Status |', '| --- | --- | --- | ---: | ---: | --- |');
actualCosts.forEach(r => md.push(`| ${r[0]} | ${r[1]} | ${r[2].replaceAll('|','\\|')} | ${r[4]} ${money(r[3])} | ¥${money(cny(r))} | ${r[5]} |`));
md.push('', 'Use booking confirmations and the expense ledger for actual costs. If over budget, reduce optional activities first while preserving weather reserves and safe return buffers.', '', '## Packing list', '', 'Use a moisture-wicking base layer, a warm mid-layer, and a windproof, waterproof outer layer.');
for (const group of new Set(kit.map(x=>x[0]))) { md.push('', `### ${group}`, ''); kit.filter(x=>x[0]===group).forEach(x=>md.push(`- [ ] ${x[1]}`)); }
md.push('', '## Safety', '', '- Use a qualified local guide for trips outside Svalbard settlements because of polar bear risk.', '- Sea conditions, wind and visibility determine routes and may cause cancellations. Reserve days provide a safety margin.', '- Confirm insurance cover for Svalbard, polar travel, search and rescue, medical evacuation and trip cancellation.', '', 'Official links:', '', '- Visit Svalbard safety: https://en.visitsvalbard.com/visitor-information/safety-in-svalbard', '- Governor of Svalbard: https://www.sysselmesteren.no/en/', '- Longyearbyen weather: https://www.yr.no/en/forecast/daily-table/2-2729907/Norway/Svalbard/Longyearbyen', '', 'Flights use local arrival dates. Accommodation is matched to each overnight stay. Unrecorded fare-change costs are excluded from the ledger.', '');
writeFileSync(resolve(root,'TRAVEL_PLAN_EN.md'), md.join('\n'));
console.log(JSON.stringify({ days: days.length, activities: activities.length, bookings: bookings.length, ledgerEntries: actualCosts.length, totalCny: money(sum), paidCny: money(paid), output: root }));
