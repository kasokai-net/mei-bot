const Discord = require('discord.js')
const client = new Discord.Client()
const config = require('./config')
let isStalled = false
const sleep = (msec) => {
  return new Promise(res => {
    setTimeout(res, msec)
  })
}
const intermissionMessages = ['ごしごし…', 'ふきふき…', 'もちもち…', 'もうあきたー']
const rareIntermissionMessages = [':abuse:', ':penis:', ':chinchin:', ':todesking:', ':robot:', ':now_feeling:', ':zzz:']

const deleteOldMessages =  async (client, channel, daysBefore, deleteLimit) => {
  // deletedLimitは独自のlimitです。limitに達するまでMessageの取得を繰り返します
  const date = new Date()
  date.setDate(date.getDate() - daysBefore)

  let oldMessages = []
  let lastMessageId = ''
  let isFinished = false


  while (oldMessages.length < deleteLimit) {
    const messages = await channel.fetchMessages({ limit: 100, before: lastMessageId })

    if (messages.array().length === 0) {
      isFinished = true
      break
    } else {
      const chunk = messages.array().filter(msg => msg.createdAt < date)
      oldMessages = oldMessages.concat(chunk)

      lastMessageId = messages.array().pop().id
    }
  }

  console.log(oldMessages.length)
  var first = date	// 消去件数が0の場合messagesが存在せず投稿時刻取得に失敗するため 初期値にローカル基準時刻を置く
  let counter = 0
  if (oldMessages.length > 0) {
    first = oldMessages[0].createdAt	// 消去が実行された場合先頭メッセージの投稿時刻が取得できる
    for (let i = 0; i < oldMessages.length; i++) {
      try {
        const deletedMessage = await oldMessages[i].delete(200)
        counter++
        console.log(counter)

        if ((counter % 30) === 0) {	// 30件消去ごとに動作中アピール
          if (Math.floor(Math.random() * 20) === 0) {	// 5%レアメッセージ
            channel.send(rareIntermissionMessages[Math.floor(Math.random()*rareIntermissionMessages.length)])
          } else {
            channel.send(intermissionMessages[Math.floor(Math.random()*intermissionMessages.length)])
          }
          await sleep(120000)
        }
      } catch (e) {
	    isStalled = true
       console.log(e)
	  const fs = require("fs")
	fs.writeFileSync(Date.now()+".log", e)	// エラーログを残す
	await sleep(120000)
	i = oldMessages.length	// (※様子見)エラーが発生し無反応になるケースがあるため中途終了させる
      }
    }
  }

  if  (counter < 2) {
	  doneMessage = 'なにも消すものなかった…'
	  }
  else if (isFinished) {
    doneMessage = `${first}以前の投稿を${counter}件削除しました。これで全部消えたようです。`
  } else {
    doneMessage = `${first}以前の投稿を${counter}件削除しました。まだ残ってるようです。`
  }

  channel.send(doneMessage).then(function() {
	  client.destroy()
 })
  if (isStalled) client.login(process.env.API_TOKEN)	// エラー中途終了が発生したらリトライ
}

client.on('ready', () => {
  const channel = client.channels.find(ch => (ch.name === 'general'))
  if (!(Math.random()+.5|0)) {    // ログインメッセージ ∬゜ΘωΘÅ
		channel.send('消しに来たよ〜！')
	} else {
		channel.send('モチッ…')
  }
  const { count, before } = config.deleteMessages
  deleteOldMessages(client, channel, before, count)
})

client.login(process.env.API_TOKEN)
