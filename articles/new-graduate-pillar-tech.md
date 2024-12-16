---
title: "新卒エンジニアを支える技術"
emoji: "📛"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: [新卒, 開発環境]
published: true
publication_name: "port_inc"
---

:::message
この記事は [ポート株式会社 サービス開発部 Advent Calendar 2024](https://adventar.org/calendars/10620) の 16 日目です。
:::

## はじめに

こんにちは、新卒エンジニアとしてポート株式会社で就活会議の開発をやってます、Cano です。

ポートでは、Vim や Linux 使いの方もいたりいなかったりと、開発環境を各々の好みに合わせて選ぶことができます。
私もプライベートと変わらない環境で開発ができていて、生産性高く開発できるな〜と感じています。

一方で、以前までプライベートでは Windows を使用していたのですが、貸与 PC が MacBook だったため、使用できるツールの選択肢が変わりました。
またプライベートで使用経験のあるツールでも、業務の中で「この機能使ったことなかったけど、こういう部分が便利なのね！」という発見をすることもあります。

今回はそういったツールをザッと紹介したいと思います。

## Raycast

https://www.raycast.com/

サイトトップの「Your shortcut to everything.」という説明のとおり、システムの音量操作やクリップボード履歴など、様々な操作ができるツールです。

めちゃくちゃ便利です。これないと何も作業できないくらい、めちゃくちゃ便利です。
ここでは頻繁に使っている機能をいくつか紹介します。

### アプリランチャー

アプリの起動と切り替えができます。このコマンドが普段一番よく使っています。

Raycast を起動してアプリ名の最初の 2~3 文字を入力すれば部分一致で提示してくれるので、慣れてくるとかなりの時短になると思います。
キーボードだけで操作できる点も 👍
![](/images/new-graduate-pillar-tech/raycast-app-launcher.png)
_`Cmd+Space`, `s`, `Enter` だけで Slack を起動できる_

アプリの切り替えについては、macOS 標準の機能 (`Cmd+Tab`) もあり、私は併用しています。

「直前に使用していたアプリに切り替わる」という動きなので、たとえばブラウザとエディタを行き来するような場合には、`Cmd+Tab` を入力するだけで良いこちらの方が合っている、というワケです。

(筆者は外部モニターを一枚も持っていないため、常にアプリを重ねて使っています 😞)

一方で、その途中に別のアプリを開きたいとなったときには、以下のような面倒な点があるため、Raycast のアプリランチャーを使っています。

- 目的のアプリまで何度か `Cmd+Tab` を入力する必要がある
- そのアプリを何回前に使用していたかで入力する回数も変わる

また、もう 1 つ嬉しい点があり、最小化したアプリも引っ張り出して表示してくれます。
私は最小化でアプリを整理をしているので、この挙動は結構助かっています。

![](/images/new-graduate-pillar-tech/raycast-switch-app.webp)
_Raycast だと最小化されたアプリも引っ張り出してくれる様子_

### Switch Windows

アプリの切り替えと同じ枠で、こちらはウィンドウの切り替えです。
推したい点もアプリの切り替えと同じなので詳細な説明は省きます。

エディタで複数のプロジェクトを開いていたり、作業に必要なタブだけ別のウィンドウにして整理していたりするので、そういった場合に使用してます。

![](/images/new-graduate-pillar-tech/raycast-switch-windows.png)
_ウィンドウタイトルでの絞り込みもできます_

### Window Management

2 つのウィンドウを画面に半分ずつ配置するなど、ウィンドウの位置やサイズを変更する機能です。

かなり種類が豊富です。ウィンドウ操作系は専用のアプリもあったりしますが、個人的には Raycast で十分...というより私には過剰なくらいです。

![](/images//new-graduate-pillar-tech/raycast-window-management-list.png)
_この画像 4 枚分くらいの種類があります_

ドキュメントとコードを睨めっこする際に、一時的にアプリを半々で表示した後、元のサイズに戻す、といった操作が簡単にできるようになります。

(筆者は外部モニターを一枚も持っていないため、MacBook の内蔵モニターを大切に使っています 😞)

## Visual Studio Code

https://code.visualstudio.com/

使ったことある方が多いと思います、いつものコードエディタです。

VSCode 自体の設定や導入している拡張機能についてはおおよそプライベートと同じで、業務のために特別カスタマイズしていることはありません。

ここでは Git 系の拡張機能において「これはチーム開発で便利！」と感じたものがあったため、それらを紹介します。

### GitLens

https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens

VSCode 上での Git 操作や表示を圧倒的に強化してくれる拡張機能です。

私が VSCode を使い始めで、おすすめの拡張機能をいろいろ探していた当時見た記事に「とりあえず入れとけ」のように書かれていて入れた記憶があります。

プライベートで開発しているうちは Git のほんの一部の機能しか使っていないこともあり、全く使い方がわからずでした。
しかし、メンターの方などから「それは Git のこの機能を使うといいよ〜」と教えてもらううちに GitLens は毎日のように使うようになっています。

例えば、開発の中で既存のコードを参考にする場面は多くありますが、そのコードが古いものだと現在のコーディング規約に沿っておらず後からレビューでめっちゃ指摘される、と言ったことがあります (ありました)。

GitLens を入れていると、画像のようにファイルや行を「誰が」「いつ」変更したかを常に確認できるようになります。

![](/images/new-graduate-pillar-tech/git-lens-first-commit.jpg)
_私の就活会議での初コミットが 5 ヶ月前だとわかる_

(ちなみに初コミットのハッシュも、GitLens で自分のコミットを検索すればすぐ見つけられたりします。)

そこから「このコード 4 年前のだな...そのままコピペするのはやめておこう」「この部分よく分からないけど、修正してる〇〇さんならわかるかな」と考えたりしています。

また、ファイルやコミットを GitHub 上で開くコマンドがいくつかあり、以下のような使い方もしています。

- 「該当部分ここです！」といった共有
- コミットが含まれる PR から関連するドキュメントを開いて仕様をキャッチアップ

![](/images/new-graduate-pillar-tech/git-lens-open-remote.png)
_Open xxx on Remote 系のコマンドが便利です_

### GitHub Pull Requests

https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-pull-request-github

Pull Request の作成やレビューを VSCode 上で行えるようにする拡張機能です。

コードを書いてそのまま PR 作成してマージ、の流れを VSCode 上で完結できるのが便利で、以前からプライベートでも使用していました。

最近では、新卒のメンバーもレビュワーアサインされるようになったことで、レビュー周りの機能も使うようになりました。

純粋にコードを見るのは VSCode 上の方がやりやすいと感じているのと、チェックアウトなどの操作も VSCode 上で完結できて効率的です。

![](/images/new-graduate-pillar-tech/ghpr-pr-list.png)
_自分がレビュワーアサインされている PR を一覧でき、そのままチェックアウトもできる_

PR 作成の面でも業務に役立つ設定があります。

#### `Issue Branch Title`

この拡張機能では Issue を元にブランチを作成できるのですが、その時のブランチ名を設定できます。

![](/images/new-graduate-pillar-tech/ghpr-checkout-issue.png)
_Issue リストの横に表示される矢印からブランチを作成できる_

ブランチの命名規則が決まっているので、それを設定しています。

![](/images/new-graduate-pillar-tech/ghpr-branch-name.png)

#### `Assign Created`

PR を作成する際に Assignee を設定できます。

自分になるように設定しています。

![](/images/new-graduate-pillar-tech/ghpr-assign-created.png)

Assignee を設定しておくと、PR 一覧でフィルターを使用して自分の PR を探すことができるようになりますし、アイコンが表示されるので視覚的にもわかりやすくなります。

![](/images/new-graduate-pillar-tech/ghpr-assignee.png)

---

余談ですが、チームの振り返りの場で「レビューどうやってますか？」という話題になった際この拡張機能をおすすめしたところ、新卒同期の方に「便利！」と言ってもらえました。
🥰
![](/images/new-graduate-pillar-tech/ghpr-feedback.jpg)

## GitHub CLI

https://cli.github.com/

CLI から GitHub の操作ができるツールです。
あまりしっかりとは使えてないのですが、普段使っている機能があるため紹介します。

### エイリアス

`gh xxx` で実行できるコマンドを設定できます。

私はブランチ整理用のコマンドとして `gh clean-branch` を設定しています。

以下のような処理を実行する感じです。

- デフォルトブランチをチェックアウト
- デフォルトブランチの最新を pull
- リモートで無くなったブランチを削除

この辺りの記事を参考に作成しています。
https://qiita.com/hajimeni/items/73d2155fc59e152630c4

```sh
git switch development;git fetch --prune;git merge origin/development;git branch --merged|egrep -v ''\*|development''|xargs git branch -d
```

このコマンドを `gh alias set` に渡すことで、`gh clean-branch` で実行できるようになります。

```sh
gh alias set --shell clean-branch '<上のコマンドを入れる>'
```

### リリース一覧、レビュワーアサイン状況の確認

毎週の振り返りの場ではその週リリースした内容を共有、毎日の朝会ではレビュワーのアサインに偏りが無いかを確認する、という取り組みを行なっています。

その際に PR の一覧を表示するため、チームの方が GitHub CLI を使用したコマンドを作成してくれています。

```sh:週のリリース一覧の確認
Xdate=$(date -v '-6d' -Idate); echo <usernames> | xargs -n 1 | xargs -IXname sh -c "echo Xname; gh pr list -S 'repo:<owner>/<repo> is:pr state:closed is:merged merged:>=${Xdate} author:Xname' --json number,title,url --template '{{range.}}- {{hyperlink .url .title}} #{{.number}}{{\"\n\"}}{{end}}'"
```

```sh:レビュワーアサイン状況の確認
echo <usernames> | xargs -n 1 | xargs -I Xname sh -c "echo Xname; gh pr list --repo <owner>/<repo> --search 'is:pr user-review-requested:Xname' --json number,title,url --template '{{range.}} - {{hyperlink .url .title}} #{{.number}}{{\"\n\"}}{{end}}'"
```

(`<...>` の箇所はよしなに置き換えてください。)

実行結果は以下のようになります。

```
canoypa
- 〇〇 を △△ に変更した #123
octocat
- △△ を 〇〇 に変更した #456
```

以前まで、チーム全員のリリースされた PR やレビュワーアサイン状況を確認するのは少し手間があったのですが、このコマンドで簡単に確認できるようになりました。

レビュワーアサイン状況の確認は毎日ということもあり、今では GitHub Actions を使用して自動で Slack に通知されていたりします。

## IT 情報安全守護

https://juyo.kandamyoujin.or.jp/detail/?152

最後は神頼みです 🙏

![](/images/new-graduate-pillar-tech/it-syugo.jpg =300x)

## おわりに

ツール自体はありきたりなものが多かったと思いますが、使い方と合わせて参考になっていたら嬉しいです。

ツールの便利な使い方考えるのが一番楽しいですね。今後も生産性向上、兼、自己満足のためにいろいろ模索していきたいです。

(IT 情報安全守護のために神棚を置きたいなあ...)
