import * as dotenv from 'dotenv'
dotenv.config()
import Messenger from "./src/lib/Messenger";
import Discord from "./src/lib/Discord";

const discord = new Discord(process.env.TOKEN as string)
const messenger = new Messenger(Messenger.createCookies(
    process.env.XS as string,
    process.env.C_USER as string
))

messenger.on('message', (msg : any) => discord.send(msg.name, msg.profilePic, msg.text, msg.img))
const prevUser : string = ''
discord.client.on('messageCreate', async (msg) =>{
    if(!msg.author.bot){
        prevUser === msg.author.username || await messenger.send(`> ${msg.author.username} from Discordlude:`)
        await messenger.send(`${msg.content}`)
    }
})
discord.init()

//setTimeout(() => messenger.close(), 20000)