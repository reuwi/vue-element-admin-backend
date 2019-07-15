import * as cors from '@koa/cors'
import * as dotenv from 'dotenv'
import * as Koa from 'koa'
import * as koaBody from 'koa-body'
import * as helmet from 'koa-helmet'
import * as jwt from 'koa-jwt'
import * as PostgressConnectionStringParser from 'pg-connection-string'
import 'reflect-metadata'
import { createConnection } from 'typeorm'
import * as winston from 'winston'

import * as path from 'path'
import * as pathToRegexp from 'path-to-regexp'
import { Middleware } from './middleware'
import { config } from './config'
import { logger } from './logging'
import { router } from './router'

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: '.env' })

// Get DB connection options from env variable
const connectionOptions = PostgressConnectionStringParser.parse(config.databaseUrl)

// create connection with database
// note that its not active database connection
// TypeORM creates you connection pull to uses connections from pull on your requests
createConnection({
  host: connectionOptions.host,
  type: 'postgres',
  port: connectionOptions.port,
  username: connectionOptions.user,
  password: connectionOptions.password,
  database: connectionOptions.database,
  synchronize: true,
  logging: false,
  entities: [
    path.resolve(__dirname, 'entity/*.ts'),
  ],
  extra: {
    ssl: config.dbsslconn, // if not development, will use SSL
  },
}).then(async (connection) => {

  const app = new Koa()

  app.use(Middleware.errHandler)

  // Provides important security headers to make your app more secure
  app.use(helmet())

  // Enable cors with default options
  app.use(cors())

  // Logger middleware -> use winston as logger (logging.ts with config)
  app.use(logger(winston))

  // Enable bodyParser with default options
  app.use(koaBody({ multipart: true }))

  app.use(Middleware.util)
  // JWT middleware -> below this line routes are only reached if JWT token is valid, secret as env variable
  app.use(jwt({
    secret: config.jwtSecret,
    getToken: ctx => {
      return ctx.headers['x-token'] // all header key will be transfered to small case
    }
  }).unless((ctx: Koa.Context) => {
    if (/^\/api/.test(ctx.path)) {
      return pathToRegexp([
        '/api/user/login',
        '/api/user/logout',
        '/api/routes',
        '/api/routes/import'
      ]).test(ctx.path)
    }
    return true
  }))

  // this routes are protected by the JWT middleware,
  // also include middleware to respond with "Method Not Allowed - 405".
  app.use(router.routes()).use(router.allowedMethods())

  app.listen(config.port)

  console.info(`Server running on port ${config.port}`)

}).catch((error) => console.info('TypeORM connection error: ', error))
