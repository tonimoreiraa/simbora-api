import OrderShare from '#models/order_share'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'

export default class OrderSharesController {
  /**
   * @swagger
   * /order-shares/share:
   *   post:
   *     tags:
   *       - Order Shares
   *     summary: Compartilhar pedido com outro usuário
   *     description: Permite que um usuário compartilhe um pedido com outro usuário, criando uma notificação
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
   *               - sharedWithUserId
   *             properties:
   *               orderId:
   *                 type: integer
   *                 description: ID do pedido a ser compartilhado
   *                 example: 25
   *               sharedWithUserId:
   *                 type: integer
   *                 description: ID do usuário que receberá o compartilhamento
   *                 example: 15
   *     responses:
   *       201:
   *         description: Pedido compartilhado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: ID único do compartilhamento (CUID)
   *                   example: "clx123abc456def789"
   *                 orderId:
   *                   type: integer
   *                   description: ID do pedido compartilhado
   *                   example: 25
   *                 userId:
   *                   type: integer
   *                   description: ID do usuário que compartilhou (usuário autenticado)
   *                   example: 10
   *                 sharedWithUserId:
   *                   type: integer
   *                   description: ID do usuário que recebeu o compartilhamento
   *                   example: 15
   *                 viewed:
   *                   type: boolean
   *                   description: Se o compartilhamento foi visualizado
   *                   example: false
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   description: Data de criação do compartilhamento
   *                   example: "2024-01-15T10:30:00.000Z"
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   description: Data da última atualização
   *                   example: "2024-01-15T10:30:00.000Z"
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
   *         description: Pedido ou usuário não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "E_ROW_NOT_FOUND: Row not found"
   */
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

  /**
   * @swagger
   * /order-shares/view:
   *   patch:
   *     tags:
   *       - Order Shares
   *     summary: Marcar compartilhamento como visualizado
   *     description: Marca uma notificação de compartilhamento como visualizada pelo usuário destinatário
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - orderShareId
   *             properties:
   *               orderShareId:
   *                 type: string
   *                 description: ID do compartilhamento a ser marcado como visualizado
   *                 example: "clx123abc456def789"
   *     responses:
   *       200:
   *         description: Compartilhamento marcado como visualizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: ID único do compartilhamento
   *                   example: "clx123abc456def789"
   *                 orderId:
   *                   type: integer
   *                   description: ID do pedido compartilhado
   *                   example: 25
   *                 userId:
   *                   type: integer
   *                   description: ID do usuário que compartilhou
   *                   example: 10
   *                 sharedWithUserId:
   *                   type: integer
   *                   description: ID do usuário que recebeu o compartilhamento
   *                   example: 15
   *                 viewed:
   *                   type: boolean
   *                   description: Status de visualização (sempre true após esta operação)
   *                   example: true
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   description: Data de criação do compartilhamento
   *                   example: "2024-01-15T10:30:00.000Z"
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   description: Data da última atualização
   *                   example: "2024-01-15T12:45:00.000Z"
   *       400:
   *         description: Dados de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "orderShareId é obrigatório"
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
   *         description: Compartilhamento não encontrado ou usuário não autorizado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "E_ROW_NOT_FOUND: Row not found"
   */
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
