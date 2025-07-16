import { ProductVariant } from '#models/product_variant'
import { createProductVariantSchema, updateProductVariantSchema } from '#validators/product'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { Supplier } from '#models/supplier'
import { Product } from '#models/product'

export default class ProductVariantsController {
  /**
   * @swagger
   * /product-variants:
   *   get:
   *     tags:
   *       - Product Variants
   *     summary: Listar variantes de produtos
   *     description: Retorna todas as variantes de produtos cadastradas no sistema com seus relacionamentos
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: productId
   *         schema:
   *           type: integer
   *         description: Filtrar por ID do produto
   *         example: 15
   *       - in: query
   *         name: variantTypeId
   *         schema:
   *           type: integer
   *         description: Filtrar por tipo de variante
   *         example: 2
   *       - in: query
   *         name: value
   *         schema:
   *           type: string
   *         description: Filtrar por valor da variante
   *         example: "Azul"
   *     responses:
   *       200:
   *         description: Lista de variantes retornada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                     description: ID único da variante
   *                     example: 8
   *                   productId:
   *                     type: integer
   *                     description: ID do produto pai
   *                     example: 15
   *                   variantTypeId:
   *                     type: integer
   *                     description: ID do tipo de variante
   *                     example: 2
   *                   value:
   *                     type: string
   *                     description: Valor da variante
   *                     example: "Azul"
   *                   unit:
   *                     type: string
   *                     description: Unidade de medida
   *                     example: "GB"
   *                   price:
   *                     type: number
   *                     format: decimal
   *                     description: Preço da variante
   *                     example: 199.99
   *                   photo:
   *                     type: string
   *                     description: Nome do arquivo da imagem
   *                     example: "clx123abc456.jpg"
   *                   product:
   *                     type: object
   *                     description: Dados do produto pai
   *                     properties:
   *                       id:
   *                         type: integer
   *                         example: 15
   *                       name:
   *                         type: string
   *                         example: "Smartphone Galaxy"
   *                       description:
   *                         type: string
   *                         example: "Smartphone com tecnologia avançada"
   *                   type:
   *                     type: object
   *                     description: Tipo da variante
   *                     properties:
   *                       id:
   *                         type: integer
   *                         example: 2
   *                       name:
   *                         type: string
   *                         example: "Cor"
   *                       defaultUnit:
   *                         type: string
   *                         example: "unidade"
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
  async index({ request, auth }: HttpContext) {
    const productId = request.input('productId')
    const variantTypeId = request.input('variantTypeId')
    const value = request.input('value')

    let query = ProductVariant.query().preload('product').preload('type')

    if (productId) {
      query = query.where('productId', productId)
    }

    if (variantTypeId) {
      query = query.where('variantTypeId', variantTypeId)
    }

    if (value) {
      query = query.whereLike('value', `%${value}%`)
    }

    // Se o usuário estiver autenticado e for supplier, filtrar apenas variantes de seus produtos
    try {
      const user = await auth.authenticate()
      if (user.role === 'supplier') {
        const supplier = await Supplier.query().where('owner_id', user.id).firstOrFail()
        query = query.whereHas('product', (productQuery) => {
          productQuery.where('supplier_id', supplier.id)
        })
      }
    } catch {
      // Usuário não autenticado ou token inválido - continuar com busca pública
    }

    const variants = await query

    return variants.map((variant) => variant.serialize())
  }

  /**
   * @swagger
   * /product-variants/{id}:
   *   get:
   *     tags:
   *       - Product Variants
   *     summary: Buscar variante por ID
   *     description: Retorna uma variante específica com seus relacionamentos (produto e tipo)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID da variante
   *         example: 8
   *     responses:
   *       200:
   *         description: Variante encontrada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   description: ID único da variante
   *                   example: 8
   *                 productId:
   *                   type: integer
   *                   description: ID do produto pai
   *                   example: 15
   *                 variantTypeId:
   *                   type: integer
   *                   description: ID do tipo de variante
   *                   example: 2
   *                 value:
   *                   type: string
   *                   description: Valor da variante
   *                   example: "Azul"
   *                 unit:
   *                   type: string
   *                   description: Unidade de medida
   *                   example: "GB"
   *                 price:
   *                   type: number
   *                   format: decimal
   *                   description: Preço da variante
   *                   example: 199.99
   *                 photo:
   *                   type: string
   *                   description: Nome do arquivo da imagem
   *                   example: "clx123abc456.jpg"
   *                 product:
   *                   type: object
   *                   description: Dados completos do produto pai
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 15
   *                     name:
   *                       type: string
   *                       example: "Smartphone Galaxy"
   *                     description:
   *                       type: string
   *                       example: "Smartphone com tecnologia avançada"
   *                     category:
   *                       type: string
   *                       example: "Eletrônicos"
   *                     brand:
   *                       type: string
   *                       example: "Samsung"
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-10T10:00:00.000Z"
   *                 type:
   *                   type: object
   *                   description: Dados do tipo da variante
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 2
   *                     name:
   *                       type: string
   *                       example: "Cor"
   *                     defaultUnit:
   *                       type: string
   *                       example: "unidade"
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-05T08:00:00.000Z"
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   description: Data de criação da variante
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
   *         description: Variante não encontrada
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
  async show({ params, auth, response }: HttpContext) {
    const variantId = params.id

    const variant = await ProductVariant.query()
      .where('id', variantId)
      .preload('product')
      .preload('type')
      .firstOrFail()

    // Se o usuário estiver autenticado e for supplier, verificar se a variante pertence a seus produtos
    try {
      const user = await auth.authenticate()
      if (user.role === 'supplier') {
        const supplier = await Supplier.query().where('owner_id', user.id).firstOrFail()
        if (variant.product.supplierId !== supplier.id) {
          return response.unauthorized({
            message: 'Você só pode acessar variantes dos seus próprios produtos',
          })
        }
      }
    } catch {
      // Usuário não autenticado - continuar com acesso público
    }

    return variant.serialize()
  }

  /**
   * @swagger
   * /product-variants:
   *   post:
   *     tags:
   *       - Product Variants
   *     summary: Criar variante de produto
   *     description: Cria uma nova variante para um produto existente com upload de imagem obrigatória
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - productId
   *               - variantTypeId
   *               - value
   *               - price
   *               - photo
   *             properties:
   *               productId:
   *                 type: integer
   *                 description: ID do produto pai
   *                 example: 15
   *               variantTypeId:
   *                 type: integer
   *                 description: ID do tipo de variante (ex. cor, tamanho)
   *                 example: 2
   *               value:
   *                 type: string
   *                 description: Valor da variante (ex. "Azul", "M", "64GB")
   *                 example: "Azul"
   *               unit:
   *                 type: string
   *                 description: Unidade de medida (opcional)
   *                 example: "GB"
   *               price:
   *                 type: number
   *                 format: decimal
   *                 minimum: 0.01
   *                 description: Preço específico desta variante
   *                 example: 199.99
   *               photo:
   *                 type: string
   *                 format: binary
   *                 description: Imagem da variante (JPG, JPEG, PNG - máx 2MB)
   *     responses:
   *       201:
   *         description: Variante criada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   description: ID único da variante
   *                   example: 8
   *                 productId:
   *                   type: integer
   *                   description: ID do produto pai
   *                   example: 15
   *                 variantTypeId:
   *                   type: integer
   *                   description: ID do tipo de variante
   *                   example: 2
   *                 value:
   *                   type: string
   *                   description: Valor da variante
   *                   example: "Azul"
   *                 unit:
   *                   type: string
   *                   nullable: true
   *                   description: Unidade de medida
   *                   example: "GB"
   *                 price:
   *                   type: number
   *                   format: decimal
   *                   description: Preço da variante
   *                   example: 199.99
   *                 photo:
   *                   type: string
   *                   description: Nome do arquivo da imagem
   *                   example: "clx123abc456.jpg"
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T16:30:00.000Z"
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T16:30:00.000Z"
   *       400:
   *         description: Dados inválidos ou imagem não enviada
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Você deve enviar uma imagem válida."
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
   *                     productId: ["O produto deve existir"]
   *                     variantTypeId: ["O tipo de variante deve existir"]
   *                     price: ["O preço deve ser um número positivo"]
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
  async store({ request, response, auth }: HttpContext) {
    await auth.authenticate()
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(createProductVariantSchema)

    // Verificar se o usuário pode criar variantes para este produto
    const product = await Product.findOrFail(payload.productId)
    if (user.role === 'supplier') {
      const supplier = await Supplier.query().where('owner_id', user.id).firstOrFail()
      if (product.supplierId !== supplier.id) {
        return response.unauthorized({
          message: 'Você só pode criar variantes para seus próprios produtos',
        })
      }
    }

    const image = request.file('photo', {
      extnames: ['jpg', 'jpeg', 'png'],
      size: '2mb',
    })

    if (!image) {
      return response.badRequest({
        message: 'Você deve enviar uma imagem válida.',
      })
    }

    const imageName = `${cuid()}.${image.extname}`
    await image.move(app.tmpPath('uploads'), {
      name: imageName,
    })

    const productVariant = await ProductVariant.create({ ...payload, photo: imageName })
    return productVariant.serialize()
  }

  /**
   * @swagger
   * /product-variants/{id}:
   *   put:
   *     tags:
   *       - Product Variants
   *     summary: Atualizar variante de produto
   *     description: Atualiza uma variante existente, incluindo opção de trocar a imagem
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID da variante a ser atualizada
   *         example: 8
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - variantTypeId
   *               - value
   *               - price
   *             properties:
   *               variantTypeId:
   *                 type: integer
   *                 description: ID do tipo de variante
   *                 example: 2
   *               value:
   *                 type: string
   *                 description: Novo valor da variante
   *                 example: "Vermelho"
   *               unit:
   *                 type: string
   *                 description: Unidade de medida (opcional)
   *                 example: "GB"
   *               price:
   *                 type: number
   *                 format: decimal
   *                 minimum: 0.01
   *                 description: Novo preço da variante
   *                 example: 219.99
   *               photo:
   *                 type: string
   *                 format: binary
   *                 description: Nova imagem da variante (JPG, JPEG, PNG - máx 2MB) - opcional
   *     responses:
   *       200:
   *         description: Variante atualizada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   example: 8
   *                 productId:
   *                   type: integer
   *                   example: 15
   *                 variantTypeId:
   *                   type: integer
   *                   example: 2
   *                 value:
   *                   type: string
   *                   example: "Vermelho"
   *                 unit:
   *                   type: string
   *                   nullable: true
   *                   example: "GB"
   *                 price:
   *                   type: number
   *                   format: decimal
   *                   example: 219.99
   *                 photo:
   *                   type: string
   *                   description: Nome do arquivo da imagem (atualizada ou existente)
   *                   example: "clx789def123.jpg"
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
   *         description: Variante não encontrada
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
   *                     variantTypeId: ["O tipo de variante deve existir"]
   *                     price: ["O preço deve ser um número positivo"]
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
  async update({ params, request, response, auth }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.getUserOrFail()
      const productVariantId = params.id
      const payload = await request.validateUsing(updateProductVariantSchema)

      const productVariant = await ProductVariant.query()
        .where('id', productVariantId)
        .preload('product')
        .firstOrFail()

      // Verificar se o usuário pode editar esta variante
      if (user.role === 'supplier') {
        const supplier = await Supplier.query().where('owner_id', user.id).firstOrFail()
        if (productVariant.product.supplierId !== supplier.id) {
          return response.unauthorized({
            message: 'Você só pode editar variantes dos seus próprios produtos',
          })
        }
      }

      const image = request.file('photo', {
        extnames: ['jpg', 'jpeg', 'png'],
        size: '2mb',
      })

      let imagePath: undefined | string
      if (image) {
        imagePath = `${cuid()}.${image.extname}`
        await image.move(app.tmpPath('uploads'), {
          name: imagePath,
        })
      }

      productVariant.merge({ ...payload, photo: imagePath || productVariant.photo })
      await productVariant.save()

      return productVariant.serialize()
    } catch (error) {
      if (error.status === 422) {
        return response.unprocessableEntity({
          message: 'Validation failed',
          errors: error.messages || error.message,
        })
      }
      throw error
    }
  }

  /**
   * @swagger
   * /product-variants/{id}:
   *   delete:
   *     tags:
   *       - Product Variants
   *     summary: Deletar variante de produto
   *     description: Remove uma variante de produto do sistema
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID da variante a ser deletada
   *         example: 8
   *     responses:
   *       204:
   *         description: Variante deletada com sucesso
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
   *         description: Variante não encontrada
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
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    const user = auth.getUserOrFail()
    const productVariantId = params.id

    const productVariant = await ProductVariant.query()
      .where('id', productVariantId)
      .preload('product')
      .firstOrFail()

    // Verificar se o usuário pode deletar esta variante
    if (user.role === 'supplier') {
      const supplier = await Supplier.query().where('owner_id', user.id).firstOrFail()
      if (productVariant.product.supplierId !== supplier.id) {
        return response.unauthorized({
          message: 'Você só pode deletar variantes dos seus próprios produtos',
        })
      }
    } else if (user.role !== 'admin') {
      return response.unauthorized({
        message: 'Acesso restrito a administradores ou proprietários',
      })
    }

    await productVariant.delete()
  }
}
