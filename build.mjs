import * as esbuild from "esbuild";
import {sassPlugin} from 'esbuild-sass-plugin';
import { exec } from 'child_process';

let result = await esbuild.build({
    entryPoints: ["./src/main.ts"],
    bundle: true,
    loader: {
        ".ts": "ts"
    },
    splitting: true,
    format: "esm",
    minify: true,
    logLevel: 'info',
    color: true,
    outdir: "dist",
    plugins: [sassPlugin()]
});
console.log(result);

exec("node .vscode/pack-zip.js", (err, stdout, stderr) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(stdout);
});
