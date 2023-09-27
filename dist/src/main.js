"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const plugin_json_1 = __importDefault(require("../plugin.json"));
const html_tag_js_1 = __importDefault(require("html-tag-js"));
const style = require("./style.scss");
const marked_1 = require("marked");
const DOMPurify = __importStar(require("dompurify"));
const marked_highlight_1 = require("marked-highlight");
const highlight_js_1 = __importDefault(require("highlight.js"));
class MarkdownCompiler {
    constructor() {
        this.$marked = new marked_1.Marked((0, marked_highlight_1.markedHighlight)({
            langPrefix: 'hljs language-',
            highlight(code, lang) {
                const language = highlight_js_1.default.getLanguage(lang) ? lang : 'plaintext';
                return highlight_js_1.default.highlight(code, { language }).value;
            }
        }));
    }
    checkRunnable() {
        var _a, _b;
        const file = editorManager.activeFile;
        if (this.$runBtn.isConnected) {
            this.$runBtn.remove();
        }
        if (file === null || file === void 0 ? void 0 : file.name.endsWith('.md')) {
            const $header = (_a = document.querySelector("#root")) === null || _a === void 0 ? void 0 : _a.querySelector('header');
            if ($header) {
                (_b = $header.querySelector('.icon.image')) === null || _b === void 0 ? void 0 : _b.remove();
                $header.insertBefore(this.$runBtn, $header.lastChild);
            }
        }
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            this.$mainPreviewBox.innerHTML = DOMPurify.sanitize(yield this.$marked.parse(editorManager.editor.getValue() || ""));
            this.$page.show();
        });
    }
    init($page, cacheFile, cacheFileUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            $page.id = "markdown-compiler";
            this.$style = (0, html_tag_js_1.default)("link", {
                rel: "stylesheet",
                href: this.baseUrl + "main.css"
            });
            this.hljsStyle = (0, html_tag_js_1.default)("link", {
                rel: "stylesheet",
                href: this.baseUrl + "github-dark.css"
            });
            this.$runBtn = document.createElement("span");
            this.$runBtn.className = "icon image";
            this.$runBtn.setAttribute("action", "run");
            this.$runBtn.onclick = this.run.bind(this);
            this.$page = $page;
            this.$page.settitle("Markdown Result");
            this.$mainPreviewBox = (0, html_tag_js_1.default)("div", {
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
        });
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.$runBtn) {
                this.$runBtn.onclick = null;
                this.$runBtn.remove();
            }
            editorManager.off('switch-file', this.checkRunnable.bind(this));
            editorManager.off('rename-file', this.checkRunnable.bind(this));
            this.$style.remove();
        });
    }
}
if (window.acode) {
    const acodePlugin = new MarkdownCompiler();
    acode.setPluginInit(plugin_json_1.default.id, (baseUrl, $page, { cacheFileUrl, cacheFile }) => __awaiter(void 0, void 0, void 0, function* () {
        if (!baseUrl.endsWith('/')) {
            baseUrl += '/';
        }
        acodePlugin.baseUrl = baseUrl;
        yield acodePlugin.init($page, cacheFile, cacheFileUrl);
    }));
    acode.setPluginUnmount(plugin_json_1.default.id, () => {
        acodePlugin.destroy();
    });
}
