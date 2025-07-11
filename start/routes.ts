import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const AuthController = () => import('#controllers/auth_controller')
const CategoriesController = () => import('#controllers/categories_controller')
const ProductsController = () => import('#controllers/products_controller')
const ProductVariantsController = () => import('#controllers/product_variants_controller')
const ProductVariantTypesController = () => import('#controllers/product_variant_types_controller')
const UserAddressesController = () => import('#controllers/user_addresses_controller')
const OrdersController = () => import('#controllers/orders_controller')
const SwaggerController = () => import('#controllers/swagger_controller')
const ProfileController = () => import('#controllers/profile_controller')
const CouponsController = () => import('#controllers/coupons_controller')
const UsersController = () => import('#controllers/users_controller')
const OrderSharesController = () => import('#controllers/order_shares_controller')

router.get('/docs', [SwaggerController, 'index'])
router.get('/openapi', [SwaggerController, 'json'])
router.post('/auth/sign-up', [AuthController, 'signUp'])
router.post('/auth/sign-in', [AuthController, 'signIn'])
router.resource('/categories', CategoriesController)
router.resource('/products', ProductsController)
router.resource('/product-variants', ProductVariantsController).only(['index', 'show'])
router.resource('/product-variant-types', ProductVariantTypesController).only(['index', 'show'])
router
  .group(() => {
    router
      .resource('/user-addresses', UserAddressesController)
      .only(['store', 'destroy', 'index', 'show'])

    router.resource('/orders', OrdersController).only(['index', 'show', 'store'])
    router.post('/order-shares/share', [OrderSharesController, 'share'])
    router.patch('/order-shares/view', [OrderSharesController, 'view'])
    router.get('/auth/session', [AuthController, 'getSession'])
    router.get('/profile', [ProfileController, 'index'])
    router.put('/profile', [ProfileController, 'update'])
    router
      .resource('/coupons', CouponsController)
      .only(['index', 'show', 'store', 'update', 'destroy'])
    router.get('/coupons/:code/verify', [CouponsController, 'verifyCoupon'])
    router
      .resource('/product-variants', ProductVariantTypesController)
      .only(['store', 'update', 'destroy'])
    router
      .resource('/product-variant-types', ProductVariantTypesController)
      .only(['store', 'update', 'destroy'])

    router.get('/users', [UsersController, 'index'])
  })
  .middleware(middleware.auth())

router.get('/uploads/:file', async ({ response, params }) => {
  const filePath = app.tmpPath(`uploads/${params.file}`)
  response.attachment(filePath, params.file)
})
