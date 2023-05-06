import plugin from '../plugin.json';
import style from "./style.scss";

class MarkdownStyler {

    async init($page) {
        $page.id = "acode-plugin-markdown";
        this.$markdowCompilerScript = tag("script",{
            src: this.baseUrl+"markdown-it.min.js"
        });
        this.$style = tag("style", {
            textContent: style
        });
        this.$runBtn = tag('span', {
          className: 'icon image',
          attr: {
            action: 'run',
          },
          onclick: this.run.bind(this),
        });
        this.$page = $page;
        this.$page.settitle("Markdown Preview");
        this.$mainDiv = tag("div",{
            className:"mainDiv"
        });
        $page.append(this.$mainDiv);
        const onhide = $page.onhide;
        $page.onhide = () => {
            this.$mainDiv.innerHTML = "";
            onhide();
        };
        this.checkRunnable();
        editorManager.on('switch-file', this.checkRunnable.bind(this));
        editorManager.on('rename-file', this.checkRunnable.bind(this));
        document.head.append(this.$markdowCompilerScript,this.$style);
    }
    
    checkRunnable(){
        const file = editorManager.activeFile;
        if (this.$runBtn.isConnected) {
          this.$runBtn.remove();
        }
        if (file?.name.endsWith('.md')) {
          const $header = root.get('header');
          $header.get('.icon.image')?.remove();
          $header.insertBefore(this.$runBtn, $header.lastChild);
        }
    }
    
    run(){
        this.$mdIt = window.markdownit({
            html: true,
            xhtmlOut: false,
            breaks: false,
            linkify: false,
            typographer: true,
            quotes: '“”‘’'
        });
        this.$mainDiv.innerHTML = this.$mdIt.render(editorManager.editor.getValue() || "");
        this.$page.show();
    }

    async destroy() {
        if (this.$runBtn) {
          this.$runBtn.onclick = null;
          this.$runBtn.remove();
        }
        editorManager.off('switch-file', this.checkRunnable.bind(this));
        editorManager.off('rename-file', this.checkRunnable.bind(this));
        this.$markdowCompilerScript.remove();
        this.$style.remove();
    }
}

if(window.acode) {
    const acodePlugin = new MarkdownStyler();
    acode.setPluginInit(plugin.id, (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
        if(!baseUrl.endsWith('/')) {
            baseUrl += '/';
        }
        acodePlugin.baseUrl = baseUrl;
        acodePlugin.init($page, cacheFile, cacheFileUrl);
    });
    acode.setPluginUnmount(plugin.id, () => {
        acodePlugin.destroy();
    });
}