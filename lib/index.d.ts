import { Context } from 'koishi';
import { Config, inject, name } from './schema';
import type { Config as ConfigType } from './types';
export { Config, inject, name };
export declare function apply(ctx: Context, config: ConfigType): void;
