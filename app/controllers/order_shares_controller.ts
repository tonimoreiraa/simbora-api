import OrderShare from '#models/order_share'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'

export default class OrderSharesController {
  async share({ request, auth }: HttpContext) {
    const orderId = request.input('orderId')
    const user = auth.getUserOrFail()
    const sharedWithUserId = request.input('sharedWithUserId')

    const id = cuid()

    const orderShare = await OrderShare.create({
      id,
      orderId: orderId,
      userId: user.id,
      sharedWithUserId: sharedWithUserId,
    })

    return orderShare.serialize()
  }

  async view({ request, auth }: HttpContext) {
    const orderShareId = request.input('orderShareId')
    const user = auth.getUserOrFail()

    const orderShare = await OrderShare.query()
      .where('id', orderShareId)
      .where('shared_with_user_id', user.id)
      .firstOrFail()

    orderShare.viewed = true
    await orderShare.save()

    return orderShare.serialize()
  }
}
