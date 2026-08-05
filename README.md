# 北纬 78°｜2026 北极之旅

两位成年男性，旅行日期：2026-09-25 至 2026-10-06。

路线：

中国 → 奥斯陆 → 朗伊尔城（斯瓦尔巴）→ 特罗姆瑟 → 塞尼亚 → 奥斯陆 → 中国

## 在线网站

https://mtysgithub.github.io/arctic-trip-2026/

## 共享任务板

https://github.com/mtysgithub/arctic-trip-2026/issues

网站会实时读取以 `[P0]`、`[P1]`、`[P2]` 开头的 GitHub Issues：

- 在 Issue 内勾选子事项并记录非敏感信息；
- 整项完成后关闭 Issue；
- 刷新网站即可看到共同完成进度；
- 不要在公开仓库上传护照、签证页、保单号、电话号码等敏感信息。

## 项目结构

- `index.html`：路线、风险、时间优先级与动态任务板
- `.github/workflows/publish.yml`：将 `main` 自动发布到 `gh-pages`
- `gh-pages`：GitHub Pages 的发布分支

每次修改并提交到 `main` 后，GitHub Actions 会自动更新线上网站。