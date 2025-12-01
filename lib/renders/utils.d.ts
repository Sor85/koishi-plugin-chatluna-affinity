export declare const COMMON_STYLE = "\n  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap');\n  @import url('https://fonts.googleapis.com/css?family=Noto+Color+Emoji');\n  \n  * { box-sizing: border-box; margin: 0; padding: 0; }\n\n  body {\n    font-family: \"Noto Sans SC\", \"Noto Color Emoji\", \"Segoe UI\", \"Microsoft YaHei\", \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", sans-serif;\n    background: #f0f2f5;\n    color: #1f2937;\n  }\n\n  .container {\n    padding: 32px;\n    width: 600px;\n    background: #f0f2f5;\n    display: flex;\n    flex-direction: column;\n    gap: 16px;\n    /* \u542F\u7528\u5B57\u8DDD\u8C03\u6574 */\n    font-feature-settings: \"palt\";\n  }\n\n  .header {\n    margin-bottom: 8px;\n    padding: 0 8px;\n  }\n\n  h1 {\n    font-size: 24px;\n    margin: 0;\n    font-weight: 700;\n    color: #111827;\n    display: flex;\n    align-items: center;\n    gap: 8px;\n  }\n  \n  h2 {\n    font-size: 16px;\n    font-weight: 500;\n    color: #6b7280;\n    margin-top: 4px;\n  }\n\n  .card {\n    background: #ffffff;\n    border-radius: 12px;\n    padding: 16px;\n    display: flex;\n    align-items: center;\n    gap: 16px;\n    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\n  }\n\n  .avatar {\n    width: 48px;\n    height: 48px;\n    border-radius: 50%;\n    object-fit: cover;\n    border: 2px solid #e5e7eb;\n    flex-shrink: 0;\n  }\n  \n  .avatar-placeholder {\n    width: 48px;\n    height: 48px;\n    border-radius: 50%;\n    background: #f3f4f6;\n    flex-shrink: 0;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    color: #9ca3af;\n    font-weight: 600;\n    font-size: 20px;\n    border: 2px solid #e5e7eb;\n  }\n\n  .info {\n    flex: 1;\n    display: flex;\n    flex-direction: column;\n    gap: 4px;\n    min-width: 0;\n  }\n\n  .name-row {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n  }\n\n  .name {\n    font-size: 16px;\n    font-weight: 600;\n    color: #111827;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n  }\n  \n  .sub-text {\n    font-size: 12px;\n    color: #6b7280;\n  }\n\n  .badge {\n    font-size: 12px;\n    padding: 2px 8px;\n    background: #e0e7ff;\n    color: #4f46e5;\n    border-radius: 999px;\n    font-weight: 500;\n    white-space: nowrap;\n  }\n  \n  .badge-red {\n    background: #fee2e2;\n    color: #ef4444;\n  }\n  \n  .badge-gray {\n    background: #f3f4f6;\n    color: #6b7280;\n  }\n\n  .value-container {\n    text-align: right;\n    display: flex;\n    flex-direction: column;\n    align-items: flex-end;\n    justify-content: center;\n    flex-shrink: 0;\n  }\n\n  .value-primary {\n    font-size: 18px;\n    font-weight: 700;\n    color: #ec4899;\n    font-feature-settings: \"tnum\";\n  }\n  \n  .value-secondary {\n    font-size: 14px;\n    font-weight: 600;\n    color: #4b5563;\n  }\n\n  .label-small {\n    font-size: 12px;\n    color: #6b7280;\n  }\n";
export interface Puppeteer {
    page: () => Promise<Page>;
}
export interface Page {
    setViewport: (options: {
        width: number;
        height: number;
        deviceScaleFactor?: number;
    }) => Promise<void>;
    setContent: (html: string, options: {
        waitUntil: string;
    }) => Promise<void>;
    $: (selector: string) => Promise<Element | null>;
    close: () => Promise<void>;
}
export interface Element {
    screenshot: (options: {
        omitBackground: boolean;
    }) => Promise<Buffer>;
}
