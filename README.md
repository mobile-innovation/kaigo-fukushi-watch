# 福祉・介護ウォッチ

無料のGoogleニュースRSSを取得して `data/news.json` を更新する静的サイトです。

## 自動更新を有効にする

1. この `outputs` フォルダの内容を新しいGitHubリポジトリへアップロードします。
2. GitHubの **Settings → Pages** で、`main` ブランチのルートを公開元に選びます。
3. **Actions** を有効化します。以後、6時間ごとにニュースを更新して保存します。

手動更新は、リポジトリ上の **Actions → Update welfare and care news → Run workflow**、またはローカルで `npm run update-news` を実行します。

Xの投稿は自動収集せず、画面のキーワードからX検索を開く方式です。
