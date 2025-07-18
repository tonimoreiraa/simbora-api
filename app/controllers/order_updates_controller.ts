import { Order } from '#models/order'
import { OrderUpdate } from '#models/order_update'
import { OrderActivityService } from '#services/order_activity_service'
import { Supplier } from '#models/supplier'
import { createOrderUpdateSchema } from '#validators/order_update'
import type { HttpContext } from '@adonisjs/core/http'

export default class OrderUpdatesController {
  /**
   * @swagger
   * /order-updates:
   *   post:
   *     tags:
   *       - Order Updates
   *     summary: Criar atualização de pedido
   *     description: Cria uma nova atualização para um pedido, alterando seu status e adicionando informações
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - orderId
   *               - status
   *             properties:
   *               orderId:
   *                 type: integer
   *                 description: ID do pedido a ser atualizado
   *                 example: 25
   *               status:
   *                 type: string
   *                 enum: [
   *                   "Pending",
   *                   "Confirmed",
   *                   "Processing",
   *                   "On Hold",
   *                   "Awaiting Payment",
   *                   "Payment Received",
   *                   "In Production",
   *                   "Shipped",
   *                   "Out for Delivery",
   *                   "Delivered",
   *                   "Completed",
   *                   "Cancelled",
   *                   "Refunded",
   *                   "Failed",
   *                   "Returned",
   *                   "Partially Shipped",
   *                   "Backordered"
   *                 ]
   *                 description: Novo status do pedido
   *                 example: "Shipped"
   *               title:
   *                 type: string
   *                 description: Título da atualização
   *                 example: "Pedido enviado"
   *               comment:
   *                 type: string
   *                 description: Comentário adicional sobre a atualização
   *                 example: "Pedido enviado via transportadora XYZ, código de rastreamento: BR123456789"
   *               private:
   *                 type: boolean
   *                 description: Se a atualização é privada (não visível para o cliente)
   *                 example: false
   *               onlyMe:
   *                 type: boolean
   *                 description: Se a atualização é visível apenas para quem criou
   *                 example: false
   *               orderShippingId:
   *                 type: integer
   *                 nullable: true
   *                 description: ID do shipping relacionado (opcional, para tracking de entrega)
   *                 example: 123
   *     responses:
   *       201:
   *         description: Atualização criada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   description: ID único da atualização
   *                   example: 15
   *                 orderId:
   *                   type: integer
   *                   description: ID do pedido atualizado
   *                   example: 25
   *                 status:
   *                   type: string
   *                   description: Status aplicado ao pedido
   *                   example: "Shipped"
   *                 title:
   *                   type: string
   *                   nullable: true
   *                   description: Título da atualização
   *                   example: "Pedido enviado"
   *                 comment:
   *                   type: string
   *                   nullable: true
   *                   description: Comentário da atualização
   *                   example: "Pedido enviado via transportadora XYZ"
   *                 private:
   *                   type: boolean
   *                   nullable: true
   *                   description: Se é uma atualização privada
   *                   example: false
   *                 onlyMe:
   *                   type: boolean
   *                   nullable: true
   *                   description: Se é visível apenas para o criador
   *                   example: false
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   description: Data de criação da atualização
   *                   example: "2024-01-15T14:30:00.000Z"
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   description: Data da última atualização
   *                   example: "2024-01-15T14:30:00.000Z"
   *       400:
   *         description: Dados de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Dados de entrada inválidos"
   *                 errors:
   *                   type: object
   *                   example:
   *                     orderId: ["O pedido deve existir"]
   *                     status: ["Status deve ser um dos valores permitidos"]
   *       401:
   *         description: Usuário não autenticado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "E_UNAUTHORIZED_ACCESS: Unauthorized access"
   *       404:
   *         description: Pedido não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "E_ROW_NOT_FOUND: Row not found"
   *       422:
   *         description: Erro de validação
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Validation failed"
   *                 errors:
   *                   type: object
   *                   additionalProperties:
   *                     type: array
   *                     items:
   *                       type: string
   *                   example:
   *                     orderId: ["O campo orderId é obrigatório"]
   *                     status: ["O status deve ser um dos valores: Pending, Confirmed, Processing..."]
   */
  async store({ request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(createOrderUpdateSchema)
    const order = await Order.findOrFail(payload.orderId)

    const oldStatus = order.status
    order.status = payload.status
    const orderUpdate = await OrderUpdate.create(payload)
    await order.save()

    // Criar log de atividade para mudança de status
    await OrderActivityService.logStatusChange(order.id, user.id, oldStatus, payload.status, {
      request,
    } as HttpContext)

    return orderUpdate
  }

  /**
   * @swagger
   * /order-updates:
   *   get:
   *     tags:
   *       - Order Updates
   *     summary: Listar atualizações de pedidos
   *     description: Lista atualizações de pedidos com filtros por pedido ou usuário
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: orderId
   *         schema:
   *           type: integer
   *         description: Filtrar por ID do pedido
   *         example: 25
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
   *         name: includePrivate
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Incluir atualizações privadas (apenas admins)
   *         example: false
   *     responses:
   *       200:
   *         description: Lista de atualizações retornada com sucesso
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
   *                         example: 15
   *                       orderId:
   *                         type: integer
   *                         example: 25
   *                       status:
   *                         type: string
   *                         example: "Shipped"
   *                       title:
   *                         type: string
   *                         example: "Pedido enviado"
   *                       comment:
   *                         type: string
   *                         example: "Pedido enviado via transportadora XYZ"
   *                       private:
   *                         type: boolean
   *                         example: false
   *                       onlyMe:
   *                         type: boolean
   *                         example: false
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-15T14:30:00.000Z"
   *                 meta:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                       example: 50
   *                     perPage:
   *                       type: integer
   *                       example: 25
   *                     currentPage:
   *                       type: integer
   *                       example: 1
   *                     lastPage:
   *                       type: integer
   *                       example: 2
   *       401:
   *         description: Usuário não autenticado
   *       500:
   *         description: Erro interno do servidor
   */
  async index({ request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const orderId = request.input('orderId')
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 25)
    const includePrivate = request.input('includePrivate', false)

    let query = OrderUpdate.query()
      .preload('order', (orderQuery) => {
        orderQuery.select('id', 'customer_id', 'status', 'total_price')
      })
      .orderBy('created_at', 'desc')

    // Filtrar por pedido se especificado
    if (orderId) {
      query = query.where('orderId', orderId)
    }

    // Controle de privacidade
    if (!includePrivate || user.role !== 'admin') {
      query = query.where('private', false)
    }

    // Controle de acesso baseado no role
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

    const updates = await query.paginate(page, perPage)
    return updates
  }

  /**
   * @swagger
   * /order-updates/{id}:
   *   get:
   *     tags:
   *       - Order Updates
   *     summary: Buscar atualização por ID
   *     description: Retorna detalhes de uma atualização específica
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID da atualização
   *         example: 15
   *     responses:
   *       200:
   *         description: Atualização encontrada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   example: 15
   *                 orderId:
   *                   type: integer
   *                   example: 25
   *                 status:
   *                   type: string
   *                   example: "Shipped"
   *                 title:
   *                   type: string
   *                   example: "Pedido enviado"
   *                 comment:
   *                   type: string
   *                   example: "Pedido enviado via transportadora XYZ"
   *                 private:
   *                   type: boolean
   *                   example: false
   *                 onlyMe:
   *                   type: boolean
   *                   example: false
   *                 order:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 25
   *                     status:
   *                       type: string
   *                       example: "Shipped"
   *                     totalPrice:
   *                       type: number
   *                       format: decimal
   *                       example: 299.99
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T14:30:00.000Z"
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T14:30:00.000Z"
   *       401:
   *         description: Usuário não autenticado
   *       403:
   *         description: Acesso negado à atualização
   *       404:
   *         description: Atualização não encontrada
   *       500:
   *         description: Erro interno do servidor
   */
  async show({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const updateId = params.id

    const update = await OrderUpdate.query()
      .where('id', updateId)
      .preload('order', (orderQuery) => {
        orderQuery.select('id', 'customer_id', 'status', 'total_price')
      })
      .firstOrFail()

    if (update.private && user.role !== 'admin') {
      return response.unauthorized({ message: 'Acesso negado à atualização privada' })
    }

    if (user.role === 'customer') {
      if (update.order.customerId !== user.id) {
        return response.unauthorized({ message: 'Acesso negado à atualização' })
      }
    } else if (user.role === 'supplier') {
      const supplier = await Supplier.query().where('owner_id', user.id).firstOrFail()
      const order = await Order.query()
        .where('id', update.orderId)
        .preload('items', (itemQuery) => {
          itemQuery.preload('product', (productQuery) => {
            productQuery.select('id', 'supplier_id')
          })
        })
        .firstOrFail()

      const hasSupplierProducts = order.items.some(
        (item) => item.product.supplierId === supplier.id
      )

      if (!hasSupplierProducts) {
        return response.unauthorized({ message: 'Acesso negado à atualização' })
      }
    }

    return update.serialize()
  }
}
