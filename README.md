# Simple New Tab / 简洁新标签页

一个简洁美观、可自定义的新标签页浏览器插件（WXT + Vue 3）。

## 开发

```bash
pnpm install
pnpm dev
```

## 构建与打包

- **构建**：

```bash
pnpm build
```

- **生成可上传商店的 zip**：

```bash
pnpm zip          # Chrome (MV3)
pnpm zip:firefox  # Firefox (MV2) + sources
```

## 发布（自动生成 GitHub Release）

本项目已配置：**使用 `package.json` 的 `version` 作为扩展版本号**，并在推送到 GitHub 后自动生成 Release。

发布步骤：

1. 修改 `package.json` 里的版本号（推荐用 `pnpm version patch|minor|major`）。
2. 提交并 push 到 `main` 分支（仅同步代码，不会触发 Release）：

```bash
git push origin main
```

3. 创建并推送版本 tag（**只有推送 tag 才会触发 Release**）：

```bash
# 例：package.json version = 1.2.3
git tag v1.2.3
git push origin main --tags
```

4. GitHub Actions 会自动：
   - 执行 `pnpm zip` / `pnpm zip:firefox`
   - 创建 `vX.Y.Z` 的 GitHub Release（若已存在则跳过）
   - 把插件包作为附件上传到 Release（仅上传 `*-chrome.zip` / `*-firefox.zip`，不包含 `sources.zip`）

> 说明：浏览器扩展的 `manifest.version` 必须是纯数字点分段（不允许 `-beta`）。  
> 本项目会把 `1.2.3-beta.1` 自动转换为 `1.2.3` 写入 `version`，同时把完整 semver 写入 `version_name`。
