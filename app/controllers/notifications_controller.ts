import OrderShare from '#models/order_share'
import type { HttpContext } from '@adonisjs/core/http'

export default class NotificationsController {

    async index({ auth }: HttpContext)
    {
        const user = auth.getUserOrFail()
        const orderShares = await OrderShare.query()
            .where('shared_with_user_id', user.id)
            .where('viewed', false)

        return {
            orderShares: orderShares.map(o => o.serialize())
        }
    }

}