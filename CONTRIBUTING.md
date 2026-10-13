# 投稿

1. 在作者自己的仓库发布商品源码，并取得固定提交。便笺提供 `worka-note.json`；桌面提供 v3 `desktop.json`，成员便笺可以使用固定远端来源或符合发布契约的随包文件。
2. 从 `main` 建投稿分支（没有仓库写权限时使用 fork），在 `catalog.jsonl` 新增或修改一行。ID 在更新中保持稳定；每行包含 `schemaVersion: 2`、`kind`、`id`、`name`、`author`、`description`、`source`，可选 `tags`、`icon`、`screenshots`。
3. `source` 必须是 HTTPS GitHub 来源并固定完整 commit，例如 `https://github.com/example/notes/tree/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/template`。企业商店另在 `market.config.json` 中限定来源站点。
4. SVG 图标和截图放在 `assets/`，引用仓库内路径；详细说明从商品来源仓库的 README 读取。
5. 运行 README 中的校验命令，并在隔离 Worka 环境验证。桌面必须检查成员选择、取消导入、连线绑定及自己的账号设置；仅源码可下载不代表业务可运行。
6. 提交 PR，说明用途、依赖、已验证和未验证项目。作者不能通过直接推 `main` 上架或更新。仓库无可用 fork 时，向维护者申请投稿分支权限。

`catalog.json` 由 JSONL 的便笺行生成。修改目录后执行 `node scripts/validate.mjs --write-legacy`；下架只影响发现目录，不删除已安装实例。

不要把私有实例 state、账号 config、凭据、缓存、历史或本机工作目录作为商品初始内容。桌面布局及作者声明的安全初始值由已有桌面发布契约负责。
