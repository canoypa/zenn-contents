---
title: "PowerShell のプロンプトを bash っぽくする"
emoji: "⌨"
type: "tech"
topics: ["powershell"]
published: false
---

最近 WSL などで Linux を触ってみている中で、bash のシンプルでカラフルなプロンプトをかなり気に入っちゃったので、普段使う PowerShell のプロンプトも bash っぽくしてみます。

## コピーライトなどを表示しないようにする

まずは起動時に表示されるコピーライトなどを表示しないようにします。
これは起動オプションとして `-NoLogo` を渡せばいいようです。

Windows Terminal であれば、PowerShell のプロファイル設定で渡すようにします。
![](/images/pwsh-bash-prompt/nologo-settings.png)

これでプロンプトのみになりました。
![](/images/pwsh-bash-prompt/nologo.png)

## プロンプトをいじる

あとはプロンプトの表示内容の変更と色付けのために、プロファイルを作成します。

プロファイルの配置場所についてはこちらのドキュメントに記載されています。

https://learn.microsoft.com/ja-jp/powershell/module/microsoft.powershell.core/about/about_profiles

以下のようなコードを用意しました。
パスやユーザ名などを取得して、色付けして表示しているだけです。

入力 (`$_`) だけ改行してます。
ディレクトリが変わっても入力開始位置が変わりませんし、コマンドが長くても変に改行されなくなるのでおすすめです。

```powershell:profile.ps1
function prompt() {
  # ドライブ名は表示してないです

  # ユーザー名を取得
  $username = $env:UserName
  # pc の名前を取得 大文字で取得されるので小文字にする
  $computername = $env:ComputerName.ToLower()
  # ドライブ名を取得 C とか D とか
  $drive = $pwd.Drive.Name
  # ドライブ名(C:) を除き、ホームディレクトリ(/users/{name}) は ~ に変換したパスを取得
  $path = $pwd.path.Replace($HOME, "~").Replace("${drive}:","")

  Write-Host "$username@$computername" -ForegroundColor "DarkGreen" -NoNewLine
  Write-Host ":" -NoNewLine
  Write-Host "$path" -ForegroundColor "DarkBlue"

  Write-Host "$" -ForegroundColor "DarkGreen" -NoNewLine

  return " "
}
```

こんな感じになります。
コマンドラインがカラフルだとなんとなく気分も上がりますね。
![](/images/pwsh-bash-prompt/result.png)

VSCode だとこんな感じ。
(`-NoLogo` を渡す設定が必要かと思ったのですが、現在はデフォルトで表示されない様子？)
![](/images/pwsh-bash-prompt/result-vscode.png)

---

参考:

https://learn.microsoft.com/ja-jp/powershell/module/microsoft.powershell.core/about/about_powershell_exe
https://learn.microsoft.com/ja-jp/powershell/module/microsoft.powershell.core/about/about_prompts
