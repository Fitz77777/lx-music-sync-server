# Fork 版本管理

本仓库是 [`lyswhut/lx-music-sync-server`](https://github.com/lyswhut/lx-music-sync-server) 的 fork。
版本号遵循以下约定：

```
<上游版本>-fork.<fork 序号>
```

例如上游 `v2.1.2` 对应的第一个 fork 版本是 `2.1.2-fork.1`。

## 分支策略

| 分支 | 用途 |
| --- | --- |
| `master` | **只用于同步上游**，保持与 `lyswhut/lx-music-sync-server` 一致，不提交 fork 改动，不触发发布 |
| `release` | fork 的正式发布分支，所有 zip 与 Docker 镜像都由推送到该分支触发 |

## 版本规则

- `2.1.2` 跟随上游，不自行修改。
- `fork.N` 只统计当前上游版本下的 fork 发布次数。
- 每次合并上游新版本后，`fork.N` 重置为 `1`。
- Git tag 使用 `v<完整版本号>`，例如 `v2.1.2-fork.1`，由发布工作流自动创建。
- 同步服务没有 versionCode，无需额外维护数字版本。

## 发版命令

```bash
# fork 自己的改动发版：fork 序号 +1
npm run version:bump

# 合并上游新版本后：重置为 <上游版本>-fork.1
npm run version:sync -- 2.2.0
```

也可以继续使用 `npm run publish`，它会自动把 `2.1.2-fork.1` 递增为 `2.1.2-fork.2`。

## 发布流程

1. `git fetch upstream --tags`
2. 更新纯上游镜像：在 `master` 上合并 `upstream/master` 并推送
3. 把 `master` 合并进 `release`
4. 合并上游版本时执行 `npm run version:sync -- <上游版本>`
5. fork 自己迭代时执行 `npm run version:bump`
6. 更新 `publish/changeLog.md`，运行 `npm run publish` 写入更新日志
7. 推送到 `release` 分支
8. `release.yml` 构建 zip 并创建 `v<version>` tag / GitHub Release；`docker-publish.yml` 推送同名版本镜像并更新 `latest`

> 不要直接向 `master` 推送 fork 改动；`master` 只作为上游镜像。

## 与上游的差异

- `package.json` 增加了 `fork.owner` / `fork.repo`。
- `publish/updateChangeLog.js` 支持 `-fork.N` 版本的自动递增，并生成指向 fork 的 compare 链接。
- `release.yml` 由 `release` 分支触发，并在创建 Release 时把 tag 指到本次提交。
- `docker-publish.yml` 由 `release` 分支触发，镜像 tag 直接取 `package.json` 的版本号，并同时更新 `latest`。

## 注意

- Docker 镜像名使用 `${{ github.repository }}`，即 `fitz77777/lx-music-sync-server`，与上游镜像不冲突。
- 同步协议版本（`src/user/data.ts` 里的 `version: 2`）与发布版本号无关，升级 fork 版本不会影响已有数据。
