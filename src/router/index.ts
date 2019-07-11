import * as Router from 'koa-router'
import * as controller from '../controller'

const router = new Router({ prefix: '/api' })

// GENERAL ROUTES
router.post('/login', controller.general.login)

// USER ROUTES
router.get('/users', controller.user.getUsers)
router.get('/users/:id', controller.user.getUser)
router.post('/users', controller.user.createUser)
router.put('/users/:id', controller.user.updateUser)
router.delete('/users/:id', controller.user.deleteUser)

// Route Routes
router.get('/routes', controller.route.getRoutes)
router.post('/routes', controller.route.createRoute)
router.delete('/routes/:id', controller.route.deleteRoute)
router.put('/routes/:id', controller.route.updateRoute)
router.post('/routes/import', controller.route.importRoutes)

export { router }