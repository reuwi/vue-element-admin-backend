import * as Router from 'koa-router'
import * as controller from '../controller'

const router = new Router({ prefix: '/api' })

// GENERAL ROUTES
router.post('/user/login', controller.general.login)
router.post('/user/logout', controller.general.logout)

// USER ROUTES
router.get('/users', controller.user.getUsers)
router.get('/users/:id', controller.user.getUser)
router.post('/users', controller.user.createUser)
router.put('/users/:id', controller.user.updateUser)
router.delete('/users/:id', controller.user.deleteUser)
router.get('/user/info', controller.user.getUser)

// Route Routes
router.get('/routes', controller.route.getRoutes)
router.post('/routes', controller.route.createRoute)
router.delete('/routes/:id', controller.route.deleteRoute)
router.put('/routes', controller.route.importRoutes)
router.put('/routes/:id', controller.route.updateRoute)

export { router }