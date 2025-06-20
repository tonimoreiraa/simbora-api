// start/routes.ts
import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

// Controllers
const AuthController = () => import('#controllers/auth_controller')
const CategoriesController = () => import('#controllers/categories_controller')
const ProductsController = () => import('#controllers/products_controller')
const UserAddressesController = () => import('#controllers/user_addresses_controller')
const OrdersController = () => import('#controllers/orders_controller')
const SwaggerController = () => import('#controllers/swagger_controller')

// ========================================
// ROTAS DA DOCUMENTAÇÃO SWAGGER
// ========================================
router.get('/docs', [SwaggerController, 'index'])
router.get('/openapi', [SwaggerController, 'json'])

// ========================================
// ROTAS DE AUTHENTICATION
// ========================================
router.post('/auth/sign-up', [AuthController, 'signUp'])
router.post('/auth/sign-in', [AuthController, 'signIn'])

// ========================================
// ROTAS PÚBLICAS
// ========================================
router.resource('/categories', CategoriesController)
router.resource('/products', ProductsController)

// ========================================
// ROTAS PROTEGIDAS (COM AUTH)
// ========================================
router
  .group(() => {
    router
      .resource('/user-addresses', UserAddressesController)
      .only(['store', 'destroy', 'index', 'show'])

    router.resource('/orders', OrdersController).only(['index', 'show', 'store'])
    router.get('/auth/session', [AuthController, 'getSession'])
  })
  .middleware(middleware.auth())

// ========================================
// ROTA PARA SERVIR ARQUIVOS UPLOADS
// ========================================
router.get('/uploads/:file', async ({ response, params }) => {
  const filePath = app.tmpPath(`uploads/${params.file}`)
  response.attachment(filePath, params.file)
})
