import {EventEmitter} from "node:events"
import {Events, MESSENGER_URL} from '../data/MessengerConstants'
import puppeteer, { Browser, Page, PageEventObject } from "puppeteer";

interface loginCredentials {
    user : string,
    pass : string
}

interface cookiesCredentials{
    xs : string,
    c_user : string
}

class Messenger extends EventEmitter{
    credentials : loginCredentials | cookiesCredentials
    browser : Browser | null
    page : Page | null

    constructor(credentials : loginCredentials | cookiesCredentials){
        super()
        this.credentials = credentials
        this.browser = null
        this.page = null
        this.init()

    }

    private async init(){
        this.browser = await puppeteer.launch({headless: false});
        this.page = (await this.browser.pages())[0];
        await this.login()
        await this.page.waitForSelector('[data-testid="solid-message-bubble"]')
        //await this.page.waitForNavigation({waitUntil: 'domcontentloaded'});
        await this.send('Inicializando Synclude - Messenger')
        await this.page.exposeFunction('emit', (event : string, info : any) => this.emit(event, info))
        await this.initOnMessage()
    }

    private initEvents(){
        
    }

    private async initOnMessage(){
        await this.page?.evaluate(() => {
            const chat : Node = document.querySelector('[data-testid="mw_message_list"]') as Node
            const config = { attributes: true, childList: true, subtree: true }
            let nick : string | null | undefined;
            const observer = new MutationObserver((mutationsList)=>{
                for(let mutation of mutationsList){
                    const msg = mutation.addedNodes[0] as HTMLElement
                    if(msg?.classList?.contains('__fb-light-mode') && (msg as any)?.role == "row" && !(msg as any)?.syncId){
                        (msg as any).syncId = 1
                        console.log(msg.querySelector('[data-testid="solid-message-bubble"]'))
                        const profile : HTMLImageElement | null = msg?.querySelector('[aria-hidden] img')
                        if(!profile) continue
                        nick = msg?.querySelector('[data-testid="mw_message_sender_name"]')?.textContent || nick
                        const img : HTMLImageElement | null = msg?.querySelector('[data-testid="message-container"] img')
                        const detail = {
                            nick,
                            'profilePic' : profile?.src,
                            'name' : profile?.alt,
                            'text' : msg.querySelector('[data-testid="solid-message-bubble"] [dir="auto"]')?.textContent,
                            'img' : img?.src,
                        }
                        //msg.remove()
                        if(!detail.profilePic) continue //si la foto de perfil es undefined es enviado por nuestra cuenta
                        //const msgEvent = new CustomEvent(Events.MESSAGE_RECIVED, {detail})
                        (window as any).emit("message", detail)
                        //document.dispatchEvent(msgEvent)
                    }     
                }
            })
            observer.observe(chat, config)
        })
    }

    private async login(){
        await this.page?.goto(MESSENGER_URL)
        const cookies : cookiesCredentials = (this.credentials as cookiesCredentials)
        if(cookies.xs){
            await this.page?.setCookie(this.parseCookie('xs', cookies.xs))
            await this.page?.setCookie(this.parseCookie('c_user', cookies.c_user))
            await this.page?.goto(MESSENGER_URL+process.env.MESSENGERCHAT)
        }else{
            const login : loginCredentials = (this.credentials as loginCredentials)

        }
    }

    private parseCookie(name : string, value : string){
        return {name,value}
    }

    // public on = async (event : string, fn : any) => {
        
    // }

    public async send(text : string){
        await this.page?.waitForSelector('[data-lexical-editor="true"]')
        await this.page?.type('[data-lexical-editor="true"]', text)
        await this.page?.keyboard.press('Enter')
    }

    public close(){
        this.browser?.close()
    }

    public static createLogin(user : string, pass : string) : loginCredentials{
        return {user,pass}
    }

    public static createCookies(xs : string, c_user : string) : cookiesCredentials{
        return {xs, c_user}
    }
}

export default Messenger