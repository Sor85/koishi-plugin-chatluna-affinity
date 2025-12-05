/**
 * 渲染器基础工具
 * 提供 Puppeteer 类型定义和通用渲染函数
 */
import type { Context } from 'koishi';
import type { LogFn } from '../types';
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
export interface RenderOptions {
    width?: number;
    height?: number;
    deviceScaleFactor?: number;
    selector?: string;
}
export declare function getPuppeteer(ctx: Context): Puppeteer | null;
export declare function renderHtml(ctx: Context, html: string, options: RenderOptions, log?: LogFn): Promise<Buffer | null>;
export declare function escapeHtmlForRender(text: string): string;
