import { Category } from '#models/category'
import { createCategorySchema } from '#validators/category'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

export default class CategoriesController {
  /**
   * @swagger
   * /categories:
   *   get:
   *     tags:
   *       - Categories
   *     summary: Listar categorias
   *     description: Lista todas as categorias ou filtra por categoria pai
   *     parameters:
   *       - in: query
   *         name: categoryId
   *         schema:
   *           type: integer
   *         description: ID da categoria pai para filtrar subcategorias
   *         example: 1
   *     responses:
   *       200:
   *         description: Lista de categorias retornada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                     description: ID único da categoria
   *                     example: 1
   *                   name:
   *                     type: string
   *                     description: Nome da categoria
   *                     example: "Eletrônicos"
   *                   description:
   *                     type: string
   *                     description: Descrição da categoria
   *                     example: "Produtos eletrônicos em geral"
   *                   categoryId:
   *                     type: integer
   *                     nullable: true
   *                     description: ID da categoria pai
   *                     example: null
   *                   image:
   *                     type: string
   *                     description: URL completa da imagem da categoria
   *                     example: "https://api.simbora.com/uploads/clx123abc.jpg"
   *                   createdAt:
   *                     type: string
   *                     format: date-time
   *                     description: Data de criação
   *                     example: "2024-01-15T10:30:00.000Z"
   *                   updatedAt:
   *                     type: string
   *                     format: date-time
   *                     description: Data da última atualização
   *                     example: "2024-01-15T10:30:00.000Z"
   */
  async index({ request }: HttpContext) {
    const category = request.input('categoryId')
    const categories = await Category.query().if(category, (query) =>
      query.where('category_id', category)
    )
    return categories.map((item) => item.serialize())
  }

  /**
   * @swagger
   * /categories:
   *   post:
   *     tags:
   *       - Categories
   *     summary: Criar nova categoria
   *     description: Cria uma nova categoria com upload de imagem
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
   *               - image
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 3
   *                 description: Nome da categoria
   *                 example: "Smartphones"
   *               description:
   *                 type: string
   *                 description: Descrição da categoria
   *                 example: "Dispositivos móveis inteligentes"
   *               categoryId:
   *                 type: integer
   *                 description: ID da categoria pai (para subcategorias)
   *                 example: 1
   *               image:
   *                 type: string
   *                 format: binary
   *                 description: Imagem da categoria (PNG, JPG, JPEG - máx 4MB)
   *     responses:
   *       201:
   *         description: Categoria criada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   example: 5
   *                 name:
   *                   type: string
   *                   example: "Smartphones"
   *                 description:
   *                   type: string
   *                   example: "Dispositivos móveis inteligentes"
   *                 categoryId:
   *                   type: integer
   *                   nullable: true
   *                   example: 1
   *                 image:
   *                   type: string
   *                   example: "clx123abc.jpg"
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T11:30:00.000Z"
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T11:30:00.000Z"
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
   *                 errors:
   *                   type: object
   *                   example:
   *                     name: ["O nome deve ter no mínimo 3 caracteres"]
   *                     image: ["A imagem é obrigatória"]
   *       404:
   *         description: Categoria pai não encontrada
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "E_ROW_NOT_FOUND: Row not found"
   */
  async store({ request }: HttpContext) {
    const { image, ...payload } = await request.validateUsing(createCategorySchema)

    if (payload.categoryId) {
      await Category.findOrFail(payload.categoryId)
    }

    let imageName: string | undefined
    if (image) {
      imageName = `${cuid()}.${image.extname}`
      await image.move(app.tmpPath('uploads'), { name: imageName })
    }

    const category = await Category.create({ ...payload, image: imageName })
    return category
  }

  /**
   * @swagger
   * /categories/{id}:
   *   get:
   *     tags:
   *       - Categories
   *     summary: Buscar categoria por ID
   *     description: Retorna uma categoria específica com seus dados e categoria pai
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID da categoria
   *         example: 1
   *     responses:
   *       200:
   *         description: Categoria encontrada com sucesso
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
   *                   example: "Eletrônicos"
   *                 description:
   *                   type: string
   *                   example: "Produtos eletrônicos em geral"
   *                 categoryId:
   *                   type: integer
   *                   nullable: true
   *                   example: null
   *                 image:
   *                   type: string
   *                   example: "https://api.simbora.com/uploads/clx123abc.jpg"
   *                 category:
   *                   type: object
   *                   nullable: true
   *                   description: Categoria pai (se existir)
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 2
   *                     name:
   *                       type: string
   *                       example: "Categoria Pai"
   *                     description:
   *                       type: string
   *                       example: "Descrição da categoria pai"
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T10:30:00.000Z"
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T10:30:00.000Z"
   *       404:
   *         description: Categoria não encontrada
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "E_ROW_NOT_FOUND: Row not found"
   */
  async show({ params }: HttpContext) {
    const category = await Category.query().where('id', params.id).preload('category').firstOrFail()
    return category
  }

  /**
   * @swagger
   * /categories/{id}:
   *   put:
   *     tags:
   *       - Categories
   *     summary: Atualizar categoria
   *     description: Atualiza uma categoria existente
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID da categoria a ser atualizada
   *         example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - image
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 3
   *                 description: Nome da categoria
   *                 example: "Smartphones Atualizados"
   *               description:
   *                 type: string
   *                 description: Descrição da categoria
   *                 example: "Nova descrição dos dispositivos móveis"
   *               categoryId:
   *                 type: integer
   *                 description: ID da categoria pai
   *                 example: 2
   *               image:
   *                 type: string
   *                 format: binary
   *                 description: Nova imagem da categoria (PNG, JPG, JPEG - máx 4MB)
   *     responses:
   *       200:
   *         description: Categoria atualizada com sucesso
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
   *                   example: "Smartphones Atualizados"
   *                 description:
   *                   type: string
   *                   example: "Nova descrição dos dispositivos móveis"
   *                 categoryId:
   *                   type: integer
   *                   example: 2
   *                 image:
   *                   type: string
   *                   example: "clx456def.jpg"
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T10:30:00.000Z"
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T12:45:00.000Z"
   *       404:
   *         description: Categoria não encontrada
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "E_ROW_NOT_FOUND: Row not found"
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
   */
  async update({ params, request }: HttpContext) {
    const category = await Category.findOrFail(params.id)
    const { image, ...payload } = await request.validateUsing(createCategorySchema)

    if (payload.categoryId) {
      await Category.findOrFail(payload.categoryId)
    }

    let imageName: string | undefined
    if (image) {
      imageName = `${cuid()}.${image.extname}`
      await image.move(app.tmpPath('uploads'), { name: imageName })
    }

    category.merge({ ...payload, image: imageName })
    await category.save()
    return category
  }

  /**
   * @swagger
   * /categories/{id}:
   *   delete:
   *     tags:
   *       - Categories
   *     summary: Deletar categoria
   *     description: Remove uma categoria do sistema
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID da categoria a ser deletada
   *         example: 1
   *     responses:
   *       204:
   *         description: Categoria deletada com sucesso
   *       404:
   *         description: Categoria não encontrada
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "E_ROW_NOT_FOUND: Row not found"
   */
  async destroy({ params }: HttpContext) {
    const category = await Category.findOrFail(params.id)
    await category.delete()
  }
}
