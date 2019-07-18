import { BaseContext } from 'koa'
import { getManager, Repository, getConnection } from 'typeorm'
import { Role } from '../entity/role'
import { Route } from '../entity/route'

export default class RoleController {
  public static async getRoles(ctx: BaseContext) {
    const roleRepository: Repository<Role> = getManager().getRepository(Role)
    const roles: Role[] = await roleRepository.find({ relations: ['routes'] })
    ctx.status = 200
    ctx.body = ctx.util.resuccess(roles.map(el => Object.assign(el, { key: el.id })))
  }

  public static async createRole(ctx: BaseContext) {
    const roleRepository: Repository<Role> = getManager().getRepository(Role)
    const roleData = ctx.request.body
    const role: Role = await roleRepository.save(roleData)
    ctx.status = 200
    ctx.body = ctx.util.resuccess(Object.assign(role, { key: role.id }))
  }

  public static async deleteRole(ctx: BaseContext) {
    const roleRepository: Repository<Role> = getManager().getRepository(Role)
    const { id } = ctx.params
    await roleRepository.delete({
      id: Number(id)
    })
    ctx.status = 200
    ctx.body = ctx.util.resuccess({})
  }

  public static async updateRole(ctx: BaseContext) {
    const roleRepository: Repository<Role> = getManager().getRepository(Role)
    const routeRepository: Repository<Route> = getManager().getRepository(Route)
    const { id } = ctx.params
    const roleData = ctx.request.body
    const role: Role = await roleRepository.findOne(Number(id), { relations: ['routes'] })
    const getRoutesIds = routes => {
      return routes.reduce((arr, route) => {
        arr.push(route.id)
        if (route.children && route.children.length) {
          console.log(2222222, getRoutesIds(route.children))
          arr.push(...getRoutesIds(route.children))
        }
        return arr
      }, [])
    }
    console.log('------', getRoutesIds(roleData.routes))
    const routes = await Promise.all(getRoutesIds(roleData.routes).map(async routeId => {
      let route = await routeRepository.findOne({ id: routeId })
      return route
    }))
    roleData.routes = routes
    console.log(routes)
    await roleRepository.save(Object.assign(role, roleData))
    ctx.status = 200
    ctx.body = ctx.util.resuccess({})
  }
}