/**
 * 默认值常量
 * 包含好感度、时间、阈值等默认配置
 */
export declare const AFFINITY_DEFAULTS: {
    readonly MIN: 0;
    readonly MAX: 100;
    readonly INITIAL_MIN: 20;
    readonly INITIAL_MAX: 40;
    readonly MAX_INCREASE_PER_MESSAGE: 5;
    readonly MAX_DECREASE_PER_MESSAGE: 10;
};
export declare const SHORT_TERM_DEFAULTS: {
    readonly PROMOTE_THRESHOLD: 15;
    readonly DEMOTE_THRESHOLD: -15;
    readonly LONG_TERM_STEP: 3;
};
export declare const ACTION_WINDOW_DEFAULTS: {
    readonly WINDOW_HOURS: 24;
    readonly INCREASE_BONUS: 2;
    readonly DECREASE_BONUS: 2;
    readonly BONUS_CHAT_THRESHOLD: 0;
    readonly ALLOW_BONUS_OVERFLOW: false;
    readonly MAX_ENTRIES: 60;
};
export declare const COEFFICIENT_DEFAULTS: {
    readonly BASE: 1;
    readonly MAX_DROP: 0.3;
    readonly MAX_BOOST: 0.3;
    readonly DECAY_PER_DAY_RATIO: 3;
    readonly BOOST_PER_DAY_RATIO: 3;
    readonly FALLBACK_DECAY: 0.1;
    readonly FALLBACK_BOOST: 0.1;
};
export declare const TIME_CONSTANTS: {
    readonly MS_PER_SECOND: 1000;
    readonly MS_PER_MINUTE: number;
    readonly MS_PER_HOUR: number;
    readonly MS_PER_DAY: number;
    readonly SECONDS_THRESHOLD: 100000000000;
};
export declare const THRESHOLDS: {
    readonly BLACKLIST_DEFAULT: -50;
    readonly MIN_ENTRIES: 10;
    readonly MIN_WINDOW_HOURS: 1;
};
export declare const RENDER_CONSTANTS: {
    readonly VIEWPORT_WIDTH: 800;
    readonly VIEWPORT_BASE_HEIGHT: 220;
    readonly VIEWPORT_ROW_HEIGHT: 48;
};
export declare const TIMING_CONSTANTS: {
    readonly ANALYSIS_TIMEOUT: 30000;
    readonly BOT_REPLY_DELAY: 3000;
    readonly SCHEDULE_RETRY_DELAY: 2000;
    readonly SCHEDULE_CHECK_INTERVAL: 60000;
};
export declare const FETCH_CONSTANTS: {
    readonly HISTORY_LIMIT_MULTIPLIER: 6;
    readonly MIN_HISTORY_LIMIT: 60;
    readonly RANK_FETCH_MULTIPLIER: 5;
    readonly RANK_FETCH_OFFSET: 20;
    readonly MAX_RANK_FETCH: 200;
};
export declare const BASE_AFFINITY_DEFAULTS: {
    readonly initialRandomMin: 20;
    readonly initialRandomMax: 40;
    readonly maxIncreasePerMessage: 5;
    readonly maxDecreasePerMessage: 5;
};
