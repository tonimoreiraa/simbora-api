/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'

const AuthController = () => import('#controllers/auth_controller')
const CategoriesController = () => import('#controllers/categories_controller')
const ProductsController = () => import('#controllers/products_controller')
const UserAddressesController = () => import('#controllers/user_addresses_controller')

router.post('/auth/sign-up', [AuthController, 'signUp'])
router.post('/auth/sign-in', [AuthController, 'signIn'])

router.resource('/categories', CategoriesController)
router.resource('/products', ProductsController)
router.resource('/user-addresses', UserAddressesController)
    .only(['create', 'destroy', 'index', 'show'])

router.get('/uploads/:file', async ({ response, params }) => {
    const filePath = app.tmpPath(`uploads/${params.file}`)
    response.attachment(filePath, params.file)
})