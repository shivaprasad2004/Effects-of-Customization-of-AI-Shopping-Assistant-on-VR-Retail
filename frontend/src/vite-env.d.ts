/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_CONTRACT_LOYALTY: string;
    readonly VITE_CONTRACT_AUTHENTICITY: string;
    readonly VITE_CONTRACT_PAYMENT: string;
    readonly VITE_ETHEREUM_RPC_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onstart: (event: Event) => void;
    onend: (event: Event) => void;
    onerror: (event: any) => void;
    onresult: (event: any) => void;
    start(): void;
    stop(): void;
    abort(): void;
}

interface SpeechRecognitionEvent extends Event {
    readonly results: {
        readonly [index: number]: {
            readonly [index: number]: {
                readonly transcript: string;
            };
        };
    };
}

interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
}
