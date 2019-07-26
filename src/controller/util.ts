import { BaseContext } from 'koa'
import * as fs from 'fs'
import * as path from 'path'
import * as moment from 'moment'
import * as mkdirp from 'mkdirp'
import * as crypto from 'crypto'

const uploadConf = {
  dir: 'upload',
  types: ['.jpg', '.gif', '.png'],
  size: 10000000
}

export default class Util {
  public static async upload(ctx: BaseContext) {
    const hash = crypto.createHash('md5')
    const date = moment().format('YYYY-MM-DD')
    const customPath = ctx.request.query.path || `default/${date}`
    const uploadDir = path.resolve('.', uploadConf.dir, customPath)
    const file = ctx.request.files.file
    const suffix = path.extname(file.name).toLowerCase()
    const now = (new Date()).getTime()
    const fileName = hash.update(now + Math.random().toString()).digest('hex') + suffix

    /* istanbul ignore if */
    if (!fs.existsSync(uploadDir)) mkdirp.sync(uploadDir)

    if (uploadConf.types.indexOf(suffix) === -1) {
      ctx.throw(400, `Upload failed, ${suffix} is not supported, only ${uploadConf.types.join('/').replace(/\./g, '')} are supported`)
      return
    }

    if (file.size > uploadConf.size) {
      ctx.throw(400, 'Upload failed, file size exceeded ')
      return
    }

    const reader = fs.createReadStream(file.path)
    const stream = fs.createWriteStream(path.join(uploadDir, fileName))
    reader.pipe(stream)

    ctx.body = ctx.util.resuccess({
      path: path.join(uploadDir, fileName).replace(path.resolve('.'), '')
    })
  }
}