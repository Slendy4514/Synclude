import * as dotenv from 'dotenv'
dotenv.config()
import {EventEmitter} from "node:events"
import {Events, MESSENGER_URL} from '../data/MessengerConstants'
import puppeteer, { Browser, Page, PageEventObject, TimeoutError } from "puppeteer";

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
        this.init().catch((e) => {
            console.log(e)
            this.retry()
        })

    }

    private async retry(){
        this.page?.close()
        this.browser?.close()
        this.init().catch((e) => {
            console.log(e)
            this.retry()
        })
    }

    private async init(){
        this.browser = await puppeteer.launch({
            headless: Boolean(process.env.HEADLESS as string),
            args: ['--no-sandbox'],
        });
        this.page = (await this.browser.pages())[0];
        this.page.setDefaultNavigationTimeout(120000)
        this.page.setDefaultTimeout(120000)
        await this.login()
        //await this.page.waitForNavigation({timeout: 60000});
        await this.page.waitForSelector('[aria-hidden] img');
        await this.send('Inicializando Synclude - Messenger')
        console.log('Inicializado')
        // const internet = this.page.evaluate(() => {
        //     const enviado = document.querySelector('[data-testid="messenger_delivery_status"] title')?.textContent
        //     return (enviado && enviado != 'Enviando')
        // })
        // if(!internet) throw 'Sin internet'
        await this.page.exposeFunction('emit', (event : string, info : any) => this.emit(event, info))
        await this.page.exposeFunction('console', (log : any) => console.log(log));
        await this.initOnMessage()
        this.emit('ready')
    }

    private initEvents(){
        
    }

    private async initOnMessage(){
        await this.page?.evaluate(() => {
            const chat : Node = document.querySelector('[role="main"]') as Node
            const config = { attributes: true, childList: true, subtree: true }
            let nick : string | null | undefined;
            const observer = new MutationObserver((mutationsList)=>{
                for(let mutation of mutationsList){
                    const msg = mutation.addedNodes[0] as HTMLElement
                    if(msg?.classList?.contains('__fb-light-mode') && (msg as any)?.role == "row"){
                        const profile : HTMLImageElement | null = msg?.querySelector('[aria-hidden] img');
                        const img : HTMLImageElement | null = msg?.querySelector('[alt="Abrir foto"]');
                        const sticker : string | null = (msg?.querySelector('[aria-label*="Sticker"]') as any)?.style?.backgroundImage
                        nick = msg?.querySelector('h4[dir="auto"]')?.textContent || nick
                        if(!profile) continue
                        // (window as any).console({
                        //     nick,
                        //     'imgUrl' : img?.src,
                        //     'profilePic' : profile?.src,
                        //     'name' : profile?.alt,
                        //     'text' : msg.querySelector('[role="none"] [dir="auto"]')?.textContent,
                        //     'reply' : msg.querySelector('.xi81zsa.x126k92a')?.textContent
                        // })
                        (window as any).emit("message", {
                            nick,
                            'imgUrl' : img?.src || sticker?.substring(5, sticker.length-2) || (msg?.querySelector('[height="32"]') as any)?.src,
                            'profilePic' : profile?.src,
                            'name' : profile?.alt,
                            'text' : msg.querySelector('[role="none"] [dir="auto"]')?.textContent,
                            'reply' : msg.querySelector('.xi81zsa.x126k92a')?.textContent
                        })
                    }     
                }
            })
            observer.observe(chat, config)
        })
    }

    private async login(){
        await this.page?.goto(MESSENGER_URL)
        const cookies : cookiesCredentials = (this.credentials as cookiesCredentials)
        // if(typeof this.credentials === Messenger.loginCredentials){

        // }
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

    private pendingMsgs : Promise<void>[] = []

    
    private sendMsg = async (text : string, prev? : Promise<void>) => {
        prev && await prev
        await this.page?.waitForSelector('[data-lexical-editor="true"]')
        await this.page?.type('[data-lexical-editor="true"]', text)
        await this.page?.keyboard.press('Enter')
    }

    public async send(text : string){
        this.pendingMsgs.push(this.sendMsg(text, this.pendingMsgs.pop()))
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