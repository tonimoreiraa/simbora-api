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
const OrderPaymentsController = () => import('#controllers/order_payments_controller')
const OrderActivityLogsController = () => import('#controllers/order_activity_logs_controller')
const OrderUpdatesController = () => import('#controllers/order_updates_controller')
const OrderShippingsController = () => import('#controllers/order_shippings_controller')
const SwaggerController = () => import('#controllers/swagger_controller')
const ProfileController = () => import('#controllers/profile_controller')
const CouponsController = () => import('#controllers/coupons_controller')
const UsersController = () => import('#controllers/users_controller')
const OrderSharesController = () => import('#controllers/order_shares_controller')
const NotificationsController = () => import('#controllers/notifications_controller')
const SuppliersController = () => import('#controllers/suppliers_controller')

router.get('/docs', [SwaggerController, 'index'])
router.get('/openapi', [SwaggerController, 'json'])
router.post('/auth/sign-up', [AuthController, 'signUp'])
router.post('/auth/sign-in', [AuthController, 'signIn'])
router.resource('/categories', CategoriesController)
router.resource('/products', ProductsController)
router.resource('/product-variants', ProductVariantsController).only(['index', 'show'])
router.resource('/product-variant-types', ProductVariantTypesController).only(['index', 'show'])
router.resource('/suppliers', SuppliersController).only(['index', 'show'])
router.post('/products/import', [ProductsController, 'importByCsv'])
router.post('/products/add-photo', [ProductsController, 'addPhoto'])
router.delete('/products/rm-photo/:imageId', [ProductsController, 'rmPhoto'])

router
  .group(() => {
    router
      .resource('/user-addresses', UserAddressesController)
      .only(['store', 'destroy', 'index', 'show'])

    router.resource('/orders', OrdersController).only(['index', 'show', 'store'])
    router.resource('/order-payments', OrderPaymentsController).only(['index', 'show'])
    router.put('/order-payments/:id/update-status', [OrderPaymentsController, 'updateStatus'])
    router.get('/order-payments/:id/analytics', [OrderPaymentsController, 'analytics'])
    router.get('/orders/:orderId/activity-logs', [OrderActivityLogsController, 'index'])
    router.post('/orders/:orderId/activity-logs', [OrderActivityLogsController, 'store'])
    router.get('/users/:userId/activity-logs', [OrderActivityLogsController, 'userLogs'])
    router.resource('/order-updates', OrderUpdatesController).only(['index', 'show', 'store'])
    router
      .resource('/order-shippings', OrderShippingsController)
      .only(['index', 'show', 'store', 'update', 'destroy'])
    router.post('/order-shares/share', [OrderSharesController, 'share'])
    router.patch('/order-shares/view', [OrderSharesController, 'view'])
    router.get('/notifications', [NotificationsController, 'index'])
    router.get('/auth/session', [AuthController, 'getSession'])
    router.delete('/auth/account', [AuthController, 'deleteAccount'])
    router.get('/profile', [ProfileController, 'index'])
    router.put('/profile', [ProfileController, 'update'])
    router.get('/coupons/:code/verify', [CouponsController, 'verifyCoupon'])
    router
      .resource('/coupons', CouponsController)
      .only(['index', 'show', 'store', 'update', 'destroy'])
    router.resource('/suppliers', SuppliersController).only(['store', 'update', 'destroy'])
    router
      .resource('/product-variants', ProductVariantsController)
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
