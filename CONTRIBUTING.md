# 添加或更新便笺

1. 发布公开 GitHub 仓库；根目录或选定子目录必须包含 `worka-note.json`，列出明确发布文件和安全初值。
2. README 说明用途、操作方式、配置项和依赖的后台能力。用户的业务数据、凭据、账号和机器路径不作为发布默认值。
3. 在 `catalog.json` 新增条目。ID 使用 `作者/便笺名` 格式，永久稳定；已有 ID 不分配给另一个作品。
4. 名称和图标沿用发布声明。SVG 复制到 `assets/<id>/icon.svg`；截图可选。修改这些素材时同步提交目录 PR。
5. 本地运行校验，在 PR 中说明测试的 Worka 版本、安装步骤及首次配置。

## 字段

必填：`id`、`name`、`author`、`description`、`source`。可选：`tags`、`icon`、`screenshots`。

`source` 支持 `https://github.com/owner/repo` 和 `https://github.com/owner/repo/tree/ref/path`。根链接跟随默认分支；分支来源在安装时固定实际 commit，tag/commit 来源保持固定版本。无需把最新版本或 commit 重复写到目录中。

图标支持 `{ "type": "emoji", "value": "🌤️" }` 或 `{ "type": "svg", "path": "assets/weather/icon.svg", "monochrome": false }`。只有没有作者图标时才使用默认图标。

## 维护者核验

CI 验证目录、重复 ID、图片路径以及远端发布声明。远端检查只读取 Git 文件，不执行作者脚本。合并前在隔离 Worka 桌面实际添加，核对配置说明、主要操作和图标，并记录使用的 Worka 版本。格式检查通过不代表交互已经验收。

普通源码更新直接发布到作者仓库；目录信息变化通过 PR。撤下时删除条目，不删除用户实例。迁移来源只作用于新安装，已有安装保留原来源。第一版不管理评分、下载量、账号或付款。
