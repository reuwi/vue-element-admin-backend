import { BaseContext } from 'koa'
import { getManager, Repository, getConnection } from 'typeorm'
import { Route } from '../entity/route'
import { RouteMeta } from '../entity/route-meta'

export default class RouteController {
  public static async getRoutes(ctx: BaseContext) {
    const routeRepository: Repository<Route> = getManager().getRepository(Route)
    const routes: Route[] = await routeRepository.find()

    ctx.status = 200
    ctx.body = {
      code: 20000,
      msg: 'success',
      data: routes
    }
  }

  public static async createRoute(ctx: BaseContext) {
    const routeRepository: Repository<Route> = getManager().getRepository(Route)
    const { meta, ...routeData } = ctx.request.body
    if (!routeData || !meta) {
      ctx.status = 200
      ctx.body = ctx.util.refail(null, 400001)
    }
    const metaTobeCreated: RouteMeta = Object.assign(new RouteMeta(), meta)
    const routeTobeCreated: Route = Object.assign(new Route(), routeData, { meta: metaTobeCreated })
    const route: Route = await routeRepository.save(routeTobeCreated)
    ctx.status = 200
    ctx.body = ctx.util.resuccess(route.id)
  }

  public static async updateRoute(ctx: BaseContext) {
    const routeRepository: Repository<Route> = getManager().getRepository(Route)
    const routeMetaRepository: Repository<RouteMeta> = getManager().getRepository(RouteMeta)
    const { id }: { id: string } = ctx.params
    const { meta: metaData, ...routeData } = ctx.request.body
    if (!routeData || !metaData) {
      ctx.status = 200
      ctx.body = ctx.util.refail(null, 400001)
    }
    const routeMetaTobeUpdated: RouteMeta = await routeMetaRepository.findOne({ route: routeData })
    const routeToBeUpdated: Route | null = await routeRepository.findOne({ id: Number(id) })

    if (!routeToBeUpdated) {
      ctx.status = 200
      ctx.body = {
        code: 40004,
        msg: '请求的资源不存在'
      }
    } else {
      const meta: RouteMeta = Object.assign(routeMetaTobeUpdated, metaData)
      const route: Route = Object.assign(routeToBeUpdated, ctx.request.body, { meta })
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
    if (await routeRepository.findOne({
      parentId: Number(id)
    })) {
      ctx.status = 200
      ctx.body = ctx.util.refail({
        msg: '请先删除该路由下的子路由'
      })
    } else {
      await routeRepository.delete({
        id: Number(id)
      })
      ctx.status = 200
      ctx.body = ctx.util.resuccess()
    }
  }

  public static async importRoutes(ctx: BaseContext) {
    const { routes }: { routes: Route[] } = ctx.body

    if (!routes) {
      ctx.status = 200
      ctx.body = ctx.refail(null, 40001)
    } else {
      await getConnection()
        .createQueryBuilder()
        .insert()
        .into(Route)
        .values(routes.map(el => {
          el.id = Number(el.id)
          el.parentId = Number(el.parentId)
          return el
        }))
        .execute()
      ctx.status = 200
      ctx.body = ctx.util.resuccess()
    }
  }
}