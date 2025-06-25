import Coupon from '#models/coupon'
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
    if (user.role !== 'admin') {
      return response.unauthorized({
        message: 'Você não tem acesso a este método.',
      })
    }
    const query = request.input('query') as string | undefined
    const active = request.input('active', false)
    const categoryId = request.input('categoryId')
    const supplierId = request.input('supplierId')
    const coupons = await Coupon.query()
      .if(query, (q) => q.whereLike('code', `%${query?.toUpperCase()}%`))
      .if(categoryId, (q) => q.where('categoryId', categoryId))
      .if(supplierId, (q) => q.where('supplierId', supplierId))
      .if(active, (q) => q.where('active', true))
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
}
