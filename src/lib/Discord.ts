import { Client, GatewayIntentBits, EmbedBuilder, TextChannel, Channel, Message, Partials} from 'discord.js'

class Discord{
    client : Client
	mainChannel : TextChannel | null
	token : string
	constructor(token : string){
		this.client = new Client({ 
			intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
			 GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildPresences]})
		this.mainChannel = null
		this.token = token
	}

	public send(title : string, profilePic : string, msg : string | undefined, img : string | undefined, reply : string | undefined){
		const text = `${msg} ${reply}`
		const sendTo : string | null | undefined = text?.match(/:[A-Za-z]*:/g)?.at(0)
		let channel : TextChannel | undefined = this.client.channels.cache.find((channel) => `:${(channel as TextChannel).name}:` === sendTo) as TextChannel
		channel = channel || this.mainChannel
		const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setAuthor({ name: title, iconURL: profilePic})
		msg && embed.setDescription(msg)
		reply && embed.addFields({ name: 'Respuesta a:', value: reply })
		img && embed.setImage(img)
		channel?.send({ embeds: [embed] })
	}

	public sendReactions(reactions : string){
		const embed = new EmbedBuilder()
		.setColor(0x0099FF).setDescription(reactions)
		this.mainChannel?.send({ embeds: [embed] })
	}

	public async getMsg(channel : TextChannel, msgId : string | undefined | null){
		const id = msgId || ''
		const msg = await channel?.messages.fetch(id)
		return msg.attachments?.first()?.url || msg?.embeds?.at(0)?.description || msg?.content || msg.embeds?.at(0)?.image?.url
	}

	public init(){
		this.client.login(this.token)
		this.client.once('ready', async () => {
			this.mainChannel = await this.client.channels.fetch(process.env.MAINCHANNEL as string) as TextChannel
		});
	}
}

export default Discord