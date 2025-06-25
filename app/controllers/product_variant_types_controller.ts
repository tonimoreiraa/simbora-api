import { ProductVariantType } from '#models/product_variant_type'
import {
  createProductVariantTypeSchema,
  updateProductVariantTypeSchema,
} from '#validators/product_variant_type'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProductVariantTypesController {
  /**
   * @swagger
   * /product-variant-types:
   *   get:
   *     tags:
   *       - Product Variant Types
   *     summary: Listar tipos de variantes
   *     description: Retorna todos os tipos de variantes cadastrados no sistema com suas variantes relacionadas
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: name
   *         schema:
   *           type: string
   *         description: Filtrar por nome do tipo
   *         example: "Cor"
   *       - in: query
   *         name: defaultUnit
   *         schema:
   *           type: string
   *         description: Filtrar por unidade padrão
   *         example: "unidade"
   *     responses:
   *       200:
   *         description: Lista de tipos de variantes retornada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                     description: ID único do tipo de variante
   *                     example: 1
   *                   name:
   *                     type: string
   *                     description: Nome do tipo de variante
   *                     example: "Cor"
   *                   defaultUnit:
   *                     type: string
   *                     description: Unidade padrão para este tipo
   *                     example: "unidade"
   *                   variants:
   *                     type: array
   *                     description: Variantes relacionadas a este tipo
   *                     items:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: integer
   *                           example: 8
   *                         value:
   *                           type: string
   *                           example: "Azul"
   *                         price:
   *                           type: number
   *                           example: 199.99
   *                         productId:
   *                           type: integer
   *                           example: 15
   *                   createdAt:
   *                     type: string
   *                     format: date-time
   *                     description: Data de criação
   *                     example: "2024-01-15T16:30:00.000Z"
   *                   updatedAt:
   *                     type: string
   *                     format: date-time
   *                     description: Data da última atualização
   *                     example: "2024-01-15T16:30:00.000Z"
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
  async index({ request }: HttpContext) {
    const name = request.input('name')
    const defaultUnit = request.input('defaultUnit')

    const query = ProductVariantType.query().preload('variants')

    if (name) {
      query.whereLike('name', `%${name}%`)
    }

    if (defaultUnit) {
      query.whereLike('defaultUnit', `%${defaultUnit}%`)
    }

    const variantTypes = await query

    return variantTypes.map((variantType) => variantType.serialize())
  }

  /**
   * @swagger
   * /product-variant-types/{id}:
   *   get:
   *     tags:
   *       - Product Variant Types
   *     summary: Buscar tipo de variante por ID
   *     description: Retorna um tipo de variante específico com suas variantes relacionadas
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do tipo de variante
   *         example: 1
   *     responses:
   *       200:
   *         description: Tipo de variante encontrado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   description: ID único do tipo de variante
   *                   example: 1
   *                 name:
   *                   type: string
   *                   description: Nome do tipo de variante
   *                   example: "Cor"
   *                 defaultUnit:
   *                   type: string
   *                   description: Unidade padrão para este tipo
   *                   example: "unidade"
   *                 variants:
   *                   type: array
   *                   description: Lista de variantes que usam este tipo
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                         example: 8
   *                       productId:
   *                         type: integer
   *                         example: 15
   *                       value:
   *                         type: string
   *                         example: "Azul"
   *                       unit:
   *                         type: string
   *                         example: "unidade"
   *                       price:
   *                         type: number
   *                         example: 199.99
   *                       photo:
   *                         type: string
   *                         example: "clx123abc456.jpg"
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-15T16:30:00.000Z"
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   description: Data de criação
   *                   example: "2024-01-15T16:30:00.000Z"
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   description: Data da última atualização
   *                   example: "2024-01-15T16:30:00.000Z"
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
   *         description: Tipo de variante não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "E_ROW_NOT_FOUND: Row not found"
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
  async show({ params }: HttpContext) {
    const variantTypeId = params.id

    const variantType = await ProductVariantType.query()
      .where('id', variantTypeId)
      .preload('variants')
      .firstOrFail()

    return variantType.serialize()
  }

  /**
   * @swagger
   * /product-variant-types:
   *   post:
   *     tags:
   *       - Product Variant Types
   *     summary: Criar tipo de variante
   *     description: Cria um novo tipo de variante de produto
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - defaultUnit
   *             properties:
   *               name:
   *                 type: string
   *                 description: Nome do tipo de variante
   *                 example: "Cor"
   *                 minLength: 2
   *                 maxLength: 50
   *               defaultUnit:
   *                 type: string
   *                 description: Unidade padrão para este tipo
   *                 example: "unidade"
   *                 minLength: 1
   *                 maxLength: 20
   *     responses:
   *       201:
   *         description: Tipo de variante criado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   description: ID único do tipo de variante
   *                   example: 1
   *                 name:
   *                   type: string
   *                   description: Nome do tipo de variante
   *                   example: "Cor"
   *                 defaultUnit:
   *                   type: string
   *                   description: Unidade padrão para este tipo
   *                   example: "unidade"
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T16:30:00.000Z"
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T16:30:00.000Z"
   *       400:
   *         description: Dados inválidos
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Dados inválidos"
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
   *                     name: ["O nome é obrigatório", "O nome deve ter pelo menos 2 caracteres"]
   *                     defaultUnit: ["A unidade padrão é obrigatória"]
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
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createProductVariantTypeSchema)

    const variantType = await ProductVariantType.create(payload)

    response.status(201)
    return variantType.serialize()
  }

  /**
   * @swagger
   * /product-variant-types/{id}:
   *   put:
   *     tags:
   *       - Product Variant Types
   *     summary: Atualizar tipo de variante
   *     description: Atualiza um tipo de variante existente
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do tipo de variante a ser atualizado
   *         example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - defaultUnit
   *             properties:
   *               name:
   *                 type: string
   *                 description: Nome do tipo de variante
   *                 example: "Tamanho"
   *                 minLength: 2
   *                 maxLength: 50
   *               defaultUnit:
   *                 type: string
   *                 description: Unidade padrão para este tipo
   *                 example: "cm"
   *                 minLength: 1
   *                 maxLength: 20
   *     responses:
   *       200:
   *         description: Tipo de variante atualizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   example: 1
   *                 name:
   *                   type: string
   *                   example: "Tamanho"
   *                 defaultUnit:
   *                   type: string
   *                   example: "cm"
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T16:30:00.000Z"
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T18:45:00.000Z"
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
   *         description: Tipo de variante não encontrado
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
   *                     name: ["O nome é obrigatório"]
   *                     defaultUnit: ["A unidade padrão é obrigatória"]
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
  async update({ params, request }: HttpContext) {
    const variantTypeId = params.id
    const payload = await request.validateUsing(updateProductVariantTypeSchema)

    const variantType = await ProductVariantType.findOrFail(variantTypeId)

    variantType.merge(payload)
    await variantType.save()

    return variantType.serialize()
  }

  /**
   * @swagger
   * /product-variant-types/{id}:
   *   delete:
   *     tags:
   *       - Product Variant Types
   *     summary: Deletar tipo de variante
   *     description: Remove um tipo de variante do sistema (apenas se não houver variantes associadas)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do tipo de variante a ser deletado
   *         example: 1
   *     responses:
   *       204:
   *         description: Tipo de variante deletado com sucesso
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
   *         description: Tipo de variante não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "E_ROW_NOT_FOUND: Row not found"
   *       409:
   *         description: Tipo de variante tem variantes associadas
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Não é possível deletar este tipo de variante pois existem variantes associadas a ele"
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
  async destroy({ params, response }: HttpContext) {
    const variantTypeId = params.id
    const variantType = await ProductVariantType.findOrFail(variantTypeId)

    // Check if there are associated variants
    await variantType.load('variants')
    if (variantType.variants.length > 0) {
      return response.conflict({
        message:
          'Não é possível deletar este tipo de variante pois existem variantes associadas a ele',
      })
    }

    await variantType.delete()

    return response.noContent()
  }
}
