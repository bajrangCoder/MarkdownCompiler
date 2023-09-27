import plugin from '../plugin.json';
import tag from 'html-tag-js';

const style = require("./style.scss");
import { Marked } from 'marked';
import * as DOMPurify from 'dompurify';
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';

class MarkdownCompiler {
    public baseUrl: string | undefined;

    private $page!: WCPage;
    private $style!: HTMLStyleElement;
    private $runBtn!: HTMLSpanElement;
    private hljsStyle!: HTMLLinkElement;
    private $mainPreviewBox!: HTMLDivElement;
    private $marked!: any;

    constructor() {
        this.$marked = new Marked(
            markedHighlight({
                langPrefix: 'hljs language-',
                highlight(code, lang) {
                    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                    return hljs.highlight(code, { language }).value;
                }
            })
        );
    }

    private checkRunnable(): void {
        const file = editorManager.activeFile;
        if (this.$runBtn.isConnected) {
            this.$runBtn.remove();
        }
        if (file?.name.endsWith('.md')) {
            const $header = document.querySelector("#root")?.querySelector('header');
            if ($header) {
                $header.querySelector('.icon.image')?.remove();
                $header.insertBefore(this.$runBtn, $header.lastChild);
            }
        }
    }

    private async run(): Promise<void> {
        this.$mainPreviewBox.innerHTML = DOMPurify.sanitize(await this.$marked.parse(editorManager.editor.getValue() || ""));
        this.$page.show();
    }

    public async init($page: WCPage, cacheFile: any, cacheFileUrl: string): Promise<void> {
        $page.id = "markdown-compiler";
        this.$style = tag("link", {
            rel: "stylesheet",
            href: this.baseUrl + "main.css"
        })
        this.hljsStyle = tag("link", {
            rel: "stylesheet",
            href: this.baseUrl + "github-dark.css"
        })
        this.$runBtn = document.createElement("span");
        this.$runBtn.className = "icon image";
        this.$runBtn.setAttribute("action", "run");
        this.$runBtn.onclick = this.run.bind(this);
        this.$page = $page;
        this.$page.settitle("Markdown Result");
        this.$mainPreviewBox = tag("div", {
            className: "container"
        });
        this.$page.append(this.$mainPreviewBox);
        const onhide: any = this.$page.onhide;
        this.$page.onhide = () => {
            this.$mainPreviewBox.innerHTML = "";
            onhide()
        };
        this.checkRunnable();
        editorManager.on('switch-file', this.checkRunnable.bind(this));
        editorManager.on('rename-file', this.checkRunnable.bind(this));
        document.head.append(this.$style, this.hljsStyle);
    }

    public async destroy(): Promise<void> {
        if (this.$runBtn) {
            this.$runBtn.onclick = null;
            this.$runBtn.remove();
        }
        editorManager.off('switch-file', this.checkRunnable.bind(this));
        editorManager.off('rename-file', this.checkRunnable.bind(this));
        this.$style.remove();
    }
}

if (window.acode) {
    const acodePlugin = new MarkdownCompiler();
    acode.setPluginInit(plugin.id, async (baseUrl: string, $page: WCPage, { cacheFileUrl, cacheFile }: any) => {
        if (!baseUrl.endsWith('/')) {
            baseUrl += '/';
        }
        acodePlugin.baseUrl = baseUrl;
        await acodePlugin.init($page, cacheFile, cacheFileUrl);
    });
    acode.setPluginUnmount(plugin.id, () => {
        acodePlugin.destroy();
    });
}
