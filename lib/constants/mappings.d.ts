/**
 * 映射表常量
 * 包含角色映射、网盘类型等静态映射数据
 */
import type { RoleMapping } from '../types';
export declare const ROLE_MAPPING: RoleMapping;
export declare const CLOUD_TYPES: Record<string, string>;
export declare const DEFAULT_MEMBER_INFO_ITEMS: readonly ["nickname", "userId", "role", "level", "title"];
export declare const ALL_MEMBER_INFO_ITEMS: readonly ["nickname", "userId", "role", "level", "title", "gender", "age", "area", "joinTime", "lastSentTime"];
