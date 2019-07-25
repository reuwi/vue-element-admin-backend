import { BaseContext } from 'koa'
import * as fs from 'fs'
import * as path from 'path'
import * as moment from 'moment'
import * as mkdirp from 'mkdirp'
import * as crypto from 'crypto'

const uploadConf = {
  dir: '../upload',
  types: ['jpg', 'gif'],
  size: 10000000
}

export default class Util {
  public static async upload(ctx: BaseContext) {
    console.log(1111111111, crypto)
    const hash = crypto.createHash('md5')
    const date = moment().format('YYYY-MM-DD')
    const customPath = ctx.request.query.path || date
    const uploadDir = path.resolve(__dirname, uploadConf.dir, customPath)
    console.log(ctx.request.body, 2222222222)
    const file = ctx.request.body.files.file
    const suffix = path.extname(file.name).toLowerCase()
    const now = (new Date()).getTime()
    const fileName = hash.update(now + Math.random().toString()).digest('hex') + suffix

    let reader
    let stream

    /* istanbul ignore if */
    if (!fs.existsSync(uploadDir)) mkdirp.sync(uploadDir)

    if (uploadConf.types.indexOf(suffix) === -1) {
      ctx.body = ctx.util.refail(`上传失败，仅支持 ${uploadConf.types.join('/').replace(/\./g, '')} 文件类型`)
      return
    }

    if (file.size > uploadConf.size) {
      ctx.body = ctx.util.refail('上传失败，超过限定大小')
      return
    }

    reader = fs.createReadStream(file.path)
    stream = fs.createWriteStream(path.join(uploadDir, fileName))
    reader.pipe(stream)

    ctx.body = ctx.util.resuccess({
      path: uploadDir
    })
  }
}