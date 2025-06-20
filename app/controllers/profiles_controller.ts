import User from '#models/user'
import { updateProfileSchema } from '#validators/profile'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

export default class ProfilesController {
  async update({ request, auth, response }: HttpContext) {
    const payload = await request.validateUsing(updateProfileSchema)
    const user = auth.getUserOrFail()

    if (payload.username) {
      const userAlreadyExistsQuery = await User.query()
        .where('username', payload.username)
        .whereNot('id', user.id)
        .first()

      if (userAlreadyExistsQuery) {
        return response.status(409).send({
          message: `O usuário ${payload.username} já existe`,
        })
      }
    }

    const avatar = request.file('avatar', {
      size: '2mb',
      extnames: ['jpg', 'png', 'jpeg'],
    })
    let avatarName: string | undefined
    if (avatar) {
      avatarName = `${cuid()}.${avatar.extname}`
      await avatar.move(app.makePath('storage/uploads'), {
        name: avatarName,
      })
    }

    user.merge({ ...payload, avatar: avatarName })
    await user.save()

    return user
  }
}
