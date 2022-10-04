"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
class Discord {
    constructor(token) {
        this.client = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMessages, discord_js_1.GatewayIntentBits.MessageContent] });
        this.mainChannel = null;
        this.token = token;
    }
    send(title, profilePic, msg, img) {
        var _a;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0x0099FF)
            .setAuthor({ name: title, iconURL: profilePic })
            .setDescription(msg);
        img && embed.setImage(img);
        (_a = this.mainChannel) === null || _a === void 0 ? void 0 : _a.send({ embeds: [embed] });
    }
    init() {
        this.client.login(this.token);
        this.client.once('ready', () => __awaiter(this, void 0, void 0, function* () {
            this.mainChannel = (yield this.client.channels.fetch(process.env.MAINCHANNEL));
            this.mainChannel.send('Inicializando Synclude - Discord');
        }));
    }
}
exports.default = Discord;
