import Coupon from '#models/coupon'
import { createCouponValidator, updateCouponValidator } from '#validators/coupon'
import { Supplier } from '#models/supplier'
import type { HttpContext } from '@adonisjs/core/http'

export default class CouponsController {
  /**
   * @swagger
   * /coupons:
   *   get:
   *     tags:
   *       - Coupons
   *     summary: Listar cupons
   *     description: Lista todos os cupons disponíveis no sistema com filtros opcionais. Requer permissão de administrador.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: query
   *         schema:
   *           type: string
   *         description: Filtro de busca por código do cupom (case insensitive)
   *         example: "DESCONTO"
   *       - in: query
   *         name: active
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Filtrar apenas cupons ativos
   *         example: true
   *       - in: query
   *         name: categoryId
   *         schema:
   *           type: integer
   *         description: Filtrar por ID da categoria
   *         example: 1
   *       - in: query
   *         name: supplierId
   *         schema:
   *           type: integer
   *         description: Filtrar por ID do fornecedor
   *         example: 2
   *     responses:
   *       200:
   *         description: Lista de cupons retornada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                     description: ID único do cupom
   *                     example: 1
   *                   code:
   *                     type: string
   *                     description: Código do cupom
   *                     example: "DESCONTO10"
   *                   description:
   *                     type: string
   *                     description: Descrição do cupom
   *                     example: "10% de desconto em produtos selecionados"
   *                   type:
   *                     type: string
   *                     enum: [percent, fixed, shipping]
   *                     description: Tipo do desconto
   *                     example: "percent"
   *                   minOrderValue:
   *                     type: number
   *                     description: Valor mínimo do pedido para usar o cupom
   *                     example: 100.00
   *                   supplierId:
   *                     type: integer
   *                     description: ID do fornecedor associado
   *                     example: 2
   *                   categoryId:
   *                     type: integer
   *                     description: ID da categoria associada
   *                     example: 1
   *                   value:
   *                     type: number
   *                     description: Valor do desconto (percentual ou fixo)
   *                     example: 10.0
   *                   maxUses:
   *                     type: integer
   *                     description: Máximo de usos do cupom
   *                     example: 100
   *                   usesCount:
   *                     type: integer
   *                     description: Quantidade de vezes que o cupom foi usado
   *                     example: 25
   *                   maxUsesPerUser:
   *                     type: integer
   *                     description: Máximo de usos por usuário
   *                     example: 1
   *                   validFrom:
   *                     type: string
   *                     format: date-time
   *                     description: Data de início da validade
   *                     example: "2024-01-01T00:00:00.000Z"
   *                   validUntil:
   *                     type: string
   *                     format: date-time
   *                     description: Data de fim da validade
   *                     example: "2024-12-31T23:59:59.000Z"
   *                   active:
   *                     type: boolean
   *                     description: Status de ativação do cupom
   *                     example: true
   *                   createdAt:
   *                     type: string
   *                     format: date-time
   *                     description: Data de criação do cupom
   *                     example: "2024-01-15T10:30:00.000Z"
   *                   updatedAt:
   *                     type: string
   *                     format: date-time
   *                     description: Data da última atualização
   *                     example: "2024-01-15T10:30:00.000Z"
   *       401:
   *         description: Token de acesso inválido ou expirado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Token de acesso inválido"
   *       403:
   *         description: Usuário não tem permissão de administrador
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Você não tem acesso a este método."
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
  async index({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.role !== 'admin' && user.role !== 'supplier') {
      return response.unauthorized({
        message: 'Você não tem acesso a este método.',
      })
    }
    const query = request.input('query') as string | undefined
    const active = request.input('active', false)
    const categoryId = request.input('categoryId')
    const supplierId = request.input('supplierId')

    let couponsQuery = Coupon.query()
      .if(query, (q) => q.whereLike('code', `%${query?.toUpperCase()}%`))
      .if(categoryId, (q) => q.where('categoryId', categoryId))
      .if(supplierId, (q) => q.where('supplierId', supplierId))
      .if(active, (q) => q.where('active', true))
      .preload('category', (categoryQuery) => categoryQuery.whereNotNull('id'))
      .preload('supplier', (supplierQuery) => supplierQuery.whereNotNull('id'))

    // Se for supplier, filtrar apenas seus cupons
    if (user.role === 'supplier') {
      const supplier = await Supplier.query().where('owner_id', user.id).firstOrFail()
      couponsQuery = couponsQuery.where('supplierId', supplier.id)
    }

    const coupons = await couponsQuery
    return coupons.map((c) => c.serialize())
  }

  /**
   * @swagger
   * /coupons/verify/{code}:
   *   get:
   *     tags:
   *       - Coupons
   *     summary: Verificar validade do cupom
   *     description: Verifica se um cupom é válido para uso, considerando status ativo, limites de uso, período de validade e outras restrições
   *     parameters:
   *       - in: path
   *         name: code
   *         required: true
   *         schema:
   *           type: string
   *         description: Código do cupom a ser verificado (case insensitive)
   *         example: "DESCONTO10"
   *     responses:
   *       200:
   *         description: Cupom válido encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   description: ID único do cupom
   *                   example: 1
   *                 code:
   *                   type: string
   *                   description: Código do cupom
   *                   example: "DESCONTO10"
   *                 description:
   *                   type: string
   *                   description: Descrição do cupom
   *                   example: "10% de desconto em produtos selecionados"
   *                 type:
   *                   type: string
   *                   enum: [percent, fixed, shipping]
   *                   description: Tipo do desconto
   *                   example: "percent"
   *                 minOrderValue:
   *                   type: number
   *                   description: Valor mínimo do pedido para usar o cupom
   *                   example: 100.00
   *                 supplierId:
   *                   type: integer
   *                   description: ID do fornecedor associado
   *                   example: 2
   *                 categoryId:
   *                   type: integer
   *                   description: ID da categoria associada
   *                   example: 1
   *                 value:
   *                   type: number
   *                   description: Valor do desconto (percentual ou fixo)
   *                   example: 10.0
   *                 maxUses:
   *                   type: integer
   *                   description: Máximo de usos do cupom
   *                   example: 100
   *                 usesCount:
   *                   type: integer
   *                   description: Quantidade de vezes que o cupom foi usado
   *                   example: 25
   *                 maxUsesPerUser:
   *                   type: integer
   *                   description: Máximo de usos por usuário
   *                   example: 1
   *                 validFrom:
   *                   type: string
   *                   format: date-time
   *                   description: Data de início da validade
   *                   example: "2024-01-01T00:00:00.000Z"
   *                 validUntil:
   *                   type: string
   *                   format: date-time
   *                   description: Data de fim da validade
   *                   example: "2024-12-31T23:59:59.000Z"
   *                 active:
   *                   type: boolean
   *                   description: Status de ativação do cupom
   *                   example: true
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   description: Data de criação do cupom
   *                   example: "2024-01-15T10:30:00.000Z"
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   description: Data da última atualização
   *                   example: "2024-01-15T10:30:00.000Z"
   *       404:
   *         description: Cupom não encontrado ou inválido
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "E_ROW_NOT_FOUND: Row not found"
   *                 errors:
   *                   type: object
   *                   example:
   *                     code: ["Cupom não encontrado, inativo, expirado ou esgotado"]
   *       422:
   *         description: Parâmetros inválidos
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
   *                   example:
   *                     code: ["O código do cupom é obrigatório"]
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
  async verifyCoupon({ request }: HttpContext) {
    let code = request.param('code') as string
    code = code.toUpperCase()
    const coupon = await Coupon.query()
      .where('code', code)
      .where('active', true)
      .whereRaw('usesCount < maxUses')
      .where('validFrom', '<=', new Date())
      .where('validUntil', '>', new Date())
      .firstOrFail()
    //* TODO: Create supplier, category and minOrderValue validation*
    return coupon
  }

  /**
   * @swagger
   * /coupons/{id}:
   *   get:
   *     tags:
   *       - Coupons
   *     summary: Obter detalhes de um cupom
   *     description: Obtém os detalhes de um cupom específico pelo ID. Requer permissão de administrador.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do cupom
   *         example: 1
   *     responses:
   *       200:
   *         description: Detalhes do cupom retornados com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   example: 1
   *                 code:
   *                   type: string
   *                   example: "DESCONTO10"
   *                 description:
   *                   type: string
   *                   example: "10% de desconto em produtos selecionados"
   *                 type:
   *                   type: string
   *                   enum: [percent, fixed, shipping]
   *                   example: "percent"
   *                 value:
   *                   type: number
   *                   example: 10.0
   *                 minOrderValue:
   *                   type: number
   *                   example: 100.00
   *                 maxUses:
   *                   type: integer
   *                   example: 100
   *                 usesCount:
   *                   type: integer
   *                   example: 25
   *                 maxUsesPerUser:
   *                   type: integer
   *                   example: 1
   *                 validFrom:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-01T00:00:00.000Z"
   *                 validUntil:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-12-31T23:59:59.000Z"
   *                 active:
   *                   type: boolean
   *                   example: true
   *                 supplierId:
   *                   type: integer
   *                   example: 2
   *                 categoryId:
   *                   type: integer
   *                   example: 1
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T10:30:00.000Z"
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T10:30:00.000Z"
   *       401:
   *         description: Token de acesso inválido ou expirado
   *       403:
   *         description: Usuário não tem permissão de administrador
   *       404:
   *         description: Cupom não encontrado
   *       500:
   *         description: Erro interno do servidor
   */
  async show({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.role !== 'admin' && user.role !== 'supplier') {
      return response.unauthorized({
        message: 'Você não tem acesso a este método.',
      })
    }

    const coupon = await Coupon.findOrFail(params.id)

    // Se for supplier, verificar se o cupom pertence a ele
    if (user.role === 'supplier') {
      const supplier = await Supplier.query().where('owner_id', user.id).firstOrFail()
      if (coupon.supplierId !== supplier.id) {
        return response.unauthorized({
          message: 'Você só pode acessar seus próprios cupons.',
        })
      }
    }

    if (coupon.categoryId) {
      await coupon.load('category')
    }
    if (coupon.supplierId) {
      await coupon.load('supplier')
    }
    return coupon.serialize()
  }

  /**
   * @swagger
   * /coupons:
   *   post:
   *     tags:
   *       - Coupons
   *     summary: Criar novo cupom
   *     description: Cria um novo cupom de desconto. Requer permissão de administrador.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - code
   *               - description
   *               - type
   *               - value
   *               - maxUses
   *               - validFrom
   *               - validUntil
   *             properties:
   *               code:
   *                 type: string
   *                 description: Código único do cupom (será convertido para maiúsculo)
   *                 example: "DESCONTO10"
   *               description:
   *                 type: string
   *                 description: Descrição do cupom
   *                 example: "10% de desconto em produtos selecionados"
   *               type:
   *                 type: string
   *                 enum: [percent, fixed, shipping]
   *                 description: Tipo do desconto
   *                 example: "percent"
   *               value:
   *                 type: number
   *                 minimum: 0
   *                 description: Valor do desconto (percentual de 0-100 para percent, valor fixo para fixed/shipping)
   *                 example: 10.0
   *               minOrderValue:
   *                 type: number
   *                 minimum: 0
   *                 description: Valor mínimo do pedido para usar o cupom
   *                 example: 100.00
   *               maxUses:
   *                 type: integer
   *                 minimum: 1
   *                 description: Máximo de usos do cupom
   *                 example: 100
   *               maxUsesPerUser:
   *                 type: integer
   *                 minimum: 1
   *                 description: Máximo de usos por usuário
   *                 example: 1
   *               validFrom:
   *                 type: string
   *                 format: date-time
   *                 description: Data de início da validade
   *                 example: "2024-01-01T00:00:00.000Z"
   *               validUntil:
   *                 type: string
   *                 format: date-time
   *                 description: Data de fim da validade
   *                 example: "2024-12-31T23:59:59.000Z"
   *               active:
   *                 type: boolean
   *                 description: Status de ativação do cupom
   *                 default: true
   *                 example: true
   *               supplierId:
   *                 type: integer
   *                 description: ID do fornecedor associado (opcional)
   *                 example: 2
   *               categoryId:
   *                 type: integer
   *                 description: ID da categoria associada (opcional)
   *                 example: 1
   *     responses:
   *       201:
   *         description: Cupom criado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   example: 1
   *                 code:
   *                   type: string
   *                   example: "DESCONTO10"
   *                 description:
   *                   type: string
   *                   example: "10% de desconto em produtos selecionados"
   *                 type:
   *                   type: string
   *                   example: "percent"
   *                 value:
   *                   type: number
   *                   example: 10.0
   *                 minOrderValue:
   *                   type: number
   *                   example: 100.00
   *                 maxUses:
   *                   type: integer
   *                   example: 100
   *                 usesCount:
   *                   type: integer
   *                   example: 0
   *                 maxUsesPerUser:
   *                   type: integer
   *                   example: 1
   *                 validFrom:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-01T00:00:00.000Z"
   *                 validUntil:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-12-31T23:59:59.000Z"
   *                 active:
   *                   type: boolean
   *                   example: true
   *                 supplierId:
   *                   type: integer
   *                   example: 2
   *                 categoryId:
   *                   type: integer
   *                   example: 1
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T10:30:00.000Z"
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T10:30:00.000Z"
   *       400:
   *         description: Dados de entrada inválidos
   *       401:
   *         description: Token de acesso inválido ou expirado
   *       403:
   *         description: Usuário não tem permissão de administrador
   *       409:
   *         description: Código do cupom já existe
   *       422:
   *         description: Erro de validação
   *       500:
   *         description: Erro interno do servidor
   */
  async store({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.role !== 'admin' && user.role !== 'supplier') {
      return response.unauthorized({
        message: 'Você não tem acesso a este método.',
      })
    }

    const data = await request.validateUsing(createCouponValidator)

    // Convert code to uppercase
    data.code = data.code.toUpperCase()

    // Se for supplier, definir automaticamente o supplierId
    if (user.role === 'supplier') {
      const supplier = await Supplier.query().where('owner_id', user.id).firstOrFail()
      data.supplierId = supplier.id
    }

    try {
      const coupon = await Coupon.create({
        ...data,
        usesCount: 0,
      })

      if (coupon.categoryId) {
        await coupon.load('category')
      }
      if (coupon.supplierId) {
        await coupon.load('supplier')
      }

      return response.created(coupon.serialize())
    } catch (error) {
      if (error.code === '23505') {
        // PostgreSQL unique constraint violation
        return response.conflict({
          message: 'Código do cupom já existe',
          errors: { code: ['Este código de cupom já está em uso'] },
        })
      }
      throw error
    }
  }

  /**
   * @swagger
   * /coupons/{id}:
   *   put:
   *     tags:
   *       - Coupons
   *     summary: Atualizar cupom
   *     description: Atualiza um cupom existente. Requer permissão de administrador.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do cupom
   *         example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               code:
   *                 type: string
   *                 description: Código único do cupom (será convertido para maiúsculo)
   *                 example: "DESCONTO15"
   *               description:
   *                 type: string
   *                 description: Descrição do cupom
   *                 example: "15% de desconto em produtos selecionados"
   *               type:
   *                 type: string
   *                 enum: [percent, fixed, shipping]
   *                 description: Tipo do desconto
   *                 example: "percent"
   *               value:
   *                 type: number
   *                 minimum: 0
   *                 description: Valor do desconto
   *                 example: 15.0
   *               minOrderValue:
   *                 type: number
   *                 minimum: 0
   *                 description: Valor mínimo do pedido para usar o cupom
   *                 example: 150.00
   *               maxUses:
   *                 type: integer
   *                 minimum: 1
   *                 description: Máximo de usos do cupom
   *                 example: 50
   *               maxUsesPerUser:
   *                 type: integer
   *                 minimum: 1
   *                 description: Máximo de usos por usuário
   *                 example: 2
   *               validFrom:
   *                 type: string
   *                 format: date-time
   *                 description: Data de início da validade
   *                 example: "2024-02-01T00:00:00.000Z"
   *               validUntil:
   *                 type: string
   *                 format: date-time
   *                 description: Data de fim da validade
   *                 example: "2024-03-31T23:59:59.000Z"
   *               active:
   *                 type: boolean
   *                 description: Status de ativação do cupom
   *                 example: true
   *               supplierId:
   *                 type: integer
   *                 description: ID do fornecedor associado (opcional)
   *                 example: 3
   *               categoryId:
   *                 type: integer
   *                 description: ID da categoria associada (opcional)
   *                 example: 2
   *     responses:
   *       200:
   *         description: Cupom atualizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   example: 1
   *                 code:
   *                   type: string
   *                   example: "DESCONTO15"
   *                 description:
   *                   type: string
   *                   example: "15% de desconto em produtos selecionados"
   *                 type:
   *                   type: string
   *                   example: "percent"
   *                 value:
   *                   type: number
   *                   example: 15.0
   *                 minOrderValue:
   *                   type: number
   *                   example: 150.00
   *                 maxUses:
   *                   type: integer
   *                   example: 50
   *                 usesCount:
   *                   type: integer
   *                   example: 25
   *                 maxUsesPerUser:
   *                   type: integer
   *                   example: 2
   *                 validFrom:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-02-01T00:00:00.000Z"
   *                 validUntil:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-03-31T23:59:59.000Z"
   *                 active:
   *                   type: boolean
   *                   example: true
   *                 supplierId:
   *                   type: integer
   *                   example: 3
   *                 categoryId:
   *                   type: integer
   *                   example: 2
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T10:30:00.000Z"
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T12:45:00.000Z"
   *       400:
   *         description: Dados de entrada inválidos
   *       401:
   *         description: Token de acesso inválido ou expirado
   *       403:
   *         description: Usuário não tem permissão de administrador
   *       404:
   *         description: Cupom não encontrado
   *       409:
   *         description: Código do cupom já existe
   *       422:
   *         description: Erro de validação
   *       500:
   *         description: Erro interno do servidor
   */
  async update({ params, request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.role !== 'admin' && user.role !== 'supplier') {
      return response.unauthorized({
        message: 'Você não tem acesso a este método.',
      })
    }

    const coupon = await Coupon.findOrFail(params.id)

    // Se for supplier, verificar se o cupom pertence a ele
    if (user.role === 'supplier') {
      const supplier = await Supplier.query().where('owner_id', user.id).firstOrFail()
      if (coupon.supplierId !== supplier.id) {
        return response.unauthorized({
          message: 'Você só pode editar seus próprios cupons.',
        })
      }
    }

    const data = await request.validateUsing(updateCouponValidator)

    // Convert code to uppercase if provided
    if (data.code) {
      data.code = data.code.toUpperCase()
    }

    // Supplier não pode alterar o supplierId
    if (user.role === 'supplier') {
      if ('supplierId' in data) {
        delete data.supplierId
      }
    }

    try {
      coupon.merge(data)
      await coupon.save()

      if (coupon.categoryId) {
        await coupon.load('category')
      }
      if (coupon.supplierId) {
        await coupon.load('supplier')
      }

      return coupon.serialize()
    } catch (error) {
      if (error.code === '23505') {
        // PostgreSQL unique constraint violation
        return response.conflict({
          message: 'Código do cupom já existe',
          errors: { code: ['Este código de cupom já está em uso'] },
        })
      }
      throw error
    }
  }

  /**
   * @swagger
   * /coupons/{id}:
   *   delete:
   *     tags:
   *       - Coupons
   *     summary: Deletar cupom
   *     description: Deleta um cupom existente. Requer permissão de administrador.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do cupom
   *         example: 1
   *     responses:
   *       200:
   *         description: Cupom deletado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Cupom deletado com sucesso"
   *       401:
   *         description: Token de acesso inválido ou expirado
   *       403:
   *         description: Usuário não tem permissão de administrador
   *       404:
   *         description: Cupom não encontrado
   *       500:
   *         description: Erro interno do servidor
   */
  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.role !== 'admin' && user.role !== 'supplier') {
      return response.unauthorized({
        message: 'Você não tem acesso a este método.',
      })
    }

    const coupon = await Coupon.findOrFail(params.id)

    // Se for supplier, verificar se o cupom pertence a ele
    if (user.role === 'supplier') {
      const supplier = await Supplier.query().where('owner_id', user.id).firstOrFail()
      if (coupon.supplierId !== supplier.id) {
        return response.unauthorized({
          message: 'Você só pode deletar seus próprios cupons.',
        })
      }
    }

    await coupon.delete()

    return response.ok({
      message: 'Cupom deletado com sucesso',
    })
  }
}
