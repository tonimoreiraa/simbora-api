import { Order } from '#models/order'
import { OrderUpdate } from '#models/order_update'
import { createOrderUpdateSchema } from '#validators/order_update'
import type { HttpContext } from '@adonisjs/core/http'

export default class OrderUpdatesController {
  async store({ request }: HttpContext) {
    const payload = await request.validateUsing(createOrderUpdateSchema)

    const order = await Order.findOrFail(payload.orderId)
    order.status = payload.status
    const orderUpdate = await OrderUpdate.create(payload)
    await order.save()

    return orderUpdate
  }
}
