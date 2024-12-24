---
title: "1Password に SSH 接続もコミット署名も管理してもらおう"
emoji: "🔏"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: [1password, ssh, git]
published: true
publication_name: "port_inc"
---

:::message
この記事は [ポート株式会社 サービス開発部 その 2 Advent Calendar 2024](https://adventar.org/calendars/10779) の 24 日目です。
:::

## はじめに

ポートではパスワードマネージャーとして 1Password を使用しています。

1Password にはもちろんパスワードを保存できるのですが、実は開発者向けの機能をいくつか提供しており、その 1 つとして SSH キーを保存 & 使用できる機能があります。

SSH キーを 1Password に保存すると、以下のような嬉しいポイントがあります。

- マシンの移行などで SSH キーを紛失する心配がなくて安心
- SSH キーを使用するには 1Password のロックを解除する必要があるので安全

❤️‍🔥

今回は基本的な使い方として SSH キーの生成と SSH 接続、そして GitHub の認証とコミット署名の設定を紹介します。

なお、この記事の内容は macOS 用 1Password での手順になります。
他のデバイスでも変わらないと思いますが、異なる点があった場合はよしなに読み替えてください。

## SSH キーを生成 / インポートする

https://developer.1password.com/docs/ssh/manage-keys

1Password を開いたら、"New item" → "SSH Key" で SSH キーを保存するためのダイアログが表示されます。

![](/images/happy-1password-ssh/new-ssh-add-new.png)

"Add Private Key" から、既存のキーをインポートするか新規に生成できます。

![](/images/happy-1password-ssh/new-ssh-new-item.png)

新規に作成する場合は、Ed25519 か RSA から選択して生成します。

![](/images/happy-1password-ssh/new-ssh-gen.png)

保存した SSH キーは以下の画像のように表示され、ここで fingerprint の確認や公開鍵のコピーができます。

![](/images/happy-1password-ssh/new-ssh-item.png)

## SSH 接続で使用する

https://developer.1password.com/docs/ssh/get-started/#step-3-turn-on-the-1password-ssh-agent

まずは SSH 接続の際、1Password に保存した SSH キーを使用してくれるように設定する必要があります。

1Password の設定を開いて、"Developer" タブの "Use the SSH Agent" にチェックを入れ、SSH Agent を有効化します。

![](/images/happy-1password-ssh/use-ssh-enable-agent.png)

そして下にある "Change SSH Config..." をクリックして、表示されるコードを `~/.ssh/config` に追加します。

![](/images/happy-1password-ssh/use-ssh-agent-config.png)

準備完了です！

SSH 接続自体の設定はここでは省きますが、これだけで `ssh xxx` した際 1Password に保存された SSH キーで認証して接続してくれます。

1Password がロックされている場合は、以下ようなのダイアログが表示されロック解除を求められます。

![](/images/happy-1password-ssh/use-ssh-request-access.png)
_Raspberry Pi 400 に接続しようとしてる_

## GitHub の認証に使用する

ここまでで SSH 認証に 1Password が使用されるように設定できたため、GitHub の認証については GitHub に公開鍵を登録するだけで OK です。

https://docs.github.com/ja/authentication/connecting-to-github-with-ssh

GitHub への公開鍵の登録は [Add new SSH key](https://github.com/settings/ssh/new) から行えます。

今回は認証に使用する鍵なので、"Key type" は "Authentication Key" を選択して登録します。

![](/images/happy-1password-ssh/gh-auth-new-auth-key.png)
_1Password のブラウザ拡張機能を入れていると、入力補完もできます_

設定はこれだけです。
あとは `ssh -T git@github.com` や、`git clone xxx` などで実際に接続できるか確認してみましょう。

(clone, fetch, push など、リモートリポジトリに接続するあらゆる操作で認証が必要なので、1Password をロックする機会が多いと多少面倒ではあります 🫤)

![](/images/happy-1password-ssh/gh-auth-request-access.png)

## Git コミットの署名に使用する

https://developer.1password.com/docs/ssh/git-commit-signing
https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits

まずは、認証の際と同様に GitHub に公開鍵を登録します。

[Add new SSH key](https://github.com/settings/ssh/new) から、今回は署名用の鍵なので "Key type" は "Signing Key" を選択して登録してください。

次に、1Password で追加の設定が必要です。

1Password で署名に使用する SSH キーを表示して、メニューの "Configure Git Commit Signing" をクリックします。

![](/images/happy-1password-ssh/sign-commit-new-sign-key.png)

コミット署名の設定のためのダイアログが表示されるので、表示されている内容を `~/.gitconfig` に追加します。

![](/images/happy-1password-ssh/sign-commit-config.png)

あとは通常通り `git commit` などでコミットすれば署名されます。

(コミットのたびに認証が必要なので、1Password をロックする機会が多いと、GitHub の認証以上に面倒ではあります 🫤)

![](/images/happy-1password-ssh/sign-commit-request-access.png)

実際に署名されているか確認するには、GitHub にプッシュしてみましょう。

GitHub では署名されたコミットには画像のように "Verified" バッジが表示されます。

(正直自分のコミットが詐称されることはないと思いますが、このバッジがあるとなんとなくかっこいいので署名しています 😇)

![](/images/happy-1password-ssh/sign-commit-verified-badge.png)
![](/images/happy-1password-ssh/sign-commit-verified-detail.png)

### 署名されていないコミットには警告が表示されるようにする

https://docs.github.com/authentication/managing-commit-signature-verification/displaying-verification-statuses-for-all-of-your-commits

全てのコミットで署名するようになったら、署名していないコミットには「詐称されてる危険がある！」と警告が表示されるようにしちゃいましょう。

GitHub の設定の [SSH and GPG keys](https://github.com/settings/keys) を開き、"Flag unsigned commits as unverified" にチェックを入れます。
![](/images/happy-1password-ssh/vigilant-mode-setting.png)

これで署名していないコミットには、以下の画像のように "Unverified" バッジが表示されるようになります。

![](/images/happy-1password-ssh/vigilant-mode-unverified.png)

## おわりに

今回は 1Password で SSH を管理する方法について紹介しました。

1Password には他にも、データベース接続設定を保存したり、CLI を使用して保存したトークンから env ファイルを生成したりと、開発者にとって便利な機能がいくつかあります。

https://developer.1password.com/

まだ 1Password を使用したことがない方や、開発者向けの機能を知らなかったという方は、ぜひこの機会に試してみてください！
