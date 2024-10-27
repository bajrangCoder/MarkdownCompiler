import * as esbuild from "esbuild";
import { exec } from 'child_process';
import {sassPlugin} from 'esbuild-sass-plugin';

let result = await esbuild.build({
    entryPoints: ["src/main.js"],
    bundle: true,
    loader: {
        ".js": "js"
    },
    minify: true,
    logLevel: 'info',
    color: true,
    outdir: "dist",
    plugins: [sassPlugin()]
});

exec("node .vscode/pack-zip.js", (err, stdout, stderr) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(stdout);
});