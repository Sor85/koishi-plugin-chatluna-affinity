/**
 * 黑名单 Schema
 * 定义黑名单相关的配置项
 */
import { Schema } from 'koishi';
export declare const BlacklistSchema: Schema<Schemastery.ObjectS<{
    enableAutoBlacklist: Schema<boolean, boolean>;
    blacklistThreshold: Schema<number, number>;
    blacklistLogInterception: Schema<boolean, boolean>;
    autoBlacklistReply: Schema<string, string>;
    shortTermBlacklist: Schema<Schemastery.ObjectS<{
        enabled: Schema<boolean, boolean>;
        windowHours: Schema<number, number>;
        decreaseThreshold: Schema<number, number>;
        durationHours: Schema<number, number>;
        penalty: Schema<number, number>;
        replyTemplate: Schema<string, string>;
        renderAsImage: Schema<boolean, boolean>;
    }>, Schemastery.ObjectT<{
        enabled: Schema<boolean, boolean>;
        windowHours: Schema<number, number>;
        decreaseThreshold: Schema<number, number>;
        durationHours: Schema<number, number>;
        penalty: Schema<number, number>;
        replyTemplate: Schema<string, string>;
        renderAsImage: Schema<boolean, boolean>;
    }>>;
    autoBlacklist: Schema<({
        userId?: string | null | undefined;
        nickname?: string | null | undefined;
        blockedAt?: string | null | undefined;
        note?: string | null | undefined;
        platform?: string | null | undefined;
    } & import("koishi").Dict)[], Schemastery.ObjectT<{
        userId: Schema<string, string>;
        nickname: Schema<string, string>;
        blockedAt: Schema<string, string>;
        note: Schema<string, string>;
        platform: Schema<string, string>;
    }>[]>;
    temporaryBlacklist: Schema<({
        userId?: string | null | undefined;
        nickname?: string | null | undefined;
        blockedAt?: string | null | undefined;
        expiresAt?: string | null | undefined;
        durationHours?: string | null | undefined;
        penalty?: string | null | undefined;
        note?: string | null | undefined;
        platform?: string | null | undefined;
    } & import("koishi").Dict)[], Schemastery.ObjectT<{
        userId: Schema<string, string>;
        nickname: Schema<string, string>;
        blockedAt: Schema<string, string>;
        expiresAt: Schema<string, string>;
        durationHours: Schema<string, string>;
        penalty: Schema<string, string>;
        note: Schema<string, string>;
        platform: Schema<string, string>;
    }>[]>;
    blacklistDefaultLimit: Schema<number, number>;
    blacklistRenderAsImage: Schema<boolean, boolean>;
    registerBlacklistTool: Schema<boolean, boolean>;
    blacklistToolName: Schema<string, string>;
}>, Schemastery.ObjectT<{
    enableAutoBlacklist: Schema<boolean, boolean>;
    blacklistThreshold: Schema<number, number>;
    blacklistLogInterception: Schema<boolean, boolean>;
    autoBlacklistReply: Schema<string, string>;
    shortTermBlacklist: Schema<Schemastery.ObjectS<{
        enabled: Schema<boolean, boolean>;
        windowHours: Schema<number, number>;
        decreaseThreshold: Schema<number, number>;
        durationHours: Schema<number, number>;
        penalty: Schema<number, number>;
        replyTemplate: Schema<string, string>;
        renderAsImage: Schema<boolean, boolean>;
    }>, Schemastery.ObjectT<{
        enabled: Schema<boolean, boolean>;
        windowHours: Schema<number, number>;
        decreaseThreshold: Schema<number, number>;
        durationHours: Schema<number, number>;
        penalty: Schema<number, number>;
        replyTemplate: Schema<string, string>;
        renderAsImage: Schema<boolean, boolean>;
    }>>;
    autoBlacklist: Schema<({
        userId?: string | null | undefined;
        nickname?: string | null | undefined;
        blockedAt?: string | null | undefined;
        note?: string | null | undefined;
        platform?: string | null | undefined;
    } & import("koishi").Dict)[], Schemastery.ObjectT<{
        userId: Schema<string, string>;
        nickname: Schema<string, string>;
        blockedAt: Schema<string, string>;
        note: Schema<string, string>;
        platform: Schema<string, string>;
    }>[]>;
    temporaryBlacklist: Schema<({
        userId?: string | null | undefined;
        nickname?: string | null | undefined;
        blockedAt?: string | null | undefined;
        expiresAt?: string | null | undefined;
        durationHours?: string | null | undefined;
        penalty?: string | null | undefined;
        note?: string | null | undefined;
        platform?: string | null | undefined;
    } & import("koishi").Dict)[], Schemastery.ObjectT<{
        userId: Schema<string, string>;
        nickname: Schema<string, string>;
        blockedAt: Schema<string, string>;
        expiresAt: Schema<string, string>;
        durationHours: Schema<string, string>;
        penalty: Schema<string, string>;
        note: Schema<string, string>;
        platform: Schema<string, string>;
    }>[]>;
    blacklistDefaultLimit: Schema<number, number>;
    blacklistRenderAsImage: Schema<boolean, boolean>;
    registerBlacklistTool: Schema<boolean, boolean>;
    blacklistToolName: Schema<string, string>;
}>>;
