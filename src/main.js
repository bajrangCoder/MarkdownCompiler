import plugin from '../plugin.json';
import style from "./style.scss";

class MarkdownStyler {

    async init() {
        this.$style = tag("style", {
            textContent: style
        });
        document.head.append(this.$style);
    }

    async destroy() {

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