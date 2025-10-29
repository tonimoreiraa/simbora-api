import { OrderShipping } from '#models/order_shipping'
import { Order } from '#models/order'
import { Supplier } from '#models/supplier'
import { createOrderShippingSchema, updateOrderShippingSchema } from '#validators/order_shipping'
import type { HttpContext } from '@adonisjs/core/http'

export default class OrderShippingsController {
  /**
   * @swagger
   * /order-shippings:
   *   get:
   *     tags:
   *       - Order Shippings
   *     summary: Listar envios de pedidos
   *     description: Lista informações de envio dos pedidos com filtros por usuário/role
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
   *         name: provider
   *         schema:
   *           type: string
   *         description: Filtrar por transportadora
   *         example: "Correios"
   *     responses:
   *       200:
   *         description: Lista de envios retornada com sucesso
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
   *                       orderId:
   *                         type: integer
   *                         example: 25
   *                       userId:
   *                         type: integer
   *                         example: 10
   *                       addressId:
   *                         type: integer
   *                         example: 5
   *                       price:
   *                         type: number
   *                         format: decimal
   *                         example: 15.50
   *                       provider:
   *                         type: string
   *                         example: "Correios"
   *                       shippingCode:
   *                         type: string
   *                         example: "BR123456789"
   *                       address:
   *                         type: string
   *                         example: "Rua das Flores"
   *                       number:
   *                         type: string
   *                         example: "123"
   *                       city:
   *                         type: string
   *                         example: "São Paulo"
   *                       state:
   *                         type: string
   *                         example: "SP"
   *                       zipCode:
   *                         type: string
   *                         example: "01234-567"
   *                       district:
   *                         type: string
   *                         example: "Centro"
   *                       complement:
   *                         type: string
   *                         nullable: true
   *                         example: "Apto 101"
   *                       country:
   *                         type: string
   *                         example: "Brasil"
   *                       order:
   *                         type: object
   *                         description: Dados básicos do pedido
   *                         properties:
   *                           id:
   *                             type: integer
   *                             example: 25
   *                           customerId:
   *                             type: integer
   *                             example: 10
   *                           status:
   *                             type: string
   *                             example: "Processing"
   *                           totalPrice:
   *                             type: number
   *                             format: decimal
   *                             example: 299.99
   *                       user:
   *                         type: object
   *                         description: Dados básicos do usuário
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
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-15T14:30:00.000Z"
   *                       updatedAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-15T14:30:00.000Z"
   *       401:
   *         description: Usuário não autenticado
   */
  async index({ request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const orderId = request.input('orderId')
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 25)
    const provider = request.input('provider')

    let query = OrderShipping.query()
      .preload('order', (orderQuery) => {
        orderQuery.select('id', 'customer_id', 'status', 'total_price')
      })
      .preload('user', (userQuery) => {
        userQuery.select('id', 'name', 'email')
      })
      .orderBy('created_at', 'desc')

    // Filtrar por pedido se especificado
    if (orderId) {
      query = query.where('order_id', orderId)
    }

    // Filtrar por transportadora se especificado
    if (provider) {
      query = query.where('provider', 'ilike', `%${provider}%`)
    }

    // Controle de acesso baseado no role
    if (user.role === 'customer') {
      query = query.where('user_id', user.id)
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

    const shippings = await query.paginate(page, perPage)
    return shippings
  }

  /**
   * @swagger
   * /order-shippings/{id}:
   *   get:
   *     tags:
   *       - Order Shippings
   *     summary: Buscar envio por ID do pedido
   *     description: Retorna detalhes do envio de um pedido específico
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
   *         description: Detalhes do envio retornados com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 orderId:
   *                   type: integer
   *                   example: 25
   *                 userId:
   *                   type: integer
   *                   example: 10
   *                 addressId:
   *                   type: integer
   *                   example: 5
   *                 price:
   *                   type: number
   *                   format: decimal
   *                   example: 15.50
   *                 provider:
   *                   type: string
   *                   example: "Correios"
   *                 shippingCode:
   *                   type: string
   *                   example: "BR123456789"
   *                 address:
   *                   type: string
   *                   example: "Rua das Flores"
   *                 number:
   *                   type: string
   *                   example: "123"
   *                 city:
   *                   type: string
   *                   example: "São Paulo"
   *                 state:
   *                   type: string
   *                   example: "SP"
   *                 zipCode:
   *                   type: string
   *                   example: "01234-567"
   *                 district:
   *                   type: string
   *                   example: "Centro"
   *                 complement:
   *                   type: string
   *                   nullable: true
   *                   example: "Apto 101"
   *                 country:
   *                   type: string
   *                   example: "Brasil"
   *                 order:
   *                   type: object
   *                   description: Dados básicos do pedido
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 25
   *                     customerId:
   *                       type: integer
   *                       example: 10
   *                     status:
   *                       type: string
   *                       example: "Processing"
   *                     totalPrice:
   *                       type: number
   *                       format: decimal
   *                       example: 299.99
   *                 user:
   *                   type: object
   *                   description: Dados básicos do usuário
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
   *                 activityLogs:
   *                   type: array
   *                   description: Logs de atividade do envio
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                         example: 15
   *                       orderShippingId:
   *                         type: integer
   *                         example: 25
   *                       status:
   *                         type: string
   *                         example: "Shipped"
   *                       title:
   *                         type: string
   *                         example: "Saiu do centro de distribuição"
   *                       comment:
   *                         type: string
   *                         example: "Saiu do centro SP, indo para transportadora ABC"
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-15T14:30:00.000Z"
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
   *         description: Acesso negado ao envio
   *       404:
   *         description: Envio não encontrado
   */
  async show({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const orderId = params.id

    const shipping = await OrderShipping.query()
      .where('order_id', orderId)
      .preload('order', (orderQuery) => {
        orderQuery.select('id', 'customer_id', 'status', 'total_price')
      })
      .preload('user', (userQuery) => {
        userQuery.select('id', 'name', 'email')
      })
      .preload('activityLogs', (logsQuery) => {
        logsQuery
          .select('id', 'order_shipping_id', 'status', 'title', 'comment', 'created_at')
          .orderBy('created_at', 'desc')
      })
      .firstOrFail()

    // Controle de acesso baseado no role
    if (user.role === 'customer') {
      if (shipping.userId !== user.id) {
        return response.unauthorized({ message: 'Acesso negado ao envio' })
      }
    } else if (user.role === 'supplier') {
      const supplier = await Supplier.query().where('owner_id', user.id).firstOrFail()
      const order = await Order.query()
        .where('id', shipping.orderId)
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
        return response.unauthorized({ message: 'Acesso negado ao envio' })
      }
    }

    return shipping.serialize()
  }

  /**
   * @swagger
   * /order-shippings:
   *   post:
   *     tags:
   *       - Order Shippings
   *     summary: Criar envio para pedido
   *     description: Cria informações de envio para um pedido
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
   *               - userId
   *               - price
   *               - provider
   *               - shippingCode
   *               - addressId
   *               - address
   *               - number
   *               - city
   *               - state
   *               - zipCode
   *               - district
   *             properties:
   *               orderId:
   *                 type: integer
   *                 description: ID do pedido
   *                 example: 25
   *               userId:
   *                 type: integer
   *                 description: ID do usuário
   *                 example: 10
   *               price:
   *                 type: number
   *                 format: decimal
   *                 description: Preço do envio
   *                 example: 15.50
   *               provider:
   *                 type: string
   *                 description: Transportadora
   *                 example: "Correios"
   *               shippingCode:
   *                 type: string
   *                 description: Código de rastreamento
   *                 example: "BR123456789"
   *               addressId:
   *                 type: integer
   *                 description: ID do endereço do usuário
   *                 example: 5
   *               address:
   *                 type: string
   *                 description: Endereço de entrega
   *                 example: "Rua das Flores"
   *               number:
   *                 type: string
   *                 description: Número do endereço
   *                 example: "123"
   *               city:
   *                 type: string
   *                 description: Cidade
   *                 example: "São Paulo"
   *               state:
   *                 type: string
   *                 description: Estado
   *                 example: "SP"
   *               zipCode:
   *                 type: string
   *                 description: CEP
   *                 example: "01234-567"
   *               district:
   *                 type: string
   *                 description: Bairro
   *                 example: "Centro"
   *               complement:
   *                 type: string
   *                 nullable: true
   *                 description: Complemento do endereço
   *                 example: "Apto 101"
   *               country:
   *                 type: string
   *                 description: País
   *                 example: "Brasil"
   *                 default: "Brasil"
   *     responses:
   *       201:
   *         description: Envio criado com sucesso
   *       400:
   *         description: Dados de entrada inválidos
   *       401:
   *         description: Usuário não autenticado
   *       403:
   *         description: Sem permissão para criar envio
   */
  async store({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(createOrderShippingSchema)

    // Verificar se o pedido existe e se o usuário tem acesso
    const order = await Order.findOrFail(payload.orderId)

    if (user.role === 'customer' && order.customerId !== user.id) {
      return response.forbidden({ message: 'Sem permissão para criar envio para este pedido' })
    }

    // Verificar se já existe envio para este pedido
    const existingShipping = await OrderShipping.query().where('order_id', payload.orderId).first()
    if (existingShipping) {
      return response.badRequest({ message: 'Já existe envio para este pedido' })
    }

    const shipping = await OrderShipping.create(payload)
    return response.created(shipping)
  }

  /**
   * @swagger
   * /order-shippings/{id}:
   *   put:
   *     tags:
   *       - Order Shippings
   *     summary: Atualizar envio do pedido
   *     description: Atualiza informações de envio de um pedido
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
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               price:
   *                 type: number
   *                 format: decimal
   *                 description: Preço do envio
   *                 example: 18.50
   *               provider:
   *                 type: string
   *                 description: Transportadora
   *                 example: "Jadlog"
   *               shippingCode:
   *                 type: string
   *                 description: Código de rastreamento
   *                 example: "BR987654321"
   *               address:
   *                 type: string
   *                 description: Endereço de entrega
   *                 example: "Rua das Palmeiras"
   *               number:
   *                 type: string
   *                 description: Número do endereço
   *                 example: "456"
   *               city:
   *                 type: string
   *                 description: Cidade
   *                 example: "Rio de Janeiro"
   *               state:
   *                 type: string
   *                 description: Estado
   *                 example: "RJ"
   *               zipCode:
   *                 type: string
   *                 description: CEP
   *                 example: "20000-000"
   *               district:
   *                 type: string
   *                 description: Bairro
   *                 example: "Copacabana"
   *               complement:
   *                 type: string
   *                 nullable: true
   *                 description: Complemento do endereço
   *                 example: "Casa 2"
   *     responses:
   *       200:
   *         description: Envio atualizado com sucesso
   *       400:
   *         description: Dados de entrada inválidos
   *       401:
   *         description: Usuário não autenticado
   *       403:
   *         description: Sem permissão para atualizar envio
   *       404:
   *         description: Envio não encontrado
   */
  async update({ params, request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const orderId = params.id
    const payload = await request.validateUsing(updateOrderShippingSchema)

    const shipping = await OrderShipping.query()
      .where('order_id', orderId)
      .preload('order')
      .firstOrFail()

    // Controle de acesso - apenas admin ou supplier podem atualizar
    if (user.role === 'customer') {
      return response.forbidden({ message: 'Clientes não podem atualizar informações de envio' })
    }

    if (user.role === 'supplier') {
      const supplier = await Supplier.query().where('owner_id', user.id).firstOrFail()
      const order = await Order.query()
        .where('id', shipping.orderId)
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
        return response.forbidden({ message: 'Sem permissão para atualizar este envio' })
      }
    }

    shipping.merge(payload)
    await shipping.save()

    return shipping
  }

  /**
   * @swagger
   * /order-shippings/{id}:
   *   delete:
   *     tags:
   *       - Order Shippings
   *     summary: Excluir envio do pedido
   *     description: Remove informações de envio de um pedido (apenas admins)
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
   *       204:
   *         description: Envio excluído com sucesso
   *       401:
   *         description: Usuário não autenticado
   *       403:
   *         description: Sem permissão para excluir envio
   *       404:
   *         description: Envio não encontrado
   */
  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const orderId = params.id

    // Apenas admins podem excluir envios
    if (user.role !== 'admin') {
      return response.forbidden({ message: 'Apenas administradores podem excluir envios' })
    }

    const shipping = await OrderShipping.query().where('order_id', orderId).firstOrFail()
    await shipping.delete()

    return response.noContent()
  }
}
