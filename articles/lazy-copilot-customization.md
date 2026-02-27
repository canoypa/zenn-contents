---
title: 頑張らない Instructions 整備
emoji: "😴"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: [プロンプトエンジニアリング, agentskills, githubcopilot, github]
published: true
publication_name: "port_inc"
---

## TL;DR

- Instructions 整備は面倒くさい！エージェント自身にやらせよう
- そのために、メタプロンプトなどを用意しよう
- 調整したいことがあれば「更新しておいて」とお願いするだけで OK 👌

## はじめに

ポート株式会社で新卒 2 年目の Cano です。👋

ここ数ヶ月はエージェント向けの Instructions 整備に力を入れています。

Instructions 整備は、エージェントにチーム・プロジェクトのルールに沿って行動してもらうために重要であり、また自分の好みに合わせてカスタマイズする楽しみがあります。

一方で、いちエンジニアとして重視すべきなのは「成果物」です。

ここにはジレンマがあります。

- エージェントを活用できれば、成果物を早く出せる
- エージェントが適切に動くには、Instructions の整備が必要
- でも Instructions 整備に時間を使うと、その分は成果物を出せない

Instructions 整備がゼロの状態であれば、一度投資として時間を設けるのも良いかもしれません。

実際、弊社では「AI Week」と題して、チーム全体でエージェントの活用に取り組む期間が設けられました。💃

https://zenn.dev/port_inc/articles/f6803af057f4d3

ただ、その後は保守のパートがやってきます。日々変わりゆくルールや好みに合わせて、継続的に Instructions を更新していく必要があります。

そんな作業に多くの時間をかけるのは勿体無いですし、人が書くと更新漏れなども発生しやすいですし、何より面倒くさいです。

エンジニアは「怠惰」であるべきです。ここは Instructions 整備のためのプロンプトを用意し、エージェント自身に丸投げできる体制を作ってしまいましょう。

この記事では、メタプロンプトを活用して、片手間かつ素早く整備サイクルを回すアプローチについて書きます。

:::message
AI 向けの指示を AI 自身に書かせる指示のことを「メタプロンプト」と呼ぶようなので、この記事でも「メタプロンプト」と呼びます。
:::

## 前提

- GitHub Copilot
  - 筆者は GitHub Copilot を利用しているため、この記事の内容は GitHub Copilot が前提。
  - 根本的には「知識を Markdown に書いておく」という話ではあるので、他のツールでも同様のアプローチは可能かと思う。
- .gitignore した `.agents/` フォルダ配下での運用
  - 加速的に作成・削除していくために、Git 管理せず個人的に運用している。
  - チームへの共有は Google Drive に上げて「よかったら使ってね」という緩い運用に留めている。

## 準備したもの

### 各種ファイル作成のスキル

エージェント自身に Instructions を整備させるためには、Instructions のベストプラクティスを知識として与える必要があります。

これには Agent Skills が最適です。

`*.instructions.md`, `*.prompt.md`, `*.skill.md`, `*.agent.md` それぞれについて、整備のためのスキルを用意しました。

それぞれの中身は、VS Code や Claude のドキュメントをまとめさせ、個人的な好みを反映させただけで、そこまで特別なものではないです。

- `instruction-writing`: Instructions 作成のスキル
  - 参考: [Use custom instructions in VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)
- `prompt-writing`: prompt 作成のスキル
  - 参考: [Use prompt files in VS Code](https://code.visualstudio.com/docs/copilot/customization/prompt-files)
- `skill-writing`: スキル作成のスキル
  - 参考: [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- `agent-writing`: エージェント作成のスキル
  - 参考: [Custom agents in VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-agents)

この 4 つのスキルにより、エージェントは instructions/prompts/skills/agents それぞれの「正しい書き方」を知ることができます。

:::details 実際のスキルの例 (skill-writing)

````markdown:skill-writing/SKILL.md
---
name: skill-writing
description: スキル定義ファイル（SKILL.md）の作成・更新を支援する。frontmatter 設計、description のトリガーキーワード調整、本文構成、progressive disclosure 設計、発火テストを含む。スキル作成、SKILL.md、frontmatter、description、.agents/skills、発火しない、トリガーワード、name フィールド、スキル競合などの言及時に使用。
---

# Skill Writing

## Quick Reference

- 実行手順: `.agents/prompts/create-skill.prompt.md`
- 雛形生成: `.agents/skills/skill-writing/scripts/init_skill.sh {name}`
- 記述原則「短く強く」/ ファイルパスリンク判断: `.agents/skills/copilot-instructions-maintenance/SKILL.md`
- スクリプト作成: `.agents/skills/agent-script-writing/SKILL.md`

## よくある致命的ミス

### 1. name が不正 → スキル認識されない

- ❌ `name: MySkill`, `name: スキル名`
- ✅ `name: my-skill`（要件は Frontmatter > MUST 参照）

### 2. description が曖昧 → 発火しない / 競合に負ける

- ❌ `description: ドキュメントを扱う`
- ✅ `description: Excelスプレッドシートを分析し、ピボットテーブルを作成する。Excelファイル、.xlsxファイルを分析する際に使用。`

### 3. 本文が冗長 → コンテキスト圧迫

AI エージェントは既に賢い。手順・制約・例（必要最小限）に絞る。

## Frontmatter

発火の決定打。`name` と `description` の2フィールドのみ。

```yaml
---
name: your-skill-name
description: [何をする]。[いつ使う]に使用。[トリガーワード]などの言及時に使用。
---
```

### MUST（バリデーション要件）

- `name`: 小文字・数字・ハイフンのみ、64文字以内、XMLタグ/予約語（`anthropic`, `claude`）禁止
- `description`: 空禁止、1024文字以内、XMLタグ禁止、三人称で書く
- 上記2フィールド以外を frontmatter に書かない

### SHOULD（発火率・競合耐性）

**description の構造**: What（何をするか）+ When（いつ使うか）+ Keywords（トリガーワード）

**Keywords の書き方**:
- 具体的な拡張子・ツール名・固有名詞を含める（例: `.xlsx`, `gh pr diff`, `SKILL.md`）
- 表記揺れを吸収する（例: `PR, pull request, プルリクエスト`）
- 競合を避ける限定語を最低1つ含める

**避けること**:
- 一般語だけで構成しない
- 一人称・二人称を使わない
- 本文に "When to Use" セクションを書かない（description に集約）

## 自由度の設計

タスクの脆弱性に合わせて指示の具体度を調整する。

- **High（目的＋ヒント）**: 複数の正解があり、状況で変わる → テキストベース指示
- **Medium（推奨パターン＋パラメータ）**: 既定パターンがあるが設定で変わる → 疑似コード
- **Low（手順固定）**: 失敗が致命的、順序厳守 → 具体コマンド/スクリプト

複数手段がある場合は**デフォルトを1つ提示**し、必要なときだけ例外を示す。

## Anatomy of a skill

```
.agents/skills/{name}/
├── SKILL.md          # 必須: メイン指示（発火時に読み込まれる）
├── scripts/          # 任意: 実行可能コード
├── references/       # 任意: 必要時に読む詳細ドキュメント
└── assets/           # 任意: 出力用素材（コンテキストに読み込まない）
```

1スキル = 1能力。トリガーワード・入出力・失敗パターンのいずれかが別物なら分割する。

## SKILL.md 本文の構成

**記述トーン**: 命令形/不定詞で統一する（「〜する」「〜を確認」）。説明文体（「〜します」「〜できます」）は使わない。

### 構成パターンの選択

スキルの性質に合わせて構成を選ぶ:

- **Workflow-Based**: 順序のある手順 → 「Step 1 → Step 2 → ...」
- **Task-Based**: 独立した操作の集合 → 「Quick Start → タスクA → タスクB」
- **Reference/Guidelines**: 基準や仕様 → 「Guidelines → Specifications → Usage」
- **Capabilities-Based**: 相互関連する機能群 → 「Core Capabilities → 1. Feature → 2. Feature」

パターンは混合可能。`init_skill.sh` が生成するデフォルト（下記）は Workflow-Based 寄り:

1. **よくある致命的ミス** — 陥りやすい罠を先に提示
2. **手順** — 核となるステップを最短経路で
3. **使い分け** — 複数パターンがある場合のみ
4. **絶対守るルール** — MUST/SHOULD 明記
5. **例** — 出力品質が例に依存する場合のみ

**500行以内**に収める。超えそうなら progressive disclosure で分離。

## 共通パターン

本文で使えるパターン。詳細は[公式 BP: Common patterns](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices#common-patterns) 参照。

- **テンプレート**: 出力形式を固定する場合。厳格さの度合いを明示
- **入出力例**: 説明より例が効果的な場合、Input/Output ペアで示す
- **条件分岐**: 「〜なら → A手順」形式。大きくなったら別ファイルに分離
- **ワークフロー & フィードバックループ**: 複雑な多段作業にはチェックリスト型 + 検証ループ。[詳細](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices#use-workflows-for-complex-tasks)
- **plan-validate-execute**: 破壊的操作やバッチ処理向け。[詳細](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices#create-verifiable-intermediate-outputs)

## Progressive disclosure

SKILL.md が肥大化する場合、詳細を `references/` に分離。

- 参照ファイルは **SKILL.md から直接リンク**する（ネスト参照禁止）
- 100行超の references は冒頭に目次を付ける
- 大サイズ（>10k words）の references は、SKILL.md に grep パターンを記載して部分参照を可能にする
- 同じ情報を SKILL.md と references の両方に書かない

```markdown
## 応用
- **詳細仕様**: [references/details.md](references/details.md)
- **API参照**: [references/api.md](references/api.md)
```

## Anti-patterns

- パスは `/` を使う（Windows形式 `\` は避ける）
- time-sensitive 情報を本文に書かない（現在推奨のみ記載）
- MCP ツール参照時は完全修飾名を使う（`ServerName:tool_name`）
- README, CHANGELOG, INSTALLATION_GUIDE 等の補助ドキュメントを含めない（スキルは AI エージェントが仕事に使う情報のみ）

## テストと評価

### 発火テスト（最低6ケース）

- 発火すべき3件: トリガーワードを含む自然な質問
- 発火しないべき3件: 似た語を含むが別スキル向きの質問

runSubagent でテスト可能。テスト時は「スキル定義を読み込ませず」純粋なユーザーとして振る舞わせる。

反復改善は[公式 BP: Develop Skills iteratively](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices#develop-skills-iteratively-with-claude) 参照。

## Checklist

スキル作成・更新後の最終確認:

- [ ] `name` が公式要件（文字種、長さ、予約語、XMLタグ禁止）を満たす。
- [ ] `description` が What/When/Keywords を満たし、限定語で競合回避できている。
- [ ] SKILL.md 本文が500行未満。
- [ ] 一般説明が過剰でない（AI エージェントは既に知っている前提）。
- [ ] テンプレート構造（よくある致命的ミス → 手順 → 使い分け → ルール → 例）に沿っている。
- [ ] progressive disclosure 使用時、references が1階層でリンクされている。
- [ ] 発火3件/非発火3件のテストを実施済み。
````

:::

### 新規作成手続きの Prompt

スキルで「何を書くべきか（ベストプラクティス）」を理解できる状態にしましたが、新規作成時の手続的な部分は別途 Prompt としました。

- `create-instruction.prompt.md`: Instructions 作成手順
- `create-prompt.prompt.md`: Prompt 作成手順
- `create-skill.prompt.md`: スキル作成手順
- `create-agent.prompt.md`: エージェント作成手順

例えば `create-skill.prompt.md` では以下のようにステップを明示しています。

1. ヒアリング: ユーザーからチャット例・期待する挙動などを聞き出す
2. 初期化: スクリプトを実行してテンプレートを適切な位置に配置
3. 設計: 既存スキルとの競合を確認し、スキル全体の構成を設計
4. 本文記述: テンプレートと作成スキルに沿って、本文を記述
5. 検証: 発火テスト・非発火テストで動作確認

スキルが「正しい書き方」を知り、Prompt が「正しい作り方の手順」を実行する、という役割分担です。

:::details 実際の Prompt の例 (create-skill.prompt.md)

````markdown:create-skill.prompt.md
---
name: create-skill
description: Agent Skill を作成する
agent: Meta
---

# スキル作成手順

`.agents/skills/` 配下に新しいスキルを作成する際の手順書です。

## 前提知識

スキルの設計原則、frontmatter の書き方、本文の構成方法、テスト方法については、[skill-writing スキル](/.agents/skills/skill-writing/SKILL.md) を参照してください。

## Quick start

1. 具体例を3つ集める（入力/期待出力/失敗パターン）
2. `init_skill.sh {slug}` を実行する
3. frontmatter の `description` を最優先で調整する
4. 本文を書く（「手順」「ルール」「最小限の例」中心）
5. テスト・反復する（発火→品質→競合）

## 作成手順

### Step 1: 具体例を収集する

スキル設計の基礎となる具体例を収集します。以下の表を3行埋めてください：

| 入力（ユーザーの自然文）                          | 期待する出力                                                | 落とし穴（競合/境界条件） | description に入れる限定語                |
| ------------------------------------------------- | ----------------------------------------------------------- | ------------------------- | ----------------------------------------- |
| （例）「SKILL.mdのdescriptionが弱くて発火しない」 | description 改善案を2～3案提示し、発火/非発火テスト文も出す | YAML編集スキルに吸われる  | `.agents/skills`, `name:`, `description:` |

### Step 2: スキルの雛形を作成する

以下のコマンドを実行して、新しいスキルの雛形を作成します：

```bash
.agents/skills/skill-writing/scripts/init_skill.sh {new-skill-slug}
```

`init_skill.sh` の詳細については、[skill-writing スキルの init_skill.sh セクション](/.agents/skills/skill-writing/SKILL.md#init_skillsh-について) を参照してください。

### Step 3: 1スキル=1能力に設計する

分割が必要かを判断します。判断基準は [skill-writing スキルの 1スキル=1能力の原則](/.agents/skills/skill-writing/SKILL.md#1スキル1能力の原則) を参照してください。

### Step 4: frontmatter を書く

生成された SKILL.md の frontmatter を編集します。
要件とベストプラクティスは [skill-writing スキルの Frontmatter の書き方](/.agents/skills/skill-writing/SKILL.md#frontmatter-の書き方) を参照してください。

### Step 5: 本文を書く

テンプレートに沿って本文を記述します。
推奨セクション構成は [skill-writing スキルの SKILL.md 本文の構成](/.agents/skills/skill-writing/SKILL.md#skill-md-本文の構成) を参照してください。

### Step 6: テストと反復

作成したスキルをテストし、改善します。

#### 6-1. レビュー観点でセルフチェック

[skill-writing スキルのレビュー観点](/.agents/skills/skill-writing/SKILL.md#レビュー観点) を参照して、以下を確認します：

1. テンプレート準拠チェック（最優先）
2. 公式要件チェック
3. 発火・品質・競合チェック

#### 6-2. テスト入力で確認

[skill-writing スキルのテスト入力テンプレ](/.agents/skills/skill-writing/SKILL.md#テスト入力テンプレ発火3件非発火3件) を参考に、発火3件/非発火3件のテストを実行します。

#### 6-3. runSubagent で評価

`runSubagent` ツールを使って、実際のエージェント挙動を確認します。詳細は [skill-writing スキルの runSubagent を使ったテスト方法](/.agents/skills/skill-writing/SKILL.md#runsubagent-を使ったテスト方法) を参照してください。

実行例：

```
"既存のスキル定義を読み込ませずに、純粋なユーザーとして振る舞って"
"SKILL.md のdescriptionが弱くて発火しない。改善案を出して"
```

エージェントの挙動（使用スキル、回答内容）が期待通りかを観察し、必要に応じて `description` やルールを調整します。

#### 6-4. 反復

[skill-writing スキルの反復の基本](/.agents/skills/skill-writing/SKILL.md#反復の基本) を参考に、問題を特定して対処します：

- 発火しない → まず `description` を直す
- 従わない → 本文の手順・ルールの書き方を直す
- 肥大化する → progressive disclosure を使う

## 完了時の確認

作成が完了したら、[skill-writing スキルの Definition of Done](/.agents/skills/skill-writing/SKILL.md#definition-of-done) と [Checklist for effective skills](/.agents/skills/skill-writing/SKILL.md#checklist-for-effective-skills) で品質を確認してください。
````

:::

### Meta エージェント

上記のスキル・Prompt を使って実際に Instructions 整備の作業を主導するカスタムエージェントも用意しました。

- `meta.agent.md`

このエージェントには Instructions 整備の基礎となるペルソナ・知識を与えています。

- ペルソナ設定: 責務の理解や、受けた指示は Instructions 整備に関わるものであるという前提作り
- 動作環境の理解: `.agents/` が .gitignore されており、そのままでは検索ツールに引っかからないことの把握
- 利用可能なツール: どのスキル・Prompt が使えるのか、それぞれの役割は何かへの理解
- 作業範囲の制限: Instructions 整備に特化し、通常のアプリケーションコード変更は行わないこと

これにより、通常のタスクやアプリケーションコードに振り回されることなく、Instructions 整備に集中する人格を用意できます。

:::details 実際の Meta エージェントの例 (meta.agent.md)

````markdown:meta.agent.md
---
name: Meta
description: instructions/prompts/skills/agents の整備・メンテナンスに特化したエージェント
---

# モードの役割と制約

あなたは Copilot の instructions/prompts/skills/agents ファイルの整備・運用に特化したエージェントです。

**通常のタスク実行（アプリケーションコードの変更、機能実装、データ確認など）は行いません。**
指示は基本的に「AIの動作・表示・手順を確認・改善したい」という意図として解釈してください。

例：
- ✅ 「User.lastを取得して」→ rails runner実行時のAIの説明や動作を確認したい
- ✅ 「reviewを実行して」→ review時のAIの動作を確認したい
- ❌ 通常のコード実装やバグ修正を行う

ただし、整備の文脈で以下は実行します：
- subagentの起動（動作確認のため）
- 既存ファイルの参照・確認
- ローカル除外ディレクトリ（`.agents/`, `.private/`）の編集

---

# スキル参照

詳細な運用ルールは [`copilot-instructions-maintenance` スキル](/.agents/skills/copilot-instructions-maintenance/SKILL.md) に記載されています。
このスキルに基づいて行動してください。

# 主な責務

- `.agents/instructions/*.instructions.md` の作成・更新
- `.agents/agents/*.agent.md` の作成・更新
- `.agents/prompts/*.prompt.md` の作成・更新
- `.agents/skills/*/SKILL.md` の作成・更新

これらの整備のため、動作確認（subagent起動、ツール実行確認など）を行います。

# タスク別の参照スキル

以下のタイプの質問・作成・編集を受けた場合、対応するスキルを必ず参照：

- **instructions** → `instruction-writing`
- **prompts** → `prompt-writing`
- **skills** → `skill-writing`
- **agents** → `agent-writing`

> 💡 例：「こういうスキルを作りたい」→ `skill-writing` を読み込んで回答

# 重要な原則

1. **追跡対象ファイルは編集せず、変更提案のみ行う**
   - 追跡対象（チーム共有）: `.github/` 配下（全体）
   - ローカル除外: `.agents/`, `.private/`

2. **ローカル除外ディレクトリへの参照を追跡対象から行わない**
   - 追跡対象ファイルから `.agents/`, `.private/` へのリンクや参照は禁止
   - 他のメンバーの環境やCIでは存在しないため

3. **検索時の注意**
   - ローカル除外ディレクトリは通常の検索でヒットしない
   - 直接 `list_dir` や `file_search` で探索する

# 作業の流れ

1. `copilot-instructions-maintenance` スキルを読み込む
2. 対象ファイルの種類を特定（repo-wide / path-specific / agent / prompt / skill）
3. 既存の指示との重複・競合を確認
4. 追跡対象の場合は提案のみ、ローカル除外の場合は編集実行
5. 変更内容を明確に説明

通常のタスクには関わらず、instructions/prompts/skills/agents の整備・動作確認に専念してください。
````

:::

---

スキルで正しい書き方の知識を与え、Prompt で正しい作り方の手順を明示し、Meta エージェントがそれらを使って整備を主導する。

この 3 つのメタプロンプト構成により、「疑問点は質問で解消でき、修正依頼も可能」という状況が作れます。

さらに、これらのメタプロンプト自体もエージェントに整備させることで、自己改善のサイクルに突入します。🕺

## 使い方

Meta エージェントに対して「疑問点は質問で解消でき、修正依頼も可能」という状態を活用します。

### 相談・レビュー

「このスキル、発火しないんだけどどこが悪い？」と聞くと、スキルを確認してフィードバックしてくれる。

「Prompt のこの書き方、ベストプラクティス的にどう？」と聞けば、Prompt/スキルを参照してレビューしてくれる。

### 作成・修正依頼

「新しいルールを適切な Instructions に追加しておいて」と依頼すると、適切な Instructions を更新してくれる。

「レビューコメントを取得するスクリプトを用意して」と依頼すれば、`.agents/` 配下に共通で使えるスクリプトを作成してくれる。

### 定期的な棚卸し

形骸化した記述の削除や、冗長な説明の簡略化も、エージェントに依頼できます。

### ツール知識の活用

それはそうか、という感じなのですが、少し意外だった点として、エージェントは tool や MCP の使い方を結構知っています。

例えば「`ask_questions` の基本的な使い方や制約を教えて」と聞けば、エージェント向けに提供されている説明から説明してくれます。

それを受けて「じゃあ PR 作成の Prompt で使うように変えよっか」という改善の進め方もできます。

## 割り切りポイント: 高速サイクル > 完璧さ

作成と削除を繰り返す前提なので、エージェントが書いた Instructions の質には強くこだわりすぎないのがベストだと考えています。

エージェントの作成・修正内容は、過度に気にしないことが大切です。
- 「これ消えて大丈夫なのか？」みたいなのがあっても一旦受け入れ
- 間違いを犯すようなら、その時修正依頼するだけ

最も重要なのは「成果物」。それを支える Instructions 自体の中身は、出力が正しいのなら多少雑でも良い、というスタンスです。

## まとめ

Agent Skills の登場に合わせてこの体制を構築して以降、Instructions の整備は修正であれば数十秒、新規作成であっても数分程度で完了するようになり、加速的に整備が進みました。

Instructions の整備が進んだことで、成果物の質も向上してきたほか、私の開発スタイルに合ってきたことで、自然とエージェントと開発ができ、「相棒」感が増してきました。

成果物をエージェントに任せて楽をする。エージェントのための Instructions 整備もエージェントに任せて楽をする。

エンジニアの美徳たる「怠惰」を発揮できていると感じて、とても楽しいです。

皆さんも、楽して、楽していきましょう。

作成しているメタプロンプトは、以下のリポジトリで公開しています。興味あればぜひ覗いてみてください。

https://github.com/PORT-INC/agent-instructions
