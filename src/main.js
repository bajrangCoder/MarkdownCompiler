import plugin from "../plugin.json";
import style from "./style.scss";
import markdownit from "markdown-it";
import MarkdownItGitHubAlerts from "markdown-it-github-alerts";
import anchor from "markdown-it-anchor";
import hljs from "highlight.js";
import taskLists from "markdown-it-task-lists";
const fsOperation = acode.require("fsOperation");

class MarkdownCompiler {
    constructor() {
        const defaultImageRenderer = markdownit().renderer.rules.image;
        this.mdit = markdownit({
            html: true,
            linkify: true,
            highlight: function (str, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return '<pre><code class="hljs">' +
                            hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                            '</code></pre>';
                    } catch (__) { }
                }

                return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
            }
        });
        // Custom image renderer
        this.mdit.renderer.rules.image = (tokens, idx, options, env, self) => {
            const token = tokens[idx];
            const srcIndex = token.attrIndex('src');

            if (srcIndex >= 0) {
                const src = token.attrs[srcIndex][1];
                if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                    const currentFilePath = editorManager.activeFile.location || '';
                    const currentDir = currentFilePath.substring(0, currentFilePath.lastIndexOf('/') + 1);
                    // Generate a placeholder URL
                    const placeholderUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='; 
                    token.attrs[srcIndex][1] = placeholderUrl;
        
                    // Resolve the image path and replace the placeholder asynchronously
                    this.resolveImagePath(src, currentDir).then((resolvedUrl) => {
                        const imgElement = document.querySelector(`img[src="${placeholderUrl}"]`);
                        if (imgElement) {
                            imgElement.src = resolvedUrl;
                        }
                    }).catch((error) => {
                        console.error('Error resolving image path:', error);
                    });
                }
            }

            // Use default renderer with modified attributes
            return defaultImageRenderer ?
                defaultImageRenderer(tokens, idx, options, env, self) :
                self.renderToken(tokens, idx, options);
        };
        this.mdit.use(MarkdownItGitHubAlerts)
            .use(anchor, {
                slugify: (s) =>
                    s
                        .trim()
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-"),
            }).use(taskLists);

        this.resolveImagePath = this.resolveImagePath.bind(this);
    }

    async resolveImagePath(relativePath, basePath) {
        // Remove any leading ./ from relative path
        relativePath = relativePath.replace(/^\.\//, '');

        // Handle parent directory references
        while (relativePath.startsWith('../')) {
            relativePath = relativePath.substring(3);
            basePath = basePath.replace(/[^/]+\/$/, '');
        }

        const absolutePath = `${basePath}${relativePath}`;
        return await this.fileToDataUrl(absolutePath)
    }
    
    async fileToDataUrl(file) {
    	const fs = fsOperation(file);
    	const fileInfo = await fs.stat();
    	const binData = await fs.readFile();
    	return URL.createObjectURL(new Blob([binData], { type: fileInfo.mime }));
    }

    checkRunnable() {
        const file = editorManager.activeFile;
        if (this.$runBtn.isConnected) {
            this.$runBtn.remove();
        }
        if (file && file.name.endsWith('.md')) {
            const $header = document.querySelector("#root")?.querySelector('header');
            if ($header) {
                $header.querySelector('.icon.image')?.remove();
                $header.insertBefore(this.$runBtn, $header.lastChild);
            }
        }
    }

    async run() {
        try {
            // Parse markdown
            const parsedContent = this.mdit.render(editorManager.editor.getValue() || "");

            this.$mainPreviewBox.innerHTML = parsedContent;

            // Handle anchor links
            this.$mainPreviewBox.querySelectorAll("a[href^='#']").forEach(link => {
                const originalHref = link.getAttribute('href');
                link.setAttribute('data-href', originalHref);
                link.style.cursor = 'pointer';
                // Remove default click behavior
                link.removeAttribute('href');

                // Add custom click handler
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const hash = link.getAttribute('data-href') || link.textContent;
                    const targetId = hash.startsWith('#') ? hash.slice(1) : hash;

                    // Look for either the anchor link or a heading with matching id
                    const targetElement = this.$mainPreviewBox.querySelector(`[name="${targetId}"]`) ||
                        this.$mainPreviewBox.querySelector(`#${targetId}`);

                    if (targetElement) {
                        const headerOffset = document.querySelector('header')?.offsetHeight || 0;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition - headerOffset;

                        this.$mainPreviewBox.scrollBy({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }

                    return false;
                }, { capture: true });
            });

        } catch (error) {
            console.error('Error parsing markdown:', error);
        }

        this.$page.show();
    }

    async init($page, cacheFile, cacheFileUrl) {
        $page.id = "markdown-compiler";
        this.$style = tag("link", {
            rel: "stylesheet",
            href: this.baseUrl + "main.css"
        });
        this.hljsStyle = tag("link", {
            rel: "stylesheet",
            href: this.baseUrl + "github-dark.css"
        });

        this.$runBtn = document.createElement("span");
        this.$runBtn.className = "icon image";
        this.$runBtn.setAttribute("action", "run");
        this.$runBtn.onclick = this.run.bind(this);

        this.$page = $page;
        this.$page.settitle("Markdown Preview");
        this.$mainPreviewBox = tag("div", {
            className: "container"
        });

        this.$page.append(this.$mainPreviewBox);

        const onhide = this.$page.onhide;
        this.$page.onhide = () => {
            this.$mainPreviewBox.innerHTML = "";
            onhide();
        };

        this.checkRunnable();
        editorManager.on('switch-file', this.checkRunnable.bind(this));
        editorManager.on('rename-file', this.checkRunnable.bind(this));
        document.head.append(this.$style, this.hljsStyle);
    }

    async destroy() {
        if (this.$runBtn) {
            this.$runBtn.onclick = null;
            this.$runBtn.remove();
        }
        editorManager.off('switch-file', this.checkRunnable.bind(this));
        editorManager.off('rename-file', this.checkRunnable.bind(this));
        this.$style.remove();
        this.hljsStyle.remove();
    }
}

if (window.acode) {
    const acodePlugin = new MarkdownCompiler();
    acode.setPluginInit(plugin.id, async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
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