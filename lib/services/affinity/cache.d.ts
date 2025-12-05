/**
 * 好感度缓存
 * 提供简单的单条目缓存，用于快速读取最近访问的好感度值
 */
import type { AffinityCache } from '../../types';
export declare function createAffinityCache(): AffinityCache;
