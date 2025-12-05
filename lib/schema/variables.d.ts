/**
 * 变量 Schema
 * 定义其他变量相关的配置项
 */
import { Schema } from 'koishi';
export declare const OtherVariablesSchema: Schema<Schemastery.ObjectS<{
    userInfo: Schema<Schemastery.ObjectS<{
        variableName: Schema<string, string>;
        items: Schema<("nickname" | "userId" | "role" | "level" | "title" | "gender" | "age" | "area" | "joinTime" | "lastSentTime")[], ("nickname" | "userId" | "role" | "level" | "title" | "gender" | "age" | "area" | "joinTime" | "lastSentTime")[]>;
    }>, Schemastery.ObjectT<{
        variableName: Schema<string, string>;
        items: Schema<("nickname" | "userId" | "role" | "level" | "title" | "gender" | "age" | "area" | "joinTime" | "lastSentTime")[], ("nickname" | "userId" | "role" | "level" | "title" | "gender" | "age" | "area" | "joinTime" | "lastSentTime")[]>;
    }>>;
    botInfo: Schema<Schemastery.ObjectS<{
        variableName: Schema<string, string>;
        items: Schema<("nickname" | "userId" | "role" | "level" | "title" | "gender" | "age" | "area" | "joinTime" | "lastSentTime")[], ("nickname" | "userId" | "role" | "level" | "title" | "gender" | "age" | "area" | "joinTime" | "lastSentTime")[]>;
    }>, Schemastery.ObjectT<{
        variableName: Schema<string, string>;
        items: Schema<("nickname" | "userId" | "role" | "level" | "title" | "gender" | "age" | "area" | "joinTime" | "lastSentTime")[], ("nickname" | "userId" | "role" | "level" | "title" | "gender" | "age" | "area" | "joinTime" | "lastSentTime")[]>;
    }>>;
    groupInfo: Schema<Schemastery.ObjectS<{
        variableName: Schema<string, string>;
        includeMemberCount: Schema<boolean, boolean>;
        includeCreateTime: Schema<boolean, boolean>;
    }>, Schemastery.ObjectT<{
        variableName: Schema<string, string>;
        includeMemberCount: Schema<boolean, boolean>;
        includeCreateTime: Schema<boolean, boolean>;
    }>>;
    random: Schema<Schemastery.ObjectS<{
        variableName: Schema<string, string>;
        min: Schema<number, number>;
        max: Schema<number, number>;
    }>, Schemastery.ObjectT<{
        variableName: Schema<string, string>;
        min: Schema<number, number>;
        max: Schema<number, number>;
    }>>;
}>, Schemastery.ObjectT<{
    userInfo: Schema<Schemastery.ObjectS<{
        variableName: Schema<string, string>;
        items: Schema<("nickname" | "userId" | "role" | "level" | "title" | "gender" | "age" | "area" | "joinTime" | "lastSentTime")[], ("nickname" | "userId" | "role" | "level" | "title" | "gender" | "age" | "area" | "joinTime" | "lastSentTime")[]>;
    }>, Schemastery.ObjectT<{
        variableName: Schema<string, string>;
        items: Schema<("nickname" | "userId" | "role" | "level" | "title" | "gender" | "age" | "area" | "joinTime" | "lastSentTime")[], ("nickname" | "userId" | "role" | "level" | "title" | "gender" | "age" | "area" | "joinTime" | "lastSentTime")[]>;
    }>>;
    botInfo: Schema<Schemastery.ObjectS<{
        variableName: Schema<string, string>;
        items: Schema<("nickname" | "userId" | "role" | "level" | "title" | "gender" | "age" | "area" | "joinTime" | "lastSentTime")[], ("nickname" | "userId" | "role" | "level" | "title" | "gender" | "age" | "area" | "joinTime" | "lastSentTime")[]>;
    }>, Schemastery.ObjectT<{
        variableName: Schema<string, string>;
        items: Schema<("nickname" | "userId" | "role" | "level" | "title" | "gender" | "age" | "area" | "joinTime" | "lastSentTime")[], ("nickname" | "userId" | "role" | "level" | "title" | "gender" | "age" | "area" | "joinTime" | "lastSentTime")[]>;
    }>>;
    groupInfo: Schema<Schemastery.ObjectS<{
        variableName: Schema<string, string>;
        includeMemberCount: Schema<boolean, boolean>;
        includeCreateTime: Schema<boolean, boolean>;
    }>, Schemastery.ObjectT<{
        variableName: Schema<string, string>;
        includeMemberCount: Schema<boolean, boolean>;
        includeCreateTime: Schema<boolean, boolean>;
    }>>;
    random: Schema<Schemastery.ObjectS<{
        variableName: Schema<string, string>;
        min: Schema<number, number>;
        max: Schema<number, number>;
    }>, Schemastery.ObjectT<{
        variableName: Schema<string, string>;
        min: Schema<number, number>;
        max: Schema<number, number>;
    }>>;
}>>;
