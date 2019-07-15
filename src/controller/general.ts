import { BaseContext } from 'koa'
import * as jwt from 'jsonwebtoken'
import { config } from '../config'
import { getManager, Repository, Not, Equal } from 'typeorm'
import { User } from '../entity/user'
export default class GeneralController {

  public static async login(ctx: BaseContext) {
    const { username, password } = ctx.request.body
    if (!username || !password) {
      ctx.status = 422
      ctx.body = {
        status: 0,
        msg: '用户名或密码不能为空'
      }
      return
    }
    // get a user repository to perform operations with user
    const userRepository: Repository<User> = getManager().getRepository(User)
    // load user by id
    const user: User = await userRepository.findOne({
      where: {
        username
      }
    })
    const { jwtSecret, jwtExpire } = config
    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: jwtExpire })
    if (user && user.password === password) {
      ctx.status = 200
      ctx.body = ctx.util.resuccess({ token })
      return
    }
    ctx.throw(422, '用户名或密码错误')
  }
  public static logout(ctx: BaseContext) {
    ctx.status = 200
    ctx.body = ctx.util.resuccess('success')
  }
}