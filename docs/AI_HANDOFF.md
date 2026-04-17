# AI HANDOFF

## Project
Cat Emotion App (PWA)

## Goal
スマホで使える多言語対応の猫の気持ち推定アプリを作る。
日本語・英語・タイ語対応。
写真アップロードで候補判定し、手動選択でも使えるようにする。
出典を表示する。

## Current MVP Scope
- 写真アップロード
- 手動でしぐさ選択
- 結果表示
- 出典表示
- 多言語切替
- GitHub Pagesで公開可能なPWA

## Completed
- 基本PWA土台
- サンプルの構造化データ
- 多言語切替UI
- 出典表示

## In Progress
- NotebookLMデータの追加
- AI画像判定の準備

## Next Task
NotebookLM の出力を JSON に変換して gestures.json に追加する。

## Important Rules
- 断定表現は避ける
- できるだけ静的構成を維持する
- JSON構造を勝手に変更しない
- 多言語キーは ja / en / th を維持する
- 出典は必ず表示できるようにする
