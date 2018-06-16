const Discord = require('discord.js')
const client = new Discord.Client()
const config = require('./config')

const sleep = (msec) => {
  return new Promise(res => {
    setTimeout(res, msec)
  })
}

const deleteOldMessages =  async (channel, daysBefore, deleteLimit) => {
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

  const first = oldMessages[0].createdAt

  let counter = 0

  for (let i = 0; i < oldMessages.length; i++) {
    try {
      const deletedMessage = await oldMessages[i].delete(200)
      counter++
      console.log(counter)

      if ((counter % 30) === 0) {
        await sleep(120000)
      }
    } catch (e) {
      console.log(e)
    }
  }

  let doneMessage = ''
  if  (counter < 2) {
	  doneMessage = 'なにも消すものなかった…'
	  }
  else if (isFinished) {
    doneMessage = `${first}以前の投稿を${counter}件削除しました。これで全部消えたようです。`
  } else {
    doneMessage = `${first}以前の投稿を${counter}件削除しました。まだ残ってるようです。`
  }

  channel.send(doneMessage)
//  channel.send(doneMessage).then(message => {
//  client.destroy()
// })
}

client.on('ready', () => {
  const channel = client.channels.find(ch => (ch.name === 'general'))
  if (!(Math.random()+.5|0)) {    // ログインメッセージ ∬゜ΘωΘÅ
		channel.send('消しに来たよ〜！')
	} else {
		channel.send('モチッ…')
  }
  const { count, before } = config.deleteMessages
  deleteOldMessages(channel, before, count)
})

client.login(process.env.API_TOKEN)
