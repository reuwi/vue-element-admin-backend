import { BaseContext } from 'koa'
import { getManager, Repository, Not, Equal } from 'typeorm'
import { validate, ValidationError } from 'class-validator'
import { User } from '../entity/user'
import { Role } from '../entity/role'

export default class UserController {

  public static async getUsers(ctx: BaseContext) {
    const { pageNum = 1, pageSize = 20 } = ctx.request.body
    // get a user repository to perform operations with user
    const userRepository: Repository<User> = getManager().getRepository(User)

    // load all users
    const [items, total]: [User[], number] = await userRepository.findAndCount({
      select: ['id', 'username', 'email', 'avatar'],
      relations: ['roles'],
      skip: (pageNum - 1) * pageSize,
      take: pageSize
    })

    // return OK status code and loaded users array
    ctx.status = 200
    ctx.body = ctx.util.resuccess({
      total,
      items
    })
  }

  public static async getUser(ctx: BaseContext) {

    // get a user repository to perform operations with user
    const userRepository: Repository<User> = getManager().getRepository(User)
    let { id } = ctx.params
    let user: User | null
    if (id === 'me' || ctx.path.endsWith('/user/info')) {
      id = ctx.state.user.id
    } else {
      id = Number(ctx.params.id)
    }
    // load user by id
    user = await userRepository.findOne(id, {
      relations: ['roles'],
      select: ['id', 'username', 'email', 'avatar']
    })

    if (user) {
      // return OK status code and loaded user object
      ctx.status = 200
      ctx.body = ctx.util.resuccess(Object.assign(user, { roles: user.roles.map(el => el.name) }))
    } else {
      // return a BAD REQUEST status code and error message
      ctx.throw(400, 'The user you are trying to retrieve doesn\'t exist in the db')
    }

  }

  public static async createUser(ctx: BaseContext) {

    // get a user repository to perform operations with user
    const userRepository: Repository<User> = getManager().getRepository(User)
    const {
      username,
      password,
      email,
      avatar,
      roles
    } = ctx.request.body
    // build up entity user to be saved
    const userToBeSaved: User = Object.assign(new User(), {
      username,
      password,
      email,
      avatar,
      roles: roles.map(role => Object.assign(new Role(), { id: role.id }))
    })

    // validate user entity
    const errors: ValidationError[] = await validate(userToBeSaved) // errors is an array of validation errors

    if (errors.length > 0) {
      // return BAD REQUEST status code and errors array
      ctx.throw(400, errors)
    } else if (await userRepository.findOne({ email: userToBeSaved.email })) {
      // return BAD REQUEST status code and email already exists error
      ctx.throw(400, 'The specified username already exists')
    } else {
      // save the user contained in the POST body
      const user = await userRepository.save(userToBeSaved)
      // return CREATED status code and updated user
      ctx.status = 200
      ctx.body = ctx.util.resuccess({
        id: user.id
      })
    }
  }

  public static async updateUser(ctx: BaseContext) {

    const userRepository: Repository<User> = getManager().getRepository(User)
    const userToBeUpdated: User | null = await userRepository.findOne(Number(ctx.params.id))
    if (!userToBeUpdated) {
      return ctx.throw(404, 'User Not Found')
    }

    const userToBeSaved = Object.assign(userToBeUpdated, ctx.request.body)
    if (ctx.request.body.roles) {
      userToBeSaved.roles = ctx.request.body.roles.map(el => Object.assign(new Role(), { id: el.id }))
    }
    // validate user entity
    const errors: ValidationError[] = await validate(userToBeSaved) // errors is an array of validation errors
    if (errors.length > 0) {
      // return BAD REQUEST status code and errors array
      ctx.throw(400, errors)
    } else if (await userRepository.findOne({ id: Not(Equal(userToBeUpdated.id)), email: userToBeUpdated.email })) {
      // return BAD REQUEST status code and email already exists error
      ctx.throw(400, 'The specified e-mail address already exists')
    } else {
      // save the user contained in the PUT body
      const user = await userRepository.save(userToBeUpdated)
      // return CREATED status code and updated user
      ctx.status = 200
      ctx.body = ctx.util.resuccess(user)
    }
  }

  public static async deleteUser(ctx: BaseContext) {

    // get a user repository to perform operations with user
    const userRepository = getManager().getRepository(User)

    // find the user by specified id
    const userToRemove: User = await userRepository.findOne(Number(ctx.params.id) || 0)
    if (!userToRemove) {
      // return a BAD REQUEST status code and error message
      ctx.throw(400, 'The user you are trying to delete doesn\'t exist in the db')
    } else if (Number(ctx.state.user.id) !== userToRemove.id && ctx.state.user.id !== 1) {
      // check user's token id and user id are the same
      // if not, return a FORBIDDEN status code and error message
      ctx.throw(403, 'A user can only be deleted by himself')
    } else {
      // the user is there so can be removed
      await userRepository.remove(userToRemove)
      // return a NO CONTENT status code
      ctx.status = 200
      ctx.body = ctx.util.resuccess()
    }
  }
}
