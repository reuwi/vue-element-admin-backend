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
      success: true,
      message: codeMap['20000'],
      data: data || null
    }
  },
  refail(message: string, code: number | null, data: number | null) {
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
}