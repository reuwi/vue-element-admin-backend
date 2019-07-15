import * as Koa from 'koa'
import { config } from './config'
import * as winston from 'winston'
import * as path from 'path'

export function logger(winstonInstance) {
  return async (ctx: Koa.Context, next: () => Promise<any>) => {
    const start = new Date().getMilliseconds()
    let errMessage = ''
    let status: number
    let uid = ''

    try {
      await next()
      status = ctx.status
      uid = ctx.user && ctx.user.id || ''
    } catch (err) {
      status = err.status || 500
      errMessage = err.message || ''
      ctx.throw(status, err.message)
    } finally {
      const ms = new Date().getMilliseconds() - start

      let logLevel: string
      if (status >= 500) {
        logLevel = 'error'
      } else if (status >= 400) {
        logLevel = 'warn'
      } else if (status >= 100) {
        logLevel = 'info'
      }

      const msg = `${Date.now()} ${uid} ${ctx.method} ${ctx.originalUrl} ${status} ${ms}ms ${errMessage}`

      winstonInstance.configure({
        level: config.debugLogging ? 'debug' : 'info',
        transports: [
          // - Write all logs error (and below) to `error.log`.
          // new winston.transports.File({ filename: path.resolve(__dirname, '../log', 'info.log'), level: 'info' }),
          new winston.transports.File({ filename: path.resolve(__dirname, '../log', 'error.log'), level: 'error' }),
          // new winston.transports.File({ filename: path.resolve(__dirname, '../log', 'warn.log'), level: 'warn' }),

          // - Write to all logs with specified level to console.
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            )
          })
        ]
      })
      winstonInstance.log(logLevel, msg)
    }
  }
}