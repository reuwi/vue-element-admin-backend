import { BaseContext } from 'koa'

const codeMap = {
  '-1': 'fail',
  '20000': 'success',
  '40001': 'token expired',
  '50000': 'server error',
  '10001': 'params error'
}

const utilFn = {
  resuccess(data: any) {
    return {
      code: 20000,
      message: codeMap['20000'],
      data: data || null
    }
  },
  refail(message?: string, code?: number, data?: number) {
    return {
      code: code || -1,
      message: message || codeMap[code],
      data: data || null
    }
  }
}

export class Middleware {
  public static util(ctx: BaseContext, next: () => Promise<any>) {
    ctx.util = utilFn
    return next()
  }
  public static async errHandler(ctx: BaseContext, next: () => Promise<any>) {
    try {
      await next()
    } catch (err) {
      console.error(err)
      const statusMsgMap = {
        400: 'Request Params Error',
        401: 'Protected resource, use Authorization header to get access\n',
        404: 'Request Not Found',
        422: 'Username Or Password Error',
        500: 'Server Interval Error'
      }
      const codeMap = {
        400: 40000,
        401: 50008,
        404: 40004,
        422: 40022,
        500: 50000
      }
      const message = statusMsgMap[err.status] || 'Server Interval Error'
      const code = codeMap[err.status]
      ctx.status = 200
      ctx.body = utilFn.refail(message, code)
    }
  }
}