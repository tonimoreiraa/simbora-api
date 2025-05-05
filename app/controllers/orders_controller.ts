import { Order } from '#models/order'
import type { HttpContext } from '@adonisjs/core/http'

export default class OrdersController {
  async index({ request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 50)
    const status = request.input('status')

    const query = await Order.query()
      .if(user.role != 'admin', (query) => query.where('customer_id', user.id))
      .if(status, (query) => query.where('status', status))
      .paginate(page, perPage)

    return query
  }

  async show({ request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const orderId = request.param('id')

    const order = await Order.query()
      .if(user.role != 'admin', (query) => query.where('customer_id', user.id))
      .if(user.role == 'admin', (query) => query.preload('customer'))
      .where('id', orderId)
      .preload('items', (query) => query.select('id', 'product_id', 'order_id').preload('product'))
      .preload('payment')
      .preload('shipping')
      .preload('updates')
      .firstOrFail()

    return order.serialize()
  }

  async store({ request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = request.only(['items', 'payment', 'shipping'])

    const order = await Order.create({
      customerId: user.id,
      ...data,
    })

    return order.serialize()
  }
}
