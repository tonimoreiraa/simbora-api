import { OrderActivityService } from '#services/order_activity_service'
import { Order } from '#models/order'
import { Supplier } from '#models/supplier'
import type { HttpContext } from '@adonisjs/core/http'

export default class OrderActivityLogsController {
  /**
   * @swagger
   * /orders/{orderId}/activity-logs:
   *   get:
   *     tags:
   *       - Order Activity Logs
   *     summary: Obter logs de atividade de um pedido
   *     description: Retorna o histórico de atividades de um pedido específico
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: orderId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do pedido
   *         example: 123
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 50
   *         description: Número máximo de logs a retornar
   *         example: 20
   *     responses:
   *       200:
   *         description: Logs de atividade retornados com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                     example: 1
   *                   orderId:
   *                     type: integer
   *                     example: 123
   *                   user:
   *                     type: object
   *                     nullable: true
   *                     properties:
   *                       id:
   *                         type: integer
   *                         example: 10
   *                       name:
   *                         type: string
   *                         example: "João Silva"
   *                       email:
   *                         type: string
   *                         example: "joao@email.com"
   *                       avatar:
   *                         type: string
   *                         nullable: true
   *                         example: "https://api.simbora.com/uploads/avatar.jpg"
   *                   action:
   *                     type: string
   *                     example: "status_changed"
   *                   entityType:
   *                     type: string
   *                     example: "order"
   *                   entityId:
   *                     type: integer
   *                     nullable: true
   *                     example: 123
   *                   oldStatus:
   *                     type: string
   *                     nullable: true
   *                     example: "pending"
   *                   newStatus:
   *                     type: string
   *                     nullable: true
   *                     example: "processing"
   *                   description:
   *                     type: string
   *                     example: "Status alterado de \"pending\" para \"processing\""
   *                   metadata:
   *                     type: object
   *                     nullable: true
   *                     example: {"reason": "payment_approved"}
   *                   createdAt:
   *                     type: string
   *                     format: date-time
   *                     example: "2024-01-15T10:30:00.000Z"
   *       401:
   *         description: Usuário não autenticado
   *       403:
   *         description: Acesso negado ao pedido
   *       404:
   *         description: Pedido não encontrado
   *       500:
   *         description: Erro interno do servidor
   */
  async index({ params, request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const orderId = params.orderId
    const limit = request.input('limit', 50)

    // Verificar se o usuário tem acesso ao pedido
    const order = await Order.query()
      .where('id', orderId)
      .preload('items', (itemQuery) => {
        itemQuery.preload('product', (productQuery) => {
          productQuery.select('id', 'supplier_id')
        })
      })
      .firstOrFail()

    // Controle de acesso baseado no role
    if (user.role === 'customer') {
      if (order.customerId !== user.id) {
        return response.unauthorized({ message: 'Acesso negado ao pedido' })
      }
    } else if (user.role === 'supplier') {
      const supplier = await Supplier.query().where('owner_id', user.id).firstOrFail()
      const hasSupplierProducts = order.items.some(
        (item) => item.product.supplierId === supplier.id
      )
      if (!hasSupplierProducts) {
        return response.unauthorized({ message: 'Acesso negado ao pedido' })
      }
    }

    // Obter logs de atividade
    const logs = await OrderActivityService.getOrderActivityLogs(orderId, limit)

    return logs.map((log) => log.formatForDisplay())
  }

  /**
   * @swagger
   * /orders/{orderId}/activity-logs:
   *   post:
   *     tags:
   *       - Order Activity Logs
   *     summary: Criar log de atividade customizado
   *     description: Cria um log de atividade customizado para um pedido. Apenas admins e suppliers podem criar logs.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: orderId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do pedido
   *         example: 123
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - action
   *               - description
   *             properties:
   *               action:
   *                 type: string
   *                 description: Ação realizada
   *                 example: "custom_note"
   *               description:
   *                 type: string
   *                 description: Descrição da atividade
   *                 example: "Cliente solicitou alteração no endereço de entrega"
   *               metadata:
   *                 type: object
   *                 description: Dados adicionais (opcional)
   *                 example: {"old_address": "Rua A, 123", "new_address": "Rua B, 456"}
   *     responses:
   *       201:
   *         description: Log de atividade criado com sucesso
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
   *                 action:
   *                   type: string
   *                   example: "custom_note"
   *                 description:
   *                   type: string
   *                   example: "Cliente solicitou alteração no endereço de entrega"
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T10:30:00.000Z"
   *                 message:
   *                   type: string
   *                   example: "Log de atividade criado com sucesso"
   *       401:
   *         description: Usuário não autenticado
   *       403:
   *         description: Acesso negado
   *       404:
   *         description: Pedido não encontrado
   *       422:
   *         description: Erro de validação
   *       500:
   *         description: Erro interno do servidor
   */
  async store({ params, request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const orderId = params.orderId
    const { action, description, metadata } = request.only(['action', 'description', 'metadata'])

    // Verificar permissões
    if (user.role === 'customer') {
      return response.unauthorized({ message: 'Customers não podem criar logs de atividade' })
    }

    // Verificar se o usuário tem acesso ao pedido
    const order = await Order.query()
      .where('id', orderId)
      .preload('items', (itemQuery) => {
        itemQuery.preload('product', (productQuery) => {
          productQuery.select('id', 'supplier_id')
        })
      })
      .firstOrFail()

    // Verificar acesso para suppliers
    if (user.role === 'supplier') {
      const supplier = await Supplier.query().where('owner_id', user.id).firstOrFail()
      const hasSupplierProducts = order.items.some(
        (item) => item.product.supplierId === supplier.id
      )
      if (!hasSupplierProducts) {
        return response.unauthorized({ message: 'Acesso negado ao pedido' })
      }
    }

    // Criar log de atividade
    const log = await OrderActivityService.logCustomAction(
      orderId,
      user.id,
      action,
      description,
      metadata,
      { request } as HttpContext
    )

    return response.created({
      id: log.id,
      orderId: log.orderId,
      action: log.action,
      description: log.description,
      createdAt: log.createdAt,
      message: 'Log de atividade criado com sucesso',
    })
  }

  /**
   * @swagger
   * /users/{userId}/activity-logs:
   *   get:
   *     tags:
   *       - Order Activity Logs
   *     summary: Obter logs de atividade de um usuário
   *     description: Retorna o histórico de atividades de um usuário específico. Apenas admins ou o próprio usuário podem acessar.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do usuário
   *         example: 10
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 50
   *         description: Número máximo de logs a retornar
   *         example: 20
   *     responses:
   *       200:
   *         description: Logs de atividade retornados com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                     example: 1
   *                   orderId:
   *                     type: integer
   *                     example: 123
   *                   order:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                         example: 123
   *                       status:
   *                         type: string
   *                         example: "processing"
   *                       totalPrice:
   *                         type: number
   *                         format: decimal
   *                         example: 299.99
   *                   action:
   *                     type: string
   *                     example: "status_changed"
   *                   description:
   *                     type: string
   *                     example: "Status alterado de \"pending\" para \"processing\""
   *                   createdAt:
   *                     type: string
   *                     format: date-time
   *                     example: "2024-01-15T10:30:00.000Z"
   *       401:
   *         description: Usuário não autenticado
   *       403:
   *         description: Acesso negado
   *       404:
   *         description: Usuário não encontrado
   *       500:
   *         description: Erro interno do servidor
   */
  async userLogs({ params, request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const userId = Number.parseInt(params.userId)
    const limit = request.input('limit', 50)

    // Verificar se o usuário tem acesso aos logs
    if (user.role !== 'admin' && user.id !== userId) {
      return response.unauthorized({ message: 'Acesso negado aos logs do usuário' })
    }

    // Obter logs de atividade do usuário
    const logs = await OrderActivityService.getUserActivityLogs(userId, limit)

    return logs.map((log) => ({
      id: log.id,
      orderId: log.orderId,
      order: log.order
        ? {
            id: log.order.id,
            status: log.order.status,
            totalPrice: log.order.totalPrice,
          }
        : null,
      action: log.action,
      description: log.description,
      createdAt: log.createdAt,
    }))
  }
}
