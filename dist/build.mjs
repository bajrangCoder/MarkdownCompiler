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
Object.defineProperty(exports, "__esModule", { value: true });
const esbuild = __importStar(require("esbuild"));
const esbuild_sass_plugin_1 = require("esbuild-sass-plugin");
const child_process_1 = require("child_process");
let result = await esbuild.build({
    entryPoints: ["./src/main.ts"],
    bundle: true,
    loader: {
        ".ts": "ts",
        ".css": "css"
    },
    splitting: true,
    format: "esm",
    minify: true,
    logLevel: 'info',
    color: true,
    outdir: "dist",
    plugins: [(0, esbuild_sass_plugin_1.sassPlugin)()]
});
console.log(result);
(0, child_process_1.exec)("node .vscode/pack-zip.js", (err, stdout, stderr) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(stdout);
});
