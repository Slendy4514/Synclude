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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_events_1 = require("node:events");
const MessengerConstants_1 = require("../data/MessengerConstants");
const puppeteer_1 = __importDefault(require("puppeteer"));
class Messenger extends node_events_1.EventEmitter {
    constructor(credentials) {
        super();
        this.credentials = credentials;
        this.browser = null;
        this.page = null;
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.browser = yield puppeteer_1.default.launch({ headless: true });
            this.page = (yield this.browser.pages())[0];
            yield this.login();
            yield this.page.waitForSelector('[data-testid="solid-message-bubble"]');
            yield this.send('Inicializando Synclude - Messenger');
            yield this.page.exposeFunction('emit', (event, info) => this.emit(event, info));
            yield this.initOnMessage();
        });
    }
    initEvents() {
    }
    initOnMessage() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield ((_a = this.page) === null || _a === void 0 ? void 0 : _a.evaluate(() => {
                const chat = document.querySelector('[data-testid="mw_message_list"]');
                const config = { attributes: true, childList: true, subtree: true };
                let nick;
                const observer = new MutationObserver((mutationsList) => {
                    var _a, _b, _c, _d;
                    for (let mutation of mutationsList) {
                        const msg = mutation.addedNodes[0];
                        if ((_a = msg === null || msg === void 0 ? void 0 : msg.classList) === null || _a === void 0 ? void 0 : _a.contains('__fb-light-mode')) {
                            console.log(msg.querySelector('[data-testid="solid-message-bubble"]'));
                            const profile = (_b = msg === null || msg === void 0 ? void 0 : msg.querySelector('img')) === null || _b === void 0 ? void 0 : _b.src;
                            if (!profile)
                                continue;
                            nick = ((_c = msg === null || msg === void 0 ? void 0 : msg.querySelector('span')) === null || _c === void 0 ? void 0 : _c.textContent) || nick;
                            const img = msg === null || msg === void 0 ? void 0 : msg.querySelector('[data-testid="message-container"] img');
                            const detail = {
                                nick,
                                'profilePic': profile,
                                'text': (_d = msg.querySelector('[data-testid="solid-message-bubble"] [dir="auto"]')) === null || _d === void 0 ? void 0 : _d.textContent,
                                'img': img === null || img === void 0 ? void 0 : img.src,
                            };
                            if (!detail.profilePic)
                                continue; //si la foto de perfil es undefined es enviado por nuestra cuenta
                            //const msgEvent = new CustomEvent(Events.MESSAGE_RECIVED, {detail})
                            window.emit("message", detail);
                            //document.dispatchEvent(msgEvent)
                        }
                    }
                });
                observer.observe(chat, config);
            }));
        });
    }
    login() {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            yield ((_a = this.page) === null || _a === void 0 ? void 0 : _a.goto(MessengerConstants_1.MESSENGER_URL));
            const cookies = this.credentials;
            yield ((_b = this.page) === null || _b === void 0 ? void 0 : _b.setCookie(this.parseCookie('xs', cookies.xs)));
            yield ((_c = this.page) === null || _c === void 0 ? void 0 : _c.setCookie(this.parseCookie('c_user', cookies.c_user)));
            yield ((_d = this.page) === null || _d === void 0 ? void 0 : _d.goto(MessengerConstants_1.MESSENGER_URL + process.env.MESSENGERCHAT));
        });
    }
    parseCookie(name, value) {
        return { name, value };
    }
    // public on = async (event : string, fn : any) => {
    // }
    send(text) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            yield ((_a = this.page) === null || _a === void 0 ? void 0 : _a.type('[data-lexical-editor="true"]', text));
            yield ((_b = this.page) === null || _b === void 0 ? void 0 : _b.keyboard.press('Enter'));
        });
    }
    close() {
        var _a;
        (_a = this.browser) === null || _a === void 0 ? void 0 : _a.close();
    }
    static createLogin(user, pass) {
        return { user, pass };
    }
    static createCookies(xs, c_user) {
        return { xs, c_user };
    }
}
exports.default = Messenger;
