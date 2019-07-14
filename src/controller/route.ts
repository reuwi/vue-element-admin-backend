import { BaseContext } from 'koa'
import { getManager, Repository, getConnection } from 'typeorm'
import { Route } from '../entity/route'
import { flat2tree } from '../utils'

export default class RouteController {
  public static async getRoutes(ctx: BaseContext) {
    const routeRepository: Repository<Route> = getManager().getRepository(Route)
    const routes: Route[] = await routeRepository.find({ relations: ['parent', 'roles'] })
    const routeProps = ['id', 'parentId', 'name', 'component', 'redirect', 'path', 'hidden']
    const mapedRoutes = routes.map(route => {
      let obj = { parentId: route.parent && route.parent.id, meta: {}}
      delete route.parent
      for (let key in route) {
        if (!routeProps.includes(key)) {
          obj.meta = Object.assign(obj.meta, { [key]: route[key] })
        } else {
          obj[key] = route[key]
        }
      }
      return obj
    })

    ctx.status = 200
    ctx.body = {
      code: 20000,
      msg: 'success',
      data: flat2tree(mapedRoutes)
    }
  }

  public static async createRoute(ctx: BaseContext) {
    const routeRepository: Repository<Route> = getManager().getRepository(Route)
    const { meta, ...routeData } = ctx.request.body
    if (!routeData || !meta) {
      ctx.status = 200
      ctx.body = ctx.util.refail(null, 400001)
    }
    const routeTobeCreated: Route = Object.assign(new Route(), routeData, ...routeData.meta)
    const route: Route = await routeRepository.save(routeTobeCreated)
    ctx.status = 200
    ctx.body = ctx.util.resuccess(route.id)
  }

  public static async updateRoute(ctx: BaseContext) {
    const routeRepository: Repository<Route> = getManager().getRepository(Route)
    const { id }: { id: string } = ctx.params
    const { meta: metaData, ...routeData } = ctx.request.body
    if (!routeData || !metaData) {
      ctx.status = 200
      ctx.body = ctx.util.refail(null, 400001)
    }
    const routeToBeUpdated: Route | null = await routeRepository.findOne({ id: Number(id) })

    if (!routeToBeUpdated) {
      ctx.status = 200
      ctx.body = {
        code: 40004,
        msg: '请求的资源不存在'
      }
    } else {
      const route: Route = Object.assign(routeToBeUpdated, ctx.request.body, ctx.request.body.meta)
      await routeRepository.save(route)
      ctx.status = 200
      ctx.body = {
        code: 20000,
        msg: 'success'
      }
    }
  }

  public static async deleteRoute(ctx: BaseContext) {
    const { id } = ctx.params
    const routeRepository: Repository<Route> = getManager().getRepository(Route)
    const parent = await routeRepository.findOne({ id })

    if (!parent) {
      ctx.status = 200
      ctx.body = ctx.util.refail('请求的资源不存在')
      return
    }
    if (await routeRepository.findOne({ parent })) {
      ctx.status = 200
      ctx.body = ctx.util.refail({
        msg: '请先删除该路由下的子路由'
      })
      return
    }
    await routeRepository.delete({
      id: Number(id)
    })
    ctx.status = 200
    ctx.body = ctx.util.resuccess()
  }

  public static async importRoutes(ctx: BaseContext) {
    const { routes } = ctx.request.body
    const routeRepository: Repository<Route> = getManager().getRepository(Route)
    const batchInsertRoutes = async (routes, parent) => {
      const routeRows = await Promise.all(routes.map(async (route, index) => {
        delete route.parentId
        let parentRowData = await routeRepository.findOne({ id: parent && parent.id })
        Object.assign(route, route.meta, { roles: [] }, { order: index })
        parentRowData && (route.parent = parentRowData)
        return route
      }))
      await getConnection()
        .createQueryBuilder()
        .insert()
        .into(Route)
        .values(routeRows)
        .execute()
      routes.forEach(async el => {
        if (!el.children || !el.children.length) return
        await batchInsertRoutes(el.children, el)
      })
    }
    if (!routes) {
      ctx.status = 200
      ctx.body = ctx.refail(null, 40001)
    } else {
      await batchInsertRoutes(routes, null)
      ctx.status = 200
      ctx.body = ctx.util.resuccess()
    }
  }
}