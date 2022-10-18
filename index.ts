import * as dotenv from 'dotenv'
dotenv.config()
import Messenger from "./src/lib/Messenger";
import Discord from "./src/lib/Discord";
import { messageLink } from 'discord.js';

const discord = new Discord(process.env.TOKEN as string)
const messenger = new Messenger(Messenger.createCookies(
    process.env.XS as string,
    process.env.C_USER as string
))

const excludes : string[] | undefined = process.env.EXCLUSION_LIST?.split(', ')

messenger.on('message', (msg : any) => {
    discord.send(`${msg.nick} (${msg.name})`, msg.profilePic, msg.text, msg.img)
    console.log(msg)
})
let prevUser : string = ''
discord.client.on('messageCreate', async (msg) =>{
    if(msg.author.bot || excludes?.includes(msg.channelId)) return
        prevUser === msg.author.username || await messenger.send(`> ${msg.author.username} from Discordlude:`)
        prevUser = msg.author.username
        console.log(msg)
        await messenger.send(`${msg.content}`)
        if(msg.attachments.first()) await messenger.send(`${msg.attachments.first()?.url}`)
})
discord.init()

//setTimeout(() => messenger.close(), 20000)