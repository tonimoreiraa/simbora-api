import { Order } from '#models/order'
import { OrderItem } from '#models/order_item'
import { Product } from '#models/product'
import { Supplier } from '#models/supplier'
import { OrderActivityService } from '#services/order_activity_service'
import { createOrderSchema } from '#validators/order'
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
   *       - in: query
   *         name: withDetails
   *         schema:
   *           type: boolean
   *         description: Incluir detalhes dos itens, pagamento e envio
   *         example: true
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
   *                       subtotalPrice:
   *                         type: number
   *                         format: decimal
   *                         example: 249.99
   *                       totalPrice:
   *                         type: number
   *                         format: decimal
   *                         example: 299.99
   *                       discountPrice:
   *                         type: number
   *                         format: decimal
   *                         example: 20.00
   *                       shippingPrice:
   *                         type: number
   *                         format: decimal
   *                         example: 30.00
   *                       paymentId:
   *                         type: integer
   *                         nullable: true
   *                         example: 5
   *                       shippingId:
   *                         type: integer
   *                         nullable: true
   *                         example: 8
   *                       itemsCount:
   *                         type: integer
   *                         description: Quantidade total de itens
   *                         example: 3
   *                       customer:
   *                         type: object
   *                         description: Dados básicos do cliente (apenas para admins)
   *                         nullable: true
   *                         properties:
   *                           id:
   *                             type: integer
   *                             example: 10
   *                           name:
   *                             type: string
   *                             example: "João Silva"
   *                           email:
   *                             type: string
   *                             example: "joao@email.com"
   *                       payment:
   *                         type: object
   *                         nullable: true
   *                         description: Informações básicas de pagamento (se withDetails=true)
   *                         properties:
   *                           status:
   *                             type: string
   *                             example: "paid"
   *                           paymentMethod:
   *                             type: string
   *                             example: "credit_card"
   *                           price:
   *                             type: number
   *                             format: decimal
   *                             example: 299.99
   *                       shipping:
   *                         type: object
   *                         nullable: true
   *                         description: Informações básicas de envio (se withDetails=true)
   *                         properties:
   *                           provider:
   *                             type: string
   *                             example: "Correios"
   *                           shippingCode:
   *                             type: string
   *                             nullable: true
   *                             example: "BR123456789"
   *                           city:
   *                             type: string
   *                             example: "São Paulo"
   *                           state:
   *                             type: string
   *                             example: "SP"
   *                       lastUpdate:
   *                         type: object
   *                         nullable: true
   *                         description: Última atualização do pedido (se withDetails=true)
   *                         properties:
   *                           status:
   *                             type: string
   *                             example: "Shipped"
   *                           title:
   *                             type: string
   *                             example: "Pedido enviado"
   *                           createdAt:
   *                             type: string
   *                             format: date-time
   *                             example: "2024-01-15T14:30:00.000Z"
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
    const withDetails = request.input('withDetails', false)

    const query = Order.query()
      .if(user.role === 'customer', (q) => q.where('customer_id', user.id))
      .if(user.role === 'professional', (q) => q.where('customer_id', user.id))
      .if(status, (q) => q.where('status', status))
      .if(user.role === 'admin', (q) =>
        q.preload('customer', (customerQuery) => {
          customerQuery.select('id', 'name', 'email')
        })
      )
      .if(user.role === 'supplier', (q) => {
        q.whereHas('items', (itemQuery) => {
          itemQuery.whereHas('product', (productQuery) => {
            productQuery.whereHas('supplier', (supplierQuery) => {
              supplierQuery.where('owner_id', user.id)
            })
          })
        })
      })

    query.withCount('items', (itemsQuery) => {
      itemsQuery.as('itemsCount')
    })

    query.preload('items', (itemsQuery) => {
      itemsQuery.preload('product').preload('variant')
    })

    if (withDetails) {
      query
        .preload('payment', (paymentQuery) => {
          paymentQuery.select(
            'id',
            'order_id',
            'status',
            'payment_method',
            'price',
            'payment_provider'
          )
        })
        .preload('shipping', (shippingQuery) => {
          shippingQuery.select('order_id', 'provider', 'shipping_code', 'city', 'state', 'price')
        })
        .preload('updates', (updatesQuery) => {
          updatesQuery
            .select('id', 'order_id', 'status', 'title', 'created_at')
            .where('private', false)
            .orderBy('created_at', 'desc')
            .limit(1)
        })
    }

    const orders = await query.orderBy('created_at', 'desc').paginate(page, perPage)

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
  async show({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const orderId = params.id

    let query = Order.query()
      .where('id', orderId)
      .preload('items', (itemQuery) =>
        itemQuery.select('id', 'product_id', 'order_id').preload('product')
      )
      .preload('payment')
      .preload('shipping')
      .preload('updates')

    if (user.role === 'customer') {
      query = query.where('customer_id', user.id)
    } else if (user.role === 'admin') {
      query = query.preload('customer')
    } else if (user.role === 'supplier') {
      const supplier = await Supplier.query().where('owner_id', user.id).first()
      if (!supplier) {
        return response.unauthorized({ message: 'Fornecedor não encontrado para este usuário' })
      }
      query = query.whereHas('items', (itemQuery) => {
        itemQuery.whereHas('product', (productQuery) => {
          productQuery.where('supplier_id', supplier.id)
        })
      })
    }

    const order = await query.firstOrFail()

    // Verificar se o supplier tem acesso a este pedido
    if (user.role === 'supplier') {
      const supplier = await Supplier.query().where('owner_id', user.id).first()
      if (!supplier) {
        return response.unauthorized({ message: 'Fornecedor não encontrado para este usuário' })
      }
      const hasSupplierProducts = await order
        .related('items')
        .query()
        .whereHas('product', (productQuery) => {
          productQuery.where('supplier_id', supplier.id)
        })
        .first()

      if (!hasSupplierProducts) {
        return response.unauthorized({ message: 'Você não tem permissão para acessar este pedido' })
      }
    }

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
   *                     - product_id
   *                     - quantity
   *                     - unit_price
   *                   properties:
   *                     product_id:
   *                       type: integer
   *                       description: ID do produto
   *                       example: 15
   *                     product_variant_id:
   *                       type: integer
   *                       description: ID da variante do produto (opcional)
   *                       example: 23
   *                     quantity:
   *                       type: integer
   *                       minimum: 1
   *                       description: Quantidade do produto
   *                       example: 2
   *                     unit_price:
   *                       type: number
   *                       format: decimal
   *                       description: Preço unitário do produto no momento da compra
   *                       example: 149.99
   *               addressId:
   *                 type: integer
   *                 description: ID do endereço de entrega (opcional)
   *                 example: 5
   *               type:
   *                 type: string
   *                 enum: ["delivery", "pickup"]
   *                 description: Tipo do pedido - entrega ou retirada
   *                 example: "delivery"
   *                 default: "delivery"
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
   *                 type:
   *                   type: string
   *                   enum: ["delivery", "pickup"]
   *                   example: "delivery"
   *                 total:
   *                   type: number
   *                   format: decimal
   *                   example: 299.98
   *                 items:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                         example: 1
   *                       productId:
   *                         type: integer
   *                         example: 15
   *                       productVariantId:
   *                         type: integer
   *                         nullable: true
   *                         example: 23
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
   *                       product:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                             example: 15
   *                           name:
   *                             type: string
   *                             example: "Smartphone XYZ"
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
    const payload = await request.validateUsing(createOrderSchema)

    // Validate products exist and prepare items with client prices
    const itemsWithPrices = await Promise.all(
      payload.items.map(async (item) => {
        // Verify product exists but use client price
        await Product.findOrFail(item.product_id)
        const totalPrice = item.unit_price * item.quantity
        return {
          productId: item.product_id,
          productVariantId: item.product_variant_id,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice,
        }
      })
    )

    // Calculate order totals
    const subtotalPrice = itemsWithPrices.reduce((sum, item) => sum + item.totalPrice, 0)
    const discountPrice = 0 // Default to 0, can be calculated based on coupons later
    const shippingPrice = 0 // Default to 0, can be calculated based on shipping method later
    const totalPrice = subtotalPrice - discountPrice + shippingPrice

    // Create order
    const order = await Order.create({
      customerId: user.id,
      subtotalPrice,
      totalPrice,
      discountPrice,
      shippingPrice,
      status: 'Pending',
      type: payload.type || 'delivery',
    })

    // Create order items
    await Promise.all(
      itemsWithPrices.map((item) =>
        OrderItem.create({
          orderId: order.id,
          ...item,
        })
      )
    )

    // Criar log de atividade para criação do pedido
    await OrderActivityService.logOrderCreated(order.id, user.id, { request } as HttpContext)

    // Return order with items
    const orderWithItems = await Order.query()
      .where('id', order.id)
      .preload('items', (itemQuery) => itemQuery.preload('product'))
      .first()

    return orderWithItems?.serialize()
  }
}
