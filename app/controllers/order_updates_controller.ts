import { Order } from '#models/order'
import { OrderUpdate } from '#models/order_update'
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
  async store({ request }: HttpContext) {
    const payload = await request.validateUsing(createOrderUpdateSchema)
    const order = await Order.findOrFail(payload.orderId)

    order.status = payload.status
    const orderUpdate = await OrderUpdate.create(payload)
    await order.save()

    return orderUpdate
  }
}
