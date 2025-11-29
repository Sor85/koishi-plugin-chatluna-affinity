import type { Context } from 'koishi';
interface RenderOptions {
    heading?: string;
    subHeading?: string;
}
export declare function createRenderTableImage(ctx: Context): (title: string, headers: string[], rows: string[][], options?: RenderOptions) => Promise<Buffer | null>;
export {};
