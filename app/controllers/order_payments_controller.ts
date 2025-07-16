import { OrderPayment } from '#models/order_payment'
import { Supplier } from '#models/supplier'
import { OrderActivityService } from '#services/order_activity_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class OrderPaymentsController {
  /**
   * @swagger
   * /order-payments:
   *   get:
   *     tags:
   *       - Order Payments
   *     summary: Listar pagamentos
   *     description: Lista pagamentos de pedidos com filtros. Admins veem todos, suppliers veem apenas seus pagamentos, customers veem apenas seus pagamentos.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Número da página
   *         example: 1
   *       - in: query
   *         name: perPage
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 25
   *         description: Itens por página
   *         example: 25
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: ["pending", "processing", "paid", "failed", "refunded", "cancelled"]
   *         description: Filtrar por status do pagamento
   *         example: "paid"
   *       - in: query
   *         name: orderId
   *         schema:
   *           type: integer
   *         description: Filtrar por ID do pedido
   *         example: 123
   *       - in: query
   *         name: paymentMethod
   *         schema:
   *           type: string
   *         description: Filtrar por método de pagamento
   *         example: "credit_card"
   *     responses:
   *       200:
   *         description: Lista de pagamentos retornada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                         example: 1
   *                       orderId:
   *                         type: integer
   *                         example: 123
   *                       paymentMethod:
   *                         type: string
   *                         example: "credit_card"
   *                       status:
   *                         type: string
   *                         example: "paid"
   *                       price:
   *                         type: number
   *                         format: decimal
   *                         example: 299.99
   *                       grossAmount:
   *                         type: number
   *                         format: decimal
   *                         example: 299.99
   *                       netAmount:
   *                         type: number
   *                         format: decimal
   *                         example: 284.99
   *                       totalItemsCount:
   *                         type: integer
   *                         example: 3
   *                       items:
   *                         type: array
   *                         items:
   *                           type: object
   *                           properties:
   *                             id:
   *                               type: integer
   *                               example: 1
   *                             quantity:
   *                               type: integer
   *                               example: 2
   *                             unitPrice:
   *                               type: number
   *                               format: decimal
   *                               example: 149.99
   *                             totalPrice:
   *                               type: number
   *                               format: decimal
   *                               example: 299.98
   *                             item:
   *                               type: object
   *                               properties:
   *                                 product:
   *                                   type: object
   *                                   properties:
   *                                     id:
   *                                       type: integer
   *                                       example: 15
   *                                     name:
   *                                       type: string
   *                                       example: "Smartphone XYZ"
   *                 meta:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                       example: 150
   *                     perPage:
   *                       type: integer
   *                       example: 25
   *                     currentPage:
   *                       type: integer
   *                       example: 1
   *                     lastPage:
   *                       type: integer
   *                       example: 6
   *       401:
   *         description: Usuário não autenticado
   *       500:
   *         description: Erro interno do servidor
   */
  async index({ request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 25)
    const status = request.input('status')
    const orderId = request.input('orderId')
    const paymentMethod = request.input('paymentMethod')

    let query = OrderPayment.query()
      .preload('order', (orderQuery) => {
        orderQuery.select('id', 'customer_id', 'status', 'total_price')
      })
      .preload('items', (itemQuery) => {
        itemQuery.preload('item', (orderItemQuery) => {
          orderItemQuery.preload('product', (productQuery) => {
            productQuery.select('id', 'name', 'price')
          })
        })
      })

    // Filtros
    if (status) {
      query = query.where('status', status)
    }
    if (orderId) {
      query = query.where('orderId', orderId)
    }
    if (paymentMethod) {
      query = query.where('paymentMethod', paymentMethod)
    }

    // Controle de acesso por role
    if (user.role === 'customer') {
      query = query.whereHas('order', (orderQuery) => {
        orderQuery.where('customer_id', user.id)
      })
    } else if (user.role === 'supplier') {
      const supplier = await Supplier.query().where('owner_id', user.id).firstOrFail()
      query = query.whereHas('order', (orderQuery) => {
        orderQuery.whereHas('items', (itemQuery) => {
          itemQuery.whereHas('product', (productQuery) => {
            productQuery.where('supplier_id', supplier.id)
          })
        })
      })
    }
    // Admins veem todos os pagamentos

    const payments = await query.orderBy('created_at', 'desc').paginate(page, perPage)

    return payments
  }

  /**
   * @swagger
   * /order-payments/{id}:
   *   get:
   *     tags:
   *       - Order Payments
   *     summary: Buscar pagamento por ID
   *     description: Retorna detalhes completos de um pagamento específico
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do pagamento
   *         example: 1
   *     responses:
   *       200:
   *         description: Pagamento encontrado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   example: 1
   *                 orderId:
   *                   type: integer
   *                   example: 123
   *                 paymentMethod:
   *                   type: string
   *                   example: "credit_card"
   *                 status:
   *                   type: string
   *                   example: "paid"
   *                 price:
   *                   type: number
   *                   format: decimal
   *                   example: 299.99
   *                 grossAmount:
   *                   type: number
   *                   format: decimal
   *                   example: 299.99
   *                 discountAmount:
   *                   type: number
   *                   format: decimal
   *                   example: 15.00
   *                 netAmount:
   *                   type: number
   *                   format: decimal
   *                   example: 284.99
   *                 totalItemsCount:
   *                   type: integer
   *                   example: 3
   *                 productsSold:
   *                   type: object
   *                   example: {"product_15": 2, "product_16": 1}
   *                 items:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                         example: 1
   *                       quantity:
   *                         type: integer
   *                         example: 2
   *                       unitPrice:
   *                         type: number
   *                         format: decimal
   *                         example: 149.99
   *                       totalPrice:
   *                         type: number
   *                         format: decimal
   *                         example: 299.98
   *                       item:
   *                         type: object
   *                         properties:
   *                           product:
   *                             type: object
   *                             properties:
   *                               id:
   *                                 type: integer
   *                                 example: 15
   *                               name:
   *                                 type: string
   *                                 example: "Smartphone XYZ"
   *                 order:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 123
   *                     status:
   *                       type: string
   *                       example: "Processing"
   *                     totalPrice:
   *                       type: number
   *                       format: decimal
   *                       example: 299.99
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T10:30:00.000Z"
   *       401:
   *         description: Usuário não autenticado
   *       403:
   *         description: Acesso negado ao pagamento
   *       404:
   *         description: Pagamento não encontrado
   *       500:
   *         description: Erro interno do servidor
   */
  async show({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const paymentId = params.id

    const payment = await OrderPayment.query()
      .where('id', paymentId)
      .preload('order', (orderQuery) => {
        orderQuery.select('id', 'customer_id', 'status', 'total_price')
      })
      .preload('items', (itemQuery) => {
        itemQuery.preload('item', (orderItemQuery) => {
          orderItemQuery.preload('product', (productQuery) => {
            productQuery.select('id', 'name', 'price', 'supplier_id')
          })
        })
      })
      .firstOrFail()

    // Verificar acesso baseado no role
    if (user.role === 'customer') {
      if (payment.order.customerId !== user.id) {
        return response.unauthorized({ message: 'Acesso negado ao pagamento' })
      }
    } else if (user.role === 'supplier') {
      const supplier = await Supplier.query().where('owner_id', user.id).firstOrFail()
      const hasSupplierProducts = payment.items.some(
        (item) => item.item.product.supplierId === supplier.id
      )
      if (!hasSupplierProducts) {
        return response.unauthorized({ message: 'Acesso negado ao pagamento' })
      }
    }

    return payment.serialize()
  }

  /**
   * @swagger
   * /order-payments/{id}/update-status:
   *   put:
   *     tags:
   *       - Order Payments
   *     summary: Atualizar status do pagamento
   *     description: Atualiza o status de um pagamento específico. Apenas admins podem fazer esta operação.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do pagamento
   *         example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - status
   *             properties:
   *               status:
   *                 type: string
   *                 enum: ["pending", "processing", "paid", "failed", "refunded", "cancelled"]
   *                 description: Novo status do pagamento
   *                 example: "paid"
   *               comment:
   *                 type: string
   *                 description: Comentário sobre a mudança de status
   *                 example: "Pagamento aprovado pela operadora"
   *     responses:
   *       200:
   *         description: Status atualizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   example: 1
   *                 status:
   *                   type: string
   *                   example: "paid"
   *                 message:
   *                   type: string
   *                   example: "Status do pagamento atualizado com sucesso"
   *       401:
   *         description: Usuário não autenticado
   *       403:
   *         description: Acesso restrito a administradores
   *       404:
   *         description: Pagamento não encontrado
   *       500:
   *         description: Erro interno do servidor
   */
  async updateStatus({ params, request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    // Apenas admins podem atualizar status de pagamento
    if (user.role !== 'admin') {
      return response.unauthorized({ message: 'Acesso restrito a administradores' })
    }

    const paymentId = params.id
    const { status, comment } = request.only(['status', 'comment'])

    const payment = await OrderPayment.query().where('id', paymentId).preload('order').firstOrFail()

    const oldStatus = payment.status
    payment.status = status
    await payment.save()

    // Criar log de atividade
    await OrderActivityService.logPaymentUpdated(
      payment.orderId,
      payment.id,
      user.id,
      'status_updated',
      `Status do pagamento alterado de "${oldStatus}" para "${status}"${comment ? `. Comentário: ${comment}` : ''}`,
      {
        oldStatus,
        newStatus: status,
        comment,
      },
      { request } as HttpContext
    )

    return {
      id: payment.id,
      status: payment.status,
      message: 'Status do pagamento atualizado com sucesso',
    }
  }

  /**
   * @swagger
   * /order-payments/{id}/analytics:
   *   get:
   *     tags:
   *       - Order Payments
   *     summary: Obter análises do pagamento
   *     description: Retorna dados analíticos detalhados de um pagamento específico
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do pagamento
   *         example: 1
   *     responses:
   *       200:
   *         description: Análises retornadas com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 paymentId:
   *                   type: integer
   *                   example: 1
   *                 orderId:
   *                   type: integer
   *                   example: 123
   *                 financialSummary:
   *                   type: object
   *                   properties:
   *                     grossAmount:
   *                       type: number
   *                       format: decimal
   *                       example: 299.99
   *                     discountAmount:
   *                       type: number
   *                       format: decimal
   *                       example: 15.00
   *                     taxAmount:
   *                       type: number
   *                       format: decimal
   *                       example: 0.00
   *                     netAmount:
   *                       type: number
   *                       format: decimal
   *                       example: 284.99
   *                     commissionAmount:
   *                       type: number
   *                       format: decimal
   *                       example: 14.25
   *                     supplierAmount:
   *                       type: number
   *                       format: decimal
   *                       example: 270.74
   *                 productsSummary:
   *                   type: object
   *                   properties:
   *                     totalItems:
   *                       type: integer
   *                       example: 3
   *                     productsSold:
   *                       type: object
   *                       example: {"product_15": 2, "product_16": 1}
   *                     itemsBreakdown:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           productId:
   *                             type: integer
   *                             example: 15
   *                           productName:
   *                             type: string
   *                             example: "Smartphone XYZ"
   *                           quantity:
   *                             type: integer
   *                             example: 2
   *                           unitPrice:
   *                             type: number
   *                             format: decimal
   *                             example: 149.99
   *                           totalPrice:
   *                             type: number
   *                             format: decimal
   *                             example: 299.98
   *                 paymentDetails:
   *                   type: object
   *                   properties:
   *                     method:
   *                       type: string
   *                       example: "credit_card"
   *                     gateway:
   *                       type: string
   *                       example: "stripe"
   *                     processingTime:
   *                       type: integer
   *                       example: 120
   *                     currency:
   *                       type: string
   *                       example: "BRL"
   *       401:
   *         description: Usuário não autenticado
   *       403:
   *         description: Acesso negado ao pagamento
   *       404:
   *         description: Pagamento não encontrado
   *       500:
   *         description: Erro interno do servidor
   */
  async analytics({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const paymentId = params.id

    const payment = await OrderPayment.query()
      .where('id', paymentId)
      .preload('order')
      .preload('items', (itemQuery) => {
        itemQuery.preload('item', (orderItemQuery) => {
          orderItemQuery.preload('product', (productQuery) => {
            productQuery.select('id', 'name', 'price', 'supplier_id')
          })
        })
      })
      .firstOrFail()

    // Verificar acesso baseado no role
    if (user.role === 'customer') {
      if (payment.order.customerId !== user.id) {
        return response.unauthorized({ message: 'Acesso negado ao pagamento' })
      }
    } else if (user.role === 'supplier') {
      const supplier = await Supplier.query().where('owner_id', user.id).firstOrFail()
      const hasSupplierProducts = payment.items.some(
        (item) => item.item.product.supplierId === supplier.id
      )
      if (!hasSupplierProducts) {
        return response.unauthorized({ message: 'Acesso negado ao pagamento' })
      }
    }

    // Montar dados analíticos
    const itemsBreakdown = payment.items.map((item) => ({
      productId: item.item.product.id,
      productName: item.item.product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    }))

    const analytics = {
      paymentId: payment.id,
      orderId: payment.orderId,
      financialSummary: {
        grossAmount: payment.grossAmount,
        discountAmount: payment.discountAmount,
        taxAmount: payment.taxAmount,
        netAmount: payment.netAmount,
        commissionAmount: payment.commissionAmount,
        supplierAmount: payment.supplierAmount,
      },
      productsSummary: {
        totalItems: payment.totalItemsCount,
        productsSold: payment.productsSold,
        itemsBreakdown,
      },
      paymentDetails: {
        method: payment.paymentMethod,
        gateway: payment.paymentGateway,
        processingTime: payment.processingTimeSeconds,
        currency: payment.currency,
      },
    }

    return analytics
  }
}
