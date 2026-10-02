# Worka 便笺市场

便笺源码由作者维护，本仓库维护可发现的目录。Worka 读取 `catalog.json`，从作者仓库的固定 Git 提交添加便笺。

每次添加都会创建独立实例，拥有自己的数据、配置和名称。添加后的更新由实例的安装来源决定；目录撤下或改源不会删除或重定向已有便笺。

## 使用

在支持市场的 Worka 版本中打开技能库 → 市场。也可以使用“从链接添加”，输入 GitHub 仓库或目录链接。自动运行默认暂停，添加后通过“开始使用”完成设置。

首批三个独立公开示例位于 `examples/`：计数器、问候卡、随手清单。它们无需额外后台插件，适合体验安装、配置和独立实例。作者也可以在自己的公开仓库发布便笺。

## 投稿

阅读 [CONTRIBUTING.md](CONTRIBUTING.md)，修改目录并提交 PR。只需 Node.js 24，无安装依赖：

```sh
npm run validate
npm test
npm run validate:remote
```

`catalog.schema.json` 定义格式。图标与截图保存在 `assets/`。维护者合并后客户端刷新即可发现条目，无需发布 Worka 新版本。

目录采用 [Obsidian 社区目录](https://github.com/obsidianmd/obsidian-releases) 的集中列表与 PR 维护方式。问题反馈请优先前往相应便笺的作者仓库。
