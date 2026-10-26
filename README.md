# Worka 商店

本仓库维护便笺和桌面的发现目录。商品源码与详细 README 由来源仓库维护；商店保存固定 Git 引用、简短介绍、图标和截图。

`catalog.jsonl` 是唯一编辑入口，每行一个 JSON 对象。`kind` 为 `note` 或 `desktop`；来源必须固定到完整 40 位 Git commit。便笺目录包含 `worka-note.json`，桌面目录包含 v3 `desktop.json`。桌面导入会创建新桌面，可选择成员便笺并保留适用的分组和连线。

新增、更新和下架商品均通过 PR。`main` 要求 PR，规则覆盖管理员；投稿分支可以提交，主分支不能直接推送。PR 合并后客户端刷新商店即可读取新目录。

```sh
node scripts/validate.mjs --write-legacy
node --test scripts/validate.test.mjs
node scripts/validate.mjs
node scripts/validate.mjs --remote
```

`catalog.schema.json` 定义单行格式。`assets/` 保存图标与截图；不要提交账号、实例数据、工作报告或凭据。远端验证只读取已配置站点。

`catalog.json` 是为旧客户端保留的便笺目录快照，由校验命令生成，不独立编辑；桌面商品只在 JSONL 中出现。

详细投稿要求见 [CONTRIBUTING.md](CONTRIBUTING.md)。

### 跟随 main

商品可声明 `"trackingRef":"main"`。支持此字段的 Worka 会在打开详情及检查更新时解析来源仓库的 main；预览与安装锁定解析得到的同一提交，已安装便笺仍由用户确认更新。此后推送 main 即可提供新版，无需每次更新目录。

`source` 继续保留完整 commit，作为旧客户端的固定发布快照；未声明 trackingRef 的商品也保持固定版本。目录缓存仅缓存商品声明，不缓存 main 的更新检查结果。`validate:remote` 对跟随条目检查 main，其余条目检查固定提交。
