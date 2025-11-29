import type { Context } from 'koishi'
import type { Config, LogFn, LogLevel } from '../types'

interface Logger {
  debug?: (...args: unknown[]) => void
  info?: (...args: unknown[]) => void
  warn?: (...args: unknown[]) => void
  error?: (...args: unknown[]) => void
  log?: (...args: unknown[]) => void
}

export function createLogger(ctx: Context, config: Config): LogFn {
  const base: Logger = ctx.logger ? ctx.logger('chatluna-affinity') : console
  
  return (level: LogLevel, message: string, detail?: unknown): void => {
    if (!config.debugLogging) return
    
    const writer = typeof base?.[level] === 'function' 
      ? base[level]! 
      : base?.info ?? base?.log ?? console.log
    
    if (detail === undefined) {
      writer.call(base, message)
    } else {
      writer.call(base, message, detail)
    }
  }
}
