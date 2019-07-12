import { BaseContext } from 'Koa'

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
      msg: codeMap['20000'],
      data: data || null
    }
  },
  refail(msg: string, code: number | null, data: number | null) {
    return {
      code: code || -1,
      msg: msg || codeMap[code],
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
      return await next()
    }
    catch (err) {
      console.error(err)
      const statusMsgMap = {
        401: 'Protected resource, use Authorization header to get access\n',
        404: 'Request Not Found',
        500: 'Server Interval Error'
      }
      const codeMap = {
        401: 40001,
        404: 40004,
        500: 50000
      }
      const msg = statusMsgMap[err.status || 500] || 'Server Interval Error'
      const code = codeMap[err.status]
      ctx.status = 200
      ctx.body = ctx.util.refail(msg, code)
    }
  }
}