import * as dotenv from 'dotenv'
dotenv.config()
import Messenger from "./src/lib/Messenger";
import Discord from "./src/lib/Discord";
import { messageLink, TextChannel, Events } from 'discord.js';

const messenger = new Messenger(Messenger.createCookies(
    process.env.XS as string,
    process.env.C_USER as string
))
const discord = new Discord(process.env.TOKEN as string)

const excludes : string[] | undefined = process.env.EXCLUSION_LIST?.split(', ')
messenger.on('ready', () => discord.mainChannel?.send('Inicializando Synclude - Discord'))
messenger.on('message', (msg : any) => {
    discord.send(`${msg.nick} (${msg.name})`, msg.profilePic, msg.text, msg.imgUrl, msg.reply)
    console.log(msg);
})
discord.client.on('messageCreate', async (msg) =>{
    if(msg.author.bot || excludes?.includes(msg.channelId)) return
        console.log(msg)
        const channelRef : string = (msg.channel === discord.mainChannel) ? '' : `:${(msg.channel as TextChannel).name}:`
        const sender : string = `${channelRef} (${msg.author.username})`
        const reply = await discord.getMsg(msg.channel as TextChannel, msg.reference?.messageId) || ''
        msg.reference && await messenger.send(`${sender} - Respuesta a: "${reply}":`)
        await messenger.send(`> ${sender} ${msg.content}`)
        if(msg.attachments.first()) await messenger.send(`${sender} ${msg.attachments.first()?.url}`)
})
discord.client.on(Events.MessageReactionAdd, async (reaction, user) => {
    const msg = reaction.message
    if(excludes?.includes(msg.channelId)) return
    const content = msg.attachments?.first()?.url || msg?.embeds?.at(0)?.description || msg?.content || msg.embeds?.at(0)?.image?.url
    messenger.send(`> ${user.username} reaccionó ${reaction.emoji.name} a: ${content}`)
})
discord.client.on(Events.MessageReactionRemove, async (reaction, user) => {
    const msg = reaction.message
    if(excludes?.includes(msg.channelId)) return
    const content = msg.attachments?.first()?.url || msg?.embeds?.at(0)?.description || msg?.content || msg.embeds?.at(0)?.image?.url
    messenger.send(`> ${user.username} removió la reacción "${reaction.emoji.name}" del mensaje: "${content}"`)
})
discord.init()

//setTimeout(() => messenger.close(), 20000)