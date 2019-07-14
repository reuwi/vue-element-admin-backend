import * as Koa from 'koa'
import { config } from './config'
import * as winston from 'winston'
import * as path from 'path'

export function logger(winstonInstance) {
  return async (ctx: Koa.Context, next: () => Promise<any>) => {
    const start = new Date().getMilliseconds()

    try {
      await next()
    } finally {
      const ms = new Date().getMilliseconds() - start

      let logLevel: string
      if (ctx.status >= 500) {
        logLevel = 'error'
      } else if (ctx.status >= 400) {
        logLevel = 'warn'
      } else if (ctx.status >= 100) {
        logLevel = 'info'
      }

      const msg = `${Date.now()} ${ctx.method} ${ctx.originalUrl} ${ctx.status} ${ms}ms`

      winstonInstance.configure({
        level: 'info',
        transports: [
          //
          // - Write all logs error (and below) to `error.log`.
          new winston.transports.File({ filename: path.resolve(__dirname, '../log', 'error.log'), level: 'error' }),
          new winston.transports.File({ filename: path.resolve(__dirname, '../log', 'warn.log'), level: 'warn' }),
          new winston.transports.File({ filename: path.resolve(__dirname, '../log', 'info.log'), level: 'info' }),
          //
          // - Write to all logs with specified level to console.
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            )
          })
        ]
      })
      console.log(11111111111, logLevel)
      winstonInstance.log(logLevel, msg)
    }
  }
}