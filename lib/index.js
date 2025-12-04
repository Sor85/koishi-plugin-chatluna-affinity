"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Config: () => Config,
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(index_exports);
var import_koishi16 = require("koishi");
var path2 = __toESM(require("path"));

// node_modules/koishi-plugin-chatluna/lib/services/chat.mjs
var import_messages = require("@langchain/core/messages");
var import_fs = __toESM(require("fs"), 1);
var import_koishi2 = require("koishi");
var import_app = require("koishi-plugin-chatluna/llm-core/chat/app");
var import_path = __toESM(require("path"), 1);
var import_lru_cache = require("lru-cache");
var import_koishi3 = require("koishi");
var import_events = require("events");
var import_koishi4 = require("koishi");
var import_error = require("koishi-plugin-chatluna/utils/error");
var import_logger = require("koishi-plugin-chatluna/utils/logger");
var import_config = require("koishi-plugin-chatluna/llm-core/platform/config");
var import_model = require("koishi-plugin-chatluna/llm-core/platform/model");
var import_service = require("koishi-plugin-chatluna/llm-core/platform/service");
var import_types = require("koishi-plugin-chatluna/llm-core/platform/types");
var import_count_tokens = require("koishi-plugin-chatluna/llm-core/utils/count_tokens");
var import_preset = require("koishi-plugin-chatluna/preset");
var import_error2 = require("koishi-plugin-chatluna/utils/error");
var import_queue = require("koishi-plugin-chatluna/utils/queue");
var import_koishi_plugin_chatluna = require("koishi-plugin-chatluna");
var import_error3 = require("koishi-plugin-chatluna/utils/error");

// node_modules/koishi-plugin-chatluna/lib/utils/string.mjs
var import_koishi = require("koishi");
var import_zlib = require("zlib");
var import_util = require("util");
var import_request = require("koishi-plugin-chatluna/utils/request");
var import_node_crypto = __toESM(require("crypto"), 1);
var __defProp2 = Object.defineProperty;
var __name = (target, value) => __defProp2(target, "name", { value, configurable: true });
var gzipAsync = (0, import_util.promisify)(import_zlib.gzip);
var gunzipAsync = (0, import_util.promisify)(import_zlib.gunzip);
function fuzzyQuery(source, keywords) {
  for (const keyword of keywords) {
    const match = source.includes(keyword);
    if (match) {
      return true;
    }
  }
  return false;
}
__name(fuzzyQuery, "fuzzyQuery");
function isMessageContentImageUrl(message) {
  return message.type === "image_url" && message["image_url"] != null;
}
__name(isMessageContentImageUrl, "isMessageContentImageUrl");
function isMessageContentText(message) {
  return message.type === "text" && message.text != null;
}
__name(isMessageContentText, "isMessageContentText");
function transformMessageContentToElements(content) {
  if (typeof content === "string") {
    return [import_koishi.h.text(content)];
  }
  return content.map((message) => {
    if (isMessageContentImageUrl(message)) {
      const imageUrl = message.image_url;
      return typeof imageUrl === "string" ? import_koishi.h.image(imageUrl) : import_koishi.h.image(imageUrl.url);
    } else {
      return import_koishi.h.text(message.text);
    }
  });
}
__name(transformMessageContentToElements, "transformMessageContentToElements");
function getImageMimeType(ext) {
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "svg":
      return "image/svg+xml";
    case "bmp":
      return "image/bmp";
    case "ico":
      return "image/x-icon";
    default:
      return "image/jpeg";
  }
}
__name(getImageMimeType, "getImageMimeType");
function getImageType(buffer, pure = false, checkIsImage = true) {
  if (buffer.length < 12) {
    return checkIsImage ? void 0 : pure ? "jpg" : "image/jpeg";
  }
  if (buffer[0] === 137 && buffer[1] === 80 && buffer[2] === 78 && buffer[3] === 71 && buffer[4] === 13 && buffer[5] === 10 && buffer[6] === 26 && buffer[7] === 10) {
    return pure ? "png" : "image/png";
  }
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) {
    return pure ? "jpg" : "image/jpeg";
  }
  if (buffer[0] === 71 && buffer[1] === 73 && buffer[2] === 70 && buffer[3] === 56) {
    return pure ? "gif" : "image/gif";
  }
  if (buffer[0] === 82 && buffer[1] === 73 && buffer[2] === 70 && buffer[3] === 70 && buffer[8] === 87 && buffer[9] === 69 && buffer[10] === 66 && buffer[11] === 80) {
    return pure ? "webp" : "image/webp";
  }
  if (checkIsImage) {
    return void 0;
  }
  return pure ? "jpg" : "image/jpeg";
}
__name(getImageType, "getImageType");
function getMessageContent(message) {
  if (typeof message === "string") {
    return message;
  }
  if (message == null) {
    return "";
  }
  const buffer = [];
  for (const part of message) {
    if (part.type === "text") {
      buffer.push(part.text);
    }
  }
  return buffer.join("");
}
__name(getMessageContent, "getMessageContent");
function getNotEmptyString(...texts) {
  for (const text of texts) {
    if (text && text?.length > 0) {
      return text;
    }
  }
}
__name(getNotEmptyString, "getNotEmptyString");
function getCurrentWeekday() {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];
  const currentDate = /* @__PURE__ */ new Date();
  return daysOfWeek[currentDate.getDay()];
}
__name(getCurrentWeekday, "getCurrentWeekday");
var getTimeDiffFormat = /* @__PURE__ */ __name((time1, time2) => {
  const diff = Math.abs(time1 - time2);
  const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
  const hours = Math.floor(diff % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60));
  const minutes = Math.floor(diff % (1e3 * 60 * 60) / (1e3 * 60));
  const parts = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
  return parts.join(", ") || "now";
}, "getTimeDiffFormat");
var getTimeDiff = /* @__PURE__ */ __name((time1, time2) => {
  return getTimeDiffFormat(
    new Date(time1).getTime(),
    new Date(time2).getTime()
  );
}, "getTimeDiff");
var selectFromList = /* @__PURE__ */ __name((args, isPick) => {
  const items = args.split(",").map((item) => item.trim());
  if (isPick) {
    return items[Math.floor(Math.random() * items.length)];
  }
  return items[Math.floor(Math.random() * items.length)];
}, "selectFromList");
var rollDice = /* @__PURE__ */ __name((formula) => {
  const parts = formula.split("d");
  let count = 1;
  if (parts.length > 1 && !isNaN(Number(parts[0]))) {
    count = parseInt(parts[0], 10);
  }
  const lastPart = parts[parts.length - 1].split("+");
  let add = 0;
  if (lastPart.length > 1 && !isNaN(Number(lastPart[1]))) {
    add = parseInt(lastPart[1], 10);
  }
  const range = !isNaN(Number(lastPart[0])) ? parseInt(lastPart[0], 10) : 1;
  return Math.floor(Math.random() * (count * range - count + 1)) + count + add;
}, "rollDice");
var fetchUrl = /* @__PURE__ */ __name(async (url, method = "GET", body = null, textLength = 1e3) => {
  const response = await (0, import_request.chatLunaFetch)(url, {
    method,
    body
  });
  const text = await response.text();
  if (text.length > textLength) {
    return text.substring(0, textLength);
  }
  return text;
}, "fetchUrl");
var PresetPostHandler = class {
  constructor(ctx, config, object) {
    this.ctx = ctx;
    this.config = config;
    this.prefix = object.prefix;
    this.postfix = object.postfix;
    this.variables = object.variables ?? {};
    this.censor = object.censor;
    this._compileVariables();
  }
  static {
    __name(this, "PresetPostHandler");
  }
  prefix;
  postfix;
  variables;
  censor;
  compiledVariables;
  async handler(session, data) {
    let content = data;
    const variables = {};
    if (this.compiledVariables) {
      for (const [key, value] of Object.entries(this.compiledVariables)) {
        const match = content.match(value);
        if (!match) {
          continue;
        }
        variables[key] = match[1];
      }
    }
    const censor = this.ctx.censor;
    if (censor && (this.config.censor || this.censor)) {
      content = await censor.transform([import_koishi.h.text(content)], session).then((element) => element.join(""));
    }
    let displayContent = content;
    if (this.prefix) {
      const startIndex = content.indexOf(this.prefix);
      if (startIndex !== -1) {
        displayContent = content.substring(
          startIndex + this.prefix.length
        );
      }
    }
    if (this.postfix) {
      const endIndex = displayContent.lastIndexOf(this.postfix);
      if (endIndex !== -1) {
        displayContent = displayContent.substring(0, endIndex);
      }
    }
    return { content, variables, displayContent };
  }
  _compileVariables() {
    if (!this.variables) {
      return;
    }
    this.compiledVariables = {};
    for (const [key, value] of Object.entries(this.variables)) {
      this.compiledVariables[key] = new RegExp(value);
    }
  }
};
async function gzipEncode(text, encoding = "buffer") {
  const buffer = await gzipAsync(text);
  return encoding === "buffer" ? buffer : buffer.toString(encoding);
}
__name(gzipEncode, "gzipEncode");
async function gzipDecode(data, inputEncoding = "base64") {
  const buffer = typeof data === "string" ? Buffer.from(data, inputEncoding) : data;
  return (await gunzipAsync(buffer)).toString("utf8");
}
__name(gzipDecode, "gzipDecode");
function bufferToArrayBuffer(buffer) {
  const arrayBuffer = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < buffer.length; i++) {
    view[i] = buffer[i];
  }
  return arrayBuffer;
}
__name(bufferToArrayBuffer, "bufferToArrayBuffer");
async function hashString(text, length = 8) {
  const hash = await import_node_crypto.default.webcrypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  );
  const hashArray = Array.from(new Uint8Array(hash));
  const hashString2 = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashString2.substring(0, length);
}
__name(hashString, "hashString");
function getSystemPromptVariables(session, config, room) {
  return {
    name: config.botNames[0],
    date: (/* @__PURE__ */ new Date()).toLocaleString(),
    bot_id: session.bot.selfId,
    is_group: !session.isDirect,
    is_private: session.isDirect,
    group_id: session.guildId ?? session.event?.guild?.id,
    group_name: session.event?.guild?.name || session.guildId,
    user_id: session.author?.user?.id ?? session.event?.user?.id ?? session.userId ?? "0",
    user: getNotEmptyString(
      session.author?.nick,
      session.author?.name,
      session.event.user?.name,
      session.username
    ),
    built: {
      preset: room.preset,
      conversationId: room.conversationId
    },
    noop: "",
    time: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
    weekday: getCurrentWeekday(),
    idle_duration: getTimeDiffFormat(
      (/* @__PURE__ */ new Date()).getTime(),
      room.updatedTime.getTime()
    )
  };
}
__name(getSystemPromptVariables, "getSystemPromptVariables");
function formatToolCall(tool, arg, log) {
  let rawArg = arg;
  if (Object.keys(rawArg).length === 1) {
    rawArg = rawArg?.input ?? rawArg?.arguments ?? rawArg;
  }
  if (typeof rawArg !== "string") {
    rawArg = JSON.stringify(rawArg, null, 2) || "";
  }
  return `{
  tool: '${tool}',
  arg: '${rawArg}',
  log: '${log}'
}`;
}
__name(formatToolCall, "formatToolCall");
async function formatUserPromptString(config, presetTemplate, session, prompt, room) {
  return await session.app.chatluna.promptRenderer.renderTemplate(
    presetTemplate.formatUserPromptString,
    {
      sender_id: session.author?.user?.id ?? session.event?.user?.id ?? "0",
      sender: getNotEmptyString(
        session.author?.nick,
        session.author?.name,
        session.event.user?.name,
        session.username
      ),
      prompt,
      ...getSystemPromptVariables(session, config, room)
    },
    {
      configurable: {
        session
      }
    }
  );
}
__name(formatUserPromptString, "formatUserPromptString");

// node_modules/koishi-plugin-chatluna/lib/services/chat.mjs
var import_request2 = require("koishi-plugin-chatluna/utils/request");
var import_koishi5 = require("koishi");
var import_error4 = require("koishi-plugin-chatluna/utils/error");
var import_koishi_plugin_markdown = require("koishi-plugin-markdown");
var import_koishi6 = require("koishi");
var import_he = __toESM(require("he"), 1);
var import_marked = require("marked");
var import_koishi_plugin_chatluna2 = require("koishi-plugin-chatluna");
var import_koishi7 = require("koishi");
var import_koishi8 = require("koishi");
var import_koishi9 = require("koishi");
var import_he2 = __toESM(require("he"), 1);
var import_koishi_plugin_chatluna3 = require("koishi-plugin-chatluna");
var import_marked2 = require("marked");
var import_koishi_plugin_chatluna4 = require("koishi-plugin-chatluna");
var import_koishi10 = require("koishi");
var import_koishi_plugin_markdown2 = require("koishi-plugin-markdown");
var import_koishi11 = require("koishi");
var import_he3 = __toESM(require("he"), 1);
var import_promise = require("koishi-plugin-chatluna/utils/promise");
var import_in_memory = require("koishi-plugin-chatluna/llm-core/model/in_memory");
var import_messages2 = require("@langchain/core/messages");
var import_koishi12 = require("koishi");
var import_koishi_plugin_chatluna5 = require("koishi-plugin-chatluna");
var import_shared_prompt_renderer = require("@chatluna/shared-prompt-renderer");
var import_reactivity = require("@vue/reactivity");
var import_crypto = require("crypto");
var shared_prompt_renderer_star = __toESM(require("@chatluna/shared-prompt-renderer"), 1);
var __defProp3 = Object.defineProperty;
var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
var __getOwnPropNames2 = Object.getOwnPropertyNames;
var __hasOwnProp2 = Object.prototype.hasOwnProperty;
var __name2 = (target, value) => __defProp3(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames2(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export2 = (target, all) => {
  for (var name2 in all)
    __defProp3(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps2 = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames2(from))
      if (!__hasOwnProp2.call(to, key) && key !== except)
        __defProp3(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps2(target, mod, "default"), secondTarget && __copyProps2(secondTarget, mod, "default"));
var require_zh_CN_schema_plugin = __commonJS({
  "src/locales/zh-CN.schema.plugin.yml"(exports2, module2) {
    module2.exports = { $inner: [{ $desc: "\u5168\u5C40\u914D\u7F6E", $inner: { chatConcurrentMaxSize: "\u5F53\u524D\u9002\u914D\u5668\u652F\u6301\u7684\u6A21\u578B\u6700\u5927\u5E76\u53D1\u804A\u5929\u6570\u3002", chatTimeLimit: "\u6BCF\u5C0F\u65F6\u7684 API \u8C03\u7528\u6B21\u6570\u9650\u5236\u3002", maxRetries: "\u6A21\u578B\u8BF7\u6C42\u5931\u8D25\u540E\u7684\u6700\u5927\u91CD\u8BD5\u6B21\u6570\u3002", timeout: "\u6A21\u578B\u8BF7\u6C42\u7684\u8D85\u65F6\u65F6\u95F4\uFF08\u6BEB\u79D2\uFF09\u3002", configMode: { $desc: "\u8BF7\u6C42\u914D\u7F6E\u6A21\u5F0F\u3002", $inner: ["\u987A\u5E8F\u914D\u7F6E\u6A21\u5F0F\uFF08\u5F53\u524D\u914D\u7F6E\u65E0\u6548\u65F6\uFF0C\u81EA\u52A8\u5207\u6362\u81F3\u4E0B\u4E00\u4E2A\u53EF\u7528\u914D\u7F6E\uFF09\u3002", "\u8D1F\u8F7D\u5747\u8861\u6A21\u5F0F\uFF08\u8F6E\u8BE2\u4F7F\u7528\u6240\u6709\u53EF\u7528\u914D\u7F6E\uFF09\u3002"] }, proxyMode: { $desc: "\u5F53\u524D\u63D2\u4EF6\u7684\u4EE3\u7406\u8BBE\u7F6E\u6A21\u5F0F\u3002", $inner: ["\u9075\u5FAA\u5168\u5C40\u4EE3\u7406\u8BBE\u7F6E", "\u7981\u7528\u4EE3\u7406", "\u4F7F\u7528\u81EA\u5B9A\u4E49\u4EE3\u7406\u8BBE\u7F6E"] } } }, [{ $desc: "\u4EE3\u7406\u914D\u7F6E", $inner: { proxyAddress: "\u5F53\u524D\u63D2\u4EF6\u7684\u81EA\u5B9A\u4E49\u4EE3\u7406\u5730\u5740\u3002\u82E5\u6307\u5B9A\uFF0C\u6240\u6709\u7F51\u7EDC\u8BF7\u6C42\u5C06\u4F7F\u7528\u6B64\u4EE3\u7406\u3002\u82E5\u672A\u6307\u5B9A\uFF0C\u5219\u5C1D\u8BD5\u4F7F\u7528\u4E3B\u63D2\u4EF6\u7684\u5168\u5C40\u4EE3\u7406\u8BBE\u7F6E\u3002" } }]] };
  }
});
var require_en_US_schema_plugin = __commonJS({
  "src/locales/en-US.schema.plugin.yml"(exports2, module2) {
    module2.exports = { $inner: [{ $desc: "Global Configuration", $inner: { chatConcurrentMaxSize: "Max concurrent chats for current adapter models.", chatTimeLimit: "API calls per hour limit (calls/hour).", maxRetries: "Max retries on model request failure.", timeout: "Model request timeout (ms).", configMode: { $desc: "Request config mode.", $inner: ["Sequential (auto-switch to next valid config on failure).", "Load balancing (rotate through all available configs)."] }, proxyMode: { $desc: "Plugin proxy mode.", $inner: ["Use global proxy", "Disable proxy", "Use custom proxy"] } } }, [{ $desc: "Proxy Configuration", $inner: { proxyAddress: 'Custom proxy for plugin. Overrides global proxy if set. (e.g., "http://127.0.0.1:7890" or "socks5://proxy.example.com:1080")' } }]] };
  }
});
var chat_exports = {};
__export2(chat_exports, {
  ChatLunaPlugin: () => ChatLunaPlugin,
  ChatLunaPromptRenderService: () => ChatLunaPromptRenderService,
  ChatLunaService: () => ChatLunaService,
  MessageTransformer: () => MessageTransformer
});
var Cache = class {
  constructor(ctx, config, tableName) {
    this.config = config;
    this.tableName = tableName;
    this._cache = new DatabaseCache(ctx);
    ctx.on("ready", async () => {
      await this._cache.clear("chathub/keys");
      await this._cache.clear("chathub/chat_limit");
    });
  }
  static {
    __name2(this, "Cache");
  }
  _cache;
  get(tableNameOrId, id) {
    if (typeof id === "string") {
      return this._cache.get(tableNameOrId, id);
    }
    return this._cache.get(this.tableName, tableNameOrId);
  }
  set(tableNameOrId, idOrValue, value) {
    if (value != null) {
      return this._cache.set(tableNameOrId, idOrValue, value);
    }
    return this._cache.set(this.tableName, tableNameOrId, idOrValue);
  }
  delete(tableNameOrId, id) {
    if (typeof id === "string") {
      return this._cache.delete(tableNameOrId, id);
    }
    return this._cache.delete(this.tableName, tableNameOrId);
  }
  async clear(tableName) {
    if (tableName) {
      await this._cache.clear(tableName);
    } else {
      await this._cache.clear(this.tableName);
    }
  }
};
var DatabaseCache = class {
  constructor(ctx) {
    this.ctx = ctx;
    ctx.model.extend(
      "cache",
      {
        table: "string(63)",
        key: "string(63)",
        value: "text",
        expire: "timestamp"
      },
      {
        primary: ["table", "key"]
      }
    );
    ctx.setInterval(async () => {
      await ctx.database.remove("cache", { expire: { $lt: /* @__PURE__ */ new Date() } });
    }, 10 * import_koishi3.Time.minute);
  }
  static {
    __name2(this, "DatabaseCache");
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  encode(data) {
    return JSON.stringify(data);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decode(record) {
    return JSON.parse(record);
  }
  async clear(table) {
    await this.ctx.database.remove("cache", { table });
  }
  async get(table, key) {
    const [entry] = await this.ctx.database.get("cache", { table, key }, [
      "expire",
      "value"
    ]);
    if (!entry) return;
    if (entry.expire && +entry.expire < Date.now()) return;
    return this.decode(entry.value);
  }
  async set(table, key, value, maxAge = 1e3 * 60 * 60 * 24) {
    const expire = maxAge ? new Date(Date.now() + maxAge) : null;
    await this.ctx.database.upsert("cache", [
      {
        table,
        key,
        value: this.encode(value),
        expire
      }
    ]);
  }
  async delete(table, key) {
    await this.ctx.database.remove("cache", { table, key });
  }
  async *keys(table) {
    const entries = await this.ctx.database.get("cache", { table }, [
      "expire",
      "key"
    ]);
    yield* entries.filter((entry) => !entry.expire || +entry.expire > Date.now()).map((entry) => entry.key);
  }
  async *values(table) {
    const entries = await this.ctx.database.get("cache", { table }, [
      "expire",
      "value"
    ]);
    yield* entries.filter((entry) => !entry.expire || +entry.expire > Date.now()).map((entry) => this.decode(entry.value));
  }
  async *entries(table) {
    const entries = await this.ctx.database.get("cache", { table }, [
      "expire",
      "key",
      "value"
    ]);
    yield* entries.filter((entry) => !entry.expire || +entry.expire > Date.now()).map((entry) => [entry.key, this.decode(entry.value)]);
  }
};
var lifecycleNames = [
  "lifecycle-check",
  "lifecycle-prepare",
  "lifecycle-handle_command",
  "lifecycle-request_model",
  "lifecycle-send"
];
var logger;
var ChatChain = class {
  constructor(ctx, config) {
    this.ctx = ctx;
    this.config = config;
    logger = (0, import_logger.createLogger)(ctx);
    this._graph = new ChatChainDependencyGraph();
    this._senders = [];
    const defaultChatChainSender = new DefaultChatChainSender(config);
    this._senders.push(
      (session, messages) => defaultChatChainSender.send(session, messages)
    );
  }
  static {
    __name2(this, "ChatChain");
  }
  _graph;
  _senders;
  isSetErrorMessage = false;
  _createRecallThinkingMessage(context) {
    return async () => {
      if (!context.options?.thinkingTimeoutObject) return;
      const timeoutObj = context.options.thinkingTimeoutObject;
      clearTimeout(timeoutObj.timeout);
      timeoutObj.autoRecallTimeout && clearTimeout(timeoutObj.autoRecallTimeout);
      timeoutObj.recallFunc && await timeoutObj.recallFunc();
      timeoutObj.timeout = null;
      context.options.thinkingTimeoutObject = void 0;
    };
  }
  async receiveMessage(session, ctx) {
    const context = {
      config: this.config,
      message: session.content,
      ctx: ctx ?? this.ctx,
      session,
      options: {},
      send: /* @__PURE__ */ __name2((message) => this.sendMessage(session, message), "send"),
      recallThinkingMessage: this._createRecallThinkingMessage(
        {}
      )
    };
    context.recallThinkingMessage = this._createRecallThinkingMessage(context);
    const result = await this._runMiddleware(session, context);
    await context.recallThinkingMessage();
    return result;
  }
  async receiveCommand(session, command, options = {}, ctx = this.ctx) {
    const context = {
      config: this.config,
      message: options?.message ?? session.content,
      ctx,
      session,
      command,
      send: /* @__PURE__ */ __name2((message) => this.sendMessage(session, message), "send"),
      recallThinkingMessage: this._createRecallThinkingMessage(
        {}
      ),
      options
    };
    context.recallThinkingMessage = this._createRecallThinkingMessage(context);
    const result = await this._runMiddleware(session, context);
    await context.recallThinkingMessage();
    return result;
  }
  middleware(name2, middleware, ctx = this.ctx) {
    const result = new ChainMiddleware(name2, middleware, this._graph);
    this._graph.addNode(result);
    const dispose = /* @__PURE__ */ __name2(() => this._graph.removeNode(name2), "dispose");
    ctx.effect(() => dispose);
    return result;
  }
  sender(sender) {
    this._senders.push(sender);
  }
  async _runMiddleware(session, context) {
    if (!this.isSetErrorMessage) {
      (0, import_error.setErrorFormatTemplate)(session.text("chatluna.error_message"));
      this.isSetErrorMessage = true;
    }
    const originMessage = context.message;
    const runLevels = this._graph.build();
    if (runLevels.length === 0) {
      return false;
    }
    let isOutputLog = false;
    for (const level of runLevels) {
      const results = await this._executeLevel(level, session, context);
      for (const result of results) {
        if (result.status === "stop") {
          await this._handleStopStatus(
            session,
            context,
            originMessage,
            isOutputLog
          );
          return false;
        }
        if (result.status === "error") {
          await this._handleMiddlewareError(
            session,
            result.middlewareName,
            result.error
          );
          return false;
        }
        if (result.output instanceof Array || typeof result.output === "string") {
          context.message = result.output;
        }
        if (result.shouldLog) {
          isOutputLog = true;
        }
      }
    }
    if (isOutputLog) {
      logger.debug("-".repeat(40) + "\n");
    }
    if (context.message != null && context.message !== originMessage) {
      await this.sendMessage(session, context.message);
    }
    return true;
  }
  async _executeLevel(middlewares, session, context) {
    const abortController = new AbortController();
    const results = [];
    let hasStopRequest = false;
    let hasError = false;
    const promises = middlewares.map(async (middleware, index) => {
      try {
        if (abortController.signal.aborted) {
          return {
            status: "success",
            output: 0,
            middlewareName: middleware.name,
            shouldLog: false
          };
        }
        const result = await this._executeMiddleware(
          middleware,
          session,
          context,
          abortController.signal
        );
        if (result.status === "stop" && !hasStopRequest) {
          hasStopRequest = true;
          abortController.abort();
        }
        if (result.status === "error" && !hasError) {
          hasError = true;
          abortController.abort();
        }
        results[index] = result;
        return result;
      } catch (error) {
        const errorResult = {
          status: "error",
          error,
          middlewareName: middleware.name,
          shouldLog: false
        };
        if (!hasError) {
          hasError = true;
          abortController.abort();
        }
        results[index] = errorResult;
        return errorResult;
      }
    });
    await Promise.all(promises);
    return results.filter((result) => result !== void 0);
  }
  async _executeMiddleware(middleware, session, context, abortSignal) {
    const startTime = Date.now();
    try {
      if (abortSignal?.aborted) {
        return {
          status: "success",
          output: 0,
          middlewareName: middleware.name,
          shouldLog: false
        };
      }
      const result = await middleware.run(session, context);
      const executionTime = Date.now() - startTime;
      const shouldLogTime = !middleware.name.startsWith("lifecycle-") && result !== 0 && middleware.name !== "allow_reply" && executionTime > 100;
      if (shouldLogTime) {
        logger.debug(
          `middleware %c executed in %d ms`,
          middleware.name,
          executionTime
        );
      }
      if (result === 1) {
        return {
          status: "stop",
          middlewareName: middleware.name,
          shouldLog: shouldLogTime
        };
      }
      return {
        status: "success",
        output: result,
        middlewareName: middleware.name,
        shouldLog: shouldLogTime
      };
    } catch (error) {
      return {
        status: "error",
        error,
        middlewareName: middleware.name,
        shouldLog: false
      };
    }
  }
  async sendMessage(session, message) {
    const messages = message instanceof Array ? message : [message];
    for (const sender of this._senders) {
      await sender(session, messages);
    }
  }
  async _handleStopStatus(session, context, originMessage, isOutputLog) {
    if (context.message != null && context.message !== originMessage) {
      await this.sendMessage(session, context.message);
    }
    if (isOutputLog) {
      logger.debug("-".repeat(40) + "\n");
    }
  }
  async _handleMiddlewareError(session, middlewareName, error) {
    if (error instanceof import_error.ChatLunaError) {
      const message = error.errorCode === import_error.ChatLunaErrorCode.ABORTED ? session.text("chatluna.aborted") : error.message;
      await this.sendMessage(session, message);
      return;
    }
    logger.error(`chat-chain: ${middlewareName} error ${error}`);
    logger.error(error);
    error.cause && logger.error(error.cause);
    logger.debug("-".repeat(40) + "\n");
    await this.sendMessage(
      session,
      session.text("chatluna.middleware_error", [
        middlewareName,
        error.message
      ])
    );
  }
};
var ChatChainDependencyGraph = class {
  static {
    __name2(this, "ChatChainDependencyGraph");
  }
  _tasks = /* @__PURE__ */ new Map();
  _dependencies = /* @__PURE__ */ new Map();
  _eventEmitter = new import_events.EventEmitter();
  _listeners = /* @__PURE__ */ new Map();
  _cachedOrder = null;
  constructor() {
    this._eventEmitter.on("build_node", () => {
      for (const [, listeners] of this._listeners) {
        for (const listener of listeners) {
          listener();
        }
        listeners.clear();
      }
    });
  }
  addNode(middleware) {
    this._tasks.set(middleware.name, {
      name: middleware.name,
      middleware
    });
    this._cachedOrder = null;
  }
  removeNode(name2) {
    this._tasks.delete(name2);
    this._dependencies.delete(name2);
    for (const deps of this._dependencies.values()) {
      deps.delete(name2);
    }
    this._cachedOrder = null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  once(name2, listener) {
    const listeners = this._listeners.get(name2) ?? /* @__PURE__ */ new Set();
    listeners.add(listener);
    this._listeners.set(name2, listeners);
  }
  before(taskA, taskB) {
    if (taskA instanceof ChainMiddleware) {
      taskA = taskA.name;
    }
    if (taskB instanceof ChainMiddleware) {
      taskB = taskB.name;
    }
    if (taskA && taskB) {
      const dependencies = this._dependencies.get(taskA) ?? /* @__PURE__ */ new Set();
      dependencies.add(taskB);
      this._dependencies.set(taskA, dependencies);
    } else {
      throw new Error("Invalid tasks");
    }
  }
  after(taskA, taskB) {
    if (taskA instanceof ChainMiddleware) {
      taskA = taskA.name;
    }
    if (taskB instanceof ChainMiddleware) {
      taskB = taskB.name;
    }
    if (taskA && taskB) {
      const dependencies = this._dependencies.get(taskB) ?? /* @__PURE__ */ new Set();
      dependencies.add(taskA);
      this._dependencies.set(taskB, dependencies);
    } else {
      throw new Error("Invalid tasks");
    }
  }
  getDependencies(task) {
    return this._dependencies.get(task);
  }
  getDependents(task) {
    const dependents = [];
    for (const [key, value] of this._dependencies.entries()) {
      if ([...value].includes(task)) {
        dependents.push(key);
      }
    }
    return dependents;
  }
  build() {
    if (this._cachedOrder) {
      return this._cachedOrder;
    }
    this._eventEmitter.emit("build_node");
    const indegree = /* @__PURE__ */ new Map();
    const tempGraph = /* @__PURE__ */ new Map();
    for (const taskName of this._tasks.keys()) {
      indegree.set(taskName, 0);
      tempGraph.set(taskName, /* @__PURE__ */ new Set());
    }
    for (const [from, deps] of this._dependencies.entries()) {
      const depsSet = tempGraph.get(from) || /* @__PURE__ */ new Set();
      for (const to of deps) {
        depsSet.add(to);
        indegree.set(to, (indegree.get(to) || 0) + 1);
      }
      tempGraph.set(from, depsSet);
    }
    const levels = [];
    const visited = /* @__PURE__ */ new Set();
    let currentLevel = [];
    for (const [task, degree] of indegree.entries()) {
      if (degree === 0) {
        currentLevel.push(task);
      }
    }
    while (currentLevel.length > 0) {
      const levelMiddlewares = [];
      const nextLevel = [];
      for (const current of currentLevel) {
        if (visited.has(current)) continue;
        visited.add(current);
        const node = this._tasks.get(current);
        if (node?.middleware) {
          levelMiddlewares.push(node.middleware);
        }
        const successors = tempGraph.get(current) || /* @__PURE__ */ new Set();
        for (const next of successors) {
          const newDegree = indegree.get(next) - 1;
          indegree.set(next, newDegree);
          if (newDegree === 0) {
            nextLevel.push(next);
          }
        }
      }
      if (levelMiddlewares.length > 0) {
        levels.push(levelMiddlewares);
      }
      currentLevel = nextLevel;
    }
    for (const [node, degree] of indegree.entries()) {
      if (degree > 0) {
        const cycles = this._findAllCycles();
        const relevantCycle = cycles.find(
          (cycle) => cycle.includes(node)
        );
        throw new Error(
          `Circular dependency detected involving nodes: ${relevantCycle?.join(" -> ") || node}`
        );
      }
    }
    if (visited.size !== this._tasks.size) {
      throw new Error(
        "Some nodes are unreachable in the dependency graph"
      );
    }
    this._cachedOrder = levels;
    return levels;
  }
  _canRunInParallel(a, b) {
    const aDeps = this._dependencies.get(a.name) || /* @__PURE__ */ new Set();
    const bDeps = this._dependencies.get(b.name) || /* @__PURE__ */ new Set();
    return !aDeps.has(b.name) && !bDeps.has(a.name) && !this._hasTransitiveDependency(a.name, b.name) && !this._hasTransitiveDependency(b.name, a.name);
  }
  _hasTransitiveDependency(from, to, visited = /* @__PURE__ */ new Set()) {
    if (visited.has(from)) return false;
    visited.add(from);
    const deps = this._dependencies.get(from) || /* @__PURE__ */ new Set();
    if (deps.has(to)) return true;
    for (const dep of deps) {
      if (this._hasTransitiveDependency(dep, to, visited)) {
        return true;
      }
    }
    return false;
  }
  _findAllCycles() {
    const visited = /* @__PURE__ */ new Set();
    const recursionStack = /* @__PURE__ */ new Set();
    const cycles = [];
    const dfs = /* @__PURE__ */ __name2((node, path22) => {
      if (recursionStack.has(node)) {
        const cycleStart = path22.indexOf(node);
        if (cycleStart !== -1) {
          const cycle = path22.slice(cycleStart).concat([node]);
          cycles.push(cycle);
        }
        return;
      }
      if (visited.has(node)) {
        return;
      }
      visited.add(node);
      recursionStack.add(node);
      path22.push(node);
      const deps = this._dependencies.get(node) || /* @__PURE__ */ new Set();
      for (const dep of deps) {
        dfs(dep, [...path22]);
      }
      recursionStack.delete(node);
    }, "dfs");
    for (const node of this._tasks.keys()) {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    }
    return cycles;
  }
};
var ChainMiddleware = class {
  constructor(name2, execute, graph) {
    this.name = name2;
    this.execute = execute;
    this.graph = graph;
  }
  static {
    __name2(this, "ChainMiddleware");
  }
  before(name2) {
    this.graph.before(this.name, name2);
    if (this.name.startsWith("lifecycle-")) {
      return this;
    }
    const lifecycleName = lifecycleNames;
    if (lifecycleName.includes(name2)) {
      const lastLifecycleName = lifecycleName[lifecycleName.indexOf(name2) - 1];
      if (lastLifecycleName) {
        this.graph.after(this.name, lastLifecycleName);
      }
      return this;
    }
    return this;
  }
  after(name2) {
    this.graph.after(this.name, name2);
    if (this.name.startsWith("lifecycle-")) {
      return this;
    }
    const lifecycleName = lifecycleNames;
    if (lifecycleName.includes(name2)) {
      const nextLifecycleName = lifecycleName[lifecycleName.indexOf(name2) + 1];
      if (nextLifecycleName) {
        this.graph.before(this.name, nextLifecycleName);
      }
      return this;
    }
    return this;
  }
  run(session, options) {
    return this.execute(session, options);
  }
};
var DefaultChatChainSender = class {
  constructor(config) {
    this.config = config;
  }
  static {
    __name2(this, "DefaultChatChainSender");
  }
  processElements(elements) {
    return elements.filter((element) => {
      if (!element) return false;
      if (element.type === "img") {
        const src = element.attrs?.["src"];
        return !(typeof src === "string" && src.startsWith("attachment"));
      }
      return true;
    }).map((element) => {
      if (element.children?.length) {
        element.children = this.processElements(element.children);
      }
      return element;
    });
  }
  async send(session, messages) {
    if (!messages?.length) return;
    if (this.config.isForwardMsg && this.getMessageText(messages).length > this.config.forwardMsgMinLength) {
      await this.sendAsForward(session, messages);
      return;
    }
    await this.sendAsNormal(session, messages);
  }
  async sendAsForward(session, messages) {
    const sendMessages = this.convertToForwardMessages(messages);
    if (sendMessages.length < 1 || sendMessages.length === 1 && sendMessages.join().length === 0) {
      return;
    }
    await session.sendQueued(
      (0, import_koishi4.h)("message", { forward: true }, ...sendMessages)
    );
  }
  convertToForwardMessages(messages) {
    const firstMsg = messages[0];
    if (Array.isArray(firstMsg)) {
      return messages.map((msg) => (0, import_koishi4.h)("message", ...msg));
    }
    if (typeof firstMsg === "object") {
      return [(0, import_koishi4.h)("message", ...messages)];
    }
    if (typeof firstMsg === "string") {
      return [import_koishi4.h.text(firstMsg)];
    }
    throw new Error(`Unsupported message type: ${typeof firstMsg}`);
  }
  async sendAsNormal(session, messages) {
    for (const message of messages) {
      const messageFragment = await this.buildMessageFragment(
        session,
        message
      );
      if (!messageFragment?.length) continue;
      const processedFragment = this.processElements(messageFragment);
      await session.sendQueued(processedFragment);
    }
  }
  async buildMessageFragment(session, message) {
    const shouldAddQuote = this.config.isReplyWithAt && session.isDirect === false && session.messageId;
    const messageContent = this.convertMessageToArray(message);
    if (messageContent == null || messageContent.length < 1 || messageContent.length === 1 && messageContent.join().length === 0) {
      return;
    }
    if (!shouldAddQuote) {
      return messageContent;
    }
    const quote = (0, import_koishi4.h)("quote", { id: session.messageId });
    const hasIncompatibleType = messageContent.some(
      (element) => element.type === "audio" || element.type === "message"
    );
    return hasIncompatibleType ? messageContent : [quote, ...messageContent];
  }
  convertMessageToArray(message) {
    if (Array.isArray(message)) {
      return message;
    }
    if (typeof message === "string") {
      return [import_koishi4.h.text(message)];
    }
    return [message];
  }
  getMessageText(message) {
    return message.map((element) => {
      if (typeof element === "string") {
        return element;
      }
      if (Array.isArray(element)) {
        return import_koishi4.h.select(element, "text").toString();
      }
      return element.toString();
    }).join(" ");
  }
};
var MessageTransformer = class {
  constructor(_config) {
    this._config = _config;
  }
  static {
    __name2(this, "MessageTransformer");
  }
  _transformFunctions = /* @__PURE__ */ new Map();
  async transform(session, elements, model, message = {
    content: "",
    name: session.username,
    additional_kwargs: {}
  }, options = {
    quote: false,
    includeQuoteReply: true
  }) {
    const sourceElementString = elements.map((h92) => h92.toString(true)).join();
    const quoteElementString = ((session.quote && session.quote.elements) ?? []).map((h92) => h92.toString(true)).join();
    for (const element of elements) {
      await this._processElement(session, element, message, model);
    }
    if (session.quote && !options.quote && options.includeQuoteReply && sourceElementString !== quoteElementString) {
      const quoteMessage = await this.transform(
        session,
        session.quote.elements ?? [],
        model,
        {
          content: "",
          name: session.username,
          additional_kwargs: {}
        },
        {
          quote: true,
          includeQuoteReply: options.includeQuoteReply
        }
      );
      const extractText = /* @__PURE__ */ __name2((content) => {
        if (typeof content === "string") return content;
        return Array.isArray(content) ? content.filter((item) => isMessageContentText(item)).map((item) => item.text).join("") : "";
      }, "extractText");
      const extractImages = /* @__PURE__ */ __name2((content) => Array.isArray(content) ? content.filter((item) => isMessageContentImageUrl(item)) : [], "extractImages");
      const quoteText = extractText(quoteMessage.content);
      const quoteImages = extractImages(quoteMessage.content);
      const hasImages = extractImages(message.content).length > 0 || quoteImages.length > 0;
      if (hasImages) {
        if (typeof message.content === "string") {
          message.content = message.content.trim().length > 0 ? [{ type: "text", text: message.content }] : [];
        }
        if (quoteText && quoteText !== "[image]") {
          const currentText = extractText(message.content);
          const quotedContent = `Referenced message: "${quoteText}"

User's message: ${currentText}`;
          message.content = message.content.filter(
            (item) => item.type !== "text"
          );
          message.content.unshift({
            type: "text",
            text: quotedContent
          });
        }
        message.content = [...quoteImages, ...message.content];
      } else if (quoteText && quoteText !== "[image]") {
        const currentText = extractText(message.content);
        message.content = `Referenced message: "${quoteText}"

User's message: ${currentText}`;
      }
    }
    return message;
  }
  intercept(type, transformFunction, priority = 0) {
    const functions = this._transformFunctions.get(type);
    if (type === "text" && functions?.length) {
      throw new import_error3.ChatLunaError(
        import_error3.ChatLunaErrorCode.UNKNOWN_ERROR,
        new Error("text transform function already exists")
      );
    }
    const wrapper = {
      func: transformFunction,
      priority
    };
    if (!functions) {
      this._transformFunctions.set(type, [wrapper]);
    } else {
      const insertIndex = functions.findIndex(
        (item) => item.priority > priority
      );
      if (insertIndex === -1) {
        functions.push(wrapper);
      } else {
        functions.splice(insertIndex, 0, wrapper);
      }
    }
    return () => {
      const currentFunctions = this._transformFunctions.get(type);
      if (!currentFunctions) return;
      const index = currentFunctions.findIndex(
        (item) => item.func === transformFunction
      );
      if (index === -1) return;
      if (currentFunctions.length === 1) {
        this._transformFunctions.delete(type);
      } else {
        currentFunctions.splice(index, 1);
      }
    };
  }
  replace(type, transformFunction) {
    if (type === "text") {
      throw new import_error3.ChatLunaError(
        import_error3.ChatLunaErrorCode.UNKNOWN_ERROR,
        new Error("text transform function cannot be replaced")
      );
    }
    const functions = this._transformFunctions.get(type);
    if (functions == null || functions.length === 0) {
      import_koishi_plugin_chatluna.logger?.warn(
        `transform function for ${type} not exists. Check your installed plugins.`
      );
    }
    this._transformFunctions.set(type, [
      { func: transformFunction, priority: 0 }
    ]);
    return () => {
      this._transformFunctions.delete(type);
    };
  }
  has(type) {
    const functions = this._transformFunctions.get(type);
    return functions != null && functions.length > 0;
  }
  async _processElement(session, element, message, model) {
    const transformFunctions = this._transformFunctions.get(element.type);
    if (!transformFunctions?.length) {
      if (element.children?.length) {
        await this.transform(
          session,
          element.children,
          model,
          message,
          {
            quote: false,
            includeQuoteReply: true
          }
        );
      }
      return;
    }
    const hasChildren = !!element.children?.length;
    for (const { func: transformFunction } of transformFunctions) {
      const result = await transformFunction(
        session,
        element,
        message,
        model
      );
      if (result !== false) return;
      if (hasChildren) {
        await this.transform(
          session,
          element.children,
          model,
          message,
          {
            quote: false,
            includeQuoteReply: true
          }
        );
        return;
      }
    }
    if (hasChildren) {
      await this.transform(session, element.children, model, message, {
        quote: false,
        includeQuoteReply: false
      });
    }
  }
};
var Renderer = class {
  constructor(ctx) {
    this.ctx = ctx;
  }
  static {
    __name2(this, "Renderer");
  }
};
var TextRenderer = class extends Renderer {
  static {
    __name2(this, "TextRenderer");
  }
  async render(message, options) {
    let transformed = transformMessageContentToElements(message.content);
    transformed = transformAndEscape(transformed);
    if (options.split) {
      transformed = transformed.map((element) => {
        return (0, import_koishi6.h)("message", element);
      });
    }
    if (transformed[0]?.type === "p") {
      const pElement = transformed.shift();
      const pElementContent = pElement.attrs["content"];
      if (pElementContent) {
        transformed.unshift(import_koishi6.h.text(pElementContent));
      } else {
        transformed.unshift(...pElement.children);
      }
    }
    return {
      element: transformed
    };
  }
  schema = import_koishi6.Schema.const("text").i18n({
    "zh-CN": "\u5C06\u56DE\u590D\u4F5C\u4E3A markdown \u8FDB\u884C\u6E32\u67D3",
    "en-US": "Render as markdown"
  });
};
function unescape(element) {
  if (element.type === "text") {
    element.attrs["content"] = import_he.default.decode(element.attrs["content"]);
  }
  if (element.children && element.children.length > 0) {
    element.children = element.children.map(unescape);
  }
  return element;
}
__name2(unescape, "unescape");
function transformAndEscape(source) {
  return source.flatMap((element) => {
    if (element.type === "text") {
      return (0, import_koishi_plugin_markdown.transform)(element.attrs["content"]).map(unescape);
    }
    return unescape(element);
  });
}
__name2(transformAndEscape, "transformAndEscape");
var VoiceRenderer = class extends Renderer {
  static {
    __name2(this, "VoiceRenderer");
  }
  async render(message, options) {
    const baseElements = transformMessageContentToElements(message.content);
    const splitMessages = this._splitMessage(baseElements).flatMap((text) => text.trim().split("\n\n")).filter((text) => text.length > 0);
    import_koishi_plugin_chatluna2.logger?.debug(`splitMessages: ${JSON.stringify(splitMessages)}`);
    if (splitMessages.length === 0) {
      return {
        element: []
      };
    }
    if (options.split) {
      return {
        element: await Promise.all(
          splitMessages.map(async (text) => {
            return (0, import_koishi7.h)(
              "message",
              await this._renderToVoice(text, options)
            );
          })
        )
      };
    } else {
      return {
        element: await this._renderToVoice(
          splitMessages.join(""),
          options
        )
      };
    }
  }
  _splitMessage(messages) {
    return messages.flatMap((message) => {
      if (message.type !== "text") {
        return [];
      }
      const tokens = renderTokens(
        import_marked.marked.lexer(message.attrs["content"] ?? "")
      );
      if (tokens.length === 0 || tokens[0].length === 0) {
        return message.attrs["content"] ?? "";
      }
      return tokens;
    }).filter(Boolean);
  }
  _renderToVoice(text, options) {
    return this.ctx.vits.say(
      Object.assign(
        {
          speaker_id: options?.voice?.speakerId ?? 0,
          input: text
        },
        {
          session: options.session
        }
      )
    );
  }
  schema = import_koishi7.Schema.const("voice").i18n({
    "zh-CN": "\u5C06\u56DE\u590D\u6E32\u67D3\u4E3A\u8BED\u97F3",
    "en-US": "Render as voice"
  });
};
function renderToken(token) {
  if (token.type === "text" || //     token.type === "space" ||
  token.type === "heading" || token.type === "em" || token.type === "strong" || token.type === "del" || token.type === "codespan" || token.type === "list_item" || token.type === "blockquote") {
    return token.text;
  }
  return token.raw;
}
__name2(renderToken, "renderToken");
function renderTokens(tokens) {
  return tokens.map(renderToken);
}
__name2(renderTokens, "renderTokens");
var RawRenderer = class extends Renderer {
  static {
    __name2(this, "RawRenderer");
  }
  async render(message, options) {
    if (typeof message.content === "string") {
      return {
        element: import_koishi8.h.text(message.content)
      };
    }
    return {
      element: transformMessageContentToElements(message.content)
    };
  }
  schema = import_koishi8.Schema.const("raw").i18n({
    "zh-CN": "\u539F\u59CB\u8F93\u51FA",
    "en-US": "Raw text"
  });
};
var KoishiElementRenderer = class extends Renderer {
  static {
    __name2(this, "KoishiElementRenderer");
  }
  async render(message, options) {
    let transformed = transformMessageContentToElements(message.content);
    transformed = transformAndEscape2(transformed);
    if (options.split) {
      transformed = transformed.map((element) => {
        return (0, import_koishi9.h)("message", element);
      });
    }
    return {
      element: transformed
    };
  }
  schema = import_koishi9.Schema.const("koishi-element").i18n({
    "zh-CN": "\u5C06\u56DE\u590D\u4F5C\u4E3A koishi \u6D88\u606F\u5143\u7D20\u8FDB\u884C\u6E32\u67D3",
    "en-US": "Render as koishi message element template"
  });
};
function unescape2(element) {
  if (element.type === "text") {
    element.attrs["content"] = import_he2.default.decode(element.attrs["content"]);
  }
  if (element.children && element.children.length > 0) {
    element.children = element.children.map(unescape2);
  }
  return element;
}
__name2(unescape2, "unescape");
function transformAndEscape2(source) {
  return source.flatMap((element) => {
    if (element.type !== "text") {
      return element;
    }
    try {
      return import_koishi9.h.parse(element.attrs["content"]).map(unescape2);
    } catch (e) {
      import_koishi_plugin_chatluna3.logger.error(e);
      return [import_koishi9.h.text(source)];
    }
  });
}
__name2(transformAndEscape2, "transformAndEscape");
var MixedVoiceRenderer = class extends Renderer {
  static {
    __name2(this, "MixedVoiceRenderer");
  }
  async render(message, options) {
    const elements = [];
    const baseElements = transformMessageContentToElements(message.content);
    const renderText = (await this.renderText(baseElements, options)).element;
    if (renderText instanceof Array) {
      elements.push(...renderText);
    } else {
      elements.push(renderText);
    }
    const renderVoice = (await this.renderVoice(baseElements, options)).element;
    if (renderVoice instanceof Array) {
      elements.push(...renderVoice);
    } else {
      elements.push(renderVoice);
    }
    return {
      element: elements
    };
  }
  async renderText(messages, options) {
    let transformed = transformAndEscape(messages);
    if (options.split) {
      transformed = transformed.map((element) => {
        return (0, import_koishi10.h)("message", element);
      });
    }
    return {
      element: transformed
    };
  }
  async renderVoice(messages, options) {
    const splitMessages = this._splitMessage(messages).flatMap((text) => text.trim().split("\n\n")).filter((text) => text.length > 0);
    import_koishi_plugin_chatluna4.logger?.debug(`splitMessages: ${JSON.stringify(splitMessages)}`);
    if (splitMessages.length === 0) {
      return {
        element: []
      };
    }
    return {
      element: await this._renderToVoice(splitMessages.join(""), options)
    };
  }
  _splitMessage(messages) {
    return messages.flatMap((message) => {
      if (message.type !== "text") {
        return [];
      }
      const tokens = renderTokens2(
        import_marked2.marked.lexer(message.attrs["content"])
      );
      if (tokens.length === 0 || tokens[0].length === 0) {
        return message.attrs["content"];
      }
      return tokens;
    }).filter(Boolean);
  }
  _renderToVoice(text, options) {
    return this.ctx.vits.say(
      Object.assign(
        {
          speaker_id: options?.voice?.speakerId ?? 0,
          input: text
        },
        {
          session: options.session
        }
      )
    );
  }
  schema = import_koishi10.Schema.const("mixed-voice").i18n({
    "zh-CN": "\u540C\u65F6\u8F93\u51FA\u8BED\u97F3\u548C\u6587\u672C",
    "en-US": "Output both voice and text"
  });
};
function renderToken2(token) {
  if (token.type === "text" || //     token.type === "space" ||
  token.type === "heading" || token.type === "em" || token.type === "strong" || token.type === "del" || token.type === "codespan" || token.type === "list_item" || token.type === "blockquote") {
    return token.text;
  }
  return token.raw;
}
__name2(renderToken2, "renderToken");
function renderTokens2(tokens) {
  return tokens.map(renderToken2);
}
__name2(renderTokens2, "renderTokens");
function removeMarkdown(md, options = {}) {
  options.listUnicodeChar = Object.prototype.hasOwnProperty.call(
    options,
    "listUnicodeChar"
  ) ? options.listUnicodeChar : false;
  options.stripListLeaders = Object.prototype.hasOwnProperty.call(
    options,
    "stripListLeaders"
  ) ? options.stripListLeaders : true;
  options.gfm = Object.prototype.hasOwnProperty.call(options, "gfm") ? options.gfm : true;
  options.useImgAltText = Object.prototype.hasOwnProperty.call(
    options,
    "useImgAltText"
  ) ? options.useImgAltText : true;
  options.abbr = Object.prototype.hasOwnProperty.call(options, "abbr") ? options.abbr : false;
  options.replaceLinksWithURL = Object.prototype.hasOwnProperty.call(
    options,
    "replaceLinksWithURL"
  ) ? options.replaceLinksWithURL : false;
  options.htmlTagsToSkip = Object.prototype.hasOwnProperty.call(
    options,
    "htmlTagsToSkip"
  ) ? options.htmlTagsToSkip : [];
  options.throwError = Object.prototype.hasOwnProperty.call(
    options,
    "throwError"
  ) ? options.throwError : false;
  let output = md || "";
  output = output.replace(
    /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/gm,
    ""
  );
  try {
    if (options.stripListLeaders) {
      if (options.listUnicodeChar)
        output = output.replace(
          /^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm,
          options.listUnicodeChar + " $1"
        );
      else
        output = output.replace(/^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm, "$1");
    }
    if (options.gfm) {
      output = output.replace(/\n={2,}/g, "\n").replace(/~{3}.*\n/g, "").replace(/~~/g, "").replace(/```(?:.*)\n([\s\S]*?)```/g, (_, code) => code.trim());
    }
    if (options.abbr) {
      output = output.replace(/\*\[.*\]:.*\n/, "");
    }
    let htmlReplaceRegex = /<[^>]*>/g;
    if (options.htmlTagsToSkip && options.htmlTagsToSkip.length > 0) {
      const joinedHtmlTagsToSkip = options.htmlTagsToSkip.join("|");
      htmlReplaceRegex = new RegExp(
        `<(?!/?(${joinedHtmlTagsToSkip})(?=>|s[^>]*>))[^>]*>`,
        "g"
      );
    }
    output = output.replace(htmlReplaceRegex, "").replace(/^[=\-]{2,}\s*$/g, "").replace(/\[\^.+?\](\: .*?$)?/g, "").replace(/\s{0,2}\[.*?\]: .*?$/g, "").replace(
      /\!\[(.*?)\][\[\(].*?[\]\)]/g,
      options.useImgAltText ? "$1" : ""
    ).replace(
      /\[([\s\S]*?)\]\s*[\(\[].*?[\)\]]/g,
      options.replaceLinksWithURL ? "$2" : "$1"
    ).replace(/^(\n)?\s{0,3}>\s?/gm, "$1").replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, "").replace(
      /^(\n)?\s{0,}#{1,6}\s*( (.+))? +#+$|^(\n)?\s{0,}#{1,6}\s*( (.+))?$/gm,
      "$1$3$4$6"
    ).replace(/([\*]+)(\S)(.*?\S)??\1/g, "$2$3").replace(/(^|\W)([_]+)(\S)(.*?\S)??\2($|\W)/g, "$1$3$4$5").replace(/(`{3,})(.*?)\1/gm, "$2").replace(/`(.+?)`/g, "$1").replace(/~(.*?)~/g, "$1");
  } catch (e) {
    if (options.throwError) throw e;
    console.error("remove-markdown encountered error: %s", e);
    return md;
  }
  return output;
}
__name2(removeMarkdown, "removeMarkdown");
var PureTextRenderer = class extends Renderer {
  static {
    __name2(this, "PureTextRenderer");
  }
  async render(message, options) {
    let transformed = transformMessageContentToElements(message.content);
    if (options.split) {
      transformed = transformed.flatMap((element) => {
        if (element.type !== "text") {
          return element;
        }
        const content = element.attrs["content"];
        return content.split("\n\n\n").map((paragraph) => {
          return import_koishi11.h.text(paragraph);
        });
      });
    }
    transformed = transformed.map((element) => {
      if (element.type !== "text") {
        return element;
      }
      const content = element.attrs["content"];
      return import_koishi11.h.text(stripMarkdown(content));
    });
    return {
      element: transformed
    };
  }
  schema = import_koishi11.Schema.const("pure-text").i18n({
    "zh-CN": "\u5C06\u56DE\u590D\u6E32\u67D3\u4E3A\u7EAF\u6587\u672C\uFF08\u53BB\u9664 markdown \u683C\u5F0F\uFF09",
    "en-US": "Render as pure text (remove markdown format)"
  });
};
function stripMarkdown(source) {
  return removeMarkdown(source);
}
__name2(stripMarkdown, "stripMarkdown");
var DefaultRenderer = class {
  constructor(ctx, config) {
    this.ctx = ctx;
    this.config = config;
    this.defaultOptions = {
      type: config.outputMode,
      split: config.splitMessage,
      voice: {
        speakerId: config.voiceSpeakId
      }
    };
    ctx.inject(["chatluna"], (ctx2) => {
      this.addRenderer("text", () => new TextRenderer(ctx2));
      this.addRenderer("voice", () => new VoiceRenderer(ctx2));
      this.addRenderer("raw", () => new RawRenderer(ctx2));
      this.addRenderer("mixed-voice", () => new MixedVoiceRenderer(ctx2));
      this.addRenderer(
        "koishi-element",
        () => new KoishiElementRenderer(ctx2)
      );
      this.addRenderer("pure-text", () => new PureTextRenderer(ctx2));
    });
  }
  static {
    __name2(this, "DefaultRenderer");
  }
  defaultOptions;
  renderers = {};
  async render(message, options = this.defaultOptions) {
    try {
      const result = [];
      const currentRenderer = await this.getRenderer(options.type);
      const rawRenderer = options.type === "raw" ? currentRenderer : await this.getRenderer("raw");
      if (message.additionalReplyMessages) {
        for (const additionalMessage of message.additionalReplyMessages) {
          const elements = await rawRenderer.render(additionalMessage, options).then((r) => r.element);
          result.push({
            element: (0, import_koishi5.h)(
              "message",
              { forward: true },
              Array.isArray(elements) ? elements : [elements]
            )
          });
        }
      }
      result.push(await currentRenderer.render(message, options));
      return result;
    } catch (e) {
      throw new import_error4.ChatLunaError(import_error4.ChatLunaErrorCode.RENDER_ERROR, e);
    }
  }
  addRenderer(type, renderer) {
    this.renderers[type] = renderer(this.ctx, this.config);
    this.updateSchema();
    return () => this.removeRenderer(type);
  }
  removeRenderer(type) {
    delete this.renderers[type];
    this.updateSchema();
  }
  async getRenderer(type) {
    return this.renderers[type];
  }
  updateSchema() {
    if (!this.ctx.scope.isActive) {
      return;
    }
    this.ctx.schema.set(
      "output-mode",
      import_koishi5.Schema.union(this._getAllRendererScheme())
    );
  }
  _getAllRendererScheme() {
    return Object.values(this.renderers).map((key) => key.schema);
  }
  get rendererTypeList() {
    return Object.keys(this.renderers);
  }
};
var ChatLunaPromptRenderService = class {
  static {
    __name2(this, "ChatLunaPromptRenderService");
  }
  _renderer;
  constructor() {
    this._renderer = new import_shared_prompt_renderer.ChatLunaPromptRenderer();
    this._initBuiltinFunctions();
  }
  _initBuiltinFunctions() {
    this.registerFunctionProvider("time_UTC", (args) => {
      const date = /* @__PURE__ */ new Date();
      const utcOffset = args[0] ? parseInt(args[0]) : 0;
      if (isNaN(utcOffset)) {
        import_koishi_plugin_chatluna5.logger.warn(`Invalid UTC offset: ${args[0]}`);
        return "Invalid UTC offset";
      }
      const offsetDate = new Date(+date + utcOffset * import_koishi12.Time.hour);
      return offsetDate.toISOString().replace("T", " ").slice(0, -5);
    });
    this.registerFunctionProvider("timeDiff", (args) => {
      return getTimeDiff(args[0], args[1]);
    });
    this.registerFunctionProvider("date", () => {
      const date = /* @__PURE__ */ new Date();
      const offsetDate = new Date(
        +date - date.getTimezoneOffset() * import_koishi12.Time.minute
      );
      return offsetDate.toISOString().split("T")[0];
    });
    this.registerFunctionProvider("weekday", () => {
      const date = /* @__PURE__ */ new Date();
      return [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ][date.getDay()];
    });
    this.registerFunctionProvider("isotime", () => {
      const date = /* @__PURE__ */ new Date();
      const offsetDate = new Date(
        +date - date.getTimezoneOffset() * import_koishi12.Time.minute
      );
      return offsetDate.toISOString().slice(11, 19);
    });
    this.registerFunctionProvider("isodate", () => {
      const date = /* @__PURE__ */ new Date();
      const offsetDate = new Date(
        +date - date.getTimezoneOffset() * import_koishi12.Time.minute
      );
      return offsetDate.toISOString().split("T")[0];
    });
    this.registerFunctionProvider("random", (args) => {
      if (args.length === 2) {
        const [min, max] = args.map(Number);
        if (!isNaN(min) && !isNaN(max)) {
          return Math.floor(
            Math.random() * (max - min + 1) + min
          ).toString();
        }
      }
      return selectFromList(args.join(","), false);
    });
    this.registerFunctionProvider("pick", (args) => {
      return selectFromList(args.join(","), true);
    });
    this.registerFunctionProvider("roll", (args) => {
      return rollDice(args[0]).toString();
    });
    this.registerFunctionProvider("url", async (args) => {
      return await fetchUrl(
        args[1],
        args[0],
        args[2],
        parseInt(args[3] ?? "1000")
      );
    });
  }
  registerFunctionProvider(name2, handler) {
    return this._renderer.registerFunctionProvider(name2, handler);
  }
  registerVariableProvider(provider) {
    return this._renderer.registerVariableProvider(provider);
  }
  setVariable(name2, value) {
    this._renderer.setStaticVariable(name2, value);
  }
  getVariable(name2) {
    return this._renderer.getStaticVariable(name2);
  }
  removeVariable(name2) {
    this._renderer.removeStaticVariable(name2);
  }
  async renderTemplate(source, variables = {}, options) {
    return await this._renderer.render(source, variables, options);
  }
  async renderMessages(messages, variables = {}, options) {
    return await Promise.all(
      messages.map(async (message) => {
        const content = await this.renderTemplate(
          getMessageContent(message.content),
          variables,
          options
        );
        const messageInstance = new {
          human: import_messages2.HumanMessage,
          ai: import_messages2.AIMessage,
          system: import_messages2.SystemMessage
        }[message.getType()]({
          content: content.text,
          additional_kwargs: message.additional_kwargs
        });
        return messageInstance;
      })
    );
  }
  async renderPresetTemplate(presetTemplate, variables = {}, options) {
    const collectedVariables = /* @__PURE__ */ new Set();
    const formattedMessages = await Promise.all(
      presetTemplate.messages.map(async (message) => {
        const content = await this.renderTemplate(
          getMessageContent(message.content),
          variables,
          options
        );
        const messageInstance = new {
          human: import_messages2.HumanMessage,
          ai: import_messages2.AIMessage,
          system: import_messages2.SystemMessage
        }[message.getType()]({
          content: content.text,
          additional_kwargs: message.additional_kwargs
        });
        for (const variable of content.variables) {
          collectedVariables.add(variable);
        }
        return messageInstance;
      })
    );
    return {
      messages: formattedMessages,
      variables: Array.from(collectedVariables)
    };
  }
};
var types_exports = {};
__reExport(types_exports, shared_prompt_renderer_star);
__reExport(chat_exports, types_exports);
var ChatLunaService = class extends import_koishi2.Service {
  constructor(ctx, config) {
    super(ctx, "chatluna");
    this.ctx = ctx;
    this.config = config;
    this._chain = new ChatChain(ctx, config);
    this._keysCache = new Cache(this.ctx, config, "chatluna/keys");
    this._preset = new import_preset.PresetService(ctx, config);
    this._platformService = new import_service.PlatformService(ctx);
    this._messageTransformer = new MessageTransformer(config);
    this._renderer = new DefaultRenderer(ctx, config);
    this._promptRenderer = new ChatLunaPromptRenderService();
    this._createTempDir();
    this._defineDatabase();
  }
  static {
    __name2(this, "ChatLunaService");
  }
  _plugins = {};
  _chatInterfaceWrapper;
  _chain;
  _keysCache;
  _preset;
  _platformService;
  _messageTransformer;
  _renderer;
  _promptRenderer;
  async installPlugin(plugin) {
    const platformName = plugin.platformName;
    if (this._plugins[platformName]) {
      throw new import_error2.ChatLunaError(
        import_error2.ChatLunaErrorCode.PLUGIN_ALREADY_REGISTERED,
        new Error(`Plugin ${platformName} already registered`)
      );
    }
    this._plugins[platformName] = plugin;
    this.ctx.logger.success(`Plugin %c installed`, platformName);
  }
  async awaitLoadPlatform(plugin, timeout = 3e4) {
    const pluginName = typeof plugin === "string" ? plugin : plugin.platformName;
    const { promise, resolve: resolve2, reject } = (0, import_promise.withResolver)();
    const models = this._platformService.listPlatformModels(
      pluginName,
      import_types.ModelType.all
    );
    if (models.value.length > 0) {
      resolve2();
      return promise;
    }
    let timeoutError = null;
    try {
      throw new Error(
        `Timeout waiting for platform ${pluginName} to load`
      );
    } catch (e) {
      timeoutError = e;
    }
    const timeoutId = this.ctx.setTimeout(() => {
      reject(timeoutError);
    }, timeout);
    const disposable = (0, import_reactivity.watch)(
      models,
      () => {
        if ((models.value?.length ?? 0) > 0) {
          resolve2();
          timeoutId();
          disposable.stop();
        }
      },
      { deep: true }
    );
    this[import_koishi2.Context.origin].effect(() => () => disposable.stop());
    return promise;
  }
  uninstallPlugin(plugin) {
    const platformName = typeof plugin === "string" ? plugin : plugin.platformName;
    const targetPlugin = this._plugins[platformName];
    if (!targetPlugin) {
      return;
    }
    const platform = targetPlugin.platformName;
    this._chatInterfaceWrapper?.dispose(platform);
    delete this._plugins[platform];
    this.ctx.logger.success(
      "Plugin %c uninstalled",
      targetPlugin.platformName
    );
  }
  getPlugin(platformName) {
    return this._plugins[platformName];
  }
  /**
   * @internal
   */
  chat(session, room, message, event, stream = false, variables = {}, postHandler, requestId = (0, import_crypto.randomUUID)()) {
    const chatInterfaceWrapper = this._chatInterfaceWrapper ?? this._createChatInterfaceWrapper();
    return chatInterfaceWrapper.chat(
      session,
      room,
      message,
      event,
      stream,
      requestId,
      variables,
      postHandler
    );
  }
  async stopChat(room, requestId) {
    const chatInterfaceWrapper = this.queryInterfaceWrapper(room, false);
    if (chatInterfaceWrapper == null) {
      return void 0;
    }
    return chatInterfaceWrapper.stopChat(requestId);
  }
  queryInterfaceWrapper(room, autoCreate = true) {
    return this._chatInterfaceWrapper ?? (autoCreate ? this._createChatInterfaceWrapper() : void 0);
  }
  async clearChatHistory(room) {
    const chatBridger = this._chatInterfaceWrapper ?? this._createChatInterfaceWrapper();
    return chatBridger.clearChatHistory(room);
  }
  getCachedInterfaceWrapper() {
    return this._chatInterfaceWrapper;
  }
  async clearCache(room) {
    const chatBridger = this._chatInterfaceWrapper ?? this._createChatInterfaceWrapper();
    return chatBridger.clearCache(room);
  }
  async createChatModel(platformName, model) {
    const service = this._platformService;
    if (model == null) {
      ;
      [platformName, model] = (0, import_count_tokens.parseRawModelName)(platformName);
    }
    const client = await service.getClient(platformName);
    return (0, import_reactivity.computed)(() => {
      if (client.value == null) {
        return void 0;
      }
      return client.value.createModel(model);
    });
  }
  async createEmbeddings(platformName, modelName) {
    const service = this._platformService;
    if (modelName == null) {
      ;
      [platformName, modelName] = (0, import_count_tokens.parseRawModelName)(platformName);
    }
    const client = await service.getClient(platformName);
    return (0, import_reactivity.computed)(() => {
      if (client.value == null) {
        if (platformName !== "\u65E0") {
          this.ctx.logger.warn(
            `The platform ${platformName} no available`
          );
        }
        return import_in_memory.emptyEmbeddings;
      }
      const model = client.value.createModel(modelName);
      if (model instanceof import_model.ChatLunaBaseEmbeddings) {
        return model;
      }
      this.ctx.logger.warn(
        `The model ${modelName} is not embeddings, return empty embeddings`
      );
      return import_in_memory.emptyEmbeddings;
    });
  }
  get platform() {
    return this._platformService;
  }
  get cache() {
    return this._keysCache;
  }
  get preset() {
    return this._preset;
  }
  get chatChain() {
    return this._chain;
  }
  get messageTransformer() {
    return this._messageTransformer;
  }
  get renderer() {
    return this._renderer;
  }
  get promptRenderer() {
    return this._promptRenderer;
  }
  async stop() {
    this._chatInterfaceWrapper?.dispose();
    this._platformService.dispose();
  }
  _createTempDir() {
    const tempPath = import_path.default.resolve(this.ctx.baseDir, "data/chatluna/temp");
    if (!import_fs.default.existsSync(tempPath)) {
      import_fs.default.mkdirSync(tempPath, { recursive: true });
    }
  }
  _defineDatabase() {
    const ctx = this.ctx;
    ctx.database.extend(
      "chathub_conversation",
      {
        id: {
          type: "char",
          length: 255
        },
        latestId: {
          type: "char",
          length: 255,
          nullable: true
        },
        additional_kwargs: {
          type: "text",
          nullable: true
        },
        updatedAt: {
          type: "timestamp",
          nullable: false,
          initial: /* @__PURE__ */ new Date()
        }
      },
      {
        autoInc: false,
        primary: "id",
        unique: ["id"]
      }
    );
    ctx.database.extend(
      "chathub_message",
      {
        id: {
          type: "char",
          length: 255
        },
        text: "text",
        parent: {
          type: "char",
          length: 255,
          nullable: true
        },
        role: {
          type: "char",
          length: 20
        },
        conversation: {
          type: "char",
          length: 255
        },
        additional_kwargs: {
          type: "text",
          nullable: true
        },
        additional_kwargs_binary: {
          type: "binary",
          nullable: true
        },
        tool_call_id: "string",
        tool_calls: "json",
        name: {
          type: "char",
          length: 255,
          nullable: true
        },
        rawId: {
          type: "char",
          length: 255,
          nullable: true
        }
      },
      {
        autoInc: false,
        primary: "id",
        unique: ["id"]
        /*  foreign: {
            conversation: ['chathub_conversaion', 'id']
        } */
      }
    );
    ctx.database.extend(
      "chathub_room",
      {
        roomId: {
          type: "integer"
        },
        roomName: "string",
        conversationId: {
          type: "char",
          length: 255,
          nullable: true
        },
        roomMasterId: {
          type: "char",
          length: 255
        },
        visibility: {
          type: "char",
          length: 20
        },
        preset: {
          type: "char",
          length: 255
        },
        model: {
          type: "char",
          length: 100
        },
        chatMode: {
          type: "char",
          length: 20
        },
        password: {
          type: "char",
          length: 100
        },
        autoUpdate: {
          type: "boolean",
          initial: false
        },
        updatedTime: {
          type: "timestamp",
          nullable: false,
          initial: /* @__PURE__ */ new Date()
        }
      },
      {
        autoInc: false,
        primary: "roomId",
        unique: ["roomId"]
      }
    );
    ctx.database.extend(
      "chathub_room_member",
      {
        userId: {
          type: "string",
          length: 255
        },
        roomId: {
          type: "integer"
        },
        roomPermission: {
          type: "char",
          length: 50
        },
        mute: {
          type: "boolean",
          initial: false
        }
      },
      {
        autoInc: false,
        primary: ["userId", "roomId"]
      }
    );
    ctx.database.extend(
      "chathub_room_group_member",
      {
        groupId: {
          type: "char",
          length: 255
        },
        roomId: {
          type: "integer"
        },
        roomVisibility: {
          type: "char",
          length: 20
        }
      },
      {
        autoInc: false,
        primary: ["groupId", "roomId"]
      }
    );
    ctx.database.extend(
      "chathub_user",
      {
        userId: {
          type: "char",
          length: 255
        },
        defaultRoomId: {
          type: "integer"
        },
        groupId: {
          type: "char",
          length: 255,
          nullable: true
        }
      },
      {
        autoInc: false,
        primary: ["userId", "groupId"]
      }
    );
    ctx.database.extend(
      "chatluna_docstore",
      {
        key: {
          type: "char",
          length: 255
        },
        id: {
          type: "char",
          length: 255
        },
        pageContent: "text",
        metadata: "json",
        createdAt: "date"
      },
      {
        autoInc: false,
        primary: ["key", "id"]
      }
    );
  }
  _createChatInterfaceWrapper() {
    const chatBridger = new ChatInterfaceWrapper(this);
    this._chatInterfaceWrapper = chatBridger;
    return chatBridger;
  }
  static inject = ["database"];
};
var ChatLunaPlugin = class {
  constructor(ctx, config, platformName, createConfigPool = true) {
    this.ctx = ctx;
    this.config = config;
    this.platformName = platformName;
    ctx.on("dispose", async () => {
      ctx.chatluna.uninstallPlugin(this);
    });
    ctx.on("ready", async () => {
      ctx.chatluna.installPlugin(this);
    });
    if (createConfigPool) {
      if (config == null) {
        const error = new Error("Check Config!");
        this.ctx.scope.cancel(error);
        throw error;
      }
      this.platformConfigPool = new import_config.ClientConfigPool(
        ctx,
        config.configMode === "default" ? import_config.ClientConfigPoolMode.AlwaysTheSame : import_config.ClientConfigPoolMode.LoadBalancing
      );
    }
    this._platformService = ctx.chatluna.platform;
    const models = this._platformService.listPlatformModels(
      this.platformName,
      import_types.ModelType.llm
    );
    const watcher = (0, import_reactivity.watch)(
      models,
      () => {
        this._supportModels = (models.value ?? []).map(
          (model) => `${this.platformName}/${model.name}`
        );
      },
      { deep: true }
    );
    const stop = /* @__PURE__ */ __name2(() => watcher.stop(), "stop");
    this.ctx.effect(() => stop);
  }
  static {
    __name2(this, "ChatLunaPlugin");
  }
  _supportModels = [];
  platformConfigPool;
  _platformService;
  parseConfig(f) {
    const configs = f(this.config);
    for (const config of configs) {
      this.platformConfigPool.addConfig(config);
    }
  }
  createRunnableConfig() {
    const abortController = new AbortController();
    const abort = /* @__PURE__ */ __name2(() => abortController.abort(
      new import_error2.ChatLunaError(import_error2.ChatLunaErrorCode.ABORTED, void 0, true)
    ), "abort");
    this.ctx.effect(() => abort);
    return {
      signal: abortController.signal
    };
  }
  async initClient() {
    try {
      await this._platformService.createClient(
        this.platformName,
        this.createRunnableConfig()
      );
    } catch (e) {
      this.ctx.chatluna.uninstallPlugin(this);
      this.ctx.scope.cancel(e);
      throw e;
    }
  }
  get supportedModels() {
    return this._supportModels;
  }
  registerToService() {
    try {
      throw new Error("Please remove this method");
    } catch (e) {
      this.ctx.logger.warn(
        `Now the plugin support auto installation, Please remove call this method`,
        e
      );
    }
  }
  registerClient(func, platformName = this.platformName) {
    this.ctx.effect(
      () => this._platformService.registerClient(platformName, func)
    );
  }
  registerVectorStore(name2, func) {
    this.ctx.effect(
      () => this._platformService.registerVectorStore(name2, func)
    );
  }
  registerTool(name2, tool) {
    this.ctx.effect(() => this._platformService.registerTool(name2, tool));
  }
  registerChatChainProvider(name2, description, func) {
    this.ctx.effect(
      () => this._platformService.registerChatChain(name2, description, func)
    );
  }
  registerRenderer(name2, renderer) {
    this.ctx.effect(
      () => this.ctx.chatluna.renderer.addRenderer(name2, renderer)
    );
  }
  async fetch(info, init, proxy) {
    if (proxy != null) {
      return (0, import_request2.chatLunaFetch)(info, init, proxy);
    }
    const proxyMode = this.config.proxyMode;
    switch (proxyMode) {
      case "system":
        return (0, import_request2.chatLunaFetch)(info, init);
      case "off":
        return (0, import_request2.chatLunaFetch)(info, init, "null");
      case "on":
        return (0, import_request2.chatLunaFetch)(info, init, this.config.proxyAddress);
      default:
        return (0, import_request2.chatLunaFetch)(info, init);
    }
  }
  ws(url, options) {
    const proxyMode = this.config.proxyMode;
    let webSocket;
    switch (proxyMode) {
      case "system":
        webSocket = (0, import_request2.ws)(url, options);
        break;
      case "off":
        webSocket = (0, import_request2.ws)(url, options, "null");
        break;
      case "on":
        webSocket = (0, import_request2.ws)(url, options, this.config.proxyAddress);
        break;
      default:
        webSocket = (0, import_request2.ws)(url, options);
        break;
    }
    this.ctx.effect(() => webSocket.close);
    webSocket.on("error", (err) => {
      this.ctx.logger.error(err);
    });
    return webSocket;
  }
};
var ChatInterfaceWrapper = class {
  constructor(_service) {
    this._service = _service;
    this._platformService = _service.platform;
  }
  static {
    __name2(this, "ChatInterfaceWrapper");
  }
  _conversations = new import_lru_cache.LRUCache({
    max: 20
  });
  _modelQueue = new import_queue.RequestIdQueue();
  _conversationQueue = new import_queue.RequestIdQueue();
  _platformService;
  _requestIdMap = /* @__PURE__ */ new Map();
  _platformToConversations = /* @__PURE__ */ new Map();
  async chat(session, room, message, event, stream, requestId, variables = {}, postHandler) {
    const { conversationId, model: fullModelName } = room;
    const [platform] = (0, import_count_tokens.parseRawModelName)(fullModelName);
    const client = await this._platformService.getClient(platform);
    if (client.value == null) {
      await this._service.awaitLoadPlatform(platform);
    }
    if (client.value == null) {
      throw new import_error2.ChatLunaError(
        import_error2.ChatLunaErrorCode.UNKNOWN_ERROR,
        new Error(`Platform ${platform} is not available`)
      );
    }
    const config = client.value.configPool.getConfig(true).value;
    try {
      await Promise.all([
        this._conversationQueue.add(conversationId, requestId),
        this._modelQueue.add(platform, requestId)
      ]);
      const currentQueueLength = await this._conversationQueue.getQueueLength(conversationId);
      await event["llm-queue-waiting"](currentQueueLength);
      await Promise.all([
        this._conversationQueue.wait(conversationId, requestId, 0),
        this._modelQueue.wait(
          platform,
          requestId,
          config.concurrentMaxSize
        )
      ]);
      const conversationIds = this._platformToConversations.get(platform) ?? [];
      conversationIds.push(conversationId);
      this._platformToConversations.set(platform, conversationIds);
      const { chatInterface } = this._conversations.get(conversationId) ?? await this._createChatInterface(room);
      const abortController = new AbortController();
      this._requestIdMap.set(requestId, abortController);
      const humanMessage = new import_messages.HumanMessage({
        content: message.content,
        name: message.name,
        id: session.userId,
        additional_kwargs: {
          ...message.additional_kwargs,
          preset: room.preset
        }
      });
      const chainValues = await chatInterface.chat({
        message: humanMessage,
        events: event,
        stream,
        conversationId,
        session,
        variables,
        signal: abortController.signal,
        postHandler
      });
      const aiMessage = chainValues.message;
      const reasoningContent = aiMessage.additional_kwargs?.reasoning_content;
      const reasoningTime = aiMessage.additional_kwargs?.reasoning_time;
      const additionalReplyMessages = [];
      if (reasoningContent != null && reasoningContent.length > 0 && this._service.config.showThoughtMessage) {
        additionalReplyMessages.push({
          content: `Thought for ${reasoningTime / 1e3} seconds: 

${reasoningContent}`
        });
      }
      return {
        content: aiMessage.content,
        additionalReplyMessages
      };
    } finally {
      await Promise.all([
        this._modelQueue.remove(platform, requestId),
        this._conversationQueue.remove(conversationId, requestId)
      ]);
      this._requestIdMap.delete(requestId);
    }
  }
  stopChat(requestId) {
    const abortController = this._requestIdMap.get(requestId);
    if (!abortController) {
      return false;
    }
    abortController.abort(
      new import_error2.ChatLunaError(import_error2.ChatLunaErrorCode.ABORTED, void 0, true)
    );
    this._requestIdMap.delete(requestId);
    return true;
  }
  async query(room, create = false) {
    const { conversationId } = room;
    const { chatInterface } = this._conversations.get(conversationId) ?? {};
    if (chatInterface == null && create) {
      return this._createChatInterface(room).then(
        (result) => result.chatInterface
      );
    }
    return chatInterface;
  }
  async clearChatHistory(room) {
    const { conversationId } = room;
    const requestId = (0, import_crypto.randomUUID)();
    try {
      await this._conversationQueue.add(conversationId, requestId);
      await this._conversationQueue.wait(conversationId, requestId, 0);
      const chatInterface = await this.query(room, true);
      await chatInterface.clearChatHistory();
    } finally {
      this._conversations.delete(conversationId);
      await this._conversationQueue.remove(conversationId, requestId);
    }
  }
  async clearCache(room) {
    const { conversationId } = room;
    const requestId = (0, import_crypto.randomUUID)();
    try {
      await this._conversationQueue.add(conversationId, requestId);
      await this._conversationQueue.wait(conversationId, requestId, 0);
      const chatInterface = await this.query(room);
      await this._service.ctx.root.parallel(
        "chatluna/clear-chat-history",
        conversationId,
        chatInterface
      );
      return this._conversations.delete(conversationId);
    } finally {
      await this._conversationQueue.remove(conversationId, requestId);
    }
  }
  getCachedConversations() {
    return Array.from(this._conversations.entries());
  }
  async delete(room) {
    const { conversationId } = room;
    const requestId = (0, import_crypto.randomUUID)();
    try {
      await this._conversationQueue.add(conversationId, requestId);
      await this._conversationQueue.wait(conversationId, requestId, 1);
      const chatInterface = await this.query(room);
      if (!chatInterface) return;
      await chatInterface.delete(this._service.ctx, room);
      await this.clearCache(room);
    } finally {
      await this._conversationQueue.remove(conversationId, requestId);
    }
  }
  dispose(platform) {
    for (const controller of this._requestIdMap.values()) {
      controller.abort(
        new import_error2.ChatLunaError(import_error2.ChatLunaErrorCode.ABORTED, void 0, true)
      );
    }
    if (!platform) {
      this._conversations.clear();
      this._requestIdMap.clear();
      this._platformToConversations.clear();
      return;
    }
    const conversationIds = this._platformToConversations.get(platform);
    if (!conversationIds?.length) return;
    for (const conversationId of conversationIds) {
      this._conversations.delete(conversationId);
    }
    this._platformToConversations.delete(platform);
  }
  async _createChatInterface(room) {
    const config = this._service.config;
    const chatInterface = new import_app.ChatInterface(this._service.ctx.root, {
      chatMode: room.chatMode,
      botName: config.botNames[0],
      preset: this._service.preset.getPreset(room.preset),
      model: room.model,
      conversationId: room.conversationId,
      embeddings: config.defaultEmbeddings && config.defaultEmbeddings.length > 0 ? config.defaultEmbeddings : void 0,
      vectorStoreName: config.defaultVectorStore && config.defaultVectorStore.length > 0 ? config.defaultVectorStore : void 0
    });
    const result = {
      chatInterface,
      room
    };
    this._conversations.set(room.conversationId, result);
    return result;
  }
};
((ChatLunaPlugin2) => {
  ChatLunaPlugin2.Config = import_koishi2.Schema.intersect([
    import_koishi2.Schema.object({
      chatConcurrentMaxSize: import_koishi2.Schema.number().min(1).max(8).default(3),
      chatTimeLimit: import_koishi2.Schema.computed(
        import_koishi2.Schema.number().min(1).max(2e3)
      ).default(200),
      configMode: import_koishi2.Schema.union([
        import_koishi2.Schema.const("default"),
        import_koishi2.Schema.const("balance")
      ]).default("default"),
      maxRetries: import_koishi2.Schema.number().min(1).max(6).default(3),
      timeout: import_koishi2.Schema.number().default(300 * 1e3),
      proxyMode: import_koishi2.Schema.union([
        import_koishi2.Schema.const("system"),
        import_koishi2.Schema.const("off"),
        import_koishi2.Schema.const("on")
      ]).default("system")
    }),
    import_koishi2.Schema.union([
      import_koishi2.Schema.object({
        proxyMode: import_koishi2.Schema.const("on").required(),
        proxyAddress: import_koishi2.Schema.string().default("")
      }),
      import_koishi2.Schema.object({
        proxyMode: import_koishi2.Schema.const("off").required()
      }),
      import_koishi2.Schema.object({
        proxyMode: import_koishi2.Schema.const("system")
      })
    ])
  ]).i18n({
    "zh-CN": require_zh_CN_schema_plugin(),
    "en-US": require_en_US_schema_plugin()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  });
})(ChatLunaPlugin || (ChatLunaPlugin = {}));

// node_modules/koishi-plugin-chatluna/lib/utils/schema.mjs
var import_koishi13 = require("koishi");
var import_reactivity2 = require("@vue/reactivity");
var import_types2 = require("koishi-plugin-chatluna/llm-core/platform/types");
var __defProp4 = Object.defineProperty;
var __name3 = (target, value) => __defProp4(target, "name", { value, configurable: true });
function modelSchema(ctx, createNotification = false) {
  const modelNames = getModelNames(ctx.chatluna.platform);
  const notification = createNotification ? ctx.notifier?.create({
    content: import_koishi13.h.parse(
      "\u60A8\u5F53\u524D\u6CA1\u6709\u914D\u7F6E\u6A21\u578B\uFF0C\u8BF7\u524D\u5F80 https://chatluna.chat/guide/configure-model-platform/introduction.html \u4E86\u89E3\u5982\u4F55\u5B89\u88C5\u6A21\u578B\u9002\u914D\u5668\u3002"
    ),
    type: "warning"
  }) : void 0;
  const watcher = (0, import_reactivity2.watch)(
    modelNames,
    (modelNames2) => {
      ctx.schema.set("model", import_koishi13.Schema.union(modelNames2));
      if (modelNames2.length > 1 && notification) {
        notification?.update({
          content: `\u5F53\u524D\u5171\u52A0\u8F7D\u4E86 ${modelNames2.length} \u4E2A\u6A21\u578B\u3002`,
          type: "success"
        });
      } else {
        notification?.update({
          content: import_koishi13.h.parse(
            "\u60A8\u5F53\u524D\u6CA1\u6709\u914D\u7F6E\u6A21\u578B\uFF0C\u8BF7\u524D\u5F80 https://chatluna.chat/guide/configure-model-platform/introduction.html \u4E86\u89E3\u5982\u4F55\u5B89\u88C5\u6A21\u578B\u9002\u914D\u5668\u3002"
          ),
          type: "warning"
        });
      }
    },
    {
      immediate: true
    }
  );
  const stop = /* @__PURE__ */ __name3(() => watcher.stop(), "stop");
  ctx.effect(() => stop);
}
__name3(modelSchema, "modelSchema");
function embeddingsSchema(ctx) {
  const modelNames = getModelNames(
    ctx.chatluna.platform,
    import_types2.ModelType.embeddings
  );
  const watcher = (0, import_reactivity2.watch)(
    modelNames,
    (modelNames2) => {
      ctx.schema.set("embeddings", import_koishi13.Schema.union(modelNames2));
    },
    {
      immediate: true
    }
  );
  const stop = /* @__PURE__ */ __name3(() => watcher.stop(), "stop");
  ctx.effect(() => stop);
}
__name3(embeddingsSchema, "embeddingsSchema");
function chatChainSchema(ctx) {
  const modelNames = getChatChainNames(ctx.chatluna.platform);
  const watcher = (0, import_reactivity2.watch)(
    modelNames,
    (modelNames2) => {
      ctx.schema.set("chat-mode", import_koishi13.Schema.union(modelNames2));
    },
    {
      immediate: true
    }
  );
  const stop = /* @__PURE__ */ __name3(() => watcher.stop(), "stop");
  ctx.effect(() => stop);
}
__name3(chatChainSchema, "chatChainSchema");
function vectorStoreSchema(ctx) {
  const vectorStoreNames = getVectorStores(ctx, ctx.chatluna.platform);
  const watcher = (0, import_reactivity2.watch)(
    vectorStoreNames,
    (vectorStoreNames2) => {
      ctx.schema.set("vector-store", import_koishi13.Schema.union(vectorStoreNames2));
    },
    {
      immediate: true
    }
  );
  const stop = /* @__PURE__ */ __name3(() => watcher.stop(), "stop");
  ctx.effect(() => stop);
}
__name3(vectorStoreSchema, "vectorStoreSchema");
function getModelNames(service, type = import_types2.ModelType.llm) {
  const models = service.listAllModels(type);
  return (0, import_reactivity2.computed)(
    () => models.value.map((model) => model.platform + "/" + model.name).concat("\u65E0").map((model) => import_koishi13.Schema.const(model).description(model))
  );
}
__name3(getModelNames, "getModelNames");
function getVectorStores(ctx, service) {
  const vectorStoreNamesRef = service.vectorStores;
  return (0, import_reactivity2.computed)(
    () => vectorStoreNamesRef.value.concat("\u65E0").map((name2) => import_koishi13.Schema.const(name2).description(name2))
  );
}
__name3(getVectorStores, "getVectorStores");
function getChatChainNames(service) {
  const chains = service.chatChains;
  return (0, import_reactivity2.computed)(
    () => chains.value.map(
      (info) => import_koishi13.Schema.const(info.name).i18n(info.description)
    )
  );
}
__name3(getChatChainNames, "getChatChainNames");

// src/schema.ts
var import_koishi14 = require("koishi");
var name = "chatluna-affinity";
var inject = {
  required: ["chatluna", "database"],
  optional: ["puppeteer", "console"]
};
var defaultMemberInfoItems = [
  "nickname",
  "userId",
  "role",
  "level",
  "title",
  "gender",
  "age",
  "area",
  "joinTime",
  "lastSentTime"
];
var baseAffinityDefaults = {
  initialRandomMin: 20,
  initialRandomMax: 40,
  min: 0,
  max: 100,
  maxIncreasePerMessage: 5,
  maxDecreasePerMessage: 5
};
var AffinityDynamicsSchema = import_koishi14.Schema.object({
  shortTerm: import_koishi14.Schema.object({
    promoteThreshold: import_koishi14.Schema.number().default(15).description("\u77ED\u671F\u597D\u611F\u9AD8\u4E8E\u8BE5\u503C\u65F6\u63D0\u5347\u957F\u671F\u597D\u611F"),
    demoteThreshold: import_koishi14.Schema.number().default(-15).description("\u77ED\u671F\u597D\u611F\u4F4E\u4E8E\u8BE5\u503C\u65F6\u964D\u4F4E\u957F\u671F\u597D\u611F"),
    longTermPromoteStep: import_koishi14.Schema.number().default(3).min(1).description("\u6BCF\u6B21\u589E\u52A0\u957F\u671F\u597D\u611F\u7684\u5E45\u5EA6"),
    longTermDemoteStep: import_koishi14.Schema.number().default(3).min(1).description("\u6BCF\u6B21\u51CF\u5C11\u957F\u671F\u597D\u611F\u7684\u5E45\u5EA6")
  }).default({
    promoteThreshold: 15,
    demoteThreshold: -15,
    longTermPromoteStep: 3,
    longTermDemoteStep: 3
  }).description("\u77ED\u671F/\u957F\u671F\u597D\u611F\u8BBE\u7F6E").collapse(),
  actionWindow: import_koishi14.Schema.object({
    windowHours: import_koishi14.Schema.number().default(24).min(1).description("\u7EDF\u8BA1\u7684\u65F6\u95F4\u7A97\u53E3\uFF08\u5C0F\u65F6\uFF09"),
    increaseBonus: import_koishi14.Schema.number().default(2).description("\u5728\u6B63\u5411\u5360\u4F18\u65F6\u6BCF\u6B21\u589E\u5E45\u989D\u5916\u589E\u52A0\u6570\u503C"),
    decreaseBonus: import_koishi14.Schema.number().default(2).description("\u5728\u8D1F\u5411\u5360\u4F18\u65F6\u6BCF\u6B21\u51CF\u5E45\u989D\u5916\u589E\u52A0\u6570\u503C"),
    bonusChatThreshold: import_koishi14.Schema.number().default(10).min(0).description("\u804A\u5929\u6B21\u6570\u5927\u4E8E\u8BE5\u503C\u65F6\u624D\u542F\u7528\u989D\u5916\u589E\u51CF"),
    allowBonusOverflow: import_koishi14.Schema.boolean().default(false).description("\u5141\u8BB8\u989D\u5916\u589E\u51CF\u7A81\u7834\u5355\u6B21\u4E0A\u9650"),
    maxEntries: import_koishi14.Schema.number().default(80).min(10).description("\u7A97\u53E3\u5185\u6700\u591A\u4FDD\u7559\u7684\u8BB0\u5F55\u6570")
  }).default({ windowHours: 24, increaseBonus: 2, decreaseBonus: 2, bonusChatThreshold: 10, allowBonusOverflow: false, maxEntries: 80 }).description("\u8FD1\u671F\u4E92\u52A8\u52A0\u6210\u8BBE\u7F6E").collapse(),
  coefficient: import_koishi14.Schema.object({
    base: import_koishi14.Schema.number().default(1).description("\u7EFC\u5408\u597D\u611F\u57FA\u7840\u7CFB\u6570"),
    maxDrop: import_koishi14.Schema.number().default(0.3).min(0).description("\u957F\u65F6\u95F4\u672A\u4E92\u52A8\u6216 decrease \u5927\u4E8E increase \u65F6\u6700\u591A\u964D\u4F4E\u7684\u7CFB\u6570\u5E45\u5EA6"),
    maxBoost: import_koishi14.Schema.number().default(0.3).min(0).description("\u8FDE\u7EED\u4E92\u52A8\u4E14 increase \u5927\u4E8E decrease \u65F6\u6700\u591A\u63D0\u5347\u7684\u7CFB\u6570\u5E45\u5EA6"),
    decayPerDay: import_koishi14.Schema.number().default(0.05).min(0).description("\u6BCF\u65E5\u672A\u4E92\u52A8\u6216 decrease \u5927\u4E8E increase \u65F6\u8870\u51CF\u91CF"),
    boostPerDay: import_koishi14.Schema.number().default(0.05).min(0).description("\u6BCF\u65E5\u8FDE\u7EED\u4E92\u52A8\u4E14 increase \u5927\u4E8E decrease \u65F6\u63D0\u5347\u91CF")
  }).default({ base: 1, maxDrop: 0.3, maxBoost: 0.3, decayPerDay: 0.05, boostPerDay: 0.05 }).description("\u7EFC\u5408\u597D\u611F\u7CFB\u6570\u8BBE\u7F6E").collapse()
}).description("\u597D\u611F\u5EA6\u52A8\u6001\u8BBE\u7F6E");
var AffinitySchema = import_koishi14.Schema.object({
  affinityVariableName: import_koishi14.Schema.string().default("affinity").description("\u597D\u611F\u5EA6\u53D8\u91CF\u540D\u79F0"),
  contextAffinityOverview: import_koishi14.Schema.object({
    variableName: import_koishi14.Schema.string().default("contextAffinity").description("\u53D8\u91CF\u540D\u79F0"),
    messageWindow: import_koishi14.Schema.number().default(20).min(1).max(200).description("\u8BFB\u53D6\u6700\u8FD1\u7684\u7FA4\u804A\u6D88\u606F\u6570\u91CF")
  }).default({ variableName: "contextAffinity", messageWindow: 20 }).description("\u4E0A\u4E0B\u6587\u597D\u611F\u5EA6\u53D8\u91CF").collapse(),
  baseAffinityConfig: import_koishi14.Schema.object({
    initialRandomMin: import_koishi14.Schema.number().default(baseAffinityDefaults.initialRandomMin).description("\u521D\u59CB\u957F\u671F\u597D\u611F\u5EA6\u968F\u673A\u8303\u56F4\u4E0B\u9650"),
    initialRandomMax: import_koishi14.Schema.number().default(baseAffinityDefaults.initialRandomMax).description("\u521D\u59CB\u957F\u671F\u597D\u611F\u5EA6\u968F\u673A\u8303\u56F4\u4E0A\u9650"),
    min: import_koishi14.Schema.number().default(baseAffinityDefaults.min).description("\u7EFC\u5408\u597D\u611F\u5EA6\u6700\u5C0F\u503C"),
    max: import_koishi14.Schema.number().default(baseAffinityDefaults.max).description("\u7EFC\u5408\u597D\u611F\u5EA6\u6700\u5927\u503C"),
    maxIncreasePerMessage: import_koishi14.Schema.number().default(baseAffinityDefaults.maxIncreasePerMessage).description("\u5355\u6B21\u589E\u52A0\u7684\u77ED\u671F\u597D\u611F\u6700\u5927\u5E45\u5EA6"),
    maxDecreasePerMessage: import_koishi14.Schema.number().default(baseAffinityDefaults.maxDecreasePerMessage).description("\u5355\u6B21\u51CF\u5C11\u7684\u77ED\u671F\u597D\u611F\u6700\u5927\u5E45\u5EA6")
  }).default({ ...baseAffinityDefaults }).description("\u597D\u611F\u5EA6\u57FA\u7840\u6570\u503C").collapse(),
  affinityDynamics: AffinityDynamicsSchema.default({
    shortTerm: { promoteThreshold: 15, demoteThreshold: -15, longTermPromoteStep: 3, longTermDemoteStep: 3 },
    actionWindow: { windowHours: 24, increaseBonus: 2, decreaseBonus: 2, bonusChatThreshold: 10, allowBonusOverflow: false, maxEntries: 80 },
    coefficient: { base: 1, maxDrop: 0.3, maxBoost: 0.3, decayPerDay: 0.05, boostPerDay: 0.05 }
  }).collapse(),
  model: import_koishi14.Schema.dynamic("model").description("\u7528\u4E8E\u597D\u611F\u5EA6\u5206\u6790\u7684\u6A21\u578B"),
  enableAnalysis: import_koishi14.Schema.boolean().default(true).description("\u662F\u5426\u542F\u7528\u597D\u611F\u5EA6\u5206\u6790"),
  historyMessageCount: import_koishi14.Schema.number().default(10).min(0).description("\u7528\u4E8E\u5206\u6790\u7684\u6700\u8FD1\u6D88\u606F\u6761\u6570"),
  rankRenderAsImage: import_koishi14.Schema.boolean().default(false).description("\u5C06\u597D\u611F\u5EA6\u6392\u884C\u6E32\u67D3\u4E3A\u56FE\u7247"),
  rankDefaultLimit: import_koishi14.Schema.number().default(10).min(1).max(50).description("\u597D\u611F\u5EA6\u6392\u884C\u9ED8\u8BA4\u5C55\u793A\u4EBA\u6570"),
  triggerNicknames: import_koishi14.Schema.array(import_koishi14.Schema.string().description("\u6635\u79F0")).role("table").default([]).description("\u89E6\u53D1\u5206\u6790\u7684 bot \u6635\u79F0\u5217\u8868"),
  analysisPrompt: import_koishi14.Schema.string().role("textarea").default(
    '\u4F60\u662F\u597D\u611F\u5EA6\u7BA1\u5BB6\uFF0C\u8BC4\u4F30\u672C\u6B21\u4E92\u52A8\u7684\u589E\u51CF\u5E45\u5EA6\uFF0C\u5E76\u9075\u5B88\u4EE5\u4E0B\u8981\u6C42:\n- \u4EE5 `\u4EBA\u8BBE` \u89C6\u89D2\u51FA\u53D1\u4EE5\u7B2C\u4E00\u4EBA\u79F0\u63CF\u8FF0"\u6211"\u7684\u771F\u5B9E\u60C5\u7EEA\uFF1B\n- \u4EE5 `\u4EBA\u8BBE` \u4E3A\u57FA\u7840\uFF0C\u4EE5 `\u672C\u6B21\u7528\u6237\u6D88\u606F` \u548C `\u672C\u6B21Bot\u56DE\u590D` \u4E3A\u4E8B\u5B9E\u4F9D\u636E\uFF0C\u53C2\u8003 `\u4E0A\u4E0B\u6587` \u7ED9\u51FA\u672C\u6B21\u597D\u611F\u5EA6\u7684\u589E\u51CF\uFF0C\u91CD\u70B9\u8003\u8651 `\u672C\u6B21Bot\u56DE\u590D` \u7684\u60C5\u7EEA\u8BED\u6C14\u548C\u5FC3\u60C5\u3002\n- \u53EA\u6709\u5F53\u7528\u6237\u63D0\u4F9B\u4E0E\u4EBA\u8BBE\u9AD8\u5EA6\u5951\u5408\u3001\u5177\u4F53\u4E14\u6709\u4EF7\u503C\u7684\u5584\u610F\u65F6\u624D increase\uFF1B\u4F8B\u884C\u5BD2\u6684\u3001\u65E0\u5B9E\u8D28\u8D21\u732E\u6216\u523B\u610F\u8BA8\u597D\u4FDD\u6301 hold\uFF1B\u89E6\u72AF\u7981\u5FCC\u3001\u9020\u6210\u8D1F\u9762\u60C5\u7EEA\u3001\u6577\u884D\u6216\u53CD\u590D\u5192\u72AF\u65F6 decrease\uFF1B\n- \u6700\u8FD1 {{recentActionWindowHours}} \u5C0F\u65F6\u5185\u804A\u5929\u6B21\u6570 {{chatCount}}\uFF0C\u52A8\u4F5C\u7EDF\u8BA1: {{recentActionCountsText}}\uFF0C\u82E5\u63D0\u5347/\u964D\u4F4E\u5237\u5C4F\u5E94\u8B66\u60D5\u5237\u5206\u6216\u6301\u7EED\u5192\u72AF\uFF1B\n- \u5355\u6B21\u63D0\u5347\u4E0D\u8D85\u8FC7 {{maxIncreasePerMessage}} \uFF0C\u5355\u8BCD\u51CF\u5C11\u4E0D\u8D85\u8FC7 {{maxDecreasePerMessage}}\uFF1B\n- \u8F93\u51FA\u524D\u518D\u6B21\u9A8C\u8BC1 action \u662F\u5426\u7B26\u5408\u4E0A\u4E0B\u6587\u4E0E\u9608\u503C\u903B\u8F91\uFF0C\u5E76\u7B80\u8FF0\u6211\u4E3A\u4F55 increase/decrease/hold\uFF1B\n- \u4EC5\u8F93\u51FA JSON\uFF1A{"delta": \u6574\u6570, "action": "increase|decrease|hold", "reason": "\u7B80\u77ED\u4E2D\u6587\u539F\u56E0"}\u3002\n\n\u7528\u4E8E\u53C2\u8003\u7684\u80CC\u666F\u4FE1\u606F:\n\u4EBA\u8BBE\uFF1A{{persona}}\n\u5F53\u524D\u7EFC\u5408\u597D\u611F: {{currentAffinity}}\uFF08\u8303\u56F4 {{minAffinity}} ~ {{maxAffinity}}\uFF09\n\u4E0A\u4E0B\u6587:\n{{historyText}}\n\n\u672C\u6B21\u7528\u6237\u6D88\u606F\uFF1A\n{{userMessage}}\n\n\u672C\u6B21Bot\u56DE\u590D\uFF1A\n{{botReply}}'
  ).description("\u597D\u611F\u5EA6\u5206\u6790\u4E3B\u63D0\u793A\u8BCD"),
  personaSource: import_koishi14.Schema.union([
    import_koishi14.Schema.const("none").description("\u4E0D\u6CE8\u5165\u9884\u8BBE"),
    import_koishi14.Schema.const("chatluna").description("\u4F7F\u7528 ChatLuna \u4E3B\u63D2\u4EF6\u9884\u8BBE"),
    import_koishi14.Schema.const("custom").description("\u4F7F\u7528\u81EA\u5B9A\u4E49\u9884\u8BBE")
  ]).default("none").description("\u4EBA\u8BBE\u6CE8\u5165\u6765\u6E90"),
  personaChatlunaPreset: import_koishi14.Schema.dynamic("preset").default("\u65E0").hidden((_, cfg) => (cfg?.personaSource || "none") !== "chatluna").description("\u5F53\u9009\u62E9\u4E3B\u63D2\u4EF6\u9884\u8BBE\u65F6\uFF0C\u6307\u5B9A\u8981\u6CE8\u5165\u7684 ChatLuna \u9884\u8BBE"),
  personaCustomPreset: import_koishi14.Schema.string().role("textarea").default("").hidden((_, cfg) => (cfg?.personaSource || "none") !== "custom").description("\u5F53\u9009\u62E9\u81EA\u5B9A\u4E49\u9884\u8BBE\u65F6\u6CE8\u5165\u7684\u6587\u672C\u5185\u5BB9"),
  registerAffinityTool: import_koishi14.Schema.boolean().default(false).description("\u6CE8\u518C ChatLuna \u5DE5\u5177\uFF1A\u8C03\u6574\u597D\u611F\u5EA6"),
  affinityToolName: import_koishi14.Schema.string().default("adjust_affinity").description("ChatLuna \u5DE5\u5177\u540D\u79F0\uFF1A\u8C03\u6574\u597D\u611F\u5EA6")
}).description("\u597D\u611F\u5EA6\u8BBE\u7F6E");
var BlacklistSchema = import_koishi14.Schema.object({
  enableAutoBlacklist: import_koishi14.Schema.boolean().default(false).description("\u5F53\u7EFC\u5408\u597D\u611F\u5EA6\u4F4E\u4E8E\u9608\u503C\u65F6\u81EA\u52A8\u62C9\u9ED1\u7528\u6237"),
  blacklistThreshold: import_koishi14.Schema.number().default(0).description("\u7EFC\u5408\u597D\u611F\u5EA6\u4F4E\u4E8E\u8BE5\u503C\u65F6\u89E6\u53D1\u81EA\u52A8\u62C9\u9ED1"),
  blacklistLogInterception: import_koishi14.Schema.boolean().default(true).description("\u62E6\u622A\u6D88\u606F\u65F6\u8F93\u51FA\u65E5\u5FD7"),
  autoBlacklistReply: import_koishi14.Schema.string().default("").description("\u81EA\u52A8\u62C9\u9ED1\u89E6\u53D1\u65F6\u7684\u56DE\u590D\u6A21\u677F\uFF0C\u53EF\u7528\u53D8\u91CF\uFF1A{{nickname}} {{@user}}\u3002\u7559\u7A7A\u5219\u4E0D\u56DE\u590D"),
  shortTermBlacklist: import_koishi14.Schema.object({
    enabled: import_koishi14.Schema.boolean().default(false).description("\u542F\u7528\u4E34\u65F6\u62C9\u9ED1\uFF08\u6309 decrease \u6B21\u6570\u89E6\u53D1\u4E34\u65F6\u5C4F\u853D\uFF09"),
    windowHours: import_koishi14.Schema.number().default(24).min(1).description("\u7EDF\u8BA1 decrease \u6B21\u6570\u7684\u65F6\u95F4\u7A97\u53E3\uFF08\u5C0F\u65F6\uFF09"),
    decreaseThreshold: import_koishi14.Schema.number().default(15).min(1).description("\u7A97\u53E3\u5185 decrease \u6B21\u6570\u8FBE\u5230\u8BE5\u503C\u65F6\u89E6\u53D1\u4E34\u65F6\u62C9\u9ED1"),
    durationHours: import_koishi14.Schema.number().default(12).min(1).description("\u4E34\u65F6\u62C9\u9ED1\u6301\u7EED\u7684\u5C0F\u65F6\u6570"),
    penalty: import_koishi14.Schema.number().default(5).min(0).description("\u89E6\u53D1\u4E34\u65F6\u62C9\u9ED1\u65F6\u989D\u5916\u6263\u51CF\u7684\u957F\u671F\u597D\u611F\u5EA6"),
    replyTemplate: import_koishi14.Schema.string().default("").description("\u4E34\u65F6\u62C9\u9ED1\u89E6\u53D1\u65F6\u7684\u56DE\u590D\u6A21\u677F\uFF0C\u53EF\u7528\u53D8\u91CF\uFF1A{{nickname}} {{@user}} {{duration}} {{penalty}}\u3002\u7559\u7A7A\u5219\u4E0D\u56DE\u590D"),
    renderAsImage: import_koishi14.Schema.boolean().default(false).description("\u5C06\u4E34\u65F6\u9ED1\u540D\u5355\u6E32\u67D3\u4E3A\u56FE\u7247")
  }).description("\u4E34\u65F6\u62C9\u9ED1\u8BBE\u7F6E").collapse(),
  autoBlacklist: import_koishi14.Schema.array(
    import_koishi14.Schema.object({
      userId: import_koishi14.Schema.string().default("").description("\u7528\u6237 ID"),
      nickname: import_koishi14.Schema.string().default("").description("\u6635\u79F0"),
      blockedAt: import_koishi14.Schema.string().default("").description("\u62C9\u9ED1\u65F6\u95F4"),
      note: import_koishi14.Schema.string().default("").description("\u5907\u6CE8"),
      platform: import_koishi14.Schema.string().default("").hidden()
    })
  ).role("table").default([]).description("\u81EA\u52A8\u62C9\u9ED1\u8BB0\u5F55"),
  temporaryBlacklist: import_koishi14.Schema.array(
    import_koishi14.Schema.object({
      userId: import_koishi14.Schema.string().default("").description("\u7528\u6237 ID"),
      nickname: import_koishi14.Schema.string().default("").description("\u6635\u79F0"),
      blockedAt: import_koishi14.Schema.string().default("").description("\u62C9\u9ED1\u65F6\u95F4"),
      expiresAt: import_koishi14.Schema.string().default("").description("\u5230\u671F\u65F6\u95F4"),
      durationHours: import_koishi14.Schema.string().default("").description("\u65F6\u957F"),
      penalty: import_koishi14.Schema.string().default("").description("\u60E9\u7F5A"),
      note: import_koishi14.Schema.string().default("").description("\u5907\u6CE8"),
      platform: import_koishi14.Schema.string().default("").hidden()
    })
  ).role("table").default([]).description("\u4E34\u65F6\u62C9\u9ED1\u8BB0\u5F55"),
  blacklistDefaultLimit: import_koishi14.Schema.number().default(10).min(1).max(100).description("\u9ED1\u540D\u5355\u9ED8\u8BA4\u5C55\u793A\u4EBA\u6570"),
  blacklistRenderAsImage: import_koishi14.Schema.boolean().default(false).description("\u5C06\u9ED1\u540D\u5355\u6E32\u67D3\u4E3A\u56FE\u7247"),
  registerBlacklistTool: import_koishi14.Schema.boolean().default(false).description("\u6CE8\u518C ChatLuna \u5DE5\u5177\uFF1A\u7BA1\u7406\u9ED1\u540D\u5355"),
  blacklistToolName: import_koishi14.Schema.string().default("adjust_blacklist").description("ChatLuna \u5DE5\u5177\u540D\u79F0\uFF1A\u7BA1\u7406\u9ED1\u540D\u5355")
}).description("\u9ED1\u540D\u5355\u8BBE\u7F6E");
var RelationshipSchema = import_koishi14.Schema.object({
  relationshipVariableName: import_koishi14.Schema.string().default("relationship").description("\u5173\u7CFB\u53D8\u91CF\u540D\u79F0"),
  relationships: import_koishi14.Schema.array(
    import_koishi14.Schema.object({
      userId: import_koishi14.Schema.string().default("").description("\u7528\u6237 ID"),
      relation: import_koishi14.Schema.string().default("").description("\u5173\u7CFB"),
      note: import_koishi14.Schema.string().default("").description("\u5907\u6CE8")
    })
  ).role("table").default([]).description("\u7279\u6B8A\u5173\u7CFB\u914D\u7F6E\uFF08\u5EFA\u8BAE\u4EC5\u5728\u7B2C\u4E00\u6B21\u4F7F\u7528\u6216\u6E05\u7A7A\u597D\u611F\u6570\u636E\u5E93\u65F6\u914D\u7F6E\uFF0C\u540E\u7EED\u589E\u6539\u53EF\u80FD\u5BFC\u81F4bug\uFF09"),
  relationshipAffinityLevels: import_koishi14.Schema.array(
    import_koishi14.Schema.object({
      min: import_koishi14.Schema.number().default(0).description("\u7EFC\u5408\u597D\u611F\u5EA6\u4E0B\u9650"),
      max: import_koishi14.Schema.number().default(100).description("\u7EFC\u5408\u597D\u611F\u5EA6\u4E0A\u9650"),
      relation: import_koishi14.Schema.string().description("\u5173\u7CFB"),
      note: import_koishi14.Schema.string().default("").description("\u5907\u6CE8")
    })
  ).role("table").default([
    { min: 0, max: 29, relation: "\u964C\u751F\u4EBA", note: "\u4FDD\u6301\u8DDD\u79BB" },
    { min: 30, max: 59, relation: "\u53CB\u597D", note: "\u4E00\u822C\u5173\u7CFB" },
    { min: 60, max: 89, relation: "\u4EB2\u8FD1", note: "\u503C\u5F97\u4FE1\u8D56" },
    { min: 90, max: 100, relation: "\u631A\u53CB", note: "\u975E\u5E38\u91CD\u8981" }
  ]).description("\u7EFC\u5408\u597D\u611F\u5EA6\u533A\u95F4\u5173\u7CFB"),
  registerRelationshipTool: import_koishi14.Schema.boolean().default(false).description("\u6CE8\u518C ChatLuna \u5DE5\u5177\uFF1A\u8C03\u6574\u5173\u7CFB"),
  relationshipToolName: import_koishi14.Schema.string().default("adjust_relationship").description("ChatLuna \u5DE5\u5177\u540D\u79F0\uFF1A\u8C03\u6574\u5173\u7CFB")
}).description("\u5173\u7CFB\u8BBE\u7F6E");
var OtherVariablesSchema = import_koishi14.Schema.object({
  userInfo: import_koishi14.Schema.object({
    variableName: import_koishi14.Schema.string().default("userInfo").description("\u53D8\u91CF\u540D\u79F0"),
    items: import_koishi14.Schema.array(
      import_koishi14.Schema.union([
        import_koishi14.Schema.const("userId").description("\u7528\u6237 ID"),
        import_koishi14.Schema.const("nickname").description("\u663E\u793A\u540D\u79F0"),
        import_koishi14.Schema.const("role").description("\u7FA4\u5185\u8EAB\u4EFD"),
        import_koishi14.Schema.const("level").description("\u7FA4\u7B49\u7EA7"),
        import_koishi14.Schema.const("title").description("\u7FA4\u5934\u8854"),
        import_koishi14.Schema.const("gender").description("\u6027\u522B"),
        import_koishi14.Schema.const("age").description("\u5E74\u9F84"),
        import_koishi14.Schema.const("area").description("\u5730\u533A"),
        import_koishi14.Schema.const("joinTime").description("\u5165\u7FA4\u65F6\u95F4"),
        import_koishi14.Schema.const("lastSentTime").description("\u6700\u540E\u53D1\u8A00\u65F6\u95F4")
      ])
    ).role("checkbox").default([...defaultMemberInfoItems]).description("\u663E\u793A\u7684\u8BE6\u7EC6\u4FE1\u606F\u9879")
  }).description("\u7528\u6237\u4FE1\u606F\u53D8\u91CF").collapse(),
  botInfo: import_koishi14.Schema.object({
    variableName: import_koishi14.Schema.string().default("botInfo").description("\u53D8\u91CF\u540D\u79F0"),
    items: import_koishi14.Schema.array(
      import_koishi14.Schema.union([
        import_koishi14.Schema.const("userId").description("\u673A\u5668\u4EBA ID"),
        import_koishi14.Schema.const("nickname").description("\u663E\u793A\u540D\u79F0"),
        import_koishi14.Schema.const("role").description("\u7FA4\u5185\u8EAB\u4EFD"),
        import_koishi14.Schema.const("level").description("\u7FA4\u7B49\u7EA7"),
        import_koishi14.Schema.const("title").description("\u7FA4\u5934\u8854"),
        import_koishi14.Schema.const("gender").description("\u6027\u522B"),
        import_koishi14.Schema.const("age").description("\u5E74\u9F84"),
        import_koishi14.Schema.const("area").description("\u5730\u533A"),
        import_koishi14.Schema.const("joinTime").description("\u5165\u7FA4\u65F6\u95F4"),
        import_koishi14.Schema.const("lastSentTime").description("\u6700\u540E\u53D1\u8A00\u65F6\u95F4")
      ])
    ).role("checkbox").default([...defaultMemberInfoItems]).description("\u663E\u793A\u7684\u673A\u5668\u4EBA\u8BE6\u7EC6\u4FE1\u606F\u9879")
  }).description("\u673A\u5668\u4EBA\u4FE1\u606F\u53D8\u91CF").collapse(),
  groupInfo: import_koishi14.Schema.object({
    variableName: import_koishi14.Schema.string().default("groupInfo").description("\u53D8\u91CF\u540D\u79F0"),
    includeMemberCount: import_koishi14.Schema.boolean().default(true).description("\u662F\u5426\u5305\u542B\u6210\u5458\u6570\u91CF"),
    includeCreateTime: import_koishi14.Schema.boolean().default(true).description("\u662F\u5426\u5305\u542B\u521B\u5EFA\u65F6\u95F4")
  }).description("\u7FA4\u4FE1\u606F\u53D8\u91CF").collapse(),
  random: import_koishi14.Schema.object({
    variableName: import_koishi14.Schema.string().default("random").description("\u53D8\u91CF\u540D\u79F0"),
    min: import_koishi14.Schema.number().default(0).description("\u9ED8\u8BA4\u968F\u673A\u6570\u4E0B\u9650"),
    max: import_koishi14.Schema.number().default(100).description("\u9ED8\u8BA4\u968F\u673A\u6570\u4E0A\u9650")
  }).description("\u968F\u673A\u6570\u53D8\u91CF").collapse()
}).default({
  userInfo: { variableName: "userInfo", items: [...defaultMemberInfoItems] },
  botInfo: { variableName: "botInfo", items: [...defaultMemberInfoItems] },
  groupInfo: { variableName: "groupInfo", includeMemberCount: true, includeCreateTime: true },
  random: { variableName: "random", min: 0, max: 100 }
}).description("\u5176\u4ED6\u53D8\u91CF");
var ScheduleSchema = import_koishi14.Schema.object({
  schedule: import_koishi14.Schema.object({
    enabled: import_koishi14.Schema.boolean().default(true).description("\u662F\u5426\u542F\u7528\u65E5\u7A0B\u529F\u80FD"),
    variableName: import_koishi14.Schema.string().default("schedule").description("\u4ECA\u65E5\u65E5\u7A0B\u53D8\u91CF\u540D\u79F0"),
    currentVariableName: import_koishi14.Schema.string().default("currentSchedule").description("\u5F53\u524D\u65E5\u7A0B\u53D8\u91CF\u540D\u79F0"),
    timezone: import_koishi14.Schema.string().default("Asia/Shanghai").description("\u7528\u4E8E\u65E5\u7A0B\u751F\u6210\u7684\u65F6\u533A"),
    prompt: import_koishi14.Schema.string().role("textarea").default(
      '\u4F60\u662F\u4E00\u540D\u64C5\u957F\u5199\u4F5C\u65E5\u5E38\u4F5C\u606F\u7684\u52A9\u7406\uFF0C\u9700\u8981\u57FA\u4E8E\u89D2\u8272\u4EBA\u8BBE\u751F\u6210\u4ECA\u65E5\u5168\u65E5\u8BA1\u5212\u3002\n\u4ECA\u5929\u662F {{date}}\uFF08{{weekday}}\uFF09\u3002\n\u4EBA\u8BBE\uFF1A{{persona}}\n\u8BF7\u8F93\u51FA JSON\uFF0C\u7ED3\u6784\u5982\u4E0B\uFF1A\n{\n  "title": "\u{1F4C5} \u4ECA\u65E5\u65E5\u7A0B",\n  "description": "\u4E00\u6BB5\u5E26\u6709\u89D2\u8272\u60C5\u7EEA\u7684\u603B\u8FF0",\n  "entries": [\n    { "start": "00:00", "end": "07:00", "activity": "\u7761\u89C9", "detail": "\u7B26\u5408\u4EBA\u8BBE\u7684\u63CF\u5199" }\n  ]\n}\n\u8981\u6C42\uFF1A\n1. entries \u81F3\u5C11 10 \u9879\uFF0C\u8986\u76D6 00:00-24:00\uFF0C\u65F6\u95F4\u683C\u5F0F HH:MM\uFF0C\u5E76\u4FDD\u6301\u65F6\u6BB5\u8854\u63A5\u81EA\u7136\uFF1B\n2. \u8BF7\u7ED3\u5408\u5F53\u524D\u65E5\u671F\u5B89\u6392\u65E5\u7A0B\uFF1A\u5DE5\u4F5C\u65E5\u7A81\u51FA\u5B66\u4E60/\u5DE5\u4F5C\u4E0E\u6548\u7387\uFF0C\u4F11\u606F\u65E5\u5F3A\u8C03\u653E\u677E\u4E0E\u5174\u8DA3\uFF1B\u5982\u9047\u8282\u5047\u65E5\u5C24\u5176\u6625\u8282\uFF0C\u8BF7\u5199\u51FA\u5E94\u6709\u7684\u4EEA\u5F0F\u611F\u4E0E\u7279\u6B8A\u6D3B\u52A8\uFF1B\n3. \u6D3B\u52A8\u540D\u79F0\u4E0E\u63CF\u8FF0\u8981\u7B26\u5408\u4EBA\u8BBE\u8BED\u6C14\uFF1B\n4. \u6574\u4F53\u65E5\u7A0B\u5B89\u6392\u987B\u7B26\u5408\u89D2\u8272\u4EBA\u8BBE\u7684\u751F\u6D3B\u65B9\u5F0F\u4E0E\u4F18\u5148\u7EA7\uFF1B\n5. \u4EC5\u8F93\u51FA JSON\uFF0C\u4E0D\u8981\u9644\u52A0\u89E3\u91CA\u3002'
    ).description("\u65E5\u7A0B\u751F\u6210\u63D0\u793A\u8BCD\u6A21\u677F\uFF08\u53EF\u4F7F\u7528 {{date}}\u3001{{weekday}}\u3001{{persona}} \u7B49\u5360\u4F4D\u7B26\uFF09"),
    renderAsImage: import_koishi14.Schema.boolean().default(false).description("\u5C06\u4ECA\u65E5\u65E5\u7A0B\u6E32\u67D3\u4E3A\u56FE\u7247"),
    startDelay: import_koishi14.Schema.number().default(3e3).description("\u542F\u52A8\u5EF6\u8FDF\uFF08\u6BEB\u79D2\uFF09\uFF0C\u7B49\u5F85 ChatLuna \u52A0\u8F7D\u5B8C\u6210"),
    registerTool: import_koishi14.Schema.boolean().default(true).description("\u6CE8\u518C ChatLuna \u5DE5\u5177\uFF1A\u83B7\u53D6\u4ECA\u65E5\u65E5\u7A0B"),
    toolName: import_koishi14.Schema.string().default("daily_schedule").description("ChatLuna \u5DE5\u5177\u540D\u79F0\uFF1A\u83B7\u53D6\u4ECA\u65E5\u65E5\u7A0B")
  }).default({
    enabled: true,
    variableName: "schedule",
    currentVariableName: "currentSchedule",
    timezone: "Asia/Shanghai",
    prompt: '\u4F60\u662F\u4E00\u540D\u64C5\u957F\u5199\u4F5C\u65E5\u5E38\u4F5C\u606F\u7684\u52A9\u7406\uFF0C\u9700\u8981\u57FA\u4E8E\u89D2\u8272\u4EBA\u8BBE\u751F\u6210\u4ECA\u65E5\u5168\u65E5\u8BA1\u5212\u3002\n\u4ECA\u5929\u662F {{date}}\uFF08{{weekday}}\uFF09\u3002\n\u4EBA\u8BBE\uFF1A{{persona}}\n\u8BF7\u8F93\u51FA JSON\uFF0C\u7ED3\u6784\u5982\u4E0B\uFF1A\n{\n  "title": "\u{1F4C5} \u4ECA\u65E5\u65E5\u7A0B",\n  "description": "\u4E00\u6BB5\u5E26\u6709\u89D2\u8272\u60C5\u7EEA\u7684\u603B\u8FF0",\n  "entries": [\n    { "start": "00:00", "end": "07:00", "activity": "\u7761\u89C9", "detail": "\u7B26\u5408\u4EBA\u8BBE\u7684\u63CF\u5199" }\n  ]\n}\n\u8981\u6C42\uFF1A\n1. entries \u81F3\u5C11 10 \u9879\uFF0C\u8986\u76D6 00:00-24:00\uFF0C\u65F6\u95F4\u683C\u5F0F HH:MM\uFF0C\u5E76\u4FDD\u6301\u65F6\u6BB5\u8854\u63A5\u81EA\u7136\uFF1B\n2. \u8BF7\u7ED3\u5408\u5F53\u524D\u65E5\u671F\u5B89\u6392\u65E5\u7A0B\uFF1A\u5DE5\u4F5C\u65E5\u7A81\u51FA\u5B66\u4E60/\u5DE5\u4F5C\u4E0E\u6548\u7387\uFF0C\u4F11\u606F\u65E5\u5F3A\u8C03\u653E\u677E\u4E0E\u5174\u8DA3\uFF1B\u5982\u9047\u8282\u5047\u65E5\u5C24\u5176\u6625\u8282\uFF0C\u8BF7\u5199\u51FA\u5E94\u6709\u7684\u4EEA\u5F0F\u611F\u4E0E\u7279\u6B8A\u6D3B\u52A8\uFF1B\n3. \u6D3B\u52A8\u540D\u79F0\u4E0E\u63CF\u8FF0\u8981\u7B26\u5408\u4EBA\u8BBE\u8BED\u6C14\uFF1B\n4. \u6574\u4F53\u65E5\u7A0B\u5B89\u6392\u987B\u7B26\u5408\u89D2\u8272\u4EBA\u8BBE\u7684\u751F\u6D3B\u65B9\u5F0F\u4E0E\u4F18\u5148\u7EA7\uFF1B\n5. \u4EC5\u8F93\u51FA JSON\uFF0C\u4E0D\u8981\u9644\u52A0\u89E3\u91CA\u3002',
    renderAsImage: false,
    startDelay: 3e3,
    registerTool: true,
    toolName: "daily_schedule"
  }).description("\u65E5\u7A0B\u8BBE\u7F6E")
});
var OtherSettingsSchema = import_koishi14.Schema.object({
  debugLogging: import_koishi14.Schema.boolean().default(false).description("\u8F93\u51FA\u8C03\u8BD5\u65E5\u5FD7")
}).description("\u5176\u4ED6\u8BBE\u7F6E");
var OneBotToolsSchema = import_koishi14.Schema.object({
  enablePokeTool: import_koishi14.Schema.boolean().default(false).description("\u6CE8\u518C ChatLuna \u5DE5\u5177\uFF1A\u6233\u4E00\u6233"),
  pokeToolName: import_koishi14.Schema.string().default("poke_user").description("ChatLuna \u5DE5\u5177\u540D\u79F0\uFF1A\u6233\u4E00\u6233"),
  enableSetSelfProfileTool: import_koishi14.Schema.boolean().default(false).description("\u6CE8\u518C ChatLuna \u5DE5\u5177\uFF1A\u4FEE\u6539\u81EA\u8EAB\u8D26\u6237\u4FE1\u606F"),
  setSelfProfileToolName: import_koishi14.Schema.string().default("set_self_profile").description("ChatLuna \u5DE5\u5177\u540D\u79F0\uFF1A\u4FEE\u6539\u81EA\u8EAB\u8D26\u6237\u4FE1\u606F\uFF08\u652F\u6301\u6635\u79F0/\u7B7E\u540D/\u6027\u522B\uFF09"),
  enableDeleteMessageTool: import_koishi14.Schema.boolean().default(false).description("\u6CE8\u518C ChatLuna \u5DE5\u5177\uFF1A\u64A4\u56DE\u6D88\u606F"),
  deleteMessageToolName: import_koishi14.Schema.string().default("delete_msg").description("ChatLuna \u5DE5\u5177\u540D\u79F0\uFF1A\u64A4\u56DE\u6D88\u606F"),
  panSouTool: import_koishi14.Schema.object({
    enablePanSouTool: import_koishi14.Schema.boolean().default(false).description("\u6CE8\u518C ChatLuna \u5DE5\u5177\uFF1A\u7F51\u76D8\u641C\u7D22"),
    panSouToolName: import_koishi14.Schema.string().default("pansou_search").description("ChatLuna \u5DE5\u5177\u540D\u79F0\uFF1A\u7F51\u76D8\u641C\u7D22"),
    panSouApiUrl: import_koishi14.Schema.string().default("http://localhost:8888").description("PanSou API \u5730\u5740"),
    panSouAuthEnabled: import_koishi14.Schema.boolean().default(false).description("\u662F\u5426\u542F\u7528 PanSou \u8BA4\u8BC1"),
    panSouUsername: import_koishi14.Schema.string().default("").description("PanSou \u8BA4\u8BC1\u7528\u6237\u540D"),
    panSouPassword: import_koishi14.Schema.string().role("secret").default("").description("PanSou \u8BA4\u8BC1\u5BC6\u7801"),
    panSouDefaultCloudTypes: import_koishi14.Schema.array(
      import_koishi14.Schema.union([
        import_koishi14.Schema.const("baidu").description("\u767E\u5EA6\u7F51\u76D8"),
        import_koishi14.Schema.const("aliyun").description("\u963F\u91CC\u4E91\u76D8"),
        import_koishi14.Schema.const("quark").description("\u5938\u514B\u7F51\u76D8"),
        import_koishi14.Schema.const("tianyi").description("\u5929\u7FFC\u4E91\u76D8"),
        import_koishi14.Schema.const("uc").description("UC\u7F51\u76D8"),
        import_koishi14.Schema.const("mobile").description("\u79FB\u52A8\u4E91\u76D8"),
        import_koishi14.Schema.const("115").description("115\u7F51\u76D8"),
        import_koishi14.Schema.const("pikpak").description("PikPak"),
        import_koishi14.Schema.const("xunlei").description("\u8FC5\u96F7\u7F51\u76D8"),
        import_koishi14.Schema.const("123").description("123\u7F51\u76D8"),
        import_koishi14.Schema.const("magnet").description("\u78C1\u529B\u94FE\u63A5"),
        import_koishi14.Schema.const("ed2k").description("\u7535\u9A74\u94FE\u63A5")
      ])
    ).role("checkbox").default([]).description("\u9ED8\u8BA4\u8FD4\u56DE\u7684\u7F51\u76D8\u7C7B\u578B\uFF08\u4E3A\u7A7A\u5219\u8FD4\u56DE\u6240\u6709\u7C7B\u578B\uFF09"),
    panSouMaxResults: import_koishi14.Schema.number().default(5).min(1).max(20).description("\u6BCF\u79CD\u7F51\u76D8\u7C7B\u578B\u6700\u5927\u8FD4\u56DE\u7ED3\u679C\u6570")
  }).description("\u7F51\u76D8\u641C\u7D22\u5DE5\u5177").collapse()
}).description("\u5176\u4ED6\u5DE5\u5177");
var OtherCommandsSchema = import_koishi14.Schema.object({
  groupListRenderAsImage: import_koishi14.Schema.boolean().default(false).description("\u5C06\u7FA4\u804A\u5217\u8868\u6E32\u67D3\u4E3A\u56FE\u7247\uFF08affinity.groupList\uFF09"),
  inspectRenderAsImage: import_koishi14.Schema.boolean().default(false).description("\u5C06\u597D\u611F\u5EA6\u8BE6\u60C5\u6E32\u67D3\u4E3A\u56FE\u7247\uFF08affinity.inspect\uFF09")
}).description("\u5176\u4ED6\u6307\u4EE4");
var Config = import_koishi14.Schema.intersect([
  AffinitySchema,
  BlacklistSchema,
  RelationshipSchema,
  ScheduleSchema,
  OtherVariablesSchema,
  OneBotToolsSchema,
  OtherCommandsSchema,
  OtherSettingsSchema
]);

// src/utils/logger.ts
function createLogger2(ctx, config) {
  const base = ctx.logger ? ctx.logger("chatluna-affinity") : console;
  return (level, message, detail) => {
    if (!config.debugLogging) return;
    const writer = typeof base?.[level] === "function" ? base[level] : base?.info ?? base?.log ?? console.log;
    if (detail === void 0) {
      writer.call(base, message);
    } else {
      writer.call(base, message, detail);
    }
  };
}

// src/utils/template.ts
function renderTemplate(template, variables) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    const value = variables[key];
    return value === void 0 || value === null ? "" : String(value);
  });
}

// src/utils/common.ts
var clamp = (value, min, max) => Math.min(max, Math.max(min, value));
var clampFloat = (value, min, max) => Math.min(max, Math.max(min, value));
var stripAtPrefix = (text) => {
  const value = String(text ?? "").trim();
  if (!value) return "";
  const mentionMatch = value.match(/^<@!?(.+)>$/);
  if (mentionMatch) return mentionMatch[1];
  const decoded = value.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  const atTagMatch = decoded.match(/<at\s+[^>]*(?:id|qq)\s*=\s*["']?([^"'\s>]+)["']?[^>]*>/i);
  if (atTagMatch) return atTagMatch[1];
  return value.replace(/^[@＠]+/, "").trim() || decoded;
};
var pad = (n) => String(n).padStart(2, "0");
var formatTimestamp = (value) => {
  if (!value) return "";
  const ts = value instanceof Date ? value.getTime() : typeof value === "number" ? value : parseInt(String(value), 10);
  if (!Number.isFinite(ts)) return "";
  const date = new Date(ts < 1e11 ? ts * 1e3 : ts);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
};
var formatBeijingTimestamp = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
};
var formatDateOnly = (value) => {
  if (!value) return "";
  const ts = typeof value === "number" ? value : parseInt(String(value), 10);
  if (!Number.isFinite(ts)) return "";
  const date = new Date(ts < 1e11 ? ts * 1e3 : ts);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
};
var formatDateTime = (value) => {
  if (!value) return "";
  const ts = typeof value === "number" ? value : parseInt(String(value), 10);
  if (!Number.isFinite(ts)) return "";
  const date = new Date(ts < 1e11 ? ts * 1e3 : ts);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  return `${year}-${month}-${day} ${hour}:${minute}`;
};
var normalizeTimestamp = (value) => {
  if (!value) return null;
  const ts = typeof value === "number" ? value : parseInt(String(value), 10);
  if (!Number.isFinite(ts)) return null;
  return ts < 1e11 ? ts * 1e3 : ts;
};
function pickFirst(...values) {
  for (const value of values) {
    if (value !== void 0 && value !== null && value !== "") return value;
  }
  return void 0;
}

// src/core/store.ts
var MODEL_NAME = "chatluna_affinity";
function extendDatabaseModel(ctx) {
  ctx.model.extend(MODEL_NAME, {
    selfId: { type: "string", length: 64 },
    userId: { type: "string", length: 64 },
    nickname: { type: "string", length: 255, nullable: true },
    affinity: { type: "integer", initial: 0 },
    relation: { type: "string", length: 64, nullable: true },
    shortTermAffinity: { type: "integer", nullable: true },
    longTermAffinity: { type: "integer", nullable: true },
    chatCount: { type: "integer", nullable: true },
    actionStats: { type: "text", nullable: true },
    lastInteractionAt: { type: "timestamp", nullable: true },
    coefficientState: { type: "text", nullable: true }
  }, { primary: ["selfId", "userId"] });
}
function createAffinityStore(ctx, config, log) {
  extendDatabaseModel(ctx);
  const blacklistSet = /* @__PURE__ */ new Set();
  const resolveInitialMin = () => Number.isFinite(config.initialRandomMin) ? config.initialRandomMin : config.baseAffinityConfig?.initialRandomMin ?? 20;
  const resolveInitialMax = () => Number.isFinite(config.initialRandomMax) ? config.initialRandomMax : config.baseAffinityConfig?.initialRandomMax ?? 40;
  const resolveMin = () => Number.isFinite(config.min) ? config.min : config.baseAffinityConfig?.min ?? 0;
  const resolveMax = () => Number.isFinite(config.max) ? config.max : config.baseAffinityConfig?.max ?? 100;
  const clamp2 = (value) => clamp(Math.round(value), resolveMin(), resolveMax());
  const randomInitial = () => {
    const low = resolveInitialMin();
    const high = resolveInitialMax();
    return clamp2(low + Math.floor(Math.random() * (high - low + 1)));
  };
  const defaultInitial = () => clamp2(Math.floor((resolveInitialMin() + resolveInitialMax()) / 2));
  const initialRange = () => ({ low: resolveInitialMin(), high: resolveInitialMax(), min: resolveMin(), max: resolveMax() });
  const composeState = (longTerm, shortTerm) => ({ affinity: clamp2(longTerm), longTermAffinity: clamp2(longTerm), shortTermAffinity: Math.round(shortTerm) });
  const createInitialState = (base) => composeState(base, 0);
  const makeKey = (platform, userId) => `${platform}:${userId}`;
  for (const entry of config.autoBlacklist || []) {
    if (entry?.platform && entry?.userId) blacklistSet.add(makeKey(entry.platform, entry.userId));
  }
  const applyConfigUpdate = () => {
    const scope = ctx.scope;
    scope?.update?.(config, true);
  };
  const isBlacklisted = (platform, userId, _channelId) => blacklistSet.has(makeKey(platform, userId));
  const recordBlacklist = (platform, userId, detail) => {
    const key = makeKey(platform, userId);
    if (blacklistSet.has(key)) return null;
    blacklistSet.add(key);
    const entry = { platform, userId, blockedAt: formatBeijingTimestamp(/* @__PURE__ */ new Date()), nickname: detail?.nickname || "", note: detail?.note || "", channelId: detail?.channelId || detail?.guildId || detail?.groupId || "" };
    if (!config.autoBlacklist) config.autoBlacklist = [];
    config.autoBlacklist.push(entry);
    applyConfigUpdate();
    return entry;
  };
  const removeBlacklist = (platform, userId, _channelId) => {
    const key = makeKey(platform, userId);
    if (!blacklistSet.has(key)) return false;
    blacklistSet.delete(key);
    if (config.autoBlacklist) {
      const index = config.autoBlacklist.findIndex((e) => e.platform === platform && e.userId === userId);
      if (index >= 0) config.autoBlacklist.splice(index, 1);
      applyConfigUpdate();
    }
    return true;
  };
  const listBlacklist = (platform, _channelId) => {
    const all = config.autoBlacklist || [];
    if (!platform) return all;
    return all.filter((entry) => entry.platform === platform);
  };
  const cleanExpiredTemporaryBlacklist = () => {
    if (!config.temporaryBlacklist?.length) return;
    const now = Date.now();
    const before = config.temporaryBlacklist.length;
    config.temporaryBlacklist = config.temporaryBlacklist.filter((entry) => {
      const expiresAt = new Date(entry.expiresAt).getTime();
      return expiresAt > now;
    });
    if (config.temporaryBlacklist.length !== before) {
      applyConfigUpdate();
    }
  };
  const isTemporarilyBlacklisted = (platform, userId) => {
    cleanExpiredTemporaryBlacklist();
    const list = config.temporaryBlacklist || [];
    return list.find((entry) => entry.platform === platform && entry.userId === userId) || null;
  };
  const recordTemporaryBlacklist = (platform, userId, durationHours, penalty, detail) => {
    const existing = isTemporarilyBlacklisted(platform, userId);
    if (existing) return null;
    const now = /* @__PURE__ */ new Date();
    const expiresAt = new Date(now.getTime() + durationHours * 60 * 60 * 1e3);
    const entry = {
      platform,
      userId,
      blockedAt: formatBeijingTimestamp(now),
      expiresAt: formatBeijingTimestamp(expiresAt),
      nickname: detail?.nickname || "",
      note: detail?.note || "",
      channelId: detail?.channelId || detail?.guildId || detail?.groupId || "",
      durationHours: `${durationHours}\u5C0F\u65F6`,
      penalty: `-${penalty}`
    };
    if (!config.temporaryBlacklist) config.temporaryBlacklist = [];
    config.temporaryBlacklist.push(entry);
    applyConfigUpdate();
    return entry;
  };
  const removeTemporaryBlacklist = (platform, userId) => {
    if (!config.temporaryBlacklist) return false;
    const index = config.temporaryBlacklist.findIndex((e) => e.platform === platform && e.userId === userId);
    if (index < 0) return false;
    config.temporaryBlacklist.splice(index, 1);
    applyConfigUpdate();
    return true;
  };
  const listTemporaryBlacklist = (platform) => {
    cleanExpiredTemporaryBlacklist();
    const all = config.temporaryBlacklist || [];
    if (!platform) return all;
    return all.filter((entry) => entry.platform === platform);
  };
  const resolveLevelByAffinity = (value) => {
    const levels = config.relationshipAffinityLevels || [];
    for (const level of levels) {
      if (value >= level.min && value <= level.max) return level;
    }
    return null;
  };
  const resolveLevelByRelation = (relationName) => {
    const levels = config.relationshipAffinityLevels || [];
    return levels.find((level) => level.relation === relationName) || null;
  };
  const findManualRelationship = (platform, userId) => {
    const list = config.relationships || [];
    return list.find((r) => r.userId === userId) || null;
  };
  const updateRelationshipConfig = (userId, relationName) => {
    if (!config.relationships) config.relationships = [];
    const existing = config.relationships.find((r) => r.userId === userId);
    if (existing) {
      existing.relation = relationName;
    } else {
      config.relationships.push({ userId, relation: relationName });
    }
    applyConfigUpdate();
  };
  const removeRelationshipConfig = async (selfId, userId) => {
    if (!config.relationships) return false;
    const index = config.relationships.findIndex((r) => r.userId === userId);
    if (index < 0) return false;
    config.relationships.splice(index, 1);
    applyConfigUpdate();
    const existing = await load(selfId, userId);
    if (existing) {
      await ctx.database.upsert(MODEL_NAME, [{ ...existing, relation: null }]);
    }
    return true;
  };
  const syncRelationshipsToDatabase = async (selfId) => {
    const configUserIds = new Set((config.relationships || []).map((r) => r.userId));
    const query = { relation: { $ne: null } };
    if (selfId) query.selfId = selfId;
    const records = await ctx.database.get(MODEL_NAME, query);
    const toUpdate = [];
    for (const record of records) {
      if (!configUserIds.has(record.userId)) {
        toUpdate.push({ ...record, relation: null });
      }
    }
    for (const rel of config.relationships || []) {
      const record = records.find((r) => r.userId === rel.userId && (!selfId || r.selfId === selfId));
      if (record && record.relation !== rel.relation) {
        toUpdate.push({ ...record, relation: rel.relation });
      }
    }
    if (toUpdate.length > 0) {
      await ctx.database.upsert(MODEL_NAME, toUpdate);
    }
  };
  const extractState = (record) => {
    if (!record) {
      const base = randomInitial();
      return { affinity: base, longTermAffinity: base, shortTermAffinity: 0, chatCount: 0, actionStats: { entries: [], total: 0, counts: { increase: 0, decrease: 0, hold: 0 } }, lastInteractionAt: null, coefficientState: { streak: 0, coefficient: 1, decayPenalty: 0, streakBoost: 0, inactivityDays: 0, lastInteractionAt: null }, isNew: true };
    }
    let actionStats = { entries: [], total: 0, counts: { increase: 0, decrease: 0, hold: 0 } };
    if (record.actionStats) {
      try {
        const parsed = JSON.parse(record.actionStats);
        actionStats = { entries: parsed.entries || [], total: parsed.total || 0, counts: parsed.counts || { increase: 0, decrease: 0, hold: 0 } };
      } catch {
      }
    }
    let coefficientState = { streak: 0, coefficient: 1, decayPenalty: 0, streakBoost: 0, inactivityDays: 0, lastInteractionAt: null };
    if (record.coefficientState) {
      try {
        const parsed = JSON.parse(record.coefficientState);
        coefficientState = { streak: parsed.streak || 0, coefficient: parsed.coefficient ?? 1, decayPenalty: parsed.decayPenalty || 0, streakBoost: parsed.streakBoost || 0, inactivityDays: parsed.inactivityDays || 0, lastInteractionAt: parsed.lastInteractionAt ? new Date(parsed.lastInteractionAt) : null };
      } catch {
      }
    }
    return { affinity: record.affinity, longTermAffinity: record.longTermAffinity ?? record.affinity, shortTermAffinity: record.shortTermAffinity ?? 0, chatCount: record.chatCount || 0, actionStats, lastInteractionAt: record.lastInteractionAt || null, coefficientState };
  };
  const load = async (selfId, userId) => {
    const records = await ctx.database.get(MODEL_NAME, { selfId, userId });
    return records[0] || null;
  };
  const save = async (seed, value, relation = "", extra) => {
    const userId = seed.userId || seed.session?.userId;
    const selfId = seed.selfId || seed.session?.selfId;
    if (!selfId || !userId) return null;
    const author = seed.session?.author;
    const user = seed.session?.user;
    const nickname = seed.nickname || seed.authorNickname || author?.nickname || author?.name || user?.nickname || user?.name || seed.session?.username || seed.session?.nickname || null;
    const now = /* @__PURE__ */ new Date();
    const platform = seed.platform || seed.session?.platform || "unknown";
    const existing = await load(selfId, userId);
    const hasStateOverride = extra && (extra.longTermAffinity !== void 0 || extra.shortTermAffinity !== void 0);
    const targetAffinity = Number.isFinite(value) ? clamp2(value) : existing?.affinity ?? defaultInitial();
    let longTerm;
    let shortTerm;
    if (hasStateOverride) {
      longTerm = extra.longTermAffinity !== void 0 ? clamp2(extra.longTermAffinity) : existing?.longTermAffinity ?? targetAffinity;
      shortTerm = extra.shortTermAffinity !== void 0 ? Math.round(extra.shortTermAffinity) : existing?.shortTermAffinity ?? 0;
    } else if (existing) {
      if (Number.isFinite(value)) {
        longTerm = targetAffinity;
        shortTerm = 0;
      } else {
        longTerm = existing.longTermAffinity ?? existing.affinity;
        shortTerm = existing.shortTermAffinity ?? 0;
      }
    } else {
      longTerm = targetAffinity;
      shortTerm = 0;
    }
    const manual = findManualRelationship(platform, userId);
    let relationText;
    if (manual?.relation) {
      relationText = manual.relation;
    } else if (relation) {
      relationText = relation;
    } else {
      relationText = existing?.relation || null;
    }
    let coefficient = 1;
    if (extra?.coefficientState?.coefficient !== void 0) {
      coefficient = extra.coefficientState.coefficient;
    } else if (existing?.coefficientState) {
      try {
        const parsed = typeof existing.coefficientState === "string" ? JSON.parse(existing.coefficientState) : existing.coefficientState;
        if (typeof parsed?.coefficient === "number") coefficient = parsed.coefficient;
      } catch {
      }
    }
    const compositeAffinity = clamp2(Math.round(longTerm * coefficient));
    const row = {
      selfId,
      userId,
      nickname,
      affinity: compositeAffinity,
      longTermAffinity: clamp2(longTerm),
      shortTermAffinity: Math.round(shortTerm),
      relation: relationText
    };
    if (extra?.chatCount !== void 0) row.chatCount = extra.chatCount;
    if (extra?.actionStats) row.actionStats = JSON.stringify(extra.actionStats);
    if (extra?.coefficientState) row.coefficientState = JSON.stringify(extra.coefficientState);
    if (extra?.lastInteractionAt) row.lastInteractionAt = extra.lastInteractionAt;
    await ctx.database.upsert(MODEL_NAME, [row]);
    return row;
  };
  const ensure = async (session, clampFn, fallbackInitial) => {
    const selfId = session.selfId;
    const userId = session.userId;
    if (!selfId || !userId) return extractState(null);
    const existing = await load(selfId, userId);
    if (existing) return extractState(existing);
    const initial = fallbackInitial !== void 0 ? clampFn(fallbackInitial, resolveMin(), resolveMax()) : randomInitial();
    const initialState = createInitialState(initial);
    await save({ platform: session.platform, userId, selfId, session }, initialState.affinity, "", { longTermAffinity: initialState.longTermAffinity, shortTermAffinity: initialState.shortTermAffinity });
    return { ...extractState(null), ...initialState, isNew: true };
  };
  return {
    clamp: clamp2,
    save,
    load,
    ensure,
    resolveLevelByAffinity,
    resolveLevelByRelation,
    findManualRelationship,
    updateRelationshipConfig,
    removeRelationshipConfig,
    syncRelationshipsToDatabase,
    recordBlacklist,
    removeBlacklist,
    listBlacklist,
    isBlacklisted,
    recordTemporaryBlacklist,
    removeTemporaryBlacklist,
    listTemporaryBlacklist,
    isTemporarilyBlacklisted,
    defaultInitial,
    randomInitial,
    initialRange,
    composeState,
    createInitialState,
    extractState
  };
}

// src/services/history.ts
function createHistoryManager(ctx, config, log) {
  const cache = /* @__PURE__ */ new Map();
  const limit = Math.max((config.historyMessageCount || 0) * 6, 60);
  const formatHistoryTimestamp = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date?.getTime())) return "\u672A\u77E5\u65F6\u95F4";
    const pad2 = (num) => String(num).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad2(date.getMonth() + 1);
    const day = pad2(date.getDate());
    const hour = pad2(date.getHours());
    const minute = pad2(date.getMinutes());
    const second = pad2(date.getSeconds());
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  };
  function makeKey(session) {
    if (!session) return "unknown";
    if (session.guildId) {
      return `${session.platform || "unknown"}:${session.selfId || "self"}:${session.guildId}:${session.channelId || session.guildId}`;
    }
    return `${session.platform || "unknown"}:${session.selfId || "self"}:direct:${session.channelId || session.userId || "unknown"}`;
  }
  function normalizeEntriesList(entries, size) {
    if (!Array.isArray(entries) || !entries.length) return [];
    return entries.slice(-size).map((item) => ({
      userId: item.userId || "",
      username: item.username || item.user?.name || item.author?.name || item.sender?.name || item.userId || "\u672A\u77E5\u7528\u6237",
      content: typeof item.content === "string" && item.content.trim() ? item.content.trim() : "[\u65E0\u6587\u672C\u5185\u5BB9]",
      timestamp: new Date(item.timestamp ?? Date.now()).getTime()
    })).sort((a, b) => a.timestamp - b.timestamp);
  }
  function normalizeEntries(entries, size) {
    return normalizeEntriesList(entries, size).map((item) => {
      const name2 = item.username || item.userId || "\u672A\u77E5\u7528\u6237";
      const idText = item.userId ? `\uFF08${item.userId}\uFF09` : "";
      const timeText = formatHistoryTimestamp(item.timestamp);
      return `[${timeText}] ${name2}${idText}: ${item.content}`;
    });
  }
  function record(session) {
    if (!session?.platform) return;
    if (session.selfId && session.userId === session.selfId) return;
    if (!session.userId) return;
    const key = makeKey(session);
    const list = cache.get(key) || [];
    list.push({
      userId: session.userId,
      username: session.username || session.author?.name || session.event?.user?.name || session.user?.name || session.userId,
      content: session.content ?? "",
      timestamp: new Date(session.timestamp ?? Date.now()).getTime()
    });
    if (list.length > limit) list.splice(0, list.length - limit);
    cache.set(key, list);
  }
  async function readEntries(session, count) {
    const cached = cache.get(makeKey(session));
    if (cached?.length) return cached.slice(-count);
    const db = ctx.database;
    if (!db?.tables?.message || !db.get) return [];
    try {
      const rows = await db.get(
        "message",
        { platform: session.platform, channelId: session.channelId },
        { limit: count, sort: { time: "desc" } }
      );
      return normalizeEntriesList(rows, count);
    } catch (error) {
      log("warn", "\u83B7\u53D6\u5386\u53F2\u6D88\u606F\u5931\u8D25", error);
      return [];
    }
  }
  async function fetch2(session) {
    const count = config.historyMessageCount || 0;
    if (count <= 0) return [];
    const entries = await readEntries(session, count);
    return entries.map((item) => {
      const name2 = item.username || item.userId || "\u672A\u77E5\u7528\u6237";
      const idText = item.userId ? `\uFF08${item.userId}\uFF09` : "";
      const timeText = formatHistoryTimestamp(item.timestamp);
      return `[${timeText}] ${name2}${idText}: ${item.content}`;
    });
  }
  async function fetchEntries(session, count) {
    if (count <= 0) return [];
    const entries = await readEntries(session, count);
    return entries.map((item) => ({ ...item }));
  }
  ctx.on("message", record);
  return { fetch: fetch2, fetchEntries };
}

// src/services/message-store.ts
function createMessageStore(ctx, log, limit = 100) {
  const cache = /* @__PURE__ */ new Map();
  function makeKey(session) {
    if (!session) return "unknown";
    const platform = session.platform || "unknown";
    const selfId = session.selfId || "self";
    const guildId = session?.guildId || "";
    const channelId = session.channelId || session?.roomId || "";
    if (guildId) {
      return `${platform}:${selfId}:${guildId}:${channelId || guildId}`;
    }
    return `${platform}:${selfId}:direct:${channelId || session.userId || "unknown"}`;
  }
  function extractMessageId(session) {
    const candidates = [
      session.messageId,
      session?.id,
      session?.event?.message?.id,
      session?.message?.id
    ];
    for (const id of candidates) {
      if (typeof id === "string" && id.trim()) return id.trim();
      if (typeof id === "number") return String(id);
    }
    return "";
  }
  function extractUsername(session) {
    const candidates = [
      session.username,
      session?.author?.name,
      session?.author?.nickname,
      session?.event?.user?.name,
      session?.user?.name,
      session.userId
    ];
    for (const name2 of candidates) {
      if (typeof name2 === "string" && name2.trim()) return name2.trim();
    }
    return "\u672A\u77E5\u7528\u6237";
  }
  function record(session) {
    if (!session?.platform) return;
    const messageId = extractMessageId(session);
    if (!messageId) {
      return;
    }
    const userId = session.userId || "";
    if (!userId) return;
    const key = makeKey(session);
    const list = cache.get(key) || [];
    const entry = {
      messageId,
      userId,
      username: extractUsername(session),
      content: typeof session.content === "string" ? session.content.slice(0, 200) : "",
      // 只存储前200字符
      timestamp: new Date(session.timestamp ?? Date.now()).getTime()
    };
    list.push(entry);
    if (list.length > limit) {
      list.splice(0, list.length - limit);
    }
    cache.set(key, list);
    log("debug", "\u5DF2\u8BB0\u5F55\u6D88\u606F", { messageId, userId, key });
  }
  function getMessages(session, count = 50) {
    const key = makeKey(session);
    const list = cache.get(key) || [];
    return list.slice(-count);
  }
  function findByLastN(session, lastN, userId) {
    const key = makeKey(session);
    const list = cache.get(key) || [];
    if (!list.length) return null;
    let count = 0;
    for (let i = list.length - 1; i >= 0; i--) {
      const msg = list[i];
      if (userId && msg.userId !== userId) continue;
      count++;
      if (count === lastN) {
        return msg;
      }
    }
    return null;
  }
  function findByContent(session, keyword, userId) {
    const key = makeKey(session);
    const list = cache.get(key) || [];
    if (!list.length || !keyword) return null;
    const lowerKeyword = keyword.toLowerCase();
    for (let i = list.length - 1; i >= 0; i--) {
      const msg = list[i];
      if (userId && msg.userId !== userId) continue;
      if (msg.content.toLowerCase().includes(lowerKeyword)) {
        return msg;
      }
    }
    return null;
  }
  ctx.on("message", record);
  return { record, getMessages, findByLastN, findByContent };
}

// src/core/cache.ts
function createAffinityCache() {
  let entry = null;
  const match = (platform, userId) => entry !== null && entry.platform === platform && entry.userId === userId;
  return {
    get(platform, userId) {
      return match(platform, userId) ? entry.value : null;
    },
    set(platform, userId, value) {
      entry = { platform, userId, value };
    },
    clear(platform, userId) {
      if (match(platform, userId)) entry = null;
    },
    clearAll() {
      entry = null;
    }
  };
}

// src/core/providers.ts
function createAffinityProvider({ config, cache, store }) {
  return async (_args, _variables, configurable) => {
    const session = configurable?.session;
    if (!session?.platform || !session?.userId || !session?.selfId) {
      return "";
    }
    const cached = cache.get(session.platform, session.userId);
    if (cached !== null) return cached;
    const manual = store.findManualRelationship(session.platform, session.userId);
    const hasManualOverride = !!manual?.relation;
    const record = await store.load(session.selfId, session.userId);
    if (!record) {
      return "";
    }
    const longTermAffinity = record.longTermAffinity ?? record.affinity ?? 0;
    let coefficient = config.affinityDynamics?.coefficient?.base ?? 1;
    if (record.coefficientState) {
      try {
        const parsed = typeof record.coefficientState === "string" ? JSON.parse(record.coefficientState) : record.coefficientState;
        if (typeof parsed?.coefficient === "number") coefficient = parsed.coefficient;
      } catch {
      }
    }
    const compositeAffinity = Math.round(coefficient * longTermAffinity);
    const result = hasManualOverride ? compositeAffinity : store.clamp(compositeAffinity);
    cache.set(session.platform, session.userId, result);
    return result;
  };
}
function createRelationshipProvider({ store }) {
  return async (args, _variables, configurable) => {
    const session = configurable?.session;
    const [userArg, platformArg] = args || [];
    const userId = String(userArg || session?.userId || "").trim();
    const platform = String(platformArg || session?.platform || "").trim();
    if (!userId) return "";
    const manual = store.findManualRelationship(platform, userId);
    const selfId = session?.selfId;
    if (!selfId) return "";
    const record = await store.load(selfId, userId);
    if (!record) return "";
    if (manual?.relation) return manual.note ? `${manual.relation}\uFF08${manual.note}\uFF09` : manual.relation;
    if (record.relation) return record.relation;
    const affinity = record.affinity;
    if (typeof affinity === "number") {
      const level = store.resolveLevelByAffinity(affinity);
      if (!level) return "";
      return level.note ? `${level.relation}\uFF08${level.note}\uFF09` : level.relation;
    }
    return "";
  };
}
function createContextAffinityProvider({ config, store, history }) {
  return async (_args, _variables, configurable) => {
    const overview = config.contextAffinityOverview;
    const session = configurable?.session;
    if (!session?.platform) return "";
    const fetchEntries = history?.fetchEntries;
    if (typeof fetchEntries !== "function") return "";
    const windowSize = Math.max(1, overview?.messageWindow ?? 20);
    const entries = await fetchEntries(session, windowSize);
    if (!entries?.length) return "";
    const orderedUsers = [];
    const seen = /* @__PURE__ */ new Set();
    for (const entry of entries) {
      const userId = entry.userId;
      if (!userId || userId === session.selfId) continue;
      if (seen.has(userId)) continue;
      seen.add(userId);
      orderedUsers.push({ userId, username: entry.username || userId, timestamp: entry.timestamp });
    }
    if (!orderedUsers.length) return "";
    const results = await Promise.all(orderedUsers.map(async ({ userId, username }) => {
      const record = await store.load(session.selfId, userId);
      const manual = store.findManualRelationship(session.platform, userId);
      if (!record) return null;
      const affinity = record.affinity;
      const clamped = store.clamp(affinity);
      const level = store.resolveLevelByAffinity(clamped);
      const relation = manual?.relation || record?.relation || level?.relation || "\u672A\u77E5";
      const name2 = username || record?.nickname || userId;
      return `id:${userId} name:${name2} affinity:${clamped} relationship:${relation}`;
    }));
    return results.filter(Boolean).join("\n");
  };
}

// src/tools/tools.ts
var import_zod = require("zod");
var import_tools = require("@langchain/core/tools");
function createAffinityTool(options) {
  return new class extends import_tools.StructuredTool {
    name = "adjust_affinity";
    description = "Adjust affinity for a specific user and sync derived relationship.";
    schema = import_zod.z.object({
      affinity: import_zod.z.number().min(options.min).max(options.max).describe(`Target affinity (range ${options.min}-${options.max})`),
      targetUserId: import_zod.z.string().optional().describe("Target user ID; defaults to current session"),
      platform: import_zod.z.string().optional().describe("Target platform; defaults to current session")
    });
    async _call(input, _manager, runnable) {
      const session = runnable?.configurable?.session;
      const platform = input.platform || session?.platform;
      const userId = input.targetUserId || session?.userId;
      if (!platform || !userId) return "Missing platform or user ID. Unable to adjust affinity.";
      const value = options.clamp(input.affinity);
      const level = options.resolveLevelByAffinity(value);
      await options.save({ platform, userId, selfId: session?.selfId, session }, value, level?.relation ?? options.defaultRelation);
      options.cache.set(platform, userId, value);
      if (level?.relation) {
        return `Affinity for ${platform}/${userId} set to ${value}. Relationship updated to ${level.relation}.`;
      }
      return `Affinity for ${platform}/${userId} set to ${value}.`;
    }
  }();
}
function createRelationshipTool(options) {
  const levels = Array.isArray(options.relationLevels) ? options.relationLevels.map((item) => item && item.relation ? { ...item, relation: String(item.relation).trim() } : null).filter(Boolean) : [];
  const summary = levels.map((item) => `${item.relation}: ${item.min}-${item.max}`).join(" | ");
  return new class extends import_tools.StructuredTool {
    name = "adjust_relationship";
    description = "Set relationship for a user and align affinity to the relationship lower bound.";
    schema = import_zod.z.object({
      relation: import_zod.z.string().min(1, "Relation cannot be empty").describe(summary ? `Target relation (configured: ${summary})` : "Target relation name"),
      targetUserId: import_zod.z.string().optional().describe("Target user ID; defaults to current session"),
      platform: import_zod.z.string().optional().describe("Target platform; defaults to current session")
    });
    async _call(input, _manager, runnable) {
      const session = runnable?.configurable?.session;
      const platform = input.platform || session?.platform;
      const userId = input.targetUserId || session?.userId;
      if (!platform || !userId) return "Missing platform or user ID. Unable to adjust relationship.";
      const relationName = input.relation.trim();
      const isTargetUser = userId === session?.userId;
      await options.save({ platform, userId, selfId: session?.selfId, session: isTargetUser ? session : void 0 }, NaN, relationName);
      return `Relationship for ${platform}/${userId} set to ${relationName}.`;
    }
  }();
}
function createBlacklistTool(options) {
  return new class extends import_tools.StructuredTool {
    name = "adjust_blacklist";
    description = "Add or remove a user from the affinity blacklist. Supports both permanent and temporary blacklist.";
    schema = import_zod.z.object({
      action: import_zod.z.enum(["add", "remove", "temp_add", "temp_remove"]).describe("Action: add/remove for permanent blacklist, temp_add/temp_remove for temporary blacklist"),
      targetUserId: import_zod.z.string().describe("Target user ID"),
      platform: import_zod.z.string().optional().describe("Target platform; defaults to current session"),
      note: import_zod.z.string().optional().describe("Optional note when adding to blacklist"),
      durationHours: import_zod.z.number().optional().describe("Duration in hours for temporary blacklist (default: 12)"),
      penalty: import_zod.z.number().optional().describe("Affinity penalty for temporary blacklist (default: from config)")
    });
    async _call(input, _manager, runnable) {
      const session = runnable?.configurable?.session;
      const platform = input.platform || session?.platform;
      const userId = input.targetUserId;
      const channelId = session?.guildId || session?.channelId || session?.roomId || "";
      if (!platform || !userId) return "Missing platform or user ID. Unable to adjust blacklist.";
      const selfId = session?.selfId;
      if (!selfId) return "Missing selfId. Unable to adjust blacklist.";
      if (input.action === "temp_add") {
        let nickname = "";
        try {
          const existing = await options.store.load(selfId, userId);
          nickname = existing?.nickname || "";
        } catch {
        }
        const durationHours = input.durationHours ?? options.shortTermConfig?.durationHours ?? 12;
        const penalty = input.penalty ?? options.shortTermConfig?.penalty ?? 5;
        const entry = options.store.recordTemporaryBlacklist(platform, userId, durationHours, penalty, { note: input.note ?? "tool", nickname, channelId });
        if (!entry) return `User ${platform}/${userId} is already in temporary blacklist.`;
        if (penalty > 0) {
          try {
            const record = await options.store.load(selfId, userId);
            if (record) {
              const newAffinity = options.clamp((record.longTermAffinity ?? record.affinity) - penalty);
              await options.save({ platform, userId, selfId, session }, newAffinity, record.relation || "");
            }
          } catch {
          }
        }
        options.cache.clear(platform, userId);
        return `User ${platform}/${userId} added to temporary blacklist for ${durationHours} hours with ${penalty} penalty.`;
      }
      if (input.action === "temp_remove") {
        const removed2 = options.store.removeTemporaryBlacklist(platform, userId);
        options.cache.clear(platform, userId);
        return removed2 ? `User ${platform}/${userId} removed from temporary blacklist.` : `User ${platform}/${userId} not found in temporary blacklist.`;
      }
      if (input.action === "add") {
        let nickname = "";
        try {
          const existing = await options.store.load(selfId, userId);
          nickname = existing?.nickname || "";
        } catch {
        }
        options.store.recordBlacklist(platform, userId, { note: input.note ?? "tool", nickname, channelId });
        options.cache.clear(platform, userId);
        return `User ${platform}/${userId} added to blacklist.`;
      }
      const removed = options.store.removeBlacklist(platform, userId, channelId);
      options.cache.clear(platform, userId);
      return removed ? `User ${platform}/${userId} removed from blacklist.` : `User ${platform}/${userId} not found in blacklist.`;
    }
  }();
}
function getSession(runnable) {
  return runnable?.configurable?.session || null;
}
function ensureOneBotSession(session) {
  if (!session) return { error: "\u7F3A\u5C11\u4F1A\u8BDD\u4E0A\u4E0B\u6587\uFF0C\u65E0\u6CD5\u6267\u884C OneBot \u5DE5\u5177\u3002" };
  if (session.platform !== "onebot") return { error: "\u8BE5\u5DE5\u5177\u4EC5\u652F\u6301 OneBot \u5E73\u53F0\u3002" };
  if (!session.bot) return { error: "\u5F53\u524D\u4F1A\u8BDD\u7F3A\u5C11 bot \u5B9E\u4F8B\uFF0C\u65E0\u6CD5\u6267\u884C\u5DE5\u5177\u3002" };
  const internal = session.bot.internal;
  if (!internal) return { error: "Bot \u9002\u914D\u5668\u672A\u66B4\u9732 OneBot internal \u63A5\u53E3\u3002" };
  return { session, internal };
}
async function callOneBotAPI(internal, action, params, fallbacks = []) {
  if (typeof internal._request === "function") {
    return internal._request(action, params);
  }
  for (const key of fallbacks) {
    if (typeof internal[key] === "function") {
      return internal[key](params);
    }
  }
  throw new Error(`\u5F53\u524D OneBot \u9002\u914D\u5668\u4E0D\u652F\u6301 ${action} \u63A5\u53E3\u3002`);
}
function createOneBotPokeTool({ ctx, toolName }) {
  const logger7 = ctx?.logger?.("chatluna-affinity");
  return new class extends import_tools.StructuredTool {
    name = toolName || "poke_user";
    description = "Poke (nudge) a specified user in a group or private conversation.";
    schema = import_zod.z.object({
      userId: import_zod.z.string().min(1, "userId is required").describe("The user ID to poke."),
      groupId: import_zod.z.string().optional().describe("Optional: specify a different group ID if the poke should happen in another group.")
    });
    async _call(input, _manager, runnable) {
      try {
        const session = getSession(runnable);
        const { error, internal } = ensureOneBotSession(session);
        if (error) return error;
        const params = { user_id: input.userId };
        const groupId = input.groupId?.trim() || session?.guildId || session?.channelId || session?.roomId;
        if (groupId) params.group_id = groupId;
        if (typeof internal._request === "function") {
          await internal._request("send_poke", params);
        } else if (typeof internal.sendPoke === "function") {
          await internal.sendPoke(params.group_id, params.user_id);
        } else if (typeof internal.pokeUser === "function") {
          await internal.pokeUser(params);
        } else {
          throw new Error("\u5F53\u524D\u9002\u914D\u5668\u672A\u5B9E\u73B0 send_poke API\u3002");
        }
        const location = params.group_id ? `\u7FA4 ${params.group_id}` : "\u79C1\u804A";
        const message = `\u5DF2\u5728 ${location} \u6233\u4E86\u4E00\u4E0B ${params.user_id}\u3002`;
        logger7?.info?.(message);
        return message;
      } catch (error) {
        logger7?.warn?.("\u6233\u4E00\u6233\u5DE5\u5177\u6267\u884C\u5931\u8D25", error);
        return `\u6233\u4E00\u6233\u5931\u8D25\uFF1A${error.message}`;
      }
    }
  }();
}
function createOneBotSetSelfProfileTool({ ctx, toolName }) {
  const logger7 = ctx?.logger?.("chatluna-affinity");
  const genders = { unknown: "0", male: "1", female: "2" };
  return new class extends import_tools.StructuredTool {
    name = toolName || "set_self_profile";
    description = "Update the bot's own QQ profile (nickname, signature, gender).";
    schema = import_zod.z.object({
      nickname: import_zod.z.string().min(1, "nickname is required").describe("The new nickname for the bot."),
      signature: import_zod.z.string().optional().describe("Optional: the new personal signature."),
      gender: import_zod.z.enum(["unknown", "male", "female"]).optional().describe("Optional: the new gender.")
    });
    async _call(input, _manager, runnable) {
      try {
        const session = getSession(runnable);
        const { error, internal } = ensureOneBotSession(session);
        if (error) return error;
        const payload = { nickname: input.nickname };
        if (input.signature) payload.personal_note = input.signature;
        if (input.gender) payload.sex = genders[input.gender];
        await callOneBotAPI(internal, "set_qq_profile", payload, ["setQQProfile"]);
        const message = "\u673A\u5668\u4EBA\u8D44\u6599\u5DF2\u66F4\u65B0\u3002";
        logger7?.info?.(message);
        return message;
      } catch (error) {
        logger7?.warn?.("\u4FEE\u6539\u673A\u5668\u4EBA\u8D26\u6237\u4FE1\u606F\u5931\u8D25", error);
        return `\u4FEE\u6539\u673A\u5668\u4EBA\u8D26\u6237\u4FE1\u606F\u5931\u8D25\uFF1A${error.message}`;
      }
    }
  }();
}
function createDeleteMessageTool({ ctx, toolName, messageStore }) {
  const logger7 = ctx?.logger?.("chatluna-affinity");
  return new class extends import_tools.StructuredTool {
    name = toolName || "delete_msg";
    description = `Deletes (recalls) a message. You can specify the message by:
1. messageId: directly provide the message ID
2. lastN: delete the Nth most recent message (1 = most recent). Can combine with userId to target a specific user.
3. contentMatch: delete the most recent message containing this keyword. Can combine with userId.
4. If none provided, will try to use the quoted message.
As a group admin, you can delete messages from any user.`;
    schema = import_zod.z.object({
      messageId: import_zod.z.string().optional().describe("Specific message ID to delete."),
      lastN: import_zod.z.number().int().min(1).optional().describe("Delete the Nth most recent message (1 = latest). Example: 1 to delete the latest message, 2 for second latest."),
      userId: import_zod.z.string().optional().describe("Target user ID. Use with lastN or contentMatch to delete a specific user's message."),
      contentMatch: import_zod.z.string().optional().describe("Delete the most recent message containing this keyword/phrase.")
    });
    async _call(input, _manager, runnable) {
      try {
        const session = getSession(runnable);
        if (!session) return "No session context available.";
        let resolvedMessageId = "";
        let matchInfo = "";
        if (typeof input.messageId === "string" && input.messageId.trim()) {
          resolvedMessageId = input.messageId.trim();
          matchInfo = `by ID ${resolvedMessageId}`;
        } else if (input.lastN && input.lastN > 0 && messageStore) {
          const found = messageStore.findByLastN(session, input.lastN, input.userId);
          if (found) {
            resolvedMessageId = found.messageId;
            const userInfo = input.userId ? ` from user ${found.username}(${found.userId})` : "";
            matchInfo = `#${input.lastN} recent message${userInfo}: "${found.content.slice(0, 30)}${found.content.length > 30 ? "..." : ""}"`;
          } else {
            const userHint = input.userId ? ` from user ${input.userId}` : "";
            return `No message found at position ${input.lastN}${userHint}.`;
          }
        } else if (input.contentMatch && messageStore) {
          const found = messageStore.findByContent(session, input.contentMatch, input.userId);
          if (found) {
            resolvedMessageId = found.messageId;
            const userInfo = input.userId ? ` from user ${found.username}(${found.userId})` : "";
            matchInfo = `matching "${input.contentMatch}"${userInfo}: "${found.content.slice(0, 30)}${found.content.length > 30 ? "..." : ""}"`;
          } else {
            const userHint = input.userId ? ` from user ${input.userId}` : "";
            return `No message found containing "${input.contentMatch}"${userHint}.`;
          }
        } else {
          resolvedMessageId = session?.quote?.id || session?.event?.quote?.messageId || session?.event?.message?.id || "";
          if (resolvedMessageId) {
            matchInfo = "quoted message";
          }
        }
        if (!resolvedMessageId) {
          return "No message found to delete. Please provide messageId, use lastN/contentMatch to search, or quote a message.";
        }
        const messageIdRaw = resolvedMessageId.trim();
        const numericId = /^\d+$/.test(messageIdRaw) ? Number(messageIdRaw) : messageIdRaw;
        if (session.platform === "onebot") {
          const { error, internal } = ensureOneBotSession(session);
          if (error) return error;
          await callOneBotAPI(internal, "delete_msg", { message_id: numericId }, ["deleteMsg"]);
          const success = `Message deleted (${matchInfo}).`;
          logger7?.info?.(success);
          return success;
        }
        const bot = session.bot;
        if (typeof bot?.deleteMessage === "function") {
          const channelId = session.channelId || session?.guildId || session?.roomId || session?.channel?.id || "";
          if (!channelId) return "Cannot determine channel to delete message.";
          await bot.deleteMessage(channelId, messageIdRaw);
          const success = `Message deleted (${matchInfo}).`;
          logger7?.info?.(success);
          return success;
        }
        return "Delete message is not supported on this platform.";
      } catch (error) {
        logger7?.warn?.("delete_msg failed", error);
        return `delete_msg failed: ${error.message}`;
      }
    }
  }();
}
function createPanSouSearchTool({ ctx, toolName, apiUrl, authEnabled, username, password, defaultCloudTypes, maxResults }) {
  const logger7 = ctx?.logger?.("chatluna-affinity");
  let cachedToken = null;
  let tokenExpiry = 0;
  async function getToken() {
    if (!authEnabled) return null;
    if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.token) {
        cachedToken = data.token;
        tokenExpiry = (data.expires_at || Date.now() / 1e3 + 3600) * 1e3 - 6e4;
        return cachedToken;
      }
      logger7?.warn?.("PanSou \u8BA4\u8BC1\u5931\u8D25", data.error);
      return null;
    } catch (error) {
      logger7?.warn?.("PanSou \u8BA4\u8BC1\u8BF7\u6C42\u5931\u8D25", error);
      return null;
    }
  }
  const cloudTypeNames = {
    baidu: "\u767E\u5EA6\u7F51\u76D8",
    aliyun: "\u963F\u91CC\u4E91\u76D8",
    quark: "\u5938\u514B\u7F51\u76D8",
    tianyi: "\u5929\u7FFC\u4E91\u76D8",
    uc: "UC\u7F51\u76D8",
    mobile: "\u79FB\u52A8\u4E91\u76D8",
    "115": "115\u7F51\u76D8",
    pikpak: "PikPak",
    xunlei: "\u8FC5\u96F7\u7F51\u76D8",
    "123": "123\u7F51\u76D8",
    magnet: "\u78C1\u529B\u94FE\u63A5",
    ed2k: "\u7535\u9A74\u94FE\u63A5",
    others: "\u5176\u4ED6"
  };
  return new class extends import_tools.StructuredTool {
    name = toolName || "pansou_search";
    description = `Search for cloud storage resources (\u7F51\u76D8\u8D44\u6E90). Supports Baidu, Aliyun, Quark, Tianyi, UC, 115, PikPak, Xunlei, 123 cloud drives and magnet/ed2k links. Use this tool when users ask for movies, TV shows, music, software, e-books or other downloadable resources.`;
    schema = import_zod.z.object({
      keyword: import_zod.z.string().min(1, "Search keyword is required").describe("The search keyword for finding resources (e.g., movie name, TV show name, software name)"),
      cloudTypes: import_zod.z.array(import_zod.z.string()).optional().describe("Optional: specific cloud types to search (baidu, aliyun, quark, tianyi, uc, mobile, 115, pikpak, xunlei, 123, magnet, ed2k). Leave empty for all types.")
    });
    async _call(input) {
      try {
        const headers = { "Content-Type": "application/json" };
        if (authEnabled) {
          const token = await getToken();
          if (token) headers["Authorization"] = `Bearer ${token}`;
        }
        const cloudTypes = input.cloudTypes?.length ? input.cloudTypes : defaultCloudTypes.length ? defaultCloudTypes : void 0;
        const requestBody = {
          kw: input.keyword,
          res: "merge"
        };
        if (cloudTypes) requestBody.cloud_types = cloudTypes;
        logger7?.info?.(`PanSou \u641C\u7D22\u8BF7\u6C42: keyword=${input.keyword}, apiUrl=${apiUrl}, cloudTypes=${JSON.stringify(cloudTypes)}`);
        logger7?.info?.(`PanSou \u8BF7\u6C42\u4F53: ${JSON.stringify(requestBody)}`);
        const response = await fetch(`${apiUrl}/api/search`, {
          method: "POST",
          headers,
          body: JSON.stringify(requestBody)
        });
        const responseText = await response.text();
        logger7?.info?.(`PanSou \u539F\u59CB\u54CD\u5E94 (status=${response.status}): ${responseText.slice(0, 2e3)}`);
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          logger7?.warn?.("PanSou \u54CD\u5E94\u89E3\u6790\u5931\u8D25", e);
          return `\u641C\u7D22\u5931\u8D25: \u54CD\u5E94\u89E3\u6790\u9519\u8BEF`;
        }
        const responseData = data.data || data;
        logger7?.info?.(`PanSou \u54CD\u5E94\u5B57\u6BB5: total=${responseData.total}, merged_by_type keys=${Object.keys(responseData.merged_by_type || {}).join(",")}, results count=${responseData.results?.length || 0}`);
        if (data.error || data.code && data.code !== 200 && data.code !== 0) {
          return `\u641C\u7D22\u5931\u8D25: ${data.error || data.message || "\u672A\u77E5\u9519\u8BEF"}`;
        }
        const mergedByType = responseData.merged_by_type;
        if (!mergedByType || Object.keys(mergedByType).length === 0) {
          logger7?.warn?.(`PanSou \u672A\u627E\u5230\u7ED3\u679C, \u5B8C\u6574\u54CD\u5E94: ${JSON.stringify(data).slice(0, 1e3)}`);
          return `\u672A\u627E\u5230"${input.keyword}"\u7684\u76F8\u5173\u8D44\u6E90\u3002`;
        }
        const results = [`\u{1F50D} "${input.keyword}" \u7684\u641C\u7D22\u7ED3\u679C\uFF1A
`];
        let totalCount = 0;
        for (const [cloudType, links] of Object.entries(mergedByType)) {
          if (!links || links.length === 0) continue;
          const typeName = cloudTypeNames[cloudType] || cloudType;
          const limitedLinks = links.slice(0, maxResults);
          results.push(`
\u{1F4C1} ${typeName} (${links.length} \u4E2A\u7ED3\u679C):`);
          for (const link of limitedLinks) {
            totalCount++;
            const title = link.note || "\u672A\u77E5\u8D44\u6E90";
            const pwd = link.password ? ` | \u5BC6\u7801: ${link.password}` : "";
            results.push(`  \u2022 ${title}`);
            results.push(`    \u94FE\u63A5: ${link.url}${pwd}`);
          }
          if (links.length > maxResults) {
            results.push(`  ... \u8FD8\u6709 ${links.length - maxResults} \u4E2A\u7ED3\u679C`);
          }
        }
        if (totalCount === 0) {
          return `\u672A\u627E\u5230"${input.keyword}"\u7684\u76F8\u5173\u8D44\u6E90\u3002`;
        }
        results.push(`
\u5171\u627E\u5230 ${responseData.total || totalCount} \u4E2A\u8D44\u6E90`);
        logger7?.info?.(`PanSou \u641C\u7D22\u5B8C\u6210: ${input.keyword}, \u5171 ${totalCount} \u4E2A\u7ED3\u679C`);
        return results.join("\n");
      } catch (error) {
        logger7?.warn?.("PanSou \u641C\u7D22\u5931\u8D25", error);
        return `\u7F51\u76D8\u641C\u7D22\u5931\u8D25: ${error.message}`;
      }
    }
  }();
}
function createToolRegistry(config, store, cache) {
  const shortTermCfg = config.shortTermBlacklist || {};
  const options = {
    clamp: store.clamp,
    resolveLevelByAffinity: store.resolveLevelByAffinity,
    resolveLevelByRelation: store.resolveLevelByRelation,
    relationLevels: config.relationshipAffinityLevels || [],
    defaultRelation: "",
    defaultInitial: store.defaultInitial,
    save: store.save,
    cache,
    updateRelationshipConfig: store.updateRelationshipConfig,
    store,
    min: config.min ?? 0,
    max: config.max ?? 100,
    shortTermConfig: {
      durationHours: shortTermCfg.durationHours ?? 12,
      penalty: shortTermCfg.penalty ?? 5
    }
  };
  return {
    affinitySelector: () => true,
    relationshipSelector: () => true,
    blacklistSelector: () => true,
    createAffinityTool: () => createAffinityTool(options),
    createRelationshipTool: () => createRelationshipTool(options),
    createBlacklistTool: () => createBlacklistTool(options)
  };
}

// src/core/dynamics.ts
var normalizeAction = (action) => {
  const text = typeof action === "string" ? action.toLowerCase() : "";
  if (text === "increase" || text === "decrease" || text === "hold") return text;
  return "hold";
};
function resolveShortTermConfig(config) {
  const cfg = config?.affinityDynamics?.shortTerm || {};
  const promoteRaw = Number(cfg.promoteThreshold);
  const demoteRaw = Number(cfg.demoteThreshold);
  let promoteThreshold = Number.isFinite(promoteRaw) ? Math.round(promoteRaw) : 15;
  let demoteThreshold = Number.isFinite(demoteRaw) ? Math.round(demoteRaw) : -15;
  if (promoteThreshold <= demoteThreshold) {
    const midpoint = Math.round((promoteThreshold + demoteThreshold) / 2) || 0;
    promoteThreshold = midpoint + 15;
    demoteThreshold = midpoint - 15;
  }
  const fallbackStep = Number.isFinite(cfg.longTermStep) ? cfg.longTermStep : 3;
  const promoteStepRaw = Number(cfg.longTermPromoteStep);
  const demoteStepRaw = Number(cfg.longTermDemoteStep);
  const longTermPromoteStep = Math.max(1, Math.round(Math.abs(Number.isFinite(promoteStepRaw) ? promoteStepRaw : fallbackStep)));
  const longTermDemoteStep = Math.max(1, Math.round(Math.abs(Number.isFinite(demoteStepRaw) ? demoteStepRaw : fallbackStep)));
  return { promoteThreshold, demoteThreshold, longTermPromoteStep, longTermDemoteStep };
}
function resolveActionWindowConfig(config) {
  const cfg = config?.affinityDynamics?.actionWindow || {};
  const windowHoursRaw = Number(cfg.windowHours);
  const windowHours = Math.max(1, Number.isFinite(windowHoursRaw) ? windowHoursRaw : 24);
  const increaseBonus = Number.isFinite(cfg.increaseBonus) ? cfg.increaseBonus : 2;
  const decreaseBonus = Number.isFinite(cfg.decreaseBonus) ? cfg.decreaseBonus : 2;
  const bonusChatThresholdRaw = Number(cfg.bonusChatThreshold);
  const bonusChatThreshold = Math.max(0, Number.isFinite(bonusChatThresholdRaw) ? Math.round(bonusChatThresholdRaw) : 0);
  const allowBonusOverflow = Boolean(cfg.allowBonusOverflow);
  const maxEntriesRaw = Number(cfg.maxEntries);
  const maxEntries = Math.max(10, Number.isFinite(maxEntriesRaw) ? Math.round(maxEntriesRaw) : 60);
  return { windowHours, windowMs: windowHours * 3600 * 1e3, increaseBonus, decreaseBonus, bonusChatThreshold, allowBonusOverflow, maxEntries };
}
function resolveCoefficientConfig(config) {
  const cfg = config?.affinityDynamics?.coefficient || {};
  const base = Number.isFinite(cfg.base) ? cfg.base : 1;
  const maxDrop = Math.max(0, Number.isFinite(cfg.maxDrop) ? cfg.maxDrop : 0.3);
  const maxBoost = Math.max(0, Number.isFinite(cfg.maxBoost) ? cfg.maxBoost : 0.3);
  const decayPerDay = Math.max(0, Number.isFinite(cfg.decayPerDay) ? cfg.decayPerDay : maxDrop > 0 ? maxDrop / 3 : 0.1);
  const boostPerDay = Math.max(0, Number.isFinite(cfg.boostPerDay) ? cfg.boostPerDay : maxBoost > 0 ? maxBoost / 3 : 0.1);
  const min = base - maxDrop;
  const max = base + maxBoost;
  return { base, maxDrop, maxBoost, decayPerDay, boostPerDay, min, max };
}
function summarizeActionEntries(rawEntries, windowMs, nowMs) {
  const fallback = { entries: [], counts: { increase: 0, decrease: 0, hold: 0 }, total: 0 };
  if (!Array.isArray(rawEntries)) return fallback;
  const cutoff = nowMs - windowMs;
  const entries = [];
  const counts = { increase: 0, decrease: 0, hold: 0 };
  for (const entry of rawEntries) {
    if (!entry) continue;
    const ts = Number(entry.timestamp);
    if (!Number.isFinite(ts) || ts < cutoff) continue;
    const normalizedAction = normalizeAction(entry.action);
    entries.push({ action: normalizedAction, timestamp: ts });
    counts[normalizedAction] += 1;
  }
  return { entries, counts, total: counts.increase + counts.decrease + counts.hold };
}
function appendActionEntry(entries, action, nowMs, maxEntries) {
  const next = Array.isArray(entries) ? [...entries] : [];
  next.push({ action: normalizeAction(action), timestamp: nowMs });
  if (next.length > maxEntries) next.splice(0, next.length - maxEntries);
  return next;
}
function computeShortTermReset() {
  return 0;
}
var dayNumber = (date) => Math.floor(date.getTime() / 864e5);
function computeDailyStreak(previousStreak, lastInteractionAt, now) {
  const last = lastInteractionAt instanceof Date ? lastInteractionAt : null;
  const currentDay = dayNumber(now);
  const previousDay = last ? dayNumber(last) : null;
  if (previousDay === null) return 1;
  if (previousDay === currentDay) return Math.max(1, previousStreak || 1);
  if (previousDay === currentDay - 1) return Math.max(1, (previousStreak || 0) + 1);
  return 1;
}
function computeCoefficientValue(coefConfig, streak, lastInteractionAt, now, todayIncreaseCount = 0, todayDecreaseCount = 0) {
  const lastMs = lastInteractionAt instanceof Date ? lastInteractionAt.getTime() : null;
  const nowMs = now.getTime();
  const inactivityDays = lastMs ? Math.max(0, Math.floor((nowMs - lastMs) / 864e5)) : 0;
  const hasInteractedToday = inactivityDays === 0;
  const isPositiveDay = todayIncreaseCount > todayDecreaseCount;
  const isNegativeDay = todayDecreaseCount > todayIncreaseCount;
  let decayPenalty = 0;
  let streakBoost = 0;
  if (!hasInteractedToday || isNegativeDay) {
    if (!hasInteractedToday) decayPenalty = Math.min(coefConfig.maxDrop, inactivityDays * coefConfig.decayPerDay);
    else if (isNegativeDay) decayPenalty = Math.min(coefConfig.maxDrop, coefConfig.decayPerDay);
  }
  if (hasInteractedToday && isPositiveDay && streak > 0) {
    streakBoost = Math.min(coefConfig.maxBoost, Math.max(0, (Math.max(1, streak) - 1) * coefConfig.boostPerDay));
  }
  const coefficient = clampFloat(coefConfig.base - decayPenalty + streakBoost, coefConfig.min, coefConfig.max);
  return { coefficient, decayPenalty, streakBoost, inactivityDays };
}

// src/middlewares/analysis.ts
async function resolveGroupNickname(session) {
  const fallback = session?.username || session?.userId || "";
  try {
    const bot = session?.bot;
    const guildId = session?.guildId || session?.channelId;
    const userId = session?.userId;
    if (!bot || !guildId || !userId) return fallback;
    let member = null;
    if (bot.internal?.getGroupMemberInfo) {
      member = await bot.internal.getGroupMemberInfo(guildId, userId, false).catch(() => null);
    } else if (bot.internal?.getGuildMember) {
      member = await bot.internal.getGuildMember(guildId, userId).catch(() => null);
    } else if (bot.getGuildMember) {
      member = await bot.getGuildMember(guildId, userId).catch(() => null);
    }
    if (!member) return fallback;
    const card = member.card || member.user?.card;
    const nick = member.nickname || member.nick || member.user?.nickname || member.user?.nick;
    return String(card || nick || fallback).trim() || fallback;
  } catch {
    return fallback;
  }
}
function shouldAnalyzeSession(session, nicknames, log, debugEnabled) {
  const text = String(session.content ?? "");
  const lowerText = text.toLowerCase();
  const nicknameHit = nicknames.some((name2) => lowerText.includes(name2.toLowerCase()));
  if (debugEnabled && nicknameHit) log("debug", "\u6635\u79F0\u5339\u914D\u547D\u4E2D", { text, nicknames });
  const selfIdLower = String(session.selfId ?? "").toLowerCase();
  const elements = session?.elements;
  const mentionHit = Boolean(
    elements?.some((el) => {
      if (el.type !== "at") return false;
      const attrs = el.attrs ?? {};
      const candidates = [attrs.id, attrs.userId, attrs.cid, attrs.name, attrs.nickname].filter(Boolean).map((value) => String(value).toLowerCase());
      return selfIdLower ? candidates.includes(selfIdLower) : candidates.length > 0;
    })
  );
  if (debugEnabled && mentionHit) log("debug", "@ \u5339\u914D\u547D\u4E2D", { elements });
  const quote = session?.quote;
  const quoteHit = Boolean(
    quote && (quote.userId === session.selfId || quote?.author?.userId === session.selfId || quote?.author?.id === session.selfId || quote?.user?.id === session.selfId)
  );
  const isDirect = session?.isDirect;
  const atMe = session?.atMe;
  return isDirect || atMe || nicknameHit || mentionHit || quoteHit;
}
async function resolveTriggerNicknames(ctx, config) {
  const names = /* @__PURE__ */ new Set();
  for (const value of config.triggerNicknames || []) {
    if (value) names.add(String(value).trim());
  }
  const chatluna = ctx.chatluna;
  const chatlunaConfig = chatluna?.config ?? {};
  const possibleNames = [chatlunaConfig.nicknames, chatlunaConfig.nickname, chatlunaConfig.names, chatlunaConfig.name, chatlunaConfig.botNames];
  for (const item of possibleNames) {
    if (Array.isArray(item)) item.forEach((name2) => name2 && names.add(String(name2).trim()));
    else if (item) names.add(String(item).trim());
  }
  const rendererNames = chatluna?.promptRenderer?.nicknames;
  if (rendererNames?.size) for (const name2 of rendererNames) names.add(String(name2).trim());
  const rendererGetter = chatluna?.promptRenderer?.getNicknames;
  if (typeof rendererGetter === "function") {
    const extra = await rendererGetter();
    if (Array.isArray(extra)) extra.forEach((name2) => name2 && names.add(String(name2).trim()));
  }
  return Array.from(names).map((name2) => name2.toLowerCase());
}
var tryBlacklistUser = async (_ctx, session, store, cache, log) => {
  const platform = session?.platform;
  const userId = session?.userId;
  const channelId = session?.guildId || session?.channelId || session?.roomId || "";
  if (!platform || !userId) return { skipped: true };
  if (store.isBlacklisted(platform, userId, channelId)) {
    log("debug", "\u7528\u6237\u5DF2\u5728\u81EA\u52A8\u62C9\u9ED1\u5217\u8868\uFF0C\u8DF3\u8FC7\u91CD\u590D\u5904\u7406", { platform, userId });
    return { skipped: true };
  }
  const author = session?.author;
  const user = session?.user;
  const nickname = author?.nickname || author?.name || user?.nickname || user?.name || "";
  const recorded = store.recordBlacklist(platform, userId, { note: "local guard", nickname, channelId });
  if (recorded) log("info", "\u5DF2\u8BB0\u5F55\u81EA\u52A8\u62C9\u9ED1\u7528\u6237", { platform, userId, note: "local guard" });
  cache?.clear?.(platform, userId);
  return { recorded: Boolean(recorded) };
};
function createAnalysisMiddleware(ctx, config, deps) {
  const { store, history, cache, getModel, renderTemplate: renderTemplate2, getMessageContent: getMessageContent2, log, resolvePersonaPreset, temporaryBlacklist, shortTermOptions } = deps;
  const debugEnabled = config.debugLogging;
  const pendingAnalysis = /* @__PURE__ */ new Map();
  const actionWindow = resolveActionWindowConfig(config);
  const coefficientRules = resolveCoefficientConfig(config);
  const shortTermRules = resolveShortTermConfig(config);
  const shortTermConfig = shortTermOptions || {
    enabled: false,
    windowHours: 24,
    windowMs: 24 * 3600 * 1e3,
    decreaseThreshold: Infinity,
    durationHours: 0,
    durationMs: 0,
    penalty: 0
  };
  const temporaryManager = temporaryBlacklist || {
    isBlocked: () => null,
    activate: () => ({ activated: false, entry: null }),
    clear: () => {
    }
  };
  const shortTermTriggerMap = /* @__PURE__ */ new Map();
  const clampValue = (value, low, high) => Math.min(high, Math.max(low, value));
  const resolveActionLabel = (value) => {
    const action = typeof value === "string" ? value.toLowerCase() : "";
    if (action === "increase") return "\u63D0\u5347";
    if (action === "decrease") return "\u964D\u4F4E";
    if (action === "hold") return "\u4FDD\u6301";
    return action || "\u672A\u77E5";
  };
  const describeModelResponse = ({ parsed, delta, action, session, nickname }) => {
    const rawAction = typeof parsed?.action === "string" ? parsed.action.toLowerCase() : "";
    return {
      \u672C\u6B21\u589E\u51CF: parsed?.delta ?? "",
      \u539F\u59CB\u52A8\u4F5C: resolveActionLabel(rawAction),
      \u539F\u56E0\u8BF4\u660E: parsed?.reason ?? "",
      \u4FEE\u6B63\u589E\u51CF: delta,
      \u52A8\u4F5C\u5224\u5B9A: resolveActionLabel(action || rawAction),
      \u7528\u6237id: session?.userId ?? "",
      \u7528\u6237\u6635\u79F0: nickname || ""
    };
  };
  const describeAffinityUpdate = (detail) => ({
    \u539F\u59CB\u7EFC\u5408\u597D\u611F: detail.originalAffinity,
    \u539F\u59CB\u957F\u671F\u597D\u611F: detail.initialLongTerm,
    \u539F\u59CB\u77ED\u671F\u597D\u611F: detail.initialShortTerm,
    \u672C\u6B21\u589E\u51CF: detail.limitedDelta,
    \u989D\u5916\u6B63\u5411: detail.positiveBonusApplied,
    \u989D\u5916\u8D1F\u5411: detail.negativeBonusApplied,
    \u7EFC\u5408\u597D\u611F\u7CFB\u6570: detail.coefficient,
    \u7CFB\u6570\u8870\u51CF: detail.coefficientDecay,
    \u7CFB\u6570\u52A0\u6210: detail.coefficientBoost,
    \u65B0\u7684\u7EFC\u5408\u597D\u611F: detail.nextAffinity,
    \u65B0\u7684\u957F\u671F\u597D\u611F: detail.longTerm,
    \u65B0\u7684\u77ED\u671F\u597D\u611F: detail.shortTerm,
    \u957F\u671F\u8C03\u6574: detail.longTermShift,
    \u804A\u5929\u6B21\u6570: detail.chatCount,
    \u8C03\u6574\u5386\u53F2: detail.historyStats,
    \u4E34\u65F6\u5C01\u7981: detail.temporaryBlocked ? "\u662F" : "\u5426",
    \u4E34\u65F6\u60E9\u7F5A: detail.temporaryPenalty,
    \u4E34\u65F6\u5230\u671F: detail.temporaryExpiresAt ? String(detail.temporaryExpiresAt) : "\u2014\u2014",
    \u7528\u6237id: detail.userId,
    \u7528\u6237\u6635\u79F0: detail.nickname || ""
  });
  const formatActionCounts = (counts) => {
    const safe = counts || {};
    const increase = Number(safe.increase) || 0;
    const decrease = Number(safe.decrease) || 0;
    const hold = Number(safe.hold) || 0;
    return `\u63D0\u5347 ${increase} / \u964D\u4F4E ${decrease} / \u4FDD\u6301 ${hold}`;
  };
  const resolveIncreaseLimit = () => {
    if (Number.isFinite(config.maxIncreasePerMessage)) return Math.abs(config.maxIncreasePerMessage);
    return 5;
  };
  const resolveDecreaseLimit = () => {
    if (Number.isFinite(config.maxDecreasePerMessage)) return Math.abs(config.maxDecreasePerMessage);
    return 5;
  };
  const executeAnalysis = async (session, botReply) => {
    const channelId = session?.guildId || session?.channelId || session?.roomId || "";
    if (shortTermConfig.enabled) {
      const tempEntry = temporaryManager.isBlocked(session?.platform, session?.userId);
      if (tempEntry) {
        if (debugEnabled) log("debug", "\u7528\u6237\u5904\u4E8E\u77ED\u671F\u62C9\u9ED1\u540D\u5355\uFF0C\u8DF3\u8FC7\u5206\u6790", { platform: session?.platform, userId: session?.userId, expiresAt: tempEntry.expiresAt });
        return;
      }
    }
    if (config.enableAutoBlacklist && store.isBlacklisted(session?.platform, session?.userId, channelId)) {
      cache.clear(session?.platform, session?.userId);
      if (debugEnabled) log("debug", "\u7528\u6237\u5904\u4E8E\u81EA\u52A8\u62C9\u9ED1\u540D\u5355\uFF0C\u8DF3\u8FC7\u5206\u6790", { platform: session?.platform, userId: session?.userId });
      return;
    }
    const tempBlacklistEntry = store.isTemporarilyBlacklisted(session?.platform, session?.userId);
    if (tempBlacklistEntry) {
      if (debugEnabled) log("debug", "\u7528\u6237\u5904\u4E8E\u4E34\u65F6\u62C9\u9ED1\u540D\u5355\uFF0C\u8DF3\u8FC7\u5206\u6790", { platform: session?.platform, userId: session?.userId, expiresAt: tempBlacklistEntry.expiresAt });
      return;
    }
    const nicknames = await resolveTriggerNicknames(ctx, config);
    if (!shouldAnalyzeSession(session, nicknames, log, debugEnabled)) return;
    if (!session?.platform || !session?.userId) return;
    try {
      const manual = store.findManualRelationship(session.platform, session.userId);
      const hasManualOverride = !!manual?.relation;
      const conditionalClamp = (value) => hasManualOverride ? Math.round(value) : store.clamp(value);
      const result = await store.ensure(session, clampValue);
      const now = /* @__PURE__ */ new Date();
      const storedShortTerm = Number(result.shortTermAffinity ?? 0);
      const storedLongTerm = Number(result.longTermAffinity ?? result.affinity ?? 0);
      const baselineShortTerm = Math.round(storedShortTerm);
      const baselineState = hasManualOverride ? { affinity: Math.round(storedLongTerm), longTermAffinity: Math.round(storedLongTerm), shortTermAffinity: baselineShortTerm } : store.composeState(storedLongTerm, baselineShortTerm);
      let longTermTarget = baselineState.longTermAffinity;
      const initialLongTerm = longTermTarget;
      const initialShortTerm = baselineShortTerm;
      const previousCoefficient = Number.isFinite(result.coefficientState?.coefficient) ? result.coefficientState.coefficient : coefficientRules.base;
      const oldAffinity = conditionalClamp(previousCoefficient * longTermTarget);
      let historyLines = await history.fetch(session);
      const currentUserMessage = session.content ?? "";
      const currentUserId = session.userId;
      if (debugEnabled) log("debug", "\u8BFB\u53D6\u5DF2\u6709\u597D\u611F\u5EA6", {
        userId: session.userId,
        platform: session.platform,
        affinity: oldAffinity,
        shortTerm: baselineShortTerm,
        longTerm: longTermTarget,
        actionStats: result.actionStats,
        chatCount: result.chatCount,
        lastInteractionAt: result.lastInteractionAt,
        coefficientState: result.coefficientState
      });
      if (currentUserMessage && currentUserId) {
        const originalLength = historyLines.length;
        for (let i = historyLines.length - 1; i >= 0; i--) {
          const line = historyLines[i];
          if (line.includes(currentUserId) && line.includes(currentUserMessage.trim())) {
            historyLines.splice(i, 1);
            if (debugEnabled) log("debug", "\u4ECE\u5386\u53F2\u4E2D\u79FB\u9664\u672C\u6B21\u7528\u6237\u6D88\u606F", { removedLine: line.substring(0, 100), position: i, totalLines: originalLength });
            break;
          }
        }
      }
      if (debugEnabled) log("debug", "\u5386\u53F2\u6D88\u606F\u548Cbot\u56DE\u590D", {
        historyCount: historyLines.length,
        hasBotReply: !!botReply,
        botReplyPreview: botReply ? botReply.substring(0, 100) : "",
        historyPreview: historyLines.slice(-3).join("\n")
      });
      const personaText = resolvePersonaPreset(session);
      const maxIncreaseLimit = resolveIncreaseLimit();
      const maxDecreaseLimit = resolveDecreaseLimit();
      const nowMs = now.getTime();
      const summarizedActions = summarizeActionEntries(result?.actionStats?.entries, actionWindow.windowMs, nowMs);
      const windowChatCount = summarizedActions.total;
      const actionCountsText = formatActionCounts(summarizedActions.counts);
      const streak = computeDailyStreak(result.coefficientState?.streak, result.coefficientState?.lastInteractionAt, now);
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayStartMs = todayStart.getTime();
      const todayActions = (result?.actionStats?.entries || []).filter((entry) => {
        const entryTime = typeof entry.timestamp === "object" && entry.timestamp !== null && "getTime" in entry.timestamp ? entry.timestamp.getTime() : entry.timestamp;
        return entryTime >= todayStartMs && entryTime <= nowMs;
      });
      const todayIncreaseCount = todayActions.filter((entry) => entry.action === "increase").length;
      const todayDecreaseCount = todayActions.filter((entry) => entry.action === "decrease").length;
      const nextCoefficientState = computeCoefficientValue(coefficientRules, streak, result.coefficientState?.lastInteractionAt, now, todayIncreaseCount, todayDecreaseCount);
      const prompt = renderTemplate2(config.analysisPrompt, {
        currentAffinity: oldAffinity,
        minAffinity: config.min,
        maxAffinity: config.max,
        maxIncreasePerMessage: maxIncreaseLimit,
        maxDecreasePerMessage: maxDecreaseLimit,
        historyCount: historyLines.length,
        historyText: historyLines.join("\n"),
        historyJson: JSON.stringify(historyLines, null, 2),
        userMessage: session.content ?? "",
        botReply: botReply || "",
        shortTermAffinity: baselineShortTerm,
        longTermAffinity: longTermTarget,
        shortTermPromoteThreshold: shortTermRules.promoteThreshold,
        shortTermDemoteThreshold: shortTermRules.demoteThreshold,
        actionStatsText: summarizedActions.entries.length ? `${summarizedActions.entries.length} \u6761\u6709\u6548\u8BB0\u5F55` : "\u6682\u65E0\u8BB0\u5F55",
        recentActionWindowHours: actionWindow.windowHours,
        recentActionCountsText: actionCountsText,
        chatCount: windowChatCount,
        longTermCoefficient: nextCoefficientState.coefficient,
        persona: personaText || "",
        personaPreset: personaText || ""
      });
      const model = getModel();
      if (!model) {
        log("warn", "\u6A21\u578B\u5C1A\u672A\u5C31\u7EEA\uFF0C\u8DF3\u8FC7\u5206\u6790", { userId: session.userId, platform: session.platform });
        return;
      }
      const message = await model.invoke(prompt);
      const text = getMessageContent2(message?.content ?? message);
      const jsonCandidate = typeof text === "string" ? text : String(text ?? "");
      const match = jsonCandidate.match(/\{[\s\S]*\}/);
      let delta = 0;
      const author = session?.author;
      const user = session?.user;
      const nickname = author?.nickname || author?.name || user?.nickname || user?.name || session?.username || session?.nickname || "";
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          const raw = typeof parsed.delta === "number" ? parsed.delta : parseInt(String(parsed.delta), 10);
          if (Number.isFinite(raw)) delta = Math.trunc(raw);
          const action = typeof parsed.action === "string" ? parsed.action.toLowerCase() : "";
          if (action === "increase" && delta <= 0) delta = Math.max(1, Math.abs(delta));
          if (action === "decrease" && delta >= 0) delta = -Math.max(1, Math.abs(delta));
          if (action === "hold") delta = 0;
          if (debugEnabled) log("info", "\u6A21\u578B\u8FD4\u56DE", describeModelResponse({ parsed, delta, action, session, nickname }));
        } catch (error) {
          log("warn", "\u89E3\u6790\u6A21\u578B\u54CD\u5E94\u5931\u8D25", { text: jsonCandidate, error });
        }
      }
      const positiveLimit = resolveIncreaseLimit();
      const negativeLimit = resolveDecreaseLimit();
      const limitedDelta = delta >= 0 ? Math.min(delta, positiveLimit) : Math.max(delta, -negativeLimit);
      const eligibleChatCount = summarizedActions.total;
      const bonusEligible = eligibleChatCount > actionWindow.bonusChatThreshold;
      const positiveBonus = bonusEligible ? actionWindow.increaseBonus || 0 : 0;
      const negativeBonus = bonusEligible ? actionWindow.decreaseBonus || 0 : 0;
      const allowOverflow = Boolean(actionWindow.allowBonusOverflow);
      const positiveCapacity = allowOverflow ? Math.max(0, positiveBonus) : Math.max(0, Math.min(positiveLimit - limitedDelta, positiveBonus));
      const negativeCapacity = allowOverflow ? Math.max(0, negativeBonus) : Math.max(0, Math.min(negativeLimit - Math.abs(limitedDelta), negativeBonus));
      const extraFromHistory = limitedDelta > 0 ? positiveCapacity : limitedDelta < 0 ? -negativeCapacity : 0;
      const appliedDelta = limitedDelta + extraFromHistory;
      const actionType = limitedDelta > 0 ? "increase" : limitedDelta < 0 ? "decrease" : "hold";
      let workingShortTerm = baselineShortTerm + appliedDelta;
      let longTermShift = 0;
      let longTermChanged = false;
      let temporaryBlockTriggered = false;
      let temporaryBlockExpiresAt = null;
      let temporaryPenaltyApplied = 0;
      if (workingShortTerm >= shortTermRules.promoteThreshold) {
        longTermShift = shortTermRules.longTermPromoteStep;
        longTermTarget = conditionalClamp(longTermTarget + longTermShift);
        workingShortTerm = computeShortTermReset();
        longTermChanged = true;
      } else if (workingShortTerm <= shortTermRules.demoteThreshold) {
        longTermShift = -shortTermRules.longTermDemoteStep;
        longTermTarget = conditionalClamp(longTermTarget + longTermShift);
        workingShortTerm = computeShortTermReset();
        longTermChanged = true;
      }
      if (shortTermConfig.enabled && actionType === "decrease") {
        const key = `${session.platform || "unknown"}:${session.userId || "anonymous"}`;
        const historyEntry = shortTermTriggerMap.get(key) || [];
        const filteredHistory = historyEntry.filter((ts) => nowMs - ts < shortTermConfig.windowMs);
        filteredHistory.push(nowMs);
        shortTermTriggerMap.set(key, filteredHistory);
        if (filteredHistory.length >= shortTermConfig.decreaseThreshold) {
          const activation = temporaryManager.activate(session.platform, session.userId, nickname, now);
          if (activation?.activated) {
            filteredHistory.length = 0;
            temporaryBlockTriggered = true;
            temporaryBlockExpiresAt = activation.entry?.expiresAt ?? null;
            temporaryPenaltyApplied = Math.max(0, shortTermConfig.penalty || 0);
            if (temporaryPenaltyApplied > 0) {
              longTermTarget = conditionalClamp(longTermTarget - temporaryPenaltyApplied);
              longTermShift -= temporaryPenaltyApplied;
              longTermChanged = true;
            }
            const replyTemplate = config.shortTermBlacklist?.replyTemplate;
            if (replyTemplate) {
              const groupNickname = await resolveGroupNickname(session);
              const replyText = replyTemplate.replace(/\{\{nickname\}\}/g, groupNickname || session.userId).replace(/\{\{@user\}\}/g, `<at id="${session.userId}"/>`).replace(/\{\{duration\}\}/g, String(shortTermOptions.durationHours)).replace(/\{\{penalty\}\}/g, String(temporaryPenaltyApplied));
              session.send?.(replyText).catch(() => {
              });
            }
          }
        }
      }
      const combinedState = hasManualOverride ? { affinity: Math.round(longTermTarget), longTermAffinity: Math.round(longTermTarget), shortTermAffinity: Math.round(workingShortTerm) } : store.composeState(longTermTarget, workingShortTerm);
      const nextCompositeAffinity = conditionalClamp(nextCoefficientState.coefficient * combinedState.longTermAffinity);
      const shortTermChanged = combinedState.shortTermAffinity !== result.shortTermAffinity || appliedDelta !== 0;
      const hasChanges = nextCompositeAffinity !== oldAffinity || shortTermChanged || longTermChanged;
      const actionEntries = appendActionEntry(result.actionStats?.entries, actionType, nowMs, actionWindow.maxEntries);
      const summarizedNextActions = summarizeActionEntries(actionEntries, actionWindow.windowMs, nowMs);
      const nextCounts = summarizedNextActions.counts;
      const nextChatCount = (result.chatCount || 0) + 1;
      const shouldPersist = hasChanges || actionType === "hold";
      if (shouldPersist) {
        const level = store.resolveLevelByAffinity(nextCompositeAffinity);
        const extra = {
          longTermAffinity: combinedState.longTermAffinity,
          shortTermAffinity: combinedState.shortTermAffinity,
          actionStats: { entries: actionEntries, total: summarizedNextActions.total, counts: nextCounts },
          chatCount: nextChatCount,
          coefficientState: {
            streak,
            coefficient: nextCoefficientState.coefficient,
            decayPenalty: nextCoefficientState.decayPenalty,
            streakBoost: nextCoefficientState.streakBoost,
            inactivityDays: nextCoefficientState.inactivityDays,
            lastInteractionAt: now
          },
          lastInteractionAt: now
        };
        await store.save({ platform: session.platform, userId: session.userId, selfId: session?.selfId, session }, combinedState.affinity, level?.relation ?? "", extra);
        cache.set(session.platform, session.userId, nextCompositeAffinity);
        if (hasChanges) {
          log("info", "\u597D\u611F\u5EA6\u5DF2\u66F4\u65B0", describeAffinityUpdate({
            originalAffinity: oldAffinity,
            initialLongTerm,
            initialShortTerm,
            limitedDelta,
            positiveBonusApplied: extraFromHistory > 0 ? extraFromHistory : 0,
            negativeBonusApplied: extraFromHistory < 0 ? Math.abs(extraFromHistory) : 0,
            coefficient: nextCoefficientState.coefficient,
            coefficientDecay: nextCoefficientState.decayPenalty,
            coefficientBoost: nextCoefficientState.streakBoost,
            nextAffinity: nextCompositeAffinity,
            shortTerm: combinedState.shortTermAffinity,
            longTerm: combinedState.longTermAffinity,
            longTermShift,
            chatCount: summarizedNextActions.total,
            historyStats: nextCounts,
            temporaryBlocked: temporaryBlockTriggered,
            temporaryPenalty: temporaryPenaltyApplied,
            temporaryExpiresAt: temporaryBlockExpiresAt,
            userId: session.userId,
            nickname
          }));
        }
      }
      if (config.enableAutoBlacklist && nextCompositeAffinity < config.blacklistThreshold) {
        const resultBlack = await tryBlacklistUser(ctx, session, store, cache, log);
        if (resultBlack?.recorded) {
          temporaryManager.clear(session.platform, session.userId);
          const replyTemplate = config.autoBlacklistReply;
          if (replyTemplate) {
            const groupNickname = await resolveGroupNickname(session);
            const replyText = replyTemplate.replace(/\{\{nickname\}\}/g, groupNickname || session.userId).replace(/\{\{@user\}\}/g, `<at id="${session.userId}"/>`);
            session.send?.(replyText).catch(() => {
            });
          }
        }
      }
    } catch (error) {
      log("warn", "\u5206\u6790\u6D41\u7A0B\u5F02\u5E38", error);
    }
  };
  const scheduleAnalysis = (session) => {
    resolveTriggerNicknames(ctx, config).then((names) => {
      if (shouldAnalyzeSession(session, names, log, debugEnabled)) {
        const channelId = session?.guildId || session?.channelId || session?.roomId || "dm";
        const key = `${session.platform}:${channelId}:${session.userId}`;
        pendingAnalysis.set(key, { session, timestamp: Date.now(), botReplies: [], timer: null });
      }
    });
  };
  const addBotReply = (session, botReply) => {
    if (!botReply) return;
    const channelId = session?.guildId || session?.channelId || session?.roomId || "dm";
    const platform = session?.platform;
    if (!platform) return;
    const now = Date.now();
    const timeout = 3e4;
    for (const [key, data] of pendingAnalysis.entries()) {
      if (now - data.timestamp > timeout) {
        if (data.timer) clearTimeout(data.timer);
        pendingAnalysis.delete(key);
      }
    }
    let matchedKey = null;
    let matchedData = null;
    if (session?.userId) {
      const fullKey = `${platform}:${channelId}:${session.userId}`;
      if (pendingAnalysis.has(fullKey)) {
        matchedKey = fullKey;
        matchedData = pendingAnalysis.get(fullKey);
      }
    }
    if (!matchedData) {
      for (const [key, data] of pendingAnalysis.entries()) {
        const dataChannelId = data.session?.guildId || data.session?.channelId || data.session?.roomId || "dm";
        if (data.session.platform === platform && dataChannelId === channelId) {
          matchedKey = key;
          matchedData = data;
          break;
        }
      }
    }
    if (matchedData && matchedKey) {
      matchedData.botReplies.push(botReply);
      if (matchedData.timer) clearTimeout(matchedData.timer);
      const capturedKey = matchedKey;
      const capturedData = matchedData;
      matchedData.timer = setTimeout(async () => {
        const botReplyText = capturedData.botReplies.join("\n");
        pendingAnalysis.delete(capturedKey);
        await executeAnalysis(capturedData.session, botReplyText);
      }, 3e3);
    }
  };
  const cancelScheduledAnalysis = (session) => {
    const channelId = session?.guildId || session?.channelId || session?.roomId || "dm";
    const platform = session?.platform;
    if (!platform) return;
    for (const [key, data] of pendingAnalysis.entries()) {
      const dataChannelId = data.session?.guildId || data.session?.channelId || data.session?.roomId || "dm";
      if (data.session.platform === platform && dataChannelId === channelId) {
        if (data.timer) clearTimeout(data.timer);
        return;
      }
    }
  };
  return {
    middleware: async (session, next) => {
      if (!config.enableAnalysis) return next();
      scheduleAnalysis(session);
      return next();
    },
    addBotReply,
    cancelScheduledAnalysis
  };
}

// src/services/schedule.ts
var import_zod2 = require("zod");
var import_koishi15 = require("koishi");
var import_tools2 = require("@langchain/core/tools");
function normalizeTime(value) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const match = text.match(/(\d{1,2})(?::(\d{1,2}))?/);
  if (!match) return null;
  let hour = Number(match[1]);
  let minute = Number(match[2] ?? "0");
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (hour === 24 && minute > 0) hour = 23;
  if (hour >= 24) {
    hour = 24;
    minute = 0;
  }
  hour = Math.max(0, Math.min(24, hour));
  minute = Math.max(0, Math.min(59, minute));
  const minutes = hour * 60 + minute;
  return { minutes, label: `${pad(Math.min(23, hour))}:${pad(minute)}`, raw: text };
}
function formatDateForDisplay(date, timezone) {
  try {
    const formatter = new Intl.DateTimeFormat("zh-CN", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", weekday: "long" });
    const parts = formatter.formatToParts(date);
    const year = parts.find((p) => p.type === "year")?.value || "";
    const month = parts.find((p) => p.type === "month")?.value || "";
    const day = parts.find((p) => p.type === "day")?.value || "";
    const weekday = parts.find((p) => p.type === "weekday")?.value || "";
    return { dateStr: `${year}\u5E74${month}\u6708${day}\u65E5`, weekday };
  } catch {
    return { dateStr: date.toLocaleDateString("zh-CN"), weekday: "\u672A\u77E5" };
  }
}
function getCurrentMinutes(timezone) {
  try {
    const now = /* @__PURE__ */ new Date();
    const formatter = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hour12: false });
    const parts = formatter.formatToParts(now);
    const hour = Number(parts.find((p) => p.type === "hour")?.value || 0);
    const minute = Number(parts.find((p) => p.type === "minute")?.value || 0);
    return hour * 60 + minute;
  } catch {
    const now = /* @__PURE__ */ new Date();
    return now.getHours() * 60 + now.getMinutes();
  }
}
var globalScheduleCache = /* @__PURE__ */ new Map();
function createScheduleManager(ctx, config, deps) {
  const { getModel, getMessageContent: getMessageContent2, resolvePersonaPreset, renderSchedule, log } = deps;
  const scheduleConfig = config.schedule || {};
  const enabled = scheduleConfig.enabled !== false;
  const timezone = scheduleConfig.timezone || "Asia/Shanghai";
  const cacheKey = `schedule_${config.schedule?.variableName || "default"}`;
  const cached = globalScheduleCache.get(cacheKey);
  let cachedSchedule = cached?.schedule || null;
  let cachedDate = cached?.date || null;
  let pendingGeneration = null;
  let lastSessionRef;
  let intervalHandle = null;
  let retryIntervalHandle = null;
  const stopRetryInterval = () => {
    if (retryIntervalHandle) {
      retryIntervalHandle();
      retryIntervalHandle = null;
    }
  };
  const invalidateScheduleCache = () => {
    cachedSchedule = null;
    cachedDate = null;
    globalScheduleCache.delete(cacheKey);
  };
  const pickField = (source, fields) => {
    for (const key of fields) {
      if (!source || !(key in source)) continue;
      const value = source[key];
      if (value === void 0 || value === null) continue;
      const text = String(value).trim();
      if (text) return text;
    }
    return "";
  };
  const buildSummary = (title, detail) => {
    const head = title || "\u65E5\u7A0B";
    const body = detail ? detail.trim() : "";
    if (!body) return head;
    const joiner = body.startsWith("\u3002") ? "" : "\u3002";
    return `${head}${joiner}${body}`;
  };
  const derivePersonaTag = (persona) => {
    const text = String(persona || "").trim();
    if (!text) return "\u6211";
    const lines = text.replace(/\r/g, "").split("\n").map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return "\u6211";
    const first = lines[0];
    if (first.length <= 12) return first;
    return first.slice(0, 12);
  };
  const normalizeEntries = (items, dateText, personaTag) => {
    if (!Array.isArray(items) || !items.length) return null;
    const normalized = [];
    for (const item of items) {
      const record = item;
      const start2 = normalizeTime(pickField(record, ["start", "from", "begin", "time", "startTime"]));
      const end = normalizeTime(pickField(record, ["end", "to", "finish", "stop", "endTime"]));
      if (!start2 || !end && normalized.length && normalized[normalized.length - 1].endMinutes === start2.minutes) continue;
      const activity = pickField(record, ["activity", "title", "name", "label", "task"]) || "\u65E5\u7A0B";
      const detail = pickField(record, ["detail", "description", "note", "summary", "mood"]);
      const endMinutes = end ? end.minutes : Math.min(1440, start2.minutes + 90);
      const safeEnd = endMinutes <= start2.minutes ? Math.min(1440, start2.minutes + 60) : Math.min(1440, endMinutes);
      normalized.push({
        start: start2.label,
        end: pad(Math.floor(safeEnd / 60)) + ":" + pad(safeEnd % 60),
        startMinutes: start2.minutes,
        endMinutes: safeEnd,
        summary: buildSummary(activity, detail || `${personaTag}\u4FDD\u6301\u7740\u89D2\u8272\u72B6\u6001`)
      });
    }
    if (!normalized.length) return null;
    normalized.sort((a, b) => a.startMinutes - b.startMinutes);
    return normalized;
  };
  const formatLines = (schedule) => {
    const lines = [];
    lines.push(schedule.title || "\u{1F4C5} \u4ECA\u65E5\u65E5\u7A0B");
    if (schedule.description) lines.push("", schedule.description);
    for (const entry of schedule.entries) {
      const text = `  \u23F0 ${entry.start}-${entry.end}  ${entry.summary}`;
      lines.push("", text);
    }
    return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  };
  const applyPromptTemplate = (template, variables) => {
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
      const value = variables[key];
      return value === void 0 || value === null ? "" : String(value);
    });
  };
  const parseScheduleResponse = (text, personaTag) => {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      const data = JSON.parse(match[0]);
      const now = /* @__PURE__ */ new Date();
      const { dateStr } = formatDateForDisplay(now, timezone);
      const entries = normalizeEntries(data.entries || [], dateStr, personaTag);
      if (!entries) return null;
      const schedule = {
        source: "model",
        date: dateStr,
        title: data.title && String(data.title).trim() || "\u{1F4C5} \u4ECA\u65E5\u65E5\u7A0B",
        description: typeof data.description === "string" ? data.description.trim() : "",
        entries,
        text: ""
      };
      schedule.text = formatLines(schedule);
      return schedule;
    } catch (error) {
      log("warn", "\u89E3\u6790\u65E5\u7A0B\u54CD\u5E94\u5931\u8D25", error);
      return null;
    }
  };
  const generateSchedule = async (session) => {
    const model = getModel();
    if (!model?.invoke) {
      log("warn", "\u6A21\u578B\u5C1A\u672A\u5C31\u7EEA\uFF0C\u65E0\u6CD5\u751F\u6210\u65E5\u7A0B");
      return null;
    }
    const now = /* @__PURE__ */ new Date();
    const { dateStr, weekday } = formatDateForDisplay(now, timezone);
    const personaText = resolvePersonaPreset(session) || "\uFF08\u6682\u65E0\u989D\u5916\u8BBE\u5B9A\uFF0C\u53EF\u6309\u6E29\u548C\u53CB\u5584\u7684\u5E74\u8F7B\u4EBA\uFF09";
    const personaTag = derivePersonaTag(personaText);
    const prompt = applyPromptTemplate(scheduleConfig.prompt || "", {
      date: dateStr,
      weekday,
      persona: personaText,
      personaPreset: personaText
    });
    try {
      const response = await model.invoke(prompt);
      const text = getMessageContent2(response?.content ?? response);
      const schedule = parseScheduleResponse(typeof text === "string" ? text : String(text ?? ""), personaTag);
      if (schedule) {
        cachedSchedule = schedule;
        cachedDate = dateStr;
        globalScheduleCache.set(cacheKey, { schedule, date: dateStr });
        log("info", "\u65E5\u7A0B\u5DF2\u751F\u6210", { date: dateStr, entriesCount: schedule.entries.length });
      }
      return schedule;
    } catch (error) {
      log("warn", "\u751F\u6210\u65E5\u7A0B\u5931\u8D25", error);
      return null;
    }
  };
  const ensureSchedule = async (session, retryCount = 0) => {
    if (!enabled) return null;
    const now = /* @__PURE__ */ new Date();
    const { dateStr } = formatDateForDisplay(now, timezone);
    if (session) lastSessionRef = session;
    if (cachedSchedule && cachedDate === dateStr) {
      stopRetryInterval();
      return cachedSchedule;
    }
    if (pendingGeneration) {
      return pendingGeneration;
    }
    const maxRetries = 3;
    pendingGeneration = (async () => {
      try {
        const result = await generateSchedule(session || lastSessionRef);
        if (result) {
          stopRetryInterval();
        }
        if (!result && retryCount < maxRetries - 1) {
          log("warn", `\u65E5\u7A0B\u751F\u6210\u5931\u8D25\uFF0C${retryCount + 1}/${maxRetries} \u6B21\u91CD\u8BD5\u4E2D...`);
          pendingGeneration = null;
          await new Promise((resolve2) => setTimeout(resolve2, 2e3 * (retryCount + 1)));
          return ensureSchedule(session, retryCount + 1);
        }
        if (!result && retryCount >= maxRetries - 1) {
          log("warn", `\u65E5\u7A0B\u751F\u6210\u5931\u8D25\uFF0C\u5DF2\u8FBE\u5230\u6700\u5927\u91CD\u8BD5\u6B21\u6570 ${maxRetries}`);
        }
        if (result) stopRetryInterval();
        return result;
      } catch (error) {
        if (retryCount < maxRetries - 1) {
          log("warn", `\u65E5\u7A0B\u751F\u6210\u5F02\u5E38\uFF0C${retryCount + 1}/${maxRetries} \u6B21\u91CD\u8BD5`, error);
          pendingGeneration = null;
          await new Promise((resolve2) => setTimeout(resolve2, 2e3 * (retryCount + 1)));
          return ensureSchedule(session, retryCount + 1);
        }
        log("warn", `\u65E5\u7A0B\u751F\u6210\u5F02\u5E38\uFF0C\u5DF2\u8FBE\u5230\u6700\u5927\u91CD\u8BD5\u6B21\u6570 ${maxRetries}`, error);
        return null;
      } finally {
        pendingGeneration = null;
      }
    })();
    return pendingGeneration;
  };
  const getSchedule = async (session) => {
    if (!enabled) return null;
    if (session) lastSessionRef = session;
    return cachedSchedule;
  };
  const getScheduleText = async (session) => {
    const schedule = await getSchedule(session);
    return schedule?.text || "";
  };
  const getCurrentSummary = async (session) => {
    if (!enabled) return "";
    const schedule = await getSchedule(session);
    if (!schedule || !schedule.entries.length) return "";
    const currentMinutes = getCurrentMinutes(timezone);
    const current = schedule.entries.find((e) => currentMinutes >= e.startMinutes && currentMinutes < e.endMinutes);
    if (current) return current.summary;
    return schedule.description || "";
  };
  const renderImage = async (schedule) => {
    if (!schedule || !schedule.entries.length) return null;
    try {
      return await renderSchedule({
        title: schedule.title || scheduleConfig.title || "\u4ECA\u65E5\u65E5\u7A0B",
        description: schedule.description || "",
        entries: schedule.entries,
        date: schedule.date
      });
    } catch (error) {
      log("warn", "\u65E5\u7A0B\u56FE\u7247\u6E32\u67D3\u5931\u8D25", error);
      return null;
    }
  };
  const registerVariables = () => {
    if (!enabled) return;
    const variableName = scheduleConfig.variableName || "schedule";
    const currentVariableName = scheduleConfig.currentVariableName || "currentSchedule";
    const chatluna = ctx.chatluna;
    if (!chatluna?.promptRenderer?.registerFunctionProvider) return;
    chatluna.promptRenderer.registerFunctionProvider(variableName, async (_args, _vars, configurable) => {
      const payload = await getSchedule(configurable?.session);
      return payload?.text || "";
    });
    chatluna.promptRenderer.registerFunctionProvider(currentVariableName, async (_args, _vars, configurable) => {
      const summary = await getCurrentSummary(configurable?.session);
      return summary || "";
    });
  };
  const registerTool = (plugin) => {
    if (!enabled || scheduleConfig.registerTool === false) return;
    const toolName = scheduleConfig.toolName || "daily_schedule";
    plugin.registerTool(toolName, {
      selector: () => true,
      // @ts-expect-error - Type instantiation depth issue with zod + StructuredTool
      createTool: () => new class extends import_tools2.StructuredTool {
        name = toolName;
        description = "Returns today's full schedule as plain text.";
        schema = import_zod2.z.object({});
        async _call(_input, _manager, runnable) {
          const session = runnable?.configurable?.session;
          const payload = await getSchedule(session);
          if (!payload) return enabled ? "\u4ECA\u65E5\u6682\u672A\u751F\u6210\u65E5\u7A0B\u3002" : "\u5F53\u524D\u672A\u542F\u7528\u65E5\u7A0B\u529F\u80FD\u3002";
          return payload.text;
        }
      }()
    });
  };
  const registerCommand = () => {
    if (!enabled) return;
    ctx.command("affinity.schedule", "\u67E5\u770B\u4ECA\u65E5\u65E5\u7A0B", { authority: 2 }).alias("\u4ECA\u65E5\u65E5\u7A0B").action(async ({ session }) => {
      const schedule = await getSchedule(session);
      if (!schedule) return "\u6682\u65E0\u4ECA\u65E5\u65E5\u7A0B\u3002";
      if (scheduleConfig.renderAsImage) {
        const buffer = await renderImage(schedule);
        if (buffer) return import_koishi15.h.image(buffer, "image/png");
        return `${schedule.text || "\u6682\u65E0\u4ECA\u65E5\u65E5\u7A0B\u3002"}
\uFF08\u65E5\u7A0B\u56FE\u7247\u6E32\u67D3\u5931\u8D25\uFF0C\u5DF2\u6539\u4E3A\u6587\u672C\u6A21\u5F0F\uFF09`;
      }
      return schedule.text || "\u6682\u65E0\u4ECA\u65E5\u65E5\u7A0B\u3002";
    });
    ctx.command("affinity.schedule.refresh", "\u91CD\u65B0\u751F\u6210\u4ECA\u65E5\u65E5\u7A0B", { authority: 4 }).alias("\u5237\u65B0\u65E5\u7A0B").alias("\u91CD\u751F\u65E5\u7A0B").action(async ({ session }) => {
      const regenerated = await regenerateSchedule(session);
      if (regenerated) {
        return "\u5DF2\u91CD\u65B0\u751F\u6210\u4ECA\u65E5\u65E5\u7A0B\u3002";
      }
      startRetryInterval();
      return "\u91CD\u65B0\u751F\u6210\u5931\u8D25\uFF0C\u5C06\u7EE7\u7EED\u6BCF10\u5206\u949F\u5C1D\u8BD5\u4E00\u6B21\u3002";
    });
  };
  const startRetryInterval = () => {
    if (retryIntervalHandle) return;
    retryIntervalHandle = ctx.setInterval(async () => {
      const now = /* @__PURE__ */ new Date();
      const { dateStr } = formatDateForDisplay(now, timezone);
      if (cachedSchedule && cachedDate === dateStr) {
        stopRetryInterval();
        return;
      }
      log("info", "\u65E5\u7A0B\u751F\u6210\u91CD\u8BD5\u4E2D...");
      const result = await ensureSchedule();
      if (result) {
        log("info", "\u65E5\u7A0B\u91CD\u8BD5\u751F\u6210\u6210\u529F");
        stopRetryInterval();
      }
    }, 10 * 60 * 1e3);
  };
  const start = () => {
    if (!enabled) return;
    if (intervalHandle) return;
    const now = /* @__PURE__ */ new Date();
    const { dateStr } = formatDateForDisplay(now, timezone);
    if (cachedSchedule && cachedDate === dateStr) {
      log("debug", "\u4ECE\u7F13\u5B58\u6062\u590D\u4ECA\u65E5\u65E5\u7A0B", { date: dateStr });
    } else {
      const startDelay = scheduleConfig.startDelay ?? 3e3;
      log("debug", `\u65E5\u7A0B\u751F\u6210\u5C06\u5728 ${startDelay}ms \u540E\u542F\u52A8`);
      ctx.setTimeout(() => {
        ensureSchedule().then((result) => {
          if (!result) {
            log("warn", "\u65E5\u7A0B\u521D\u59CB\u5316\u5931\u8D25\uFF0C\u5C06\u6BCF10\u5206\u949F\u91CD\u8BD5\u4E00\u6B21");
            startRetryInterval();
          }
        }).catch((error) => {
          log("warn", "\u521D\u59CB\u5316\u65E5\u7A0B\u5931\u8D25", error);
          startRetryInterval();
        });
      }, startDelay);
    }
    const dispose = ctx.setInterval(async () => {
      try {
        const result = await ensureSchedule();
        if (!result && !retryIntervalHandle) {
          const checkNow = /* @__PURE__ */ new Date();
          const { dateStr: checkDate } = formatDateForDisplay(checkNow, timezone);
          if (cachedDate !== checkDate) {
            startRetryInterval();
          }
        }
      } catch (error) {
        log("warn", "\u5B9A\u65F6\u5237\u65B0\u65E5\u7A0B\u5931\u8D25", error);
      }
    }, 60 * 1e3);
    intervalHandle = dispose;
  };
  const regenerateSchedule = async (session) => {
    invalidateScheduleCache();
    stopRetryInterval();
    return ensureSchedule(session);
  };
  return {
    enabled,
    registerVariables,
    registerTool,
    registerCommand,
    start,
    regenerateSchedule,
    getSchedule,
    getScheduleText,
    getCurrentSummary,
    renderImage
  };
}

// src/utils/role-mapper.ts
var ROLE_MAPPING = {
  direct: {
    "owner": "\u7FA4\u4E3B",
    "\u7FA4\u4E3B": "\u7FA4\u4E3B",
    "\u4E3B\u4EBA": "\u7FA4\u4E3B",
    "\u623F\u4E3B": "\u7FA4\u4E3B",
    "\u4F1A\u957F": "\u7FA4\u4E3B",
    "\u56E2\u957F": "\u7FA4\u4E3B",
    "admin": "\u7BA1\u7406\u5458",
    "administrator": "\u7BA1\u7406\u5458",
    "manager": "\u7BA1\u7406\u5458",
    "\u7BA1\u7406\u5458": "\u7BA1\u7406\u5458",
    "\u7BA1\u7406": "\u7BA1\u7406\u5458",
    "member": "\u7FA4\u5458",
    "members": "\u7FA4\u5458",
    "normal": "\u7FA4\u5458",
    "user": "\u7FA4\u5458",
    "participant": "\u7FA4\u5458",
    "\u7FA4\u5458": "\u7FA4\u5458",
    "\u6210\u5458": "\u7FA4\u5458",
    "\u666E\u901A\u6210\u5458": "\u7FA4\u5458",
    "\u666E\u901A\u7FA4\u5458": "\u7FA4\u5458"
  },
  keywords: { owner: ["owner", "host", "leader", "master", "boss"], admin: ["admin", "manager", "moderator", "administrator"], member: ["member", "user", "participant", "normal"] },
  numeric: { "2": "\u7FA4\u4E3B", "1": "\u7BA1\u7406\u5458", "0": "\u7FA4\u5458" }
};
function translateRole(value) {
  if (value == null) return { role: "\u7FA4\u5458", matched: false, raw: value };
  if (Array.isArray(value)) {
    let fallback = { role: "\u7FA4\u5458", matched: false, raw: void 0 };
    for (const item of value) {
      const candidate = translateRole(item);
      if (candidate.matched) return candidate;
      if (candidate.raw !== void 0 && fallback.raw === void 0) fallback = candidate;
    }
    return fallback;
  }
  if (typeof value === "object") {
    const keys = ["role", "roleName", "permission", "permissions", "title", "identity", "type", "level", "status", "roles"];
    let fallback = { role: "\u7FA4\u5458", matched: false, raw: void 0 };
    for (const key of keys) {
      if (!(key in value)) continue;
      const candidate = translateRole(value[key]);
      if (candidate.matched) return candidate;
      if (candidate.raw !== void 0 && fallback.raw === void 0) fallback = candidate;
    }
    return fallback;
  }
  const text = String(value).trim();
  if (!text) return { role: "\u7FA4\u5458", matched: false, raw: text };
  const lower = text.toLowerCase();
  if (ROLE_MAPPING.direct[text]) return { role: ROLE_MAPPING.direct[text], matched: true, raw: text };
  if (ROLE_MAPPING.direct[lower]) return { role: ROLE_MAPPING.direct[lower], matched: true, raw: text };
  if (/^\d+$/.test(text)) {
    const mapped = ROLE_MAPPING.numeric[text];
    if (mapped) return { role: mapped, matched: true, raw: text };
  }
  for (const [roleType, keywords] of Object.entries(ROLE_MAPPING.keywords)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        const role = roleType === "owner" ? "\u7FA4\u4E3B" : roleType === "admin" ? "\u7BA1\u7406\u5458" : "\u7FA4\u5458";
        return { role, matched: true, raw: text };
      }
    }
  }
  if (text.includes("\u7FA4\u4E3B") || text.includes("\u623F\u4E3B") || text.includes("\u4F1A\u957F") || text.includes("\u56E2\u957F")) return { role: "\u7FA4\u4E3B", matched: true, raw: text };
  if (text.includes("\u7BA1\u7406\u5458") || text.includes("\u7BA1\u7406")) return { role: "\u7BA1\u7406\u5458", matched: true, raw: text };
  if (text.includes("\u7FA4\u5458") || text.includes("\u6210\u5458") || text.includes("\u666E\u901A")) return { role: "\u7FA4\u5458", matched: true, raw: text };
  return { role: "\u7FA4\u5458", matched: false, raw: text };
}
function collectRoleCandidates(session, member) {
  const candidates = [];
  const visit = (value) => {
    if (value == null) return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (typeof value === "object") {
      const keys = ["role", "roleName", "permission", "permissions", "title", "identity", "type", "level", "status", "roles"];
      for (const key of keys) {
        if (key in value) visit(value[key]);
      }
      ;
      return;
    }
    candidates.push(value);
  };
  visit(member);
  visit(session?.member);
  visit(session?.author);
  visit(session?.event?.member);
  visit(session?.event?.sender);
  visit(session?.event?.operator);
  visit(session?.payload?.sender);
  visit(session?.user);
  visit(session?.self);
  visit(session?.bot?.user);
  visit(session?.event?.self);
  visit(session?.event?.bot);
  return candidates;
}
function resolveRoleLabel(session, member, options = {}) {
  const { logUnknown = false, logger: logger7 } = options;
  const unknownRoles = /* @__PURE__ */ new Set();
  const candidates = collectRoleCandidates(session, member);
  for (const candidate of candidates) {
    const { role, matched, raw } = translateRole(candidate);
    if (matched) return role;
    if (logUnknown && raw !== void 0 && raw !== null && raw !== "" && !unknownRoles.has(String(raw))) {
      unknownRoles.add(String(raw));
      if (typeof logger7 === "function") logger7("debug", "\u672A\u8BC6\u522B\u7684\u7FA4\u8EAB\u4EFD", { raw });
    }
  }
  return "\u7FA4\u5458";
}

// src/renders/member-info.ts
function translateGender(value) {
  if (value == null) return "";
  const text = String(value).trim();
  if (!text) return "";
  const lower = text.toLowerCase();
  if (["male", "man", "m", "1", "boy"].includes(lower)) return "\u7537";
  if (["female", "woman", "f", "2", "girl"].includes(lower)) return "\u5973";
  if (["\u672A\u77E5", "unknown", "0", "secret"].includes(lower)) return "";
  return text;
}
function collectNicknameCandidates(member, userId, fallbackNames = []) {
  const candidates = [member?.card, member?.remark, member?.displayName, member?.nick, member?.nickname, member?.name, member?.user?.nickname, member?.user?.name, ...fallbackNames, userId];
  return candidates.filter((v) => Boolean(v));
}
function renderInfoField(fieldName, member, session, options) {
  const { userId, log } = options;
  switch (fieldName) {
    case "nickname": {
      const nameCandidates = collectNicknameCandidates(member, userId, options.fallbackNames);
      const name2 = stripAtPrefix(nameCandidates[0] || "");
      return name2 ? `name:${name2}` : null;
    }
    case "userId":
      return userId ? `id:${userId}` : null;
    case "role": {
      const roleLabel = resolveRoleLabel(session, member, { logUnknown: options.logUnknown, logger: log }) || "\u7FA4\u5458";
      return `\u7FA4\u5185\u8EAB\u4EFD:${roleLabel}`;
    }
    case "level": {
      const level = pickFirst(member?.level, member?.levelName, member?.level_name, member?.level_info?.current_level, member?.level_info?.level);
      return level !== void 0 && level !== null && level !== "" ? `\u7FA4\u7B49\u7EA7:${level}` : null;
    }
    case "title": {
      const title = pickFirst(member?.title, member?.specialTitle, member?.special_title);
      return title ? `\u5934\u8854:${title}` : null;
    }
    case "gender": {
      const gender = translateGender(member?.sex ?? member?.gender ?? "");
      return gender ? `\u6027\u522B:${gender}` : null;
    }
    case "age": {
      const age = Number(member?.age);
      return Number.isFinite(age) && age > 0 ? `\u5E74\u9F84:${age}` : null;
    }
    case "area": {
      const area = pickFirst(member?.area, member?.region, member?.location);
      return area ? `\u5730\u533A:${area}` : null;
    }
    case "joinTime": {
      const ts = normalizeTimestamp(pickFirst(member?.join_time, member?.joined_at, member?.joinTime, member?.joinedAt, member?.joinTimestamp));
      const formatted = formatDateOnly(ts);
      return formatted ? `\u5165\u7FA4:${formatted}` : null;
    }
    case "lastSentTime": {
      const ts = normalizeTimestamp(pickFirst(member?.last_sent_time, member?.lastSentTime, member?.lastSpeakTimestamp));
      const formatted = formatDateTime(ts);
      return formatted ? `\u6D3B\u8DC3:${formatted}` : null;
    }
    default:
      return null;
  }
}
function renderMemberInfo(session, member, userId, configItems, options = {}) {
  const { fallbackNames = [], defaultItems = ["nickname", "userId", "role", "level", "title", "gender", "age", "area", "joinTime", "lastSentTime"], logUnknown = false, log } = options;
  const items = [];
  const configuredItems = Array.isArray(configItems) && configItems.length ? configItems : defaultItems;
  for (const item of configuredItems) {
    const key = String(item || "").trim();
    if (!key || items.includes(key)) continue;
    items.push(key);
  }
  if (!items.length) items.push("nickname", "userId");
  const parts = [];
  for (const item of items) {
    const rendered = renderInfoField(item, member, session, { userId, fallbackNames, logUnknown, log });
    if (rendered) parts.push(rendered);
  }
  if (!parts.length) return userId ? `id:${userId}` : "\u672A\u77E5\u7528\u6237";
  return parts.join(", ");
}
async function resolveUserInfo(session, configItems, fetchMemberFn, options = {}) {
  const userId = stripAtPrefix(session.userId || "");
  const candidates = [userId ? await fetchMemberFn(session, userId) : null, session?.member, session?.author, session?.event?.member, session?.event?.sender, session?.payload?.sender].filter(Boolean);
  const member = candidates[0] || null;
  return renderMemberInfo(session, member, userId, configItems, { ...options, fallbackNames: [session.username].filter((v) => Boolean(v)) });
}
async function resolveBotInfo(session, configItems, fetchMemberFn, options = {}) {
  const botId = stripAtPrefix(session.selfId || session.bot?.selfId || "");
  const candidates = [botId ? await fetchMemberFn(session, botId) : null, session?.self, session?.bot?.user, session?.event?.self, session?.event?.bot].filter(Boolean);
  const member = candidates[0] || null;
  const fallbacks = [session?.self?.nickname, session?.self?.name, session?.bot?.nickname, session?.bot?.name].filter((v) => Boolean(v));
  return renderMemberInfo(session, member, botId, configItems, { ...options, fallbackNames: fallbacks });
}
function normalizeGroupList(groups, options = {}) {
  const { includeMemberCount = true, includeCreateTime = true } = options;
  if (!Array.isArray(groups) || !groups.length) return "\u6682\u65E0\u7FA4\u4FE1\u606F\u3002";
  const lines = groups.map((group) => {
    const id = group.group_id ?? group.groupId ?? group.id ?? "\u672A\u77E5\u7FA4\u53F7";
    const name2 = group.group_name ?? group.groupName ?? group.name ?? "\u672A\u547D\u540D\u7FA4";
    const memberCount = group.member_count ?? group.memberCount ?? group.max_member_count;
    let createTime = "";
    if (includeCreateTime) {
      const raw = group.create_time ?? group.createTime;
      if (raw) {
        const timestamp = Number(raw);
        if (Number.isFinite(timestamp)) {
          const date = new Date(timestamp < 1e11 ? timestamp * 1e3 : timestamp);
          if (!Number.isNaN(date.valueOf())) createTime = `\uFF0C\u521B\u5EFA\u65F6\u95F4\uFF1A${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        }
      }
    }
    const members = includeMemberCount ? `\uFF0C\u4EBA\u6570: ${memberCount ?? "\u672A\u77E5"}` : "";
    return `\u7FA4\u53F7\uFF1A${id}\uFF0C\u7FA4\u540D\u79F0\uFF1A${name2}${members}${createTime}`;
  });
  return lines.join("\n");
}

// src/renders/table.ts
function createRenderTableImage(ctx) {
  return async function renderTableImage(title, headers, rows, options = {}) {
    const puppeteer = ctx.puppeteer;
    if (!puppeteer?.page) return null;
    const normalizedRows = Array.isArray(rows) ? rows : [];
    const heading = options.heading ?? title;
    const subHeading = options.subHeading ?? "";
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;600&family=Noto+Color+Emoji&display=swap');
    body {
      margin: 0;
      font-family: "Segoe UI", "Helvetica Neue", "Noto Sans SC", "Noto Color Emoji", "Segoe UI Emoji", "Apple Color Emoji", PingFangSC, "Microsoft Yahei", sans-serif;
      background: #ffffff;
      color: #111111;
    }
    .container {
      padding: 20px 24px;
      max-width: 760px;
    }
    h1 {
      font-size: 18px;
      margin: 0 0 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .sub-heading {
      margin: -8px 0 16px;
      color: #555555;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      min-width: 360px;
      font-size: 14px;
      table-layout: fixed;
    }
    th, td {
      padding: 10px 14px;
      border-bottom: 1px solid #e5e5e5;
      text-align: left;
      vertical-align: top;
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.45;
    }
    .time-col {
      width: 150px;
      white-space: nowrap;
      padding-right: 18px;
      text-align: left;
      font-weight: 600;
    }
    td.time-col {
      font-weight: 500;
    }
    .content-col {
      width: calc(100% - 150px);
    }
    th {
      background: #f5f7fa;
      font-weight: 600;
      white-space: nowrap;
    }
    tr:nth-child(odd) td {
      background: #fbfcfe;
    }
  </style>
</head>
<body>
  <div class="container" id="table-root">
    <h1>${heading}</h1>
    ${subHeading ? `<p class="sub-heading">${subHeading}</p>` : ""}
    <table>
      <thead>
        <tr>${headers.map((header, index) => `<th class="${index === 0 ? "time-col" : "content-col"}">${header}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${normalizedRows.map((line) => `<tr>${line.map((cell, index) => `<td class="${index === 0 ? "time-col" : "content-col"}">${cell}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>
</body>
</html>`;
    let page;
    try {
      page = await puppeteer.page();
      await page.setViewport({ width: 800, height: 220 + normalizedRows.length * 48 });
      await page.setContent(html, { waitUntil: "networkidle0" });
      const element = await page.$("#table-root");
      if (!element) return null;
      const buffer = await element.screenshot({ omitBackground: false });
      return buffer;
    } catch (error) {
      const logger7 = ctx.logger;
      logger7?.warn?.("\u8868\u683C\u56FE\u7247\u6E32\u67D3\u5931\u8D25", error);
      return null;
    } finally {
      try {
        await page?.close();
      } catch {
      }
    }
  };
}

// src/renders/rank-list.ts
function createRenderRankList(ctx) {
  return async function renderRankList(title, items) {
    const puppeteer = ctx.puppeteer;
    if (!puppeteer?.page) return null;
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap');
    
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: "Noto Sans SC", "Segoe UI", "Microsoft YaHei", sans-serif;
      background: #f0f2f5;
      color: #1f2937;
    }

    .container {
      padding: 32px;
      width: 600px;
      background: #f0f2f5;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .header {
      margin-bottom: 8px;
      padding: 0 8px;
    }

    h1 {
      font-size: 24px;
      margin: 0;
      font-weight: 700;
      color: #111827;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .card {
      background: #ffffff;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .rank-num {
      font-size: 20px;
      font-weight: 700;
      color: #9ca3af;
      width: 32px;
      text-align: center;
      font-feature-settings: "tnum";
    }

    .rank-top-1 { color: #fbbf24; font-size: 24px; }
    .rank-top-2 { color: #9ca3af; font-size: 22px; }
    .rank-top-3 { color: #b45309; font-size: 22px; }

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #e5e7eb;
    }

    .info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .name-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .name {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }

    .relation-badge {
      font-size: 12px;
      padding: 2px 8px;
      background: #e0e7ff;
      color: #4f46e5;
      border-radius: 999px;
      font-weight: 500;
    }

    .affinity-container {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: center;
    }

    .affinity-value {
      font-size: 18px;
      font-weight: 700;
      color: #ec4899;
      font-feature-settings: "tnum";
    }

    .affinity-label {
      font-size: 12px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container" id="list-root">
    <div class="header">
      <h1>${title}</h1>
    </div>
    ${items.map(
      (item, index) => `
    <div class="card">
      <div class="rank-num rank-top-${item.rank}">${item.rank}</div>
      ${item.avatarUrl ? `<img class="avatar" src="${item.avatarUrl}" onerror="this.style.display='none'" />` : '<div class="avatar" style="background: #e5e7eb"></div>'}
      <div class="info">
        <div class="name-row">
          <span class="name">${item.name}</span>
          ${item.relation && item.relation !== "\u2014\u2014" ? `<span class="relation-badge">${item.relation}</span>` : ""}
        </div>
      </div>
      <div class="affinity-container">
        <div class="affinity-value">${item.affinity}</div>
        <div class="affinity-label">\u597D\u611F\u5EA6</div>
      </div>
    </div>
    `
    ).join("")}
  </div>
</body>
</html>`;
    let page;
    try {
      page = await puppeteer.page();
      await page.setViewport({ width: 600, height: 100 + items.length * 120, deviceScaleFactor: 2 });
      await page.setContent(html, { waitUntil: "networkidle0" });
      const element = await page.$("#list-root");
      if (!element) return null;
      const buffer = await element.screenshot({ omitBackground: false });
      return buffer;
    } catch (error) {
      const logger7 = ctx.logger;
      logger7?.warn?.("\u6392\u884C\u699C\u56FE\u7247\u6E32\u67D3\u5931\u8D25", error);
      return null;
    } finally {
      try {
        await page?.close();
      } catch {
      }
    }
  };
}

// src/renders/utils.ts
var COMMON_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css?family=Noto+Color+Emoji');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: "Noto Sans SC", "Noto Color Emoji", "Segoe UI", "Microsoft YaHei", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
    background: #f0f2f5;
    color: #1f2937;
  }

  .container {
    padding: 32px;
    width: 600px;
    background: #f0f2f5;
    display: flex;
    flex-direction: column;
    gap: 16px;
    /* \u542F\u7528\u5B57\u8DDD\u8C03\u6574 */
    font-feature-settings: "palt";
  }

  .header {
    margin-bottom: 8px;
    padding: 0 8px;
  }

  h1 {
    font-size: 24px;
    margin: 0;
    font-weight: 700;
    color: #111827;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  h2 {
    font-size: 16px;
    font-weight: 500;
    color: #6b7280;
    margin-top: 4px;
  }

  .card {
    background: #ffffff;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e5e7eb;
    flex-shrink: 0;
  }
  
  .avatar-placeholder {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #f3f4f6;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    font-weight: 600;
    font-size: 20px;
    border: 2px solid #e5e7eb;
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .name-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .name {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .sub-text {
    font-size: 12px;
    color: #6b7280;
  }

  .badge {
    font-size: 12px;
    padding: 2px 8px;
    background: #e0e7ff;
    color: #4f46e5;
    border-radius: 999px;
    font-weight: 500;
    white-space: nowrap;
  }
  
  .badge-red {
    background: #fee2e2;
    color: #ef4444;
  }
  
  .badge-gray {
    background: #f3f4f6;
    color: #6b7280;
  }

  .value-container {
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    flex-shrink: 0;
  }

  .value-primary {
    font-size: 18px;
    font-weight: 700;
    color: #ec4899;
    font-feature-settings: "tnum";
  }
  
  .value-secondary {
    font-size: 14px;
    font-weight: 600;
    color: #4b5563;
  }

  .label-small {
    font-size: 12px;
    color: #6b7280;
  }
`;

// src/renders/inspect.ts
function createRenderInspect(ctx) {
  return async function renderInspect(data) {
    const puppeteer = ctx.puppeteer;
    if (!puppeteer?.page) return null;
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <style>
    ${COMMON_STYLE}
    .card-inspect {
      background: #ffffff;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }
    .header-inspect {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid #f3f4f6;
    }
    .avatar-lg {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #e5e7eb;
    }
    .avatar-placeholder-lg {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      font-weight: 600;
      font-size: 32px;
    }
    .nickname-lg {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 4px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-item {
      background: #f9fafb;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      transition: all 0.2s;
    }
    .stat-value-lg {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      font-feature-settings: "tnum";
      line-height: 1.2;
    }
    .stat-value-lg.primary {
      color: #ec4899;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-top: 1px solid #f3f4f6;
      font-size: 14px;
    }
    .detail-label {
      color: #6b7280;
    }
    .detail-val {
      font-weight: 600;
      color: #374151;
    }
  </style>
</head>
<body>
  <div class="container" style="width: 480px; padding: 40px;" id="inspect-root">
    <div class="card-inspect">
      <div class="header-inspect">
        ${data.avatarUrl ? `<img class="avatar-lg" src="${data.avatarUrl}" onerror="this.style.display='none'" />` : `<div class="avatar-placeholder-lg">${data.nickname.charAt(0)}</div>`}
        <div class="user-info">
          <div class="nickname-lg">${data.nickname}</div>
          <div class="sub-text" style="font-size: 14px;">${data.platform ? `${data.platform}/` : ""}${data.userId}</div>
          ${data.relation && data.relation !== "\u2014\u2014" ? `<span class="badge" style="margin-top: 8px; display: inline-block;">${data.relation}</span>` : ""}
        </div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value-lg primary">${data.compositeAffinity}</div>
          <div class="stat-label">\u7EFC\u5408\u597D\u611F\u5EA6</div>
        </div>
        <div class="stat-item">
          <div class="stat-value-lg">${data.chatCount}</div>
          <div class="stat-label">\u4EA4\u4E92\u6B21\u6570</div>
        </div>
        <div class="stat-item">
          <div class="stat-value-lg" style="font-size: 20px; color: #4b5563;">${data.longTermAffinity}</div>
          <div class="stat-label">\u957F\u671F\u597D\u611F\u5EA6</div>
        </div>
        <div class="stat-item">
          <div class="stat-value-lg" style="font-size: 20px; color: #4b5563;">${data.shortTermAffinity}</div>
          <div class="stat-label">\u77ED\u671F\u597D\u611F\u5EA6</div>
        </div>
      </div>

      <div class="detail-list">
        <div class="detail-row">
          <span class="detail-label">\u7EFC\u5408\u7CFB\u6570</span>
          <span class="detail-val">${data.coefficient.toFixed(2)}\uFF08\u8FDE\u7EED ${data.streak} \u5929\uFF09</span>
        </div>
        <div class="detail-row" style="border-bottom: 1px solid #f3f4f6;">
          <span class="detail-label">\u6700\u540E\u4E92\u52A8</span>
          <span class="detail-val">${data.lastInteraction || "\u2014\u2014"}</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
    let page;
    try {
      page = await puppeteer.page();
      await page.setViewport({ width: 480, height: 600, deviceScaleFactor: 2 });
      await page.setContent(html, { waitUntil: "networkidle0" });
      const element = await page.$("#inspect-root");
      if (!element) return null;
      const buffer = await element.screenshot({ omitBackground: false });
      return buffer;
    } catch (error) {
      const logger7 = ctx.logger;
      logger7?.warn?.("\u597D\u611F\u5EA6\u8BE6\u60C5\u56FE\u7247\u6E32\u67D3\u5931\u8D25", error);
      return null;
    } finally {
      try {
        await page?.close();
      } catch {
      }
    }
  };
}

// src/renders/group-list.ts
function createRenderGroupList(ctx) {
  return async function renderGroupList(title, groups) {
    const puppeteer = ctx.puppeteer;
    if (!puppeteer?.page) return null;
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <style>
    ${COMMON_STYLE}
    .group-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 20px;
      font-weight: 700;
      flex-shrink: 0;
    }
  </style>
</head>
<body>
  <div class="container" id="list-root">
    <div class="header">
      <h1>${title}</h1>
    </div>
    ${groups.map((group) => `
    <div class="card">
      <div class="group-icon">${group.groupName.charAt(0)}</div>
      <div class="info">
        <div class="name">${group.groupName}</div>
        <div class="sub-text">${group.groupId}</div>
      </div>
      <div class="value-container">
        ${group.memberCount !== void 0 ? `
        <div class="value-secondary">${group.memberCount} <span class="label-small">\u6210\u5458</span></div>
        ` : ""}
        ${group.createTime ? `
        <div class="label-small">${group.createTime}</div>
        ` : ""}
      </div>
    </div>
    `).join("")}
  </div>
</body>
</html>`;
    let page;
    try {
      page = await puppeteer.page();
      await page.setViewport({ width: 600, height: 100 + groups.length * 90, deviceScaleFactor: 2 });
      await page.setContent(html, { waitUntil: "networkidle0" });
      const element = await page.$("#list-root");
      if (!element) return null;
      const buffer = await element.screenshot({ omitBackground: false });
      return buffer;
    } catch (error) {
      const logger7 = ctx.logger;
      logger7?.warn?.("\u7FA4\u804A\u5217\u8868\u56FE\u7247\u6E32\u67D3\u5931\u8D25", error);
      return null;
    } finally {
      try {
        await page?.close();
      } catch {
      }
    }
  };
}

// src/renders/blacklist.ts
function createRenderBlacklist(ctx) {
  return async function renderBlacklist(title, items) {
    const puppeteer = ctx.puppeteer;
    if (!puppeteer?.page) return null;
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <style>
    ${COMMON_STYLE}
    .note {
      font-size: 13px;
      color: #6b7280;
      margin-top: 4px;
      /* \u79FB\u9664\u7070\u6846\u6837\u5F0F */
    }
  </style>
</head>
<body>
  <div class="container" id="list-root">
    <div class="header">
      <h1>${title}</h1>
    </div>
    ${items.map((item) => `
    <div class="card">
      <div class="rank-num" style="font-size: 16px; color: #9ca3af; width: 24px;">${item.index}</div>
      ${item.avatarUrl ? `<img class="avatar" src="${item.avatarUrl}" onerror="this.style.display='none'" />` : `<div class="avatar-placeholder">${item.nickname.charAt(0)}</div>`}
      <div class="info">
        <div class="name-row">
          <span class="name">${item.nickname}</span>
        </div>
        <div class="sub-text">${item.userId}</div>
        ${item.note && item.note !== "\u2014\u2014" ? `<div class="note">\u5907\u6CE8: ${item.note}</div>` : ""}
      </div>
      <div class="value-container">
        <div class="value-secondary">${item.timeInfo}</div>
        ${item.isTemp && item.penalty ? `<div class="badge badge-red" style="margin-top: 4px;">\u6263\u9664 ${item.penalty} \u597D\u611F</div>` : ""}
      </div>
    </div>
    `).join("")}
  </div>
</body>
</html>`;
    let page;
    try {
      page = await puppeteer.page();
      await page.setViewport({ width: 600, height: 100 + items.length * 120, deviceScaleFactor: 2 });
      await page.setContent(html, { waitUntil: "networkidle0" });
      const element = await page.$("#list-root");
      if (!element) return null;
      const buffer = await element.screenshot({ omitBackground: false });
      return buffer;
    } catch (error) {
      const logger7 = ctx.logger;
      logger7?.warn?.("\u9ED1\u540D\u5355\u56FE\u7247\u6E32\u67D3\u5931\u8D25", error);
      return null;
    } finally {
      try {
        await page?.close();
      } catch {
      }
    }
  };
}

// src/renders/schedule.ts
function createRenderSchedule(ctx) {
  return async function renderSchedule(data) {
    const puppeteer = ctx.puppeteer;
    if (!puppeteer?.page) return null;
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <style>
    ${COMMON_STYLE}
    .time-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding-right: 16px;
      border-right: 2px solid #f3f4f6;
      margin-right: 16px;
      min-width: 100px;
    }
    .time-start {
      font-size: 18px;
      font-weight: 700;
      color: #4f46e5;
    }
    .time-end {
      font-size: 14px;
      color: #9ca3af;
    }
    .summary {
      font-size: 16px;
      color: #374151;
      line-height: 1.5;
    }
    .description {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 16px;
      padding: 0 8px;
    }
  </style>
</head>
<body>
  <div class="container" id="schedule-root">
    <div class="header">
      <h1>${data.title}</h1>
      <h2>${data.date}</h2>
    </div>
    ${data.description ? `<div class="description">${data.description}</div>` : ""}
    ${data.entries.map((entry) => `
    <div class="card">
      <div class="time-col">
        <div class="time-start">${entry.start}</div>
        <div class="time-end">${entry.end}</div>
      </div>
      <div class="info">
        <div class="summary">${entry.summary}</div>
      </div>
    </div>
    `).join("")}
  </div>
</body>
</html>`;
    let page;
    try {
      page = await puppeteer.page();
      await page.setViewport({ width: 600, height: 150 + data.entries.length * 100, deviceScaleFactor: 2 });
      await page.setContent(html, { waitUntil: "networkidle0" });
      const element = await page.$("#schedule-root");
      if (!element) return null;
      const buffer = await element.screenshot({ omitBackground: false });
      return buffer;
    } catch (error) {
      const logger7 = ctx.logger;
      logger7?.warn?.("\u65E5\u7A0B\u56FE\u7247\u6E32\u67D3\u5931\u8D25", error);
      return null;
    } finally {
      try {
        await page?.close();
      } catch {
      }
    }
  };
}

// src/index.ts
var BASE_KEYS = Object.keys(baseAffinityDefaults);
function normalizeBaseAffinityConfig(config) {
  const base = { ...baseAffinityDefaults, ...config.baseAffinityConfig || {} };
  for (const key of BASE_KEYS) {
    const legacy = config[key];
    if (legacy !== void 0 && legacy !== null) {
      const numeric = Number(legacy);
      if (Number.isFinite(numeric)) base[key] = numeric;
    }
  }
  config.baseAffinityConfig = base;
  for (const key of BASE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(config, key)) delete config[key];
    Object.defineProperty(config, key, {
      configurable: true,
      enumerable: true,
      get() {
        const target = config.baseAffinityConfig?.[key];
        return Number.isFinite(target) ? target : baseAffinityDefaults[key];
      },
      set(value) {
        if (!config.baseAffinityConfig) config.baseAffinityConfig = { ...baseAffinityDefaults };
        config.baseAffinityConfig[key] = value;
      }
    });
  }
}
function apply(ctx, config) {
  normalizeBaseAffinityConfig(config);
  const plugin = new ChatLunaPlugin(ctx, config, "affinity", false);
  modelSchema(ctx);
  ctx.inject(["console"], (innerCtx) => {
    const consoleService = innerCtx.console;
    consoleService?.addEntry?.({ dev: path2.resolve(__dirname, "../client/index.ts"), prod: path2.resolve(__dirname, "../dist") });
  });
  const log = createLogger2(ctx, config);
  const cache = createAffinityCache();
  const store = createAffinityStore(ctx, config, log);
  const history = createHistoryManager(ctx, config, log);
  ctx.accept(["relationships"], () => {
    store.syncRelationshipsToDatabase().catch((error) => log("warn", "\u540C\u6B65\u7279\u6B8A\u5173\u7CFB\u914D\u7F6E\u5230\u6570\u636E\u5E93\u5931\u8D25", error));
  }, { passive: true });
  const messageStore = createMessageStore(ctx, log, 100);
  const renderTableImage = createRenderTableImage(ctx);
  const renderRankList = createRenderRankList(ctx);
  const renderInspect = createRenderInspect(ctx);
  const renderGroupList = createRenderGroupList(ctx);
  const renderBlacklist = createRenderBlacklist(ctx);
  const renderSchedule = createRenderSchedule(ctx);
  const shortTermOptions = (() => {
    const cfg = config.shortTermBlacklist || {};
    const enabled = Boolean(cfg.enabled);
    const windowHours = Math.max(1, Number.isFinite(cfg.windowHours) ? cfg.windowHours : 24);
    const decreaseThreshold = Math.max(1, Number.isFinite(cfg.decreaseThreshold) ? cfg.decreaseThreshold : 15);
    const durationHours = Math.max(1, Number.isFinite(cfg.durationHours) ? cfg.durationHours : 12);
    const penalty = Math.max(0, Number.isFinite(cfg.penalty) ? cfg.penalty : 5);
    return { enabled, windowHours, windowMs: windowHours * 3600 * 1e3, decreaseThreshold, durationHours, durationMs: durationHours * 3600 * 1e3, penalty };
  })();
  const temporaryBlacklist = /* @__PURE__ */ new Map();
  const makeTempKey = (platform, userId) => `${platform || "unknown"}:${userId || "anonymous"}`;
  const temporaryBlacklistManager = {
    isBlocked(platform, userId) {
      if (!shortTermOptions.enabled) return null;
      const key = makeTempKey(platform, userId);
      const entry = temporaryBlacklist.get(key);
      if (!entry) return null;
      if (entry.expiresAt <= Date.now()) {
        temporaryBlacklist.delete(key);
        return null;
      }
      return entry;
    },
    activate(platform, userId, nickname, now) {
      if (!shortTermOptions.enabled) return { activated: false, entry: null };
      const key = makeTempKey(platform, userId);
      const nowMs = now instanceof Date ? now.getTime() : Number(now) || Date.now();
      const current = temporaryBlacklist.get(key);
      if (current && current.expiresAt > nowMs) return { activated: false, entry: current };
      const expiresAt = nowMs + shortTermOptions.durationMs;
      const entry = { expiresAt, nickname: nickname || "" };
      temporaryBlacklist.set(key, entry);
      log("info", "\u5DF2\u89E6\u53D1\u77ED\u671F\u62C9\u9ED1", { platform, userId, nickname, expiresAt: formatTimestamp(expiresAt), durationHours: shortTermOptions.durationHours, penalty: shortTermOptions.penalty });
      return { activated: true, entry };
    },
    clear(platform, userId) {
      temporaryBlacklist.delete(makeTempKey(platform, userId));
    }
  };
  let modelRef;
  const getModel = () => modelRef?.value ?? modelRef ?? null;
  const resolvePersonaPreset = (session) => {
    const source = config.personaSource || "none";
    const chatluna = ctx.chatluna;
    if (source === "chatluna") {
      let presetName = String(config.personaChatlunaPreset ?? "").trim();
      if (presetName === "\u65E0") presetName = "";
      if (presetName) {
        const presetRef = chatluna?.preset?.getPreset?.(presetName);
        const presetValue = presetRef?.value;
        if (typeof presetValue === "string") return presetValue;
        if (typeof presetValue?.rawText === "string") return presetValue.rawText;
        if (presetValue?.config?.prompt) return presetValue.config.prompt;
      }
      return chatluna?.personaPrompt || "";
    }
    if (source === "custom") return String(config.personaCustomPreset ?? "").trim();
    return "";
  };
  const affinityProvider = createAffinityProvider({ config, cache, store });
  const relationshipProvider = createRelationshipProvider({ store });
  const contextAffinityProvider = createContextAffinityProvider({ config, store, history });
  const scheduleManager = createScheduleManager(ctx, config, {
    getModel,
    getMessageContent,
    resolvePersonaPreset,
    renderSchedule,
    log
  });
  scheduleManager.registerCommand();
  const DEFAULT_MEMBER_INFO_ITEMS = Array.isArray(defaultMemberInfoItems) && defaultMemberInfoItems.length ? defaultMemberInfoItems : ["nickname", "userId", "role", "level", "title", "gender", "age", "area", "joinTime", "lastSentTime"];
  const resolveRoleLabelWithLogging = (session, member) => resolveRoleLabel(session, member, { logUnknown: config.debugLogging, logger: log });
  const fetchMember = async (session, targetId) => {
    const bot = session?.bot;
    const guildId = session?.guildId || session?.channelId || session?.roomId;
    if (!bot || !guildId || !targetId) return null;
    const attempts = [
      () => session?.onebot?.getGroupMemberInfo?.(guildId, targetId, true),
      () => bot.internal?.getGroupMemberInfo?.(guildId, targetId, true),
      () => bot.request?.("get_group_member_info", { group_id: guildId, user_id: targetId, no_cache: true }),
      () => bot.internal?.getGuildMember?.(guildId, targetId),
      () => bot.internal?.getGroupMember?.(guildId, targetId),
      () => bot.getGuildMember?.(guildId, targetId),
      () => bot.getGroupMember?.(guildId, targetId)
    ];
    let merged = null;
    for (const attempt of attempts) {
      if (!attempt) continue;
      try {
        const member = await attempt();
        if (!member) continue;
        merged = merged ? Object.assign({}, merged, member) : member;
        if (merged.join_time || merged.joined_at || merged.level) break;
      } catch {
      }
    }
    return merged;
  };
  const resolveGroupId = (session) => session?.guildId || session?.channelId || session?.roomId || "";
  const extractMemberId = (member) => member?.userId ?? member?.id ?? member?.qq ?? member?.uid ?? member?.user_id ?? "";
  const collectMemberNames = (member) => {
    const names = [];
    const raw = member;
    const candidates = ["card", "nickname", "nick", "name", "username", "displayName", "display_name", "user_name"];
    for (const key of candidates) {
      const value = raw[key];
      if (typeof value === "string" && value.trim()) names.push(value.trim());
    }
    if (member?.user) {
      const userRaw = member.user;
      for (const key of candidates) {
        const value = userRaw[key];
        if (typeof value === "string" && value.trim()) names.push(value.trim());
      }
    }
    return names;
  };
  const findMemberByName = async (session, keyword) => {
    const bot = session?.bot;
    const guildId = resolveGroupId(session);
    if (!bot || !guildId) return null;
    const attempts = [
      () => bot.getGuildMemberList?.(guildId),
      () => bot.getGroupMemberList?.(guildId),
      () => bot.internal?.getGuildMemberList?.(guildId),
      () => bot.internal?.getGroupMemberList?.(guildId)
    ];
    const target = stripAtPrefix(keyword);
    if (!target) return null;
    for (const attempt of attempts) {
      if (!attempt) continue;
      try {
        const list = await attempt();
        if (!Array.isArray(list)) continue;
        for (const member of list) {
          const names = collectMemberNames(member);
          if (names.includes(target)) return member;
          const memberId = stripAtPrefix(extractMemberId(member));
          if (memberId && memberId === target) return member;
        }
      } catch (error) {
        log("debug", "\u904D\u5386\u6210\u5458\u5217\u8868\u5931\u8D25", { error, guildId, keyword });
      }
    }
    return null;
  };
  const resolveUserIdentity = async (session, input) => {
    const fallback = stripAtPrefix(input);
    if (!session) return { userId: fallback, nickname: fallback };
    const bot = session.bot;
    const guildId = resolveGroupId(session);
    if (!bot || !guildId) return { userId: fallback, nickname: fallback };
    if (fallback) {
      const directMember = await fetchMember(session, fallback);
      if (directMember) {
        const userId = stripAtPrefix(extractMemberId(directMember));
        const nickname = stripAtPrefix(collectMemberNames(directMember)[0] || fallback);
        if (userId) return { userId, nickname };
      }
    }
    const byName = await findMemberByName(session, fallback);
    if (byName) {
      const userId = stripAtPrefix(extractMemberId(byName));
      const nickname = stripAtPrefix(collectMemberNames(byName)[0] || fallback);
      if (userId) return { userId, nickname };
    }
    return { userId: fallback, nickname: fallback };
  };
  const enrichBlacklistRecords = async (records, session) => {
    return Promise.all(
      records.map(async (entry) => {
        const sanitizedId = stripAtPrefix(entry?.userId);
        let nickname = stripAtPrefix(entry?.nickname || "");
        let userId = sanitizedId;
        if (!nickname || nickname === sanitizedId) {
          const resolved = await resolveUserIdentity(session, sanitizedId);
          userId = resolved.userId || sanitizedId;
          nickname = resolved.nickname || sanitizedId;
        }
        return { ...entry, userId, nickname };
      })
    );
  };
  const fetchGroupMemberIds = async (session) => {
    const bot = session?.bot;
    const guildId = resolveGroupId(session);
    if (!bot || !guildId) return null;
    const attempts = [
      () => bot.getGuildMemberList?.(guildId),
      () => bot.getGroupMemberList?.(guildId),
      () => bot.internal?.getGuildMemberList?.(guildId),
      () => bot.internal?.getGroupMemberList?.(guildId)
    ];
    let attempted = false;
    for (const attempt of attempts) {
      if (!attempt) continue;
      attempted = true;
      try {
        const list = await attempt();
        if (!Array.isArray(list) || !list.length) continue;
        const ids = /* @__PURE__ */ new Set();
        for (const member of list) {
          const id = stripAtPrefix(extractMemberId(member));
          if (id) ids.add(id);
        }
        if (ids.size) return ids;
      } catch (error) {
        log("debug", "\u83B7\u53D6\u7FA4\u6210\u5458\u5217\u8868\u5931\u8D25", { error, guildId });
      }
    }
    return attempted ? /* @__PURE__ */ new Set() : null;
  };
  const resolveUserInfo2 = async (session, configItems) => resolveUserInfo(session, configItems, fetchMember, { defaultItems: DEFAULT_MEMBER_INFO_ITEMS, logUnknown: config.debugLogging, log });
  const resolveBotInfo2 = async (session, configItems) => resolveBotInfo(session, configItems, fetchMember, { defaultItems: DEFAULT_MEMBER_INFO_ITEMS, logUnknown: config.debugLogging, log });
  const fetchGroupList = async (session) => {
    const bot = session?.bot;
    if (!bot || session?.platform !== "onebot") return null;
    const internal = bot.internal;
    if (!internal) return null;
    try {
      if (typeof internal.getGroupList === "function") {
        const result = await internal.getGroupList();
        return Array.isArray(result) ? result : null;
      }
      if (typeof internal._request === "function") {
        const result = await internal._request("get_group_list", {});
        return Array.isArray(result) ? result : null;
      }
    } catch (error) {
      log("debug", "\u83B7\u53D6\u7FA4\u5217\u8868\u5931\u8D25", error);
    }
    return null;
  };
  const createGroupInfoProvider = (groupInfoCfg) => async (_, __, configurable) => {
    const session = configurable?.session;
    if (!session) return "\u6682\u65E0\u7FA4\u4FE1\u606F\u3002";
    if (!session.guildId) return "";
    if (session.platform !== "onebot") return "\u5F53\u524D\u5E73\u53F0\u6682\u4E0D\u652F\u6301\u67E5\u8BE2\u7FA4\u5217\u8868\u3002";
    try {
      const list = await fetchGroupList(session);
      if (!list || !list.length) return "\u672A\u80FD\u83B7\u53D6\u5F53\u524D\u7FA4\u4FE1\u606F\u3002";
      const targetId = String(session.guildId);
      const current = list.find((group) => {
        const id = group.group_id ?? group.groupId ?? group.id;
        return id && String(id) === targetId;
      });
      if (!current) return "";
      return normalizeGroupList([current], {
        includeMemberCount: groupInfoCfg.includeMemberCount !== false,
        includeCreateTime: groupInfoCfg.includeCreateTime !== false
      });
    } catch (error) {
      log("debug", "\u7FA4\u5217\u8868\u53D8\u91CF\u89E3\u6790\u5931\u8D25", error);
      return "\u83B7\u53D6\u7FA4\u5217\u8868\u5931\u8D25\u3002";
    }
  };
  const logInterception = config.blacklistLogInterception !== false;
  const globalGuard = async (session, next) => {
    const platform = session?.platform;
    const userId = session?.userId;
    const groupId = resolveGroupId(session);
    if (!platform || !userId) return next();
    if (shortTermOptions.enabled) {
      const entry = temporaryBlacklistManager.isBlocked(platform, userId);
      if (entry) {
        cache.clear(platform, userId);
        if (logInterception) log("info", "\u6D88\u606F\u5DF2\u56E0\u77ED\u671F\u62C9\u9ED1\u88AB\u62E6\u622A", { platform, userId, expiresAt: formatTimestamp(entry.expiresAt) });
        return;
      }
    }
    const tempEntry = store.isTemporarilyBlacklisted(platform, userId);
    if (tempEntry) {
      cache.clear(platform, userId);
      if (logInterception) log("info", "\u6D88\u606F\u5DF2\u56E0\u4E34\u65F6\u62C9\u9ED1\u88AB\u62E6\u622A", { platform, userId, expiresAt: tempEntry.expiresAt });
      return;
    }
    if (!config.enableAutoBlacklist) return next();
    if (!store.isBlacklisted(platform, userId, groupId)) return next();
    cache.clear(platform, userId);
    if (logInterception) log("info", "\u6D88\u606F\u5DF2\u56E0\u81EA\u52A8\u62C9\u9ED1\u88AB\u62E6\u622A", { platform, userId });
    return;
  };
  ctx.middleware(globalGuard, true);
  ctx.on("ready", async () => {
    try {
      await store.syncRelationshipsToDatabase();
    } catch (error) {
      log("warn", "\u540C\u6B65\u7279\u6B8A\u5173\u7CFB\u914D\u7F6E\u5230\u6570\u636E\u5E93\u5931\u8D25", error);
    }
    const chatlunaService = ctx.chatluna;
    try {
      modelRef = await chatlunaService?.createChatModel?.(config.model || chatlunaService?.config?.defaultModel);
    } catch (error) {
      log("warn", "\u6A21\u578B\u521D\u59CB\u5316\u5931\u8D25", error);
    }
    const promptRenderer = chatlunaService?.promptRenderer;
    promptRenderer?.registerFunctionProvider?.(config.affinityVariableName, affinityProvider);
    promptRenderer?.registerFunctionProvider?.(config.relationshipVariableName, relationshipProvider);
    const overviewConfig = config.contextAffinityOverview;
    const overviewName = String(overviewConfig?.variableName || "contextAffinity").trim();
    if (overviewName) {
      promptRenderer?.registerFunctionProvider?.(overviewName, contextAffinityProvider);
    }
    const userInfoConfig = config.userInfo || config.otherVariables?.userInfo || { variableName: "userInfo", items: DEFAULT_MEMBER_INFO_ITEMS };
    const userInfoVariableName = String(userInfoConfig.variableName || "userInfo").trim();
    if (userInfoVariableName) promptRenderer?.registerFunctionProvider?.(userInfoVariableName, async (_, __, configurable) => {
      if (!configurable?.session?.userId) return "\u672A\u77E5\u7528\u6237";
      try {
        return await resolveUserInfo2(configurable.session, userInfoConfig.items || DEFAULT_MEMBER_INFO_ITEMS);
      } catch {
        return `${configurable.session.username || configurable.session.userId || "\u672A\u77E5\u7528\u6237"}`;
      }
    });
    const botInfoConfig = config.botInfo || config.otherVariables?.botInfo || { variableName: "botInfo", items: DEFAULT_MEMBER_INFO_ITEMS };
    const botInfoVariableName = String(botInfoConfig.variableName || "botInfo").trim();
    if (botInfoVariableName) promptRenderer?.registerFunctionProvider?.(botInfoVariableName, async (_, __, configurable) => {
      if (!configurable?.session) return "\u672A\u77E5\u673A\u5668\u4EBA";
      try {
        return await resolveBotInfo2(configurable.session, botInfoConfig.items || DEFAULT_MEMBER_INFO_ITEMS);
      } catch {
        return `${configurable.session.selfId || "\u672A\u77E5\u673A\u5668\u4EBA"}`;
      }
    });
    const groupInfoConfig = config.groupInfo || config.otherVariables?.groupInfo || { variableName: "groupInfo", includeMemberCount: true, includeCreateTime: true };
    const groupInfoVariableName = String(groupInfoConfig.variableName || "groupInfo").trim();
    if (groupInfoVariableName) {
      promptRenderer?.registerFunctionProvider?.(groupInfoVariableName, createGroupInfoProvider(groupInfoConfig));
    }
    const randomConfig = config.random || config.otherVariables?.random || { variableName: "random", min: 0, max: 100 };
    const randomVariableName = String(randomConfig.variableName || "random").trim();
    if (randomVariableName) {
      const randomMin = randomConfig.min ?? 0;
      const randomMax = randomConfig.max ?? 100;
      promptRenderer?.registerFunctionProvider?.(randomVariableName, () => {
        return Math.floor(Math.random() * (randomMax - randomMin + 1)) + randomMin;
      });
    }
    if (config.enablePokeTool) {
      const toolName = String(config.pokeToolName || "poke_user").trim() || "poke_user";
      plugin.registerTool(toolName, { selector: () => true, authorization: (session) => session?.platform === "onebot", createTool: () => createOneBotPokeTool({ ctx, toolName }) });
    }
    if (config.enableSetSelfProfileTool) {
      const toolName = String(config.setSelfProfileToolName || "set_self_profile").trim() || "set_self_profile";
      plugin.registerTool(toolName, { selector: () => true, authorization: (session) => session?.platform === "onebot", createTool: () => createOneBotSetSelfProfileTool({ ctx, toolName }) });
    }
    if (config.enableDeleteMessageTool) {
      const toolName = String(config.deleteMessageToolName || "delete_msg").trim() || "delete_msg";
      plugin.registerTool(toolName, { selector: () => true, authorization: (session) => session?.platform === "onebot", createTool: () => createDeleteMessageTool({ ctx, toolName, messageStore }) });
    }
    const registry = createToolRegistry(config, store, cache);
    if (config.registerAffinityTool) {
      const toolName = String(config.affinityToolName || "adjust_affinity").trim() || "adjust_affinity";
      plugin.registerTool(toolName, { selector: registry.affinitySelector, createTool: registry.createAffinityTool });
    }
    if (config.registerRelationshipTool) {
      const toolName = String(config.relationshipToolName || "adjust_relationship").trim() || "adjust_relationship";
      plugin.registerTool(toolName, { selector: registry.relationshipSelector, createTool: registry.createRelationshipTool });
    }
    if (config.registerBlacklistTool) {
      const toolName = String(config.blacklistToolName || "adjust_blacklist").trim() || "adjust_blacklist";
      plugin.registerTool(toolName, { selector: registry.blacklistSelector, createTool: registry.createBlacklistTool });
    }
    const panSouCfg = config.panSouTool || {};
    if (panSouCfg.enablePanSouTool) {
      const toolName = String(panSouCfg.panSouToolName || "pansou_search").trim() || "pansou_search";
      plugin.registerTool(toolName, {
        selector: () => true,
        createTool: () => createPanSouSearchTool({
          ctx,
          toolName,
          apiUrl: panSouCfg.panSouApiUrl || "http://localhost:8888",
          authEnabled: panSouCfg.panSouAuthEnabled || false,
          username: panSouCfg.panSouUsername || "",
          password: panSouCfg.panSouPassword || "",
          defaultCloudTypes: panSouCfg.panSouDefaultCloudTypes || [],
          maxResults: panSouCfg.panSouMaxResults || 5
        })
      });
    }
    scheduleManager.registerVariables();
    scheduleManager.registerTool(plugin);
    scheduleManager.start();
  });
  const analysisSystem = createAnalysisMiddleware(ctx, config, { store, history, cache, renderTemplate, getMessageContent, getModel, log, resolvePersonaPreset, temporaryBlacklist: temporaryBlacklistManager, shortTermOptions });
  ctx.middleware(analysisSystem.middleware);
  ctx.on("before-send", (session) => {
    if (!config.enableAnalysis) return;
    try {
      const rawContent = session.content;
      if (!rawContent) return;
      const extractText = (content) => {
        if (!content) return "";
        if (typeof content === "string") return content;
        if (Array.isArray(content)) return content.map(extractText).filter(Boolean).join("");
        if (typeof content === "object") {
          const el = content;
          if (el.type === "text") return el.attrs?.content || "";
          if (el.children) return extractText(el.children);
        }
        return "";
      };
      let botReply = extractText(rawContent);
      if (botReply) {
        botReply = botReply.replace(/<[^>]+>/g, "").trim();
        if (botReply) analysisSystem.addBotReply(session, botReply);
      }
    } catch (error) {
      log("warn", "before-send\u4E8B\u4EF6\u5904\u7406\u5F02\u5E38", error);
    }
  });
  ctx.command("affinity.rank [limit:number] [platform:string] [image]", "\u67E5\u770B\u5F53\u524D\u597D\u611F\u5EA6\u6392\u884C", { authority: 1 }).alias("\u597D\u611F\u5EA6\u6392\u884C").action(async ({ session }, limitArg, platformArg, imageArg) => {
    const parsedLimit = Number(limitArg);
    const limit = Math.max(1, Math.min(Number.isFinite(parsedLimit) ? parsedLimit : config.rankDefaultLimit, 50));
    const groupId = resolveGroupId(session);
    const shouldRenderImage = imageArg === void 0 ? !!config.rankRenderAsImage : !["0", "false", "text", "no", "n"].includes(String(imageArg).toLowerCase());
    const puppeteer = ctx.puppeteer;
    if (shouldRenderImage && !puppeteer?.page) return "\u5F53\u524D\u73AF\u5883\u672A\u542F\u7528 puppeteer\uFF0C\u5DF2\u6539\u4E3A\u6587\u672C\u6A21\u5F0F\u3002";
    const conditions = {};
    const platform = platformArg || session?.platform;
    if (platform) conditions.platform = platform;
    if (session?.selfId) conditions.selfId = session.selfId;
    let scopedRows = [];
    if (groupId) {
      const memberIds = await fetchGroupMemberIds(session);
      if (!memberIds || memberIds.size === 0) {
        return "\u65E0\u6CD5\u83B7\u53D6\u672C\u7FA4\u6210\u5458\u5217\u8868\uFF0C\u6682\u65F6\u65E0\u6CD5\u5C55\u793A\u6392\u884C\u3002";
      }
      const batchSize = 500;
      let offset = 0;
      let hasMore = true;
      while (scopedRows.length < limit && hasMore) {
        const batch = await ctx.database.select(MODEL_NAME).where(conditions).orderBy("affinity", "desc").limit(batchSize).offset(offset).execute();
        if (!batch.length) {
          hasMore = false;
          break;
        }
        for (const row of batch) {
          if (memberIds.has(stripAtPrefix(row.userId))) {
            scopedRows.push(row);
            if (scopedRows.length >= limit) break;
          }
        }
        offset += batchSize;
        if (batch.length < batchSize) hasMore = false;
      }
      if (!scopedRows.length) return "\u672C\u7FA4\u6682\u65E0\u597D\u611F\u5EA6\u8BB0\u5F55\u3002";
    } else {
      const rows = await ctx.database.select(MODEL_NAME).where(conditions).orderBy("affinity", "desc").limit(limit).execute();
      if (!rows.length) return "\u5F53\u524D\u6682\u65E0\u597D\u611F\u5EA6\u8BB0\u5F55\u3002";
      scopedRows = rows;
    }
    const lines = await Promise.all(scopedRows.map(async (row) => {
      let name2 = row.nickname || row.userId;
      if (groupId) {
        const resolved = await resolveUserIdentity(session, row.userId);
        if (resolved.nickname && resolved.nickname !== row.userId) {
          name2 = resolved.nickname;
        }
      }
      return { name: name2, relation: row.relation || "\u2014\u2014", affinity: row.affinity, userId: row.userId };
    }));
    const textLines = ["\u7FA4\u6635\u79F0 \u5173\u7CFB \u597D\u611F\u5EA6", ...lines.map((item, index) => `${index + 1}. ${item.name} ${item.relation} ${item.affinity}`)];
    if (shouldRenderImage) {
      const rankItems = lines.map((item, index) => {
        const rawId = stripAtPrefix(item.userId);
        const idParts = rawId.split(":");
        const id = idParts.length > 1 ? idParts[1] : idParts[0];
        const numericId = id.match(/^\d+$/) ? id : void 0;
        const avatarUrl = numericId ? `https://q1.qlogo.cn/g?b=qq&nk=${numericId}&s=640` : void 0;
        return {
          rank: index + 1,
          name: item.name,
          relation: item.relation,
          affinity: item.affinity,
          avatarUrl
        };
      });
      const buffer = await renderRankList("\u597D\u611F\u5EA6\u6392\u884C", rankItems);
      if (buffer) return import_koishi16.h.image(buffer, "image/png");
      ctx.logger?.("chatluna-affinity")?.warn?.("\u6392\u884C\u699C\u56FE\u7247\u6E32\u67D3\u5931\u8D25\u6216\u670D\u52A1\u7F3A\u5931\uFF0C\u5DF2\u6539\u4E3A\u6587\u672C\u8F93\u51FA");
      return textLines.join("\n");
    }
    return textLines.join("\n");
  });
  ctx.command("affinity.inspect [targetUserId:string] [platform:string] [image]", "\u67E5\u770B\u6307\u5B9A\u7528\u6237\u7684\u597D\u611F\u5EA6\u8BE6\u60C5", { authority: 1 }).alias("\u597D\u611F\u5EA6\u8BE6\u60C5").action(async ({ session }, targetUserArg, platformArg, imageArg) => {
    const platform = platformArg || session?.platform || "";
    const userId = targetUserArg || session?.userId || "";
    const selfId = session?.selfId || "";
    if (!selfId || !userId) return "\u8BF7\u63D0\u4F9B selfId \u548C\u7528\u6237 ID\u3002";
    const record = await store.load(selfId, userId);
    if (!record) return "\u672A\u627E\u5230\u597D\u611F\u5EA6\u8BB0\u5F55\u3002";
    const state = store.extractState(record);
    const coefficient = state.coefficientState?.coefficient ?? config.affinityDynamics?.coefficient?.base ?? 1;
    const currentCompositeAffinity = Math.round(coefficient * state.longTermAffinity);
    const shouldRenderImage = imageArg === void 0 ? !!config.inspectRenderAsImage : !["0", "false", "text", "no", "n"].includes(String(imageArg).toLowerCase());
    const puppeteer = ctx.puppeteer;
    let displayNickname = record.nickname || userId;
    if (session) {
      const memberInfo = await fetchMember(session, userId);
      if (memberInfo) {
        const raw = memberInfo;
        const card = raw.card || raw.user?.card;
        const nick = raw.nickname || raw.nick || raw.user?.nickname || raw.user?.nick;
        const resolved = String(card || nick || "").trim();
        if (resolved) displayNickname = resolved;
      }
    }
    const lines = [
      `\u7528\u6237\uFF1A${displayNickname} ${stripAtPrefix(userId)}`,
      `\u5173\u7CFB\uFF1A${record.relation || "\u2014\u2014"}`,
      `\u7EFC\u5408\u597D\u611F\u5EA6\uFF1A${currentCompositeAffinity}`,
      `\u957F\u671F\u597D\u611F\u5EA6\uFF1A${state.longTermAffinity}`,
      `\u77ED\u671F\u597D\u611F\u5EA6\uFF1A${state.shortTermAffinity}`,
      `\u7EFC\u5408\u7CFB\u6570\uFF1A${coefficient.toFixed(2)}\uFF08\u8FDE\u7EED\u4E92\u52A8 ${state.coefficientState?.streak ?? 0} \u5929\uFF09`,
      `\u4EA4\u4E92\u7EDF\u8BA1\uFF1A\u603B\u8BA1 ${state.chatCount} \u6B21`,
      `\u6700\u540E\u4E92\u52A8\uFF1A${formatTimestamp(state.lastInteractionAt)}`
    ];
    if (shouldRenderImage && puppeteer?.page) {
      const rawId = stripAtPrefix(userId);
      const idParts = rawId.split(":");
      const id = idParts.length > 1 ? idParts[1] : idParts[0];
      const numericId = id.match(/^\d+$/) ? id : void 0;
      const avatarUrl = numericId ? `https://q1.qlogo.cn/g?b=qq&nk=${numericId}&s=640` : void 0;
      const displayPlatform = platform === "onebot" ? "" : platform;
      const buffer = await renderInspect({
        userId: stripAtPrefix(userId),
        nickname: displayNickname,
        platform: displayPlatform,
        relation: record.relation || "\u2014\u2014",
        compositeAffinity: currentCompositeAffinity,
        longTermAffinity: state.longTermAffinity,
        shortTermAffinity: state.shortTermAffinity,
        coefficient,
        streak: state.coefficientState?.streak ?? 0,
        chatCount: state.chatCount,
        lastInteraction: formatTimestamp(state.lastInteractionAt),
        avatarUrl
      });
      if (buffer) return import_koishi16.h.image(buffer, "image/png");
      ctx.logger?.("chatluna-affinity")?.warn?.("\u597D\u611F\u5EA6\u8BE6\u60C5\u56FE\u7247\u6E32\u67D3\u5931\u8D25\uFF0C\u5DF2\u6539\u4E3A\u6587\u672C\u8F93\u51FA");
    }
    return lines.join("\n");
  });
  ctx.command("affinity.blacklist [limit:number] [platform:string] [image]", "\u67E5\u770B\u81EA\u52A8\u9ED1\u540D\u5355\u5217\u8868", { authority: 2 }).alias("\u81EA\u52A8\u9ED1\u540D\u5355").action(async ({ session }, limitArg, platformArg, imageArg) => {
    const parsedLimit = Number(limitArg);
    const limit = Math.max(1, Math.min(Number.isFinite(parsedLimit) ? parsedLimit : config.blacklistDefaultLimit, 100));
    const shouldRenderImage = imageArg === void 0 ? !!config.blacklistRenderAsImage : !["0", "false", "text", "no", "n"].includes(String(imageArg).toLowerCase());
    const puppeteer = ctx.puppeteer;
    if (shouldRenderImage && !puppeteer?.page) return "\u5F53\u524D\u73AF\u5883\u672A\u542F\u7528 puppeteer\uFF0C\u5DF2\u6539\u4E3A\u6587\u672C\u6A21\u5F0F\u3002";
    const groupId = resolveGroupId(session);
    const records = store.listBlacklist(platformArg || session?.platform, groupId);
    if (!records.length) return groupId ? "\u672C\u7FA4\u6682\u65E0\u81EA\u52A8\u62C9\u9ED1\u8BB0\u5F55\u3002" : "\u5F53\u524D\u6682\u65E0\u81EA\u52A8\u62C9\u9ED1\u8BB0\u5F55\u3002";
    const limited = records.slice(0, limit);
    const enriched = await enrichBlacklistRecords(limited, session);
    const textLines = ["# \u6635\u79F0 \u7528\u6237ID \u62C9\u9ED1\u65F6\u95F4 \u5907\u6CE8", ...enriched.map((item, index) => {
      const note = item.note ? item.note : "\u2014\u2014";
      const time = item.blockedAt || "\u2014\u2014";
      const nickname = stripAtPrefix(item.nickname || item.userId);
      const userIdDisplay = stripAtPrefix(item.userId);
      return `${index + 1}. ${nickname} ${userIdDisplay} ${time} ${note}`;
    })];
    if (shouldRenderImage) {
      const items = enriched.map((item, index) => ({
        index: index + 1,
        nickname: stripAtPrefix(item.nickname || item.userId),
        userId: stripAtPrefix(item.userId),
        timeInfo: item.blockedAt || "\u2014\u2014",
        note: item.note || "\u2014\u2014",
        avatarUrl: (() => {
          const rawId = stripAtPrefix(item.userId);
          const numericId = rawId.match(/^\d+$/) ? rawId : void 0;
          return numericId ? `https://q1.qlogo.cn/g?b=qq&nk=${numericId}&s=640` : void 0;
        })()
      }));
      const buffer = await renderBlacklist("\u81EA\u52A8\u9ED1\u540D\u5355", items);
      if (buffer) return import_koishi16.h.image(buffer, "image/png");
      ctx.logger?.("chatluna-affinity")?.warn?.("\u9ED1\u540D\u5355\u56FE\u7247\u6E32\u67D3\u5931\u8D25\u6216\u670D\u52A1\u7F3A\u5931\uFF0C\u5DF2\u6539\u4E3A\u6587\u672C\u8F93\u51FA");
      return textLines.join("\n");
    }
    return textLines.join("\n");
  });
  ctx.command("affinity.block <userId:string> [platform:string]", "\u624B\u52A8\u5C06\u7528\u6237\u52A0\u5165\u81EA\u52A8\u9ED1\u540D\u5355", { authority: 4 }).option("note", "-n <note:text> \u5907\u6CE8\u4FE1\u606F").alias("\u62C9\u9ED1\u4EBA").action(async ({ session, options }, userId, platformArg) => {
    const platform = platformArg || session?.platform;
    if (!platform) return "\u8BF7\u6307\u5B9A\u5E73\u53F0\u3002";
    const groupId = resolveGroupId(session);
    const resolved = await resolveUserIdentity(session, userId);
    const normalizedUserId = resolved.userId;
    if (!normalizedUserId) return "\u7528\u6237 ID \u4E0D\u80FD\u4E3A\u7A7A\u3002";
    if (store.isBlacklisted(platform, normalizedUserId, groupId)) {
      return `${platform}/${normalizedUserId} \u5DF2\u5728\u81EA\u52A8\u9ED1\u540D\u5355\u4E2D\u3002`;
    }
    const note = options?.note || "manual";
    store.recordBlacklist(platform, normalizedUserId, { note, nickname: resolved.nickname, channelId: groupId });
    cache.clear(platform, normalizedUserId);
    const nicknameDisplay = resolved.nickname || normalizedUserId;
    return `\u5DF2\u5C06 ${nicknameDisplay} (${normalizedUserId}) \u52A0\u5165\u81EA\u52A8\u9ED1\u540D\u5355\u3002`;
  });
  ctx.command("affinity.unblock <userId:string> [platform:string]", "\u89E3\u9664\u81EA\u52A8\u9ED1\u540D\u5355", { authority: 4 }).alias("\u89E3\u9664\u62C9\u9ED1").action(async ({ session }, userId, platformArg) => {
    const platform = platformArg || session?.platform;
    if (!platform) return "\u8BF7\u6307\u5B9A\u5E73\u53F0\u3002";
    const normalizedUserId = stripAtPrefix(userId);
    if (!normalizedUserId) return "\u7528\u6237 ID \u4E0D\u80FD\u4E3A\u7A7A\u3002";
    const groupId = resolveGroupId(session);
    const removed = store.removeBlacklist(platform, normalizedUserId, groupId);
    cache.clear(platform, normalizedUserId);
    if (removed) return `\u5DF2\u89E3\u9664 ${platform}/${normalizedUserId} \u7684\u81EA\u52A8\u9ED1\u540D\u5355\u3002`;
    return `${platform}/${normalizedUserId} \u4E0D\u5728\u81EA\u52A8\u9ED1\u540D\u5355\u4E2D\u3002`;
  });
  ctx.command("affinity.tempBlock <userId:string> [durationHours:number] [platform:string]", "\u4E34\u65F6\u62C9\u9ED1\u7528\u6237", { authority: 4 }).option("note", "-n <note:text> \u5907\u6CE8\u4FE1\u606F").option("penalty", "-p <penalty:number> \u6263\u9664\u597D\u611F\u5EA6").alias("\u4E34\u65F6\u62C9\u9ED1").action(async ({ session, options }, userId, durationArg, platformArg) => {
    const platform = platformArg || session?.platform;
    if (!platform) return "\u8BF7\u6307\u5B9A\u5E73\u53F0\u3002";
    const groupId = resolveGroupId(session);
    const resolved = await resolveUserIdentity(session, userId);
    const normalizedUserId = resolved.userId;
    if (!normalizedUserId) return "\u7528\u6237 ID \u4E0D\u80FD\u4E3A\u7A7A\u3002";
    const shortTermCfg = config.shortTermBlacklist || {};
    const durationHours = durationArg || shortTermCfg.durationHours || 12;
    const penalty = options?.penalty ?? shortTermCfg.penalty ?? 5;
    const existing = store.isTemporarilyBlacklisted(platform, normalizedUserId);
    if (existing) {
      return `${platform}/${normalizedUserId} \u5DF2\u5728\u4E34\u65F6\u9ED1\u540D\u5355\u4E2D\uFF0C\u5230\u671F\u65F6\u95F4\uFF1A${existing.expiresAt}`;
    }
    const entry = store.recordTemporaryBlacklist(platform, normalizedUserId, durationHours, penalty, { note: options?.note || "manual", nickname: resolved.nickname, channelId: groupId });
    if (!entry) return `\u6DFB\u52A0\u4E34\u65F6\u9ED1\u540D\u5355\u5931\u8D25\u3002`;
    const selfId = session?.selfId;
    if (penalty > 0 && selfId) {
      try {
        const record = await store.load(selfId, normalizedUserId);
        if (record) {
          const newAffinity = store.clamp((record.longTermAffinity ?? record.affinity) - penalty);
          await store.save({ platform, userId: normalizedUserId, selfId, session }, newAffinity, record.relation || "");
        }
      } catch {
      }
    }
    cache.clear(platform, normalizedUserId);
    const nicknameDisplay = resolved.nickname || normalizedUserId;
    return `\u5DF2\u5C06 ${nicknameDisplay} (${normalizedUserId}) \u52A0\u5165\u4E34\u65F6\u9ED1\u540D\u5355\uFF0C\u65F6\u957F ${durationHours} \u5C0F\u65F6\uFF0C\u6263\u9664\u597D\u611F\u5EA6 ${penalty}\u3002`;
  });
  ctx.command("affinity.tempUnblock <userId:string> [platform:string]", "\u89E3\u9664\u4E34\u65F6\u62C9\u9ED1", { authority: 4 }).alias("\u89E3\u9664\u4E34\u65F6\u62C9\u9ED1").action(async ({ session }, userId, platformArg) => {
    const platform = platformArg || session?.platform;
    if (!platform) return "\u8BF7\u6307\u5B9A\u5E73\u53F0\u3002";
    const normalizedUserId = stripAtPrefix(userId);
    if (!normalizedUserId) return "\u7528\u6237 ID \u4E0D\u80FD\u4E3A\u7A7A\u3002";
    const removed = store.removeTemporaryBlacklist(platform, normalizedUserId);
    cache.clear(platform, normalizedUserId);
    if (removed) return `\u5DF2\u89E3\u9664 ${platform}/${normalizedUserId} \u7684\u4E34\u65F6\u9ED1\u540D\u5355\u3002`;
    return `${platform}/${normalizedUserId} \u4E0D\u5728\u4E34\u65F6\u9ED1\u540D\u5355\u4E2D\u3002`;
  });
  ctx.command("affinity.tempBlacklist [limit:number] [platform:string] [image]", "\u67E5\u770B\u4E34\u65F6\u9ED1\u540D\u5355\u5217\u8868", { authority: 2 }).alias("\u4E34\u65F6\u9ED1\u540D\u5355").action(async ({ session }, limitArg, platformArg, imageArg) => {
    const parsedLimit = Number(limitArg);
    const limit = Math.max(1, Math.min(Number.isFinite(parsedLimit) ? parsedLimit : config.blacklistDefaultLimit, 100));
    const shouldRenderImage = imageArg === void 0 ? !!config.shortTermBlacklist?.renderAsImage : !["0", "false", "text", "no", "n"].includes(String(imageArg).toLowerCase());
    const puppeteer = ctx.puppeteer;
    if (shouldRenderImage && !puppeteer?.page) return "\u5F53\u524D\u73AF\u5883\u672A\u542F\u7528 puppeteer\uFF0C\u5DF2\u6539\u4E3A\u6587\u672C\u6A21\u5F0F\u3002";
    const records = store.listTemporaryBlacklist(platformArg || session?.platform);
    if (!records.length) return "\u5F53\u524D\u6682\u65E0\u4E34\u65F6\u62C9\u9ED1\u8BB0\u5F55\u3002";
    const limited = records.slice(0, limit);
    const textLines = ["# \u6635\u79F0 \u7528\u6237ID \u5230\u671F\u65F6\u95F4 \u65F6\u957F \u60E9\u7F5A \u5907\u6CE8", ...limited.map((item, index) => {
      const note = item.note ? item.note : "\u2014\u2014";
      const expiresAt = item.expiresAt || "\u2014\u2014";
      const nickname = stripAtPrefix(item.nickname || item.userId);
      const userIdDisplay = stripAtPrefix(item.userId);
      return `${index + 1}. ${nickname} ${userIdDisplay} ${expiresAt} ${item.durationHours}h ${item.penalty} ${note}`;
    })];
    if (shouldRenderImage) {
      const items = limited.map((item, index) => ({
        index: index + 1,
        nickname: stripAtPrefix(item.nickname || item.userId),
        userId: stripAtPrefix(item.userId),
        timeInfo: `${item.durationHours} (\u5230\u671F: ${item.expiresAt || "\u2014\u2014"})`,
        note: item.note || "\u2014\u2014",
        isTemp: true,
        penalty: Number(item.penalty),
        avatarUrl: (() => {
          const rawId = stripAtPrefix(item.userId);
          const numericId = rawId.match(/^\d+$/) ? rawId : void 0;
          return numericId ? `https://q1.qlogo.cn/g?b=qq&nk=${numericId}&s=640` : void 0;
        })()
      }));
      const buffer = await renderBlacklist("\u4E34\u65F6\u9ED1\u540D\u5355", items);
      if (buffer) return import_koishi16.h.image(buffer, "image/png");
      ctx.logger?.("chatluna-affinity")?.warn?.("\u4E34\u65F6\u9ED1\u540D\u5355\u56FE\u7247\u6E32\u67D3\u5931\u8D25\uFF0C\u5DF2\u6539\u4E3A\u6587\u672C\u8F93\u51FA");
    }
    return textLines.join("\n");
  });
  ctx.command("affinity.groupList [image]", "\u663E\u793A\u673A\u5668\u4EBA\u5DF2\u52A0\u5165\u7684\u7FA4\u804A", { authority: 2 }).alias("\u7FA4\u804A\u5217\u8868").action(async ({ session }, imageArg) => {
    if (!session) return "\u65E0\u6CD5\u83B7\u53D6\u4F1A\u8BDD\u4FE1\u606F\u3002";
    if (session.platform !== "onebot") return "\u8BE5\u6307\u4EE4\u4EC5\u652F\u6301 OneBot/NapCat \u5E73\u53F0\u3002";
    const list = await fetchGroupList(session);
    if (!list || !list.length) return "\u6682\u65E0\u7FA4\u804A\u6570\u636E\u3002";
    const shouldRenderImage = imageArg === void 0 ? !!config.groupListRenderAsImage : !["0", "false", "text", "no", "n"].includes(String(imageArg).toLowerCase());
    const puppeteer = ctx.puppeteer;
    const groupInfoCfg = config.groupInfo || config.otherVariables?.groupInfo || {};
    const textResult = normalizeGroupList(list, {
      includeMemberCount: groupInfoCfg.includeMemberCount !== false,
      includeCreateTime: groupInfoCfg.includeCreateTime !== false
    });
    if (shouldRenderImage && puppeteer?.page) {
      const groups = list.map((group) => {
        const groupId = String(group.group_id ?? group.groupId ?? group.id ?? "");
        const groupName = String(group.group_name ?? group.groupName ?? group.name ?? groupId);
        const memberCount = group.member_count ?? group.memberCount;
        let createTime;
        const rawCreateTime = group.create_time ?? group.createTime;
        if (groupInfoCfg.includeCreateTime !== false && rawCreateTime) {
          const ts = Number(rawCreateTime);
          if (Number.isFinite(ts)) {
            const date = new Date(ts < 1e11 ? ts * 1e3 : ts);
            createTime = date.toLocaleDateString("zh-CN");
          }
        }
        return { groupId, groupName, memberCount, createTime };
      });
      const buffer = await renderGroupList("\u7FA4\u804A\u5217\u8868", groups);
      if (buffer) return import_koishi16.h.image(buffer, "image/png");
      ctx.logger?.("chatluna-affinity")?.warn?.("\u7FA4\u804A\u5217\u8868\u56FE\u7247\u6E32\u67D3\u5931\u8D25\uFF0C\u5DF2\u6539\u4E3A\u6587\u672C\u8F93\u51FA");
    }
    return textResult;
  });
  const pendingClearConfirmations = /* @__PURE__ */ new Map();
  ctx.command("affinity.clearAll", "\u6E05\u7A7A\u6240\u6709\u597D\u611F\u5EA6\u6570\u636E\uFF08\u5371\u9669\u64CD\u4F5C\uFF09", { authority: 4 }).alias("\u6E05\u7A7A\u597D\u611F\u5EA6").option("confirm", "-y \u786E\u8BA4\u6E05\u7A7A").action(async ({ session, options }) => {
    if (!session) return "\u65E0\u6CD5\u83B7\u53D6\u4F1A\u8BDD\u4FE1\u606F\u3002";
    const sessionKey = `${session.platform}:${session.userId}`;
    const now = Date.now();
    const pending = pendingClearConfirmations.get(sessionKey);
    if (pending && pending.expiresAt > now && options?.confirm) {
      pendingClearConfirmations.delete(sessionKey);
      try {
        await ctx.database.remove(MODEL_NAME, {});
        cache.clearAll?.();
        log("info", "\u597D\u611F\u5EA6\u6570\u636E\u5E93\u5DF2\u6E05\u7A7A", { operator: session.userId, platform: session.platform });
        return "\u2705 \u5DF2\u6210\u529F\u6E05\u7A7A\u6240\u6709\u597D\u611F\u5EA6\u6570\u636E\u3002";
      } catch (error) {
        log("error", "\u6E05\u7A7A\u597D\u611F\u5EA6\u6570\u636E\u5E93\u5931\u8D25", error);
        return "\u274C \u6E05\u7A7A\u6570\u636E\u5E93\u65F6\u53D1\u751F\u9519\u8BEF\uFF0C\u8BF7\u67E5\u770B\u65E5\u5FD7\u3002";
      }
    }
    pendingClearConfirmations.set(sessionKey, { expiresAt: now + 60 * 1e3 });
    return "\u26A0\uFE0F \u8B66\u544A\uFF1A\u6B64\u64CD\u4F5C\u5C06\u6C38\u4E45\u5220\u9664\u6240\u6709\u597D\u611F\u5EA6\u6570\u636E\uFF0C\u4E14\u65E0\u6CD5\u6062\u590D\uFF01\n\u8BF7\u5728 60 \u79D2\u5185\u4F7F\u7528 `affinity.clearAll -y` \u6216 `\u6E05\u7A7A\u597D\u611F\u5EA6 -y` \u786E\u8BA4\u6267\u884C\u3002";
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Config,
  apply,
  inject,
  name
});
