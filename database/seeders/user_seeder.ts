import User from '#models/user'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const email = env.get('DEFAULT_USER_EMAIL')
    const password = env.get('DEFAULT_USER_PASSWORD')
    const user = await User.updateOrCreate({
      email,
    }, {
      username: email,
      email,
      password,
      name: 'Administrador',
      role: 'admin',
    })
    logger.info(`Usuário administrador atualizado com ID: ${user.id}`)
  }
}