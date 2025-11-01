/// <reference types="vite/client" />

declare global {
    interface Window {
        aistudio?: {
            hasSelectedApiKey: () => Promise<boolean>;
            openSelectKey: () => Promise<void>;
        };
    }
}

// FIX: Add export to make this file a module and fix global augmentation error.
export {};
