/**
 * 随机数变量提供者
 * 为 ChatLuna 提供可配置范围的随机数
 */
import type { Config } from '../../../types';
export interface RandomProviderDeps {
    config: Config;
}
export declare function createRandomProvider(deps: RandomProviderDeps): () => number;
export type RandomProvider = ReturnType<typeof createRandomProvider>;
