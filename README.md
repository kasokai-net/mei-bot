# mei-bot

## 概要
作業部屋用のbotです。現在は動かしたら投稿を削除するのみです。

## 使い方
自分の環境の環境変数 API_TOKEN にDescordのtokenを設定して node app.js で動きます。

動かしたとたん削除はじめるので注意。

## メモ

discordの制限上、Message.delete()が30回呼ぶたびにしばらくとまるようなので30回呼ぶたびに120秒sleepさせてます。
