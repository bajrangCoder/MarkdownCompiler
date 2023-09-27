declare var editorManager: EditorManager;

type FileEvent = "switch-file" | "rename-file" | "save-file" | "file-loaded" | "file-content-changed" | "add-folder" | "remove-folder" | "new-file" | "init-open-file-list" | "update";

interface EditorManager {
    editor: AjaxAce.Editor | null;
    getFile(checkFor: string | number, type: "id" | "name" | "uri"): File;
    switchFile(id: string): void;
    activeFile(): File;
    hasUnsavedFiles(): number | null;
    files: Array<File>;
    container: HTMLElement;
    isScrolling: boolean;
    on(event: FileEvent, callback: () => void): void;
    off(event: FileEvent, callback: () => void): void;
    emit(event: FileEvent, ...args): any;
}