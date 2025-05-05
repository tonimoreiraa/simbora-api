import User from '#models/user'
import { signUpSchema } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async signIn({ request }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user)

    return { user, token }
  }

  async signUp({ request }: HttpContext) {
    const payload = await request.validateUsing(signUpSchema)

    const user = await User.create(payload)

    const token = await User.accessTokens.create(user)

    return { user, token }
  }
}
