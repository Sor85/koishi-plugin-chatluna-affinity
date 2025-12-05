/**
 * 工具 Schema
 * 定义 OneBot 工具和其他工具相关的配置项
 */
import { Schema } from 'koishi';
export declare const OneBotToolsSchema: Schema<Schemastery.ObjectS<{
    enablePokeTool: Schema<boolean, boolean>;
    pokeToolName: Schema<string, string>;
    enableSetSelfProfileTool: Schema<boolean, boolean>;
    setSelfProfileToolName: Schema<string, string>;
    enableDeleteMessageTool: Schema<boolean, boolean>;
    deleteMessageToolName: Schema<string, string>;
    panSouTool: Schema<Schemastery.ObjectS<{
        enablePanSouTool: Schema<boolean, boolean>;
        panSouToolName: Schema<string, string>;
        panSouApiUrl: Schema<string, string>;
        panSouAuthEnabled: Schema<boolean, boolean>;
        panSouUsername: Schema<string, string>;
        panSouPassword: Schema<string, string>;
        panSouDefaultCloudTypes: Schema<("quark" | "xunlei" | "115" | "tianyi" | "pikpak" | "uc" | "baidu" | "aliyun" | "mobile" | "123" | "magnet" | "ed2k")[], ("quark" | "xunlei" | "115" | "tianyi" | "pikpak" | "uc" | "baidu" | "aliyun" | "mobile" | "123" | "magnet" | "ed2k")[]>;
        panSouMaxResults: Schema<number, number>;
    }>, Schemastery.ObjectT<{
        enablePanSouTool: Schema<boolean, boolean>;
        panSouToolName: Schema<string, string>;
        panSouApiUrl: Schema<string, string>;
        panSouAuthEnabled: Schema<boolean, boolean>;
        panSouUsername: Schema<string, string>;
        panSouPassword: Schema<string, string>;
        panSouDefaultCloudTypes: Schema<("quark" | "xunlei" | "115" | "tianyi" | "pikpak" | "uc" | "baidu" | "aliyun" | "mobile" | "123" | "magnet" | "ed2k")[], ("quark" | "xunlei" | "115" | "tianyi" | "pikpak" | "uc" | "baidu" | "aliyun" | "mobile" | "123" | "magnet" | "ed2k")[]>;
        panSouMaxResults: Schema<number, number>;
    }>>;
}>, Schemastery.ObjectT<{
    enablePokeTool: Schema<boolean, boolean>;
    pokeToolName: Schema<string, string>;
    enableSetSelfProfileTool: Schema<boolean, boolean>;
    setSelfProfileToolName: Schema<string, string>;
    enableDeleteMessageTool: Schema<boolean, boolean>;
    deleteMessageToolName: Schema<string, string>;
    panSouTool: Schema<Schemastery.ObjectS<{
        enablePanSouTool: Schema<boolean, boolean>;
        panSouToolName: Schema<string, string>;
        panSouApiUrl: Schema<string, string>;
        panSouAuthEnabled: Schema<boolean, boolean>;
        panSouUsername: Schema<string, string>;
        panSouPassword: Schema<string, string>;
        panSouDefaultCloudTypes: Schema<("quark" | "xunlei" | "115" | "tianyi" | "pikpak" | "uc" | "baidu" | "aliyun" | "mobile" | "123" | "magnet" | "ed2k")[], ("quark" | "xunlei" | "115" | "tianyi" | "pikpak" | "uc" | "baidu" | "aliyun" | "mobile" | "123" | "magnet" | "ed2k")[]>;
        panSouMaxResults: Schema<number, number>;
    }>, Schemastery.ObjectT<{
        enablePanSouTool: Schema<boolean, boolean>;
        panSouToolName: Schema<string, string>;
        panSouApiUrl: Schema<string, string>;
        panSouAuthEnabled: Schema<boolean, boolean>;
        panSouUsername: Schema<string, string>;
        panSouPassword: Schema<string, string>;
        panSouDefaultCloudTypes: Schema<("quark" | "xunlei" | "115" | "tianyi" | "pikpak" | "uc" | "baidu" | "aliyun" | "mobile" | "123" | "magnet" | "ed2k")[], ("quark" | "xunlei" | "115" | "tianyi" | "pikpak" | "uc" | "baidu" | "aliyun" | "mobile" | "123" | "magnet" | "ed2k")[]>;
        panSouMaxResults: Schema<number, number>;
    }>>;
}>>;
export declare const OtherCommandsSchema: Schema<Schemastery.ObjectS<{
    groupListRenderAsImage: Schema<boolean, boolean>;
    inspectRenderAsImage: Schema<boolean, boolean>;
}>, Schemastery.ObjectT<{
    groupListRenderAsImage: Schema<boolean, boolean>;
    inspectRenderAsImage: Schema<boolean, boolean>;
}>>;
export declare const OtherSettingsSchema: Schema<Schemastery.ObjectS<{
    debugLogging: Schema<boolean, boolean>;
}>, Schemastery.ObjectT<{
    debugLogging: Schema<boolean, boolean>;
}>>;
