---
title: "Agent Plugins のチーム配布と、それに耐えられるスキル設計"
emoji: "🤔"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["githubcopilot", "agentskills"]
published: true
publication_name: "port_inc"
---

# はじめに

ポート株式会社の Cano です。👋

以前、Instructions の整備をエージェントに任せる方法を書きました。

https://zenn.dev/port_inc/articles/lazy-copilot-customization

当時は指示ファイルを配置している `.agents/` フォルダを git 管理せず、チームへの共有は「よかったら使ってね」と Google Drive に入れておき、一応共有されてる程度の状態でした。

しかしながら、これでは導入のためにダウンロードして、適切なフォルダに配置して、更新があれば再ダウンロードして...と手間がかかります。

ちょうどこの課題をどうにかしたいと考えていたタイミングで、Agent Plugins が VS Code 1.110 でサポートされました。

https://code.visualstudio.com/updates/v1_110#_agent-plugins-experimental

Agent Plugins は前述の課題をまさに解決してくれます。
導入は GUI から数クリック、更新は日次で自動、必要なものだけ選んでインストールできます。

この記事では、Agent Plugins の基本的な使い方と、プラグイン化に当たって考慮したことについて書きます。

# Agent Plugins とは

Agent Plugins はエージェント用カスタムファイルをまとめたパッケージです。

プラグインには以下の要素を含めることができます。

- Skills
- Commands (`prompt.md`)
- Agents (`.agent.md`)
- Hooks
- MCP

`instructions.md` はプラグインに含めることができません。
配布できると便利な場面はあると思うのですが、基本的にルールはリポジトリや個人に閉じられるものであり、プラグインに含むものではないでしょう。

個人的にはマシン間の同期をどうするか悩んでいるので、良い方法があれば知りたいところです。

Marketplace となるリポジトリを用意し、そこにプラグインを配置すれば、配布の体制が整います。
VS Code では、設定から Marketplace を登録すれば、拡張機能ビューから簡単に導入が可能になり、24 時間ごとに自動で更新も行なってくれます。

## Marketplace の設定方法

### リポジトリの構造

Marketplace リポジトリの構造は以下のようになります。

```
your-marketplace/
  .github/plugin/
    marketplace.json  # プラグイン一覧を管理する
  plugins/
    foobar/
      plugin.json     # プラグインのメタデータ
      agents/         # カスタムエージェント
        *.agent.md
      commands/       # スラッシュコマンド
        *.md
      hooks/          # Hooks
        hooks.json
      skills/         # スキル
        foobar/
          SKILL.md
      .mcp.json       # MCP サーバー
```

プラグインの一覧は `.github/plugin/marketplace.json` で管理します。

各プラグインは `plugins/` 配下にディレクトリとして配置し、そこに Skills / Agents / Commands / Hooks / MCP の各要素を配置します。

プラグインの構成は Claude Code の形式に合わせているのかもしれません。
スラッシュコマンドの定義は、GitHub Copilot では `prompts/*.prompt.md` ですが、プラグインでは `commands/*.md` になっています。

### インストール

VS Code の場合、まず `settings.json` に Marketplace リポジトリを `owner/repo` で指定します。

```jsonc
{
  "chat.plugins.enabled": true,
  "chat.plugins.marketplaces": [
    "your-org/your-marketplace"
  ]
}
```

あとは拡張機能のビューで `@agentPlugins` と検索するとインストール可能なプラグイン一覧が表示されます。
インストールしたプラグインのスキルやエージェントは、ローカルの定義と並んでそのまま使えます。

# チーム共有のための設計

個人で指示ファイルを整備しているうちは、あまり指示ファイル同士の結合度などを考えず、全体で 1 つのセットのように扱っていました。

プラグイン化にあたってこの点を解消し、他プロジェクトでも使える汎用的な設計にしたいと考えました。以下では、そのために行った 2 つの対応を紹介します。

対応内容はシンプルで、プロジェクト固有のルールを分離し、指示ファイル同士の直接参照は避けることです。

主にスキルを扱っていたため、スキルの設計に関する内容が中心です。

## プロジェクト固有のルールを分離する

スキルを普通に作っていると、「常時必要ではない」という理由で instructions には書いていないルールを含めてしまいがちです。

例えば PR 作成のスキルにおける、タイトルの命名規則やテンプレート・ラベル・レビュアーの選定などです。

このようなルールを分離するために、プロジェクト固有のルールをまとめたスキルを用意しました。

イメージは以下のような感じです。

```markdown:your-project-pr-rules/SKILL.md
---
name: your-project-pr-rules
description: XXX プロジェクトにおける PR のルールを提供する。テンプレート・ラベル・レビュアー設定・タイトルプレフィックスなど、PR を作成・更新する場面で参照する。
user-invocable: false
---

- テンプレートは 2 種類ある。タスクに応じて適切なテンプレートを選択する。
  - `PULL_REQUEST_TEMPLATE.md`（通常の PR 用）
  - `MIGRATION_PULL_REQUEST_TEMPLATE.md`（マイグレーション用）
- ラベルは実装内容・状況に応じて以下から選択する。
  - `bug`
  - `enable preview`
- レビュアーには `@your-team` をアサインすること。
- GitHub Actions によって自動で付与されるタイトルプレフィックがある。削除しないこと。
```

プロジェクト固有のルールを専用のスキルに分離したことで、PR 作成のスキルは「PR を作成するための一貫したフロー」のみに関心を持つことができるようになり、異なるプロジェクトでも使えるようになります。

ルールは一貫して instructions にあるべきな気もするので、そもそも専用スキルではなく、instructions にドキュメントへのリンクを貼っておく、などの対応でも良いかもしれません。🤔

## 直接参照を避ける

スキルのスコープを説明したり、オプショナルな次のステップを案内する目的で、別のスキル名を参照しているスキルがいくつかありました。

例えばレビュースキルにおいて、「レビューコメントを投稿する場合は `port-review-comment` スキルを参照する。」のような記述です。

```markdown:review/SKILL.md
---
name: review
description: PR をレビューする
---

## step n

PR へのコメント投稿をする場合、`post-review-comment` スキルを参照する
```

プラグインに移行するにあたって、これらは別々のプラグインに分離したため、片方のみがインストールされていると参照切れを起こします。

このような記述はスキルの description の品質が十分であれば、参照する必要があるとエージェントが自律的に判断できます。

基本的には対象スキルの description を見直し、参照する記述を削除するのが良いです。

```diff markdown:review/SKILL.md
  ---
  name: review
  description: PR をレビューする
  ---

- ## step n
- 
- PR へのコメント投稿をする場合、`post-review-comment` スキルを参照する
```

あるいは、フローとしては組み込みたいなどの意図があれば、スキル名ではなく自然言語で記述するのが良いと考えています。

実際に先ほどの PR 作成のスキルでは、最初にルールを確認して欲しいため、そのように記述しています。

```markdown:create-pr/SKILL.md
---
name: create-pr
description: PR を作成するための一貫したフローを提供する
user-invocable: false
---

## 1. PR の品質基準を整理する

以下を確認して整理する。

- プロジェクトのルール <!-- ← これをスキル発火のトリガーにしている -->
- ユーザーの指示
- 現在のブランチの作業内容
```

# おわりに

Agent Plugins を利用することで、これまで個人の工夫に閉じられていた指示ファイルをチームで共有することが容易になりました。

また、汎用化のための記述の整理によって、ルールの追加や更新もどこに記述するかが明確になり、以前よりやりやすくなったと感じます。

# 参考

https://code.visualstudio.com/docs/copilot/customization/agent-plugins
