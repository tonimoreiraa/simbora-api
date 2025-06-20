import Coupon from '#models/coupon'
import type { HttpContext } from '@adonisjs/core/http'

export default class CouponsController {
  async index({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    if (user.role !== 'admin') {
      return response.unauthorized({
        message: 'Você não tem acesso a este método.',
      })
    }

    const query = request.input('query') as string | undefined
    const active = request.input('active', false)
    const categoryId = request.input('categoryId')
    const supplierId = request.input('supplierId')

    const coupons = await Coupon.query()
      .if(query, (q) => q.whereLike('code', `%${query?.toUpperCase}%`))
      .if(categoryId, (q) => q.where('categoryId', categoryId))
      .if(supplierId, (q) => q.where('supplierId', supplierId))
      .if(active, (q) => q.where('active', true))

    return coupons.map((c) => c.serialize())
  }

  async verifyCoupon({ request }: HttpContext) {
    let code = request.param('code') as string
    code = code.toUpperCase()
    const coupon = await Coupon.query()
      .where('code', code)
      .where('active', true)
      .whereRaw('usesCount < maxUses')
      .where('validFrom', '<=', new Date())
      .where('validUntil', '>', new Date())
      .firstOrFail()

    // TODO: Create supplier, category and minOrderValue validation
    return coupon
  }
}
