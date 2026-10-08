# 北纬 78°｜2026 北极之旅 / 78° North — Arctic Trip 2026

两位成年男性共同旅行至 2026-10-06；其中一人继续在奥斯陆停留两晚，于 2026-10-08 返程，2026-10-09 抵达香港。

Two adult men travel together until 6 October 2026. One traveller stays in Oslo for two additional nights, departs on 8 October and arrives in Hong Kong on 9 October.

路线 / Route:

中国 → 奥斯陆 → 朗伊尔城（斯瓦尔巴）→ 特罗姆瑟 → 塞尼亚 → 奥斯陆 → 同行者返程 / 一人奥斯陆延长两晚 → 中国

China → Oslo → Longyearbyen (Svalbard) → Tromsø → Senja → Oslo → companion's return / two-night solo extension → China

## 在线网站 / Website

- [中文版 / Chinese](https://mtysgithub.github.io/arctic-trip-2026/)
- [English itinerary](https://mtysgithub.github.io/arctic-trip-2026/en.html)
- [Complete English travel plan](TRAVEL_PLAN_EN.md)

The English version translates the full itinerary snapshot checked on 25 September 2026: all 15 days, 8 activities, 20 booking-board entries, budget, 16 expense entries, packing list and safety notes. Dates, bookings, amounts and the fixed exchange-rate snapshot are retained. Payment statuses describe that snapshot, rather than a post-trip reconciliation.

## 共享任务板 / Shared task board

https://github.com/mtysgithub/arctic-trip-2026/issues

中文主站会实时读取以 `[P0]`、`[P1]`、`[P2]` 开头的 GitHub Issues：

- 在 Issue 内勾选子事项并记录非敏感信息；
- 整项完成后关闭 Issue；
- 刷新网站即可看到共同完成进度；
- 不要在公开仓库上传护照、签证页、保单号、电话号码等敏感信息。

The Chinese main site reads GitHub Issues whose titles start with `[P0]`, `[P1]` or `[P2]`. Check subtasks in an issue, close completed issues and refresh the site to see shared progress. Keep passport scans, visa pages, policy numbers and phone numbers out of this public repository.

The English itinerary retains the booking and packing checklists and budget controls from the current Sites plan. Checklist ticks are saved in the current browser. It does not read or translate live GitHub Issues.

## 项目结构 / Files

- `index.html`: Chinese main site with an English link
- `en.html`: complete English itinerary, readable before JavaScript loads
- `TRAVEL_PLAN_EN.md`: full English plan for reading directly on GitHub
- `assets/arctic-en.js` and `assets/arctic-en.css`: English page assets
- `english-source/`: editable English component, styles and export script
- `environment-monitor.html`: existing Chinese environment monitoring dashboard
- `.github/workflows/publish.yml`: publishes `main` to `gh-pages`

## Rebuild the English page

```sh
cd english-source
npm install
npm run build
```

This generates `en.html`, its two assets and `TRAVEL_PLAN_EN.md` from the same itinerary data. Commit the source and generated outputs together.

每次修改并提交到 `main` 后，GitHub Actions 会自动更新线上网站。

After each commit to `main`, GitHub Actions updates the published website.
