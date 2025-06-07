import { Order } from '#models/order'
import type { HttpContext } from '@adonisjs/core/http'

export default class OrdersController {
  /**
   * @swagger
   * /orders:
   *   get:
   *     tags:
   *       - Orders
   *     summary: Listar pedidos
   *     description: Lista pedidos do usuário (ou todos se for admin) com paginação e filtros
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: Número da página
   *         example: 1
   *       - in: query
   *         name: perPage
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         description: Itens por página (máximo 100)
   *         example: 50
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [
   *             "Pending",
   *             "Confirmed",
   *             "Processing",
   *             "On Hold",
   *             "Awaiting Payment",
   *             "Payment Received",
   *             "In Production",
   *             "Shipped",
   *             "Out for Delivery",
   *             "Delivered",
   *             "Completed",
   *             "Cancelled",
   *             "Refunded",
   *             "Failed",
   *             "Returned",
   *             "Partially Shipped",
   *             "Backordered"
   *           ]
   *         description: Filtrar por status do pedido
   *         example: "Processing"
   *     responses:
   *       200:
   *         description: Lista de pedidos retornada com sucesso
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
   *                         example: 25
   *                       customerId:
   *                         type: integer
   *                         example: 10
   *                       status:
   *                         type: string
   *                         example: "Processing"
   *                       total:
   *                         type: number
   *                         format: decimal
   *                         example: 299.99
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-15T10:30:00.000Z"
   *                       updatedAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-15T12:45:00.000Z"
   *                 meta:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                       description: Total de registros
   *                       example: 150
   *                     perPage:
   *                       type: integer
   *                       description: Registros por página
   *                       example: 50
   *                     currentPage:
   *                       type: integer
   *                       description: Página atual
   *                       example: 1
   *                     lastPage:
   *                       type: integer
   *                       description: Última página
   *                       example: 3
   *                     firstPage:
   *                       type: integer
   *                       description: Primeira página
   *                       example: 1
   *                     firstPageUrl:
   *                       type: string
   *                       example: "/?page=1"
   *                     lastPageUrl:
   *                       type: string
   *                       example: "/?page=3"
   *                     nextPageUrl:
   *                       type: string
   *                       nullable: true
   *                       example: "/?page=2"
   *                     previousPageUrl:
   *                       type: string
   *                       nullable: true
   *                       example: null
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
   */
  async index({ request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 50)
    const status = request.input('status')

    const orders = await Order.query()
      .if(user.role !== 'admin', (query) => query.where('customer_id', user.id))
      .if(status, (query) => query.where('status', status))
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)

    return orders
  }

  /**
   * @swagger
   * /orders/{id}:
   *   get:
   *     tags:
   *       - Orders
   *     summary: Buscar pedido por ID
   *     description: Retorna detalhes completos de um pedido específico com itens, pagamento, envio e atualizações
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do pedido
   *         example: 25
   *     responses:
   *       200:
   *         description: Detalhes do pedido retornados com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   example: 25
   *                 customerId:
   *                   type: integer
   *                   example: 10
   *                 status:
   *                   type: string
   *                   example: "Processing"
   *                 total:
   *                   type: number
   *                   format: decimal
   *                   example: 299.99
   *                 customer:
   *                   type: object
   *                   description: Dados do cliente (apenas para admins)
   *                   nullable: true
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 10
   *                     name:
   *                       type: string
   *                       example: "João Silva"
   *                     email:
   *                       type: string
   *                       example: "joao@email.com"
   *                 items:
   *                   type: array
   *                   description: Itens do pedido
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                         example: 1
   *                       productId:
   *                         type: integer
   *                         example: 15
   *                       orderId:
   *                         type: integer
   *                         example: 25
   *                       quantity:
   *                         type: integer
   *                         example: 2
   *                       price:
   *                         type: number
   *                         format: decimal
   *                         example: 149.99
   *                       product:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                             example: 15
   *                           name:
   *                             type: string
   *                             example: "Smartphone XYZ"
   *                           price:
   *                             type: number
   *                             format: decimal
   *                             example: 149.99
   *                 payment:
   *                   type: object
   *                   nullable: true
   *                   description: Informações de pagamento
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 5
   *                     method:
   *                       type: string
   *                       example: "credit_card"
   *                     status:
   *                       type: string
   *                       example: "paid"
   *                     amount:
   *                       type: number
   *                       format: decimal
   *                       example: 299.99
   *                 shipping:
   *                   type: object
   *                   nullable: true
   *                   description: Informações de envio
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 8
   *                     address:
   *                       type: string
   *                       example: "Rua das Flores, 123"
   *                     city:
   *                       type: string
   *                       example: "São Paulo"
   *                     trackingCode:
   *                       type: string
   *                       nullable: true
   *                       example: "BR123456789"
   *                 updates:
   *                   type: array
   *                   description: Histórico de atualizações do pedido
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                         example: 15
   *                       status:
   *                         type: string
   *                         example: "Shipped"
   *                       title:
   *                         type: string
   *                         nullable: true
   *                         example: "Pedido enviado"
   *                       comment:
   *                         type: string
   *                         nullable: true
   *                         example: "Enviado via transportadora XYZ"
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-15T14:30:00.000Z"
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T10:30:00.000Z"
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T12:45:00.000Z"
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
   *       403:
   *         description: Acesso negado ao pedido
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Você não tem permissão para acessar este pedido"
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
   */
  async show({ request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const orderId = request.param('id')

    const order = await Order.query()
      .if(user.role !== 'admin', (query) => query.where('customer_id', user.id))
      .if(user.role === 'admin', (query) => query.preload('customer'))
      .where('id', orderId)
      .preload('items', (query) => query.select('id', 'product_id', 'order_id').preload('product'))
      .preload('payment')
      .preload('shipping')
      .preload('updates')
      .firstOrFail()

    return order.serialize()
  }

  /**
   * @swagger
   * /orders:
   *   post:
   *     tags:
   *       - Orders
   *     summary: Criar novo pedido
   *     description: Cria um novo pedido para o usuário autenticado
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - items
   *             properties:
   *               items:
   *                 type: array
   *                 description: Itens do pedido
   *                 items:
   *                   type: object
   *                   required:
   *                     - productId
   *                     - quantity
   *                     - price
   *                   properties:
   *                     productId:
   *                       type: integer
   *                       description: ID do produto
   *                       example: 15
   *                     quantity:
   *                       type: integer
   *                       minimum: 1
   *                       description: Quantidade do produto
   *                       example: 2
   *                     price:
   *                       type: number
   *                       format: decimal
   *                       description: Preço unitário do produto
   *                       example: 149.99
   *               payment:
   *                 type: object
   *                 description: Informações de pagamento
   *                 properties:
   *                   method:
   *                     type: string
   *                     enum: ["credit_card", "debit_card", "pix", "bank_transfer"]
   *                     description: Método de pagamento
   *                     example: "credit_card"
   *                   installments:
   *                     type: integer
   *                     minimum: 1
   *                     description: Número de parcelas
   *                     example: 3
   *               shipping:
   *                 type: object
   *                 description: Informações de envio
   *                 properties:
   *                   address:
   *                     type: string
   *                     description: Endereço de entrega
   *                     example: "Rua das Flores, 123"
   *                   city:
   *                     type: string
   *                     description: Cidade
   *                     example: "São Paulo"
   *                   state:
   *                     type: string
   *                     description: Estado
   *                     example: "SP"
   *                   zipCode:
   *                     type: string
   *                     description: CEP
   *                     example: "01234-567"
   *                   method:
   *                     type: string
   *                     enum: ["standard", "express", "same_day"]
   *                     description: Método de envio
   *                     example: "standard"
   *     responses:
   *       201:
   *         description: Pedido criado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   example: 26
   *                 customerId:
   *                   type: integer
   *                   example: 10
   *                 status:
   *                   type: string
   *                   example: "Pending"
   *                 total:
   *                   type: number
   *                   format: decimal
   *                   example: 299.98
   *                 items:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       productId:
   *                         type: integer
   *                         example: 15
   *                       quantity:
   *                         type: integer
   *                         example: 2
   *                       price:
   *                         type: number
   *                         format: decimal
   *                         example: 149.99
   *                 payment:
   *                   type: object
   *                   nullable: true
   *                   example:
   *                     method: "credit_card"
   *                     installments: 3
   *                 shipping:
   *                   type: object
   *                   nullable: true
   *                   example:
   *                     address: "Rua das Flores, 123"
   *                     city: "São Paulo"
   *                     method: "standard"
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T15:45:00.000Z"
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T15:45:00.000Z"
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
   */
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
