/// <reference path="acode.d.ts" />
/// <reference path="editorManager.d.ts" />
declare global {
    interface Window {
        toast(message: string, duration: number): void;
    }
}
export {};