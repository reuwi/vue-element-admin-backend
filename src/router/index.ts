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


export { router }