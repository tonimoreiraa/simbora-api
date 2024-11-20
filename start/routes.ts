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

router.post('/auth/sign-up', [AuthController, 'signUp'])
router.post('/auth/sign-in', [AuthController, 'signIn'])

router.resource('/categories', CategoriesController)

router.get('/uploads/:file', async ({ response, params }) => {
    const filePath = app.tmpPath(`uploads/${params.file}`)
    console.log(filePath)
    response.attachment(filePath, params.file)
})