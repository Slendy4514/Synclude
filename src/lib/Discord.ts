import { Client, GatewayIntentBits, EmbedBuilder, TextChannel} from 'discord.js'

class Discord{
    client : Client
	mainChannel : TextChannel | null
	token : string
	constructor(token : string){
		this.client = new Client({ intents: [GatewayIntentBits.Guilds] })
		this.mainChannel = null
		this.token = token
	}

	public send(title : string, profilePic : string, msg : string, img : string | undefined){
		const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setAuthor({ name: title, iconURL: profilePic})
		.setDescription(msg)
		img && embed.setImage(img)
		this.mainChannel?.send({ embeds: [embed] })
	}

	public init(){
		this.client.login(this.token)
		this.client.once('ready', async () => {
			this.mainChannel = await this.client.channels.fetch(process.env.MAINCHANNEL as string) as TextChannel
			this.mainChannel.send('Inicializando Synclude - Discord')
		});
	}
}

export default Discord