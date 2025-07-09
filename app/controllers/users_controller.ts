import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {

    async index({ request, auth, response }: HttpContext)
    {
        const role = auth.getUserOrFail().role
        const query = request.input('query')
        const page = request.input('page', 1)
        const perPage = request.input('perPage', 25)

        if (role != 'admin' && !query?.length) {
            return response.badRequest({
                message: 'Você deve enviar um filtro de pesquisa.'
            })
        }
        const users = await User.query()
            .if(role != 'admin', query => query.select('id', 'name', 'avatar', 'username'))
            .if(query, q => q.whereLike('username', `%${query.toLowerCase()}%`))
            .paginate(page, perPage)

        return users;
    }

}