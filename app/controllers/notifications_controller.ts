import OrderShare from '#models/order_share'
import type { HttpContext } from '@adonisjs/core/http'

export default class NotificationsController {
  /**
   * @swagger
   * /notifications:
   *   get:
   *     tags:
   *       - Notifications
   *     summary: Listar notificações não visualizadas
   *     description: Retorna todas as notificações (pedidos compartilhados) não visualizadas do usuário autenticado
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de notificações retornada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 orderShares:
   *                   type: array
   *                   description: Lista de pedidos compartilhados não visualizados
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                         description: ID único do compartilhamento
   *                         example: 1
   *                       orderId:
   *                         type: integer
   *                         description: ID do pedido compartilhado
   *                         example: 25
   *                       sharedByUserId:
   *                         type: integer
   *                         description: ID do usuário que compartilhou
   *                         example: 10
   *                       sharedWithUserId:
   *                         type: integer
   *                         description: ID do usuário que recebeu o compartilhamento
   *                         example: 15
   *                       viewed:
   *                         type: boolean
   *                         description: Se a notificação foi visualizada
   *                         example: false
   *                       message:
   *                         type: string
   *                         description: Mensagem do compartilhamento
   *                         example: "João compartilhou um pedido com você"
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                         description: Data de criação da notificação
   *                         example: "2024-01-15T10:30:00.000Z"
   *                       updatedAt:
   *                         type: string
   *                         format: date-time
   *                         description: Data da última atualização
   *                         example: "2024-01-15T10:30:00.000Z"
   *             example:
   *               orderShares: [
   *                 {
   *                   id: 1,
   *                   orderId: 25,
   *                   sharedByUserId: 10,
   *                   sharedWithUserId: 15,
   *                   viewed: false,
   *                   message: "João compartilhou um pedido com você",
   *                   createdAt: "2024-01-15T10:30:00.000Z",
   *                   updatedAt: "2024-01-15T10:30:00.000Z"
   *                 },
   *                 {
   *                   id: 2,
   *                   orderId: 30,
   *                   sharedByUserId: 12,
   *                   sharedWithUserId: 15,
   *                   viewed: false,
   *                   message: "Maria compartilhou um pedido com você",
   *                   createdAt: "2024-01-15T11:15:00.000Z",
   *                   updatedAt: "2024-01-15T11:15:00.000Z"
   *                 }
   *               ]
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
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Erro interno do servidor"
   */
  async index({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const orderShares = await OrderShare.query()
      .where('shared_with_user_id', user.id)
      .where('viewed', false)

    return {
      orderShares: orderShares.map((o) => o.serialize()),
    }
  }
}
