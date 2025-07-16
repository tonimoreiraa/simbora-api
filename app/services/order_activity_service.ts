import { OrderActivityLog } from '#models/order_activity_log'
import type { HttpContext } from '@adonisjs/core/http'

export class OrderActivityService {
  /**
   * Criar log de atividade para uma order
   */
  static async logActivity(data: {
    orderId: number
    userId?: number
    action: string
    entityType: string
    entityId?: number
    oldStatus?: string
    newStatus?: string
    description: string
    metadata?: object
    httpContext?: HttpContext
  }) {
    const logData = {
      orderId: data.orderId,
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      oldStatus: data.oldStatus,
      newStatus: data.newStatus,
      description: data.description,
      metadata: data.metadata,
      ipAddress: data.httpContext?.request.ip(),
      userAgent: data.httpContext?.request.header('user-agent'),
    }

    return await OrderActivityLog.createLog(logData)
  }

  /**
   * Log para criação de order
   */
  static async logOrderCreated(orderId: number, userId: number, httpContext?: HttpContext) {
    return await this.logActivity({
      orderId,
      userId,
      action: 'created',
      entityType: 'order',
      entityId: orderId,
      description: 'Pedido criado',
      httpContext,
    })
  }

  /**
   * Log para mudança de status
   */
  static async logStatusChange(
    orderId: number,
    userId: number,
    oldStatus: string,
    newStatus: string,
    httpContext?: HttpContext
  ) {
    return await this.logActivity({
      orderId,
      userId,
      action: 'status_changed',
      entityType: 'order',
      entityId: orderId,
      oldStatus,
      newStatus,
      description: `Status alterado de "${oldStatus}" para "${newStatus}"`,
      httpContext,
    })
  }

  /**
   * Log para atualização de pagamento
   */
  static async logPaymentUpdated(
    orderId: number,
    paymentId: number,
    userId: number,
    action: string,
    description: string,
    metadata?: object,
    httpContext?: HttpContext
  ) {
    return await this.logActivity({
      orderId,
      userId,
      action: `payment_${action}`,
      entityType: 'payment',
      entityId: paymentId,
      description,
      metadata,
      httpContext,
    })
  }

  /**
   * Log para atualização de shipping
   */
  static async logShippingUpdated(
    orderId: number,
    shippingId: number,
    userId: number,
    action: string,
    description: string,
    metadata?: object,
    httpContext?: HttpContext
  ) {
    return await this.logActivity({
      orderId,
      userId,
      action: `shipping_${action}`,
      entityType: 'shipping',
      entityId: shippingId,
      description,
      metadata,
      httpContext,
    })
  }

  /**
   * Log para item adicionado/removido
   */
  static async logItemUpdated(
    orderId: number,
    itemId: number,
    userId: number,
    action: string,
    description: string,
    metadata?: object,
    httpContext?: HttpContext
  ) {
    return await this.logActivity({
      orderId,
      userId,
      action: `item_${action}`,
      entityType: 'item',
      entityId: itemId,
      description,
      metadata,
      httpContext,
    })
  }

  /**
   * Log para aplicação de cupom
   */
  static async logCouponApplied(
    orderId: number,
    couponId: number,
    userId: number,
    couponCode: string,
    discountAmount: number,
    httpContext?: HttpContext
  ) {
    return await this.logActivity({
      orderId,
      userId,
      action: 'coupon_applied',
      entityType: 'coupon',
      entityId: couponId,
      description: `Cupom "${couponCode}" aplicado com desconto de R$ ${discountAmount.toFixed(2)}`,
      metadata: {
        couponCode,
        discountAmount,
      },
      httpContext,
    })
  }

  /**
   * Log para ação customizada
   */
  static async logCustomAction(
    orderId: number,
    userId: number,
    action: string,
    description: string,
    metadata?: object,
    httpContext?: HttpContext
  ) {
    return await this.logActivity({
      orderId,
      userId,
      action,
      entityType: 'custom',
      description,
      metadata,
      httpContext,
    })
  }

  /**
   * Obter logs de atividade de uma order
   */
  static async getOrderActivityLogs(orderId: number, limit: number = 50) {
    return await OrderActivityLog.query()
      .where('orderId', orderId)
      .preload('user', (userQuery) => {
        userQuery.select('id', 'name', 'email', 'avatar')
      })
      .orderBy('createdAt', 'desc')
      .limit(limit)
  }

  /**
   * Obter logs de atividade de um usuário
   */
  static async getUserActivityLogs(userId: number, limit: number = 50) {
    return await OrderActivityLog.query()
      .where('userId', userId)
      .preload('order', (orderQuery) => {
        orderQuery.select('id', 'status', 'totalPrice')
      })
      .orderBy('createdAt', 'desc')
      .limit(limit)
  }
}
