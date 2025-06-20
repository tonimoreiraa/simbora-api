import { Product } from '#models/product'
import { createProductSchema, updateProductSchema } from '#validators/product'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import ProductImage from '#models/product_image'
import { ProductVariantType } from '#models/product_variant_type'

export default class ProductsController {
  /**
   * @swagger
   * /products:
   *   get:
   *     tags:
   *       - Products
   *     summary: Listar produtos
   *     description: Lista produtos com busca, filtros e paginação
   *     parameters:
   *       - in: query
   *         name: query
   *         schema:
   *           type: string
   *         description: Termo de busca (nome ou descrição)
   *         example: "smartphone"
   *       - in: query
   *         name: categoryId
   *         schema:
   *           type: integer
   *         description: Filtrar por categoria
   *         example: 1
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
   *         description: Itens por página
   *         example: 25
   *       - in: query
   *         name: groupByCategory
   *         schema:
   *           type: boolean
   *         description: Agrupar resultados por categoria
   *         example: false
   *     responses:
   *       200:
   *         description: Lista de produtos retornada com sucesso
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
   *                         example: 15
   *                       name:
   *                         type: string
   *                         example: "Smartphone XYZ Pro"
   *                       price:
   *                         type: number
   *                         format: decimal
   *                         example: 899.99
   *                       description:
   *                         type: string
   *                         example: "Smartphone com tela de 6.5 polegadas e câmera tripla"
   *                       supplierId:
   *                         type: integer
   *                         example: 5
   *                       categoryId:
   *                         type: integer
   *                         example: 1
   *                       tags:
   *                         type: array
   *                         items:
   *                           type: string
   *                         nullable: true
   *                         example: ["eletrônicos", "smartphone", "android"]
   *                       stock:
   *                         type: integer
   *                         example: 50
   *                       supplier:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                             example: 5
   *                           name:
   *                             type: string
   *                             example: "TechSupplier Ltd"
   *                       images:
   *                         type: array
   *                         items:
   *                           type: object
   *                           properties:
   *                             id:
   *                               type: integer
   *                               example: 1
   *                             path:
   *                               type: string
   *                               example: "https://api.simbora.com/uploads/clx123abc.jpg"
   *                             productId:
   *                               type: integer
   *                               example: 15
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-15T10:30:00.000Z"
   *                 meta:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                       example: 150
   *                     perPage:
   *                       type: integer
   *                       example: 25
   *                     currentPage:
   *                       type: integer
   *                       example: 1
   *                     lastPage:
   *                       type: integer
   *                       example: 6
   */
  async index({ request }: HttpContext) {
    const userQuery = request.input('query')
    const categoryId = request.input('categoryId')
    const page = request.input('page')
    const perPage = request.input('perPage', 25)
    const groupByCategory = request.input('groupByCategory', false)

    const products = await Product.query()
      .if(userQuery && userQuery.length, (query) => {
        const conditions = userQuery.split(/\s+/).map((word: string) => `%${word}%`)
        for (let condition of conditions) {
          condition = `%${condition}%`
          query.orWhere('name', 'ILIKE', condition).orWhere('description', 'ILIKE', condition)
        }
      })
      .preload('images')
      .preload('supplier')
      .if(categoryId, (query) => query.where('category_id', categoryId))
      .if(groupByCategory, (query) => query.groupBy('category_id'))
      .paginate(page, perPage)

    return products
  }

  /**
   * @swagger
   * /products:
   *   post:
   *     tags:
   *       - Products
   *     summary: Criar novo produto
   *     description: Cria um produto completo com imagens e variantes
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - price
   *               - description
   *               - supplierId
   *               - categoryId
   *               - image
   *             properties:
   *               name:
   *                 type: string
   *                 description: Nome do produto
   *                 example: "Smartphone XYZ Pro"
   *               price:
   *                 type: number
   *                 format: decimal
   *                 minimum: 0.01
   *                 description: Preço do produto
   *                 example: 899.99
   *               description:
   *                 type: string
   *                 description: Descrição detalhada do produto
   *                 example: "Smartphone com tela de 6.5 polegadas, câmera tripla de 108MP"
   *               supplierId:
   *                 type: integer
   *                 description: ID do fornecedor
   *                 example: 5
   *               categoryId:
   *                 type: integer
   *                 description: ID da categoria
   *                 example: 1
   *               tags:
   *                 type: string
   *                 description: Tags separadas por vírgula
   *                 example: "eletrônicos,smartphone,android"
   *               stock:
   *                 type: integer
   *                 minimum: 0
   *                 description: Quantidade em estoque
   *                 example: 50
   *               image:
   *                 type: string
   *                 format: binary
   *                 description: Imagem principal do produto (PNG, JPG, JPEG - máx 2MB)
   *               images:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *                 description: Imagens adicionais do produto
   *               variants:
   *                 type: array
   *                 description: Variantes do produto (ex. cores, tamanhos)
   *                 items:
   *                   type: object
   *                   required:
   *                     - variantTypeId
   *                     - value
   *                     - price
   *                   properties:
   *                     variantTypeId:
   *                       type: integer
   *                       description: ID do tipo de variante
   *                       example: 2
   *                     value:
   *                       type: string
   *                       description: Valor da variante
   *                       example: "Azul"
   *                     unit:
   *                       type: string
   *                       description: Unidade (opcional)
   *                       example: "GB"
   *                     price:
   *                       type: number
   *                       format: decimal
   *                       description: Preço específico da variante
   *                       example: 949.99
   *                     photo:
   *                       type: string
   *                       format: binary
   *                       description: Foto específica da variante
   *     responses:
   *       201:
   *         description: Produto criado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   example: 16
   *                 name:
   *                   type: string
   *                   example: "Smartphone XYZ Pro"
   *                 price:
   *                   type: number
   *                   format: decimal
   *                   example: 899.99
   *                 description:
   *                   type: string
   *                   example: "Smartphone com tela de 6.5 polegadas"
   *                 supplierId:
   *                   type: integer
   *                   example: 5
   *                 categoryId:
   *                   type: integer
   *                   example: 1
   *                 tags:
   *                   type: array
   *                   items:
   *                     type: string
   *                   example: ["eletrônicos", "smartphone", "android"]
   *                 stock:
   *                   type: integer
   *                   example: 50
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T16:30:00.000Z"
   *       400:
   *         description: Dados de entrada inválidos
   *       401:
   *         description: Usuário não autenticado
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
   *                   example:
   *                     supplierId: ["O fornecedor deve existir"]
   *                     categoryId: ["A categoria deve existir"]
   */
  async store({ request }: HttpContext) {
    let { images, image, variants, ...payload } = await request.validateUsing(createProductSchema)

    const product = await Product.create(payload)

    if (image) {
      images = images ? [...images, image] : [image]
    }
    if (images) {
      const imagesDir = app.tmpPath('uploads')
      let imagePaths: string[] = []
      for (const uploadedImage of images) {
        const imageName = `${cuid()}.${uploadedImage.extname}`
        await uploadedImage.move(imagesDir, {
          name: imageName,
        })
        imagePaths.push(imageName)
      }

      await ProductImage.createMany(
        imagePaths.map((path) => ({
          productId: product.id,
          path,
        }))
      )
    }

    if (variants) {
      const variantsPayload = await Promise.all(
        variants.map(async (variant) => {
          const variantType = await ProductVariantType.findOrFail(variant.variantTypeId)
          if (variant.unit === null) variant.unit = variantType.defaultUnit
          if (variant.photo) {
            const photoName = `${cuid()}.${variant.photo.extname}`
            variant.photo.move(app.tmpPath('uploads'), {
              name: photoName,
            })
            return {
              ...variant,
              photo: photoName,
            }
          }
          return { ...variant, photo: undefined }
        })
      )
      await product.related('variants').createMany(variantsPayload)
    }

    return product.serialize()
  }

  /**
   * @swagger
   * /products/{id}:
   *   get:
   *     tags:
   *       - Products
   *     summary: Buscar produto por ID
   *     description: Retorna detalhes completos de um produto com categoria, fornecedor, variantes e imagens
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do produto
   *         example: 15
   *     responses:
   *       200:
   *         description: Produto encontrado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   example: 15
   *                 name:
   *                   type: string
   *                   example: "Smartphone XYZ Pro"
   *                 price:
   *                   type: number
   *                   format: decimal
   *                   example: 899.99
   *                 description:
   *                   type: string
   *                   example: "Smartphone com tela de 6.5 polegadas"
   *                 supplierId:
   *                   type: integer
   *                   example: 5
   *                 categoryId:
   *                   type: integer
   *                   example: 1
   *                 tags:
   *                   type: array
   *                   items:
   *                     type: string
   *                   nullable: true
   *                   example: ["eletrônicos", "smartphone", "android"]
   *                 stock:
   *                   type: integer
   *                   example: 50
   *                 category:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     name:
   *                       type: string
   *                       example: "Eletrônicos"
   *                 supplier:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 5
   *                     name:
   *                       type: string
   *                       example: "TechSupplier Ltd"
   *                 variants:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                         example: 8
   *                       variantTypeId:
   *                         type: integer
   *                         example: 2
   *                       value:
   *                         type: string
   *                         example: "Azul"
   *                       unit:
   *                         type: string
   *                         nullable: true
   *                         example: "GB"
   *                       price:
   *                         type: number
   *                         format: decimal
   *                         example: 949.99
   *                       photo:
   *                         type: string
   *                         nullable: true
   *                         example: "clx456def.jpg"
   *                       type:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                             example: 2
   *                           name:
   *                             type: string
   *                             example: "Cor"
   *                           defaultUnit:
   *                             type: string
   *                             example: "unidade"
   *                 images:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                         example: 1
   *                       path:
   *                         type: string
   *                         example: "https://api.simbora.com/uploads/clx123abc.jpg"
   *                       productId:
   *                         type: integer
   *                         example: 15
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T10:30:00.000Z"
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T12:45:00.000Z"
   *       404:
   *         description: Produto não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "E_ROW_NOT_FOUND: Row not found"
   */
  async show({ request }: HttpContext) {
    const productId = request.param('id')
    const product = await Product.query()
      .where('id', productId)
      .preload('category', (query) => query.select('id', 'name'))
      .preload('supplier', (query) => query.select('id', 'name'))
      .preload('variants', (query) => query.preload('type'))
      .preload('images', (query) => query.select('path', 'product_id', 'id'))
      .firstOrFail()

    return product
  }

  /**
   * @swagger
   * /products/{id}:
   *   put:
   *     tags:
   *       - Products
   *     summary: Atualizar produto
   *     description: Atualiza dados básicos de um produto existente
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do produto a ser atualizado
   *         example: 15
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - price
   *               - description
   *               - supplierId
   *               - categoryId
   *             properties:
   *               name:
   *                 type: string
   *                 description: Nome do produto
   *                 example: "Smartphone XYZ Pro Max"
   *               price:
   *                 type: number
   *                 format: decimal
   *                 minimum: 0.01
   *                 description: Novo preço do produto
   *                 example: 999.99
   *               description:
   *                 type: string
   *                 description: Nova descrição do produto
   *                 example: "Smartphone premium com tela de 6.7 polegadas"
   *               supplierId:
   *                 type: integer
   *                 description: ID do fornecedor
   *                 example: 5
   *               categoryId:
   *                 type: integer
   *                 description: ID da categoria
   *                 example: 1
   *               tags:
   *                 type: array
   *                 items:
   *                   type: string
   *                 nullable: true
   *                 description: Lista de tags
   *                 example: ["eletrônicos", "smartphone", "premium"]
   *               stock:
   *                 type: integer
   *                 minimum: 0
   *                 description: Quantidade em estoque
   *                 example: 30
   *     responses:
   *       200:
   *         description: Produto atualizado com sucesso
   *       401:
   *         description: Usuário não autenticado
   *       404:
   *         description: Produto não encontrado
   *       422:
   *         description: Erro de validação
   */
  async update({ request }: HttpContext) {
    const productId = request.param('id')
    const payload = await request.validateUsing(updateProductSchema)

    const product = await Product.findOrFail(productId)
    product.merge(payload)

    await product.save()
  }

  /**
   * @swagger
   * /products/add-photo:
   *   post:
   *     tags:
   *       - Products
   *     summary: Adicionar foto ao produto
   *     description: Adiciona uma imagem adicional a um produto existente
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - productId
   *               - image
   *             properties:
   *               productId:
   *                 type: integer
   *                 description: ID do produto
   *                 example: 15
   *               image:
   *                 type: string
   *                 format: binary
   *                 description: Imagem a ser adicionada (JPG, JPEG, PNG - máx 2MB)
   *     responses:
   *       200:
   *         description: Imagem adicionada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "OK"
   *       400:
   *         description: Imagem não enviada ou inválida
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
   *       404:
   *         description: Produto não encontrado
   */
  async addPhoto({ request, response }: HttpContext) {
    const productId = request.input('productId')

    const product = await Product.findOrFail(productId)

    const image = request.file('image', {
      extnames: ['jpg', 'jpeg', 'png'],
      size: '2mb',
    })

    if (!image) {
      return response.badRequest({
        message: 'Você deve enviar uma imagem válida.',
      })
    }
    const imageName = `${cuid()}.${image.extname}`
    await image.move(app.makePath('storage/uploads'), {
      name: imageName,
    })

    await ProductImage.create({
      productId: product.id,
      path: imageName,
    })

    return response.safeStatus(200).json({ message: 'OK' })
  }
}
