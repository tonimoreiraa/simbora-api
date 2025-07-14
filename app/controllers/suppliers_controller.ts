import { Supplier } from '#models/supplier'
import { createSupplierSchema, updateSupplierSchema } from '#validators/supplier'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

export default class SuppliersController {
  /**
   * @swagger
   * /suppliers:
   *   get:
   *     tags:
   *       - Suppliers
   *     summary: Listar fornecedores
   *     description: Lista todos os fornecedores com paginação e filtros opcionais
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número da página para paginação
   *         example: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Número de itens por página
   *         example: 10
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Termo de busca para filtrar por nome ou descrição
   *         example: "Mercado"
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [name, created_at, updated_at]
   *           default: created_at
   *         description: Campo para ordenação
   *         example: "name"
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: desc
   *         description: Ordem de classificação
   *         example: "asc"
   *     responses:
   *       200:
   *         description: Lista de fornecedores retornada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 meta:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                       example: 50
   *                     per_page:
   *                       type: integer
   *                       example: 10
   *                     current_page:
   *                       type: integer
   *                       example: 1
   *                     last_page:
   *                       type: integer
   *                       example: 5
   *                     first_page:
   *                       type: integer
   *                       example: 1
   *                     first_page_url:
   *                       type: string
   *                       example: "/?page=1"
   *                     last_page_url:
   *                       type: string
   *                       example: "/?page=5"
   *                     next_page_url:
   *                       type: string
   *                       nullable: true
   *                       example: "/?page=2"
   *                     previous_page_url:
   *                       type: string
   *                       nullable: true
   *                       example: null
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                         description: ID único do fornecedor
   *                         example: 1
   *                       name:
   *                         type: string
   *                         description: Nome do fornecedor
   *                         example: "Mercado Central"
   *                       description:
   *                         type: string
   *                         description: Descrição do fornecedor
   *                         example: "Mercado com variedade de produtos frescos"
   *                       address:
   *                         type: string
   *                         description: Endereço do fornecedor
   *                         example: "Rua das Flores, 123, Centro"
   *                       photo:
   *                         type: string
   *                         nullable: true
   *                         description: URL completa da foto do fornecedor
   *                         example: "https://api.simbora.com/uploads/clx123abc.jpg"
   *                       ownerId:
   *                         type: integer
   *                         description: ID do proprietário do fornecedor
   *                         example: 1
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                         description: Data de criação
   *                         example: "2024-01-15T10:30:00.000Z"
   *                       updatedAt:
   *                         type: string
   *                         format: date-time
   *                         description: Data da última atualização
   *                         example: "2024-01-15T10:30:00.000Z"
   */
  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const search = request.input('search')
    const sortBy = request.input('sortBy', 'created_at')
    const sortOrder = request.input('sortOrder', 'desc')

    const query = Supplier.query()

    if (search) {
      query.where((builder) => {
        builder.where('name', 'ILIKE', `%${search}%`)
        builder.orWhere('description', 'ILIKE', `%${search}%`)
      })
    }

    query.orderBy(sortBy, sortOrder)

    const suppliers = await query.paginate(page, limit)

    return suppliers.serialize()
  }

  /**
   * @swagger
   * /suppliers:
   *   post:
   *     tags:
   *       - Suppliers
   *     summary: Criar novo fornecedor
   *     description: Cria um novo fornecedor com upload opcional de foto
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - address
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 3
   *                 description: Nome do fornecedor
   *                 example: "Mercado Central"
   *               description:
   *                 type: string
   *                 description: Descrição do fornecedor
   *                 example: "Mercado com variedade de produtos frescos"
   *               address:
   *                 type: string
   *                 minLength: 10
   *                 description: Endereço do fornecedor
   *                 example: "Rua das Flores, 123, Centro"
   *               photo:
   *                 type: string
   *                 format: binary
   *                 description: Foto do fornecedor (PNG, JPG, JPEG - máx 4MB)
   *     responses:
   *       201:
   *         description: Fornecedor criado com sucesso
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
   *                   example: "Mercado Central"
   *                 description:
   *                   type: string
   *                   example: "Mercado com variedade de produtos frescos"
   *                 address:
   *                   type: string
   *                   example: "Rua das Flores, 123, Centro"
   *                 photo:
   *                   type: string
   *                   nullable: true
   *                   example: "https://api.simbora.com/uploads/clx123abc.jpg"
   *                 ownerId:
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
   *         description: Erro de validação
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Erro de validação"
   *                 errors:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       field:
   *                         type: string
   *                         example: "name"
   *                       message:
   *                         type: string
   *                         example: "O nome deve ter pelo menos 3 caracteres"
   *       401:
   *         description: Não autorizado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Token de acesso inválido"
   */
  async store({ request, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    const payload = await request.validateUsing(createSupplierSchema)

    let photoPath: string | null = null

    if (payload.photo) {
      const photoName = `${cuid()}.${payload.photo.extname}`
      await payload.photo.move(app.makePath('storage/uploads'), {
        name: photoName,
      })
      photoPath = photoName
    }

    const supplier = await Supplier.create({
      name: payload.name,
      description: payload.description,
      address: payload.address,
      photo: photoPath || undefined,
      ownerId: user.id,
    })

    return response.status(201).json(supplier.serialize())
  }

  /**
   * @swagger
   * /suppliers/{id}:
   *   get:
   *     tags:
   *       - Suppliers
   *     summary: Obter fornecedor por ID
   *     description: Retorna os dados de um fornecedor específico
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do fornecedor
   *         example: 1
   *     responses:
   *       200:
   *         description: Fornecedor encontrado com sucesso
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
   *                   example: "Mercado Central"
   *                 description:
   *                   type: string
   *                   example: "Mercado com variedade de produtos frescos"
   *                 address:
   *                   type: string
   *                   example: "Rua das Flores, 123, Centro"
   *                 photo:
   *                   type: string
   *                   nullable: true
   *                   example: "https://api.simbora.com/uploads/clx123abc.jpg"
   *                 ownerId:
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
   *       404:
   *         description: Fornecedor não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Fornecedor não encontrado"
   */
  async show({ params, response }: HttpContext) {
    const supplier = await Supplier.find(params.id)

    if (!supplier) {
      return response.status(404).json({ message: 'Fornecedor não encontrado' })
    }

    return response.json(supplier.serialize())
  }

  /**
   * @swagger
   * /suppliers/{id}:
   *   put:
   *     tags:
   *       - Suppliers
   *     summary: Atualizar fornecedor
   *     description: Atualiza os dados de um fornecedor existente
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do fornecedor
   *         example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 3
   *                 description: Nome do fornecedor
   *                 example: "Mercado Central Atualizado"
   *               description:
   *                 type: string
   *                 description: Descrição do fornecedor
   *                 example: "Mercado com variedade de produtos frescos e orgânicos"
   *               address:
   *                 type: string
   *                 minLength: 10
   *                 description: Endereço do fornecedor
   *                 example: "Rua das Flores, 456, Centro"
   *               photo:
   *                 type: string
   *                 format: binary
   *                 description: Nova foto do fornecedor (PNG, JPG, JPEG - máx 4MB)
   *     responses:
   *       200:
   *         description: Fornecedor atualizado com sucesso
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
   *                   example: "Mercado Central Atualizado"
   *                 description:
   *                   type: string
   *                   example: "Mercado com variedade de produtos frescos e orgânicos"
   *                 address:
   *                   type: string
   *                   example: "Rua das Flores, 456, Centro"
   *                 photo:
   *                   type: string
   *                   nullable: true
   *                   example: "https://api.simbora.com/uploads/clx456def.jpg"
   *                 ownerId:
   *                   type: integer
   *                   example: 1
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T10:30:00.000Z"
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T11:30:00.000Z"
   *       400:
   *         description: Erro de validação
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Erro de validação"
   *                 errors:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       field:
   *                         type: string
   *                         example: "name"
   *                       message:
   *                         type: string
   *                         example: "O nome deve ter pelo menos 3 caracteres"
   *       401:
   *         description: Não autorizado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Token de acesso inválido"
   *       403:
   *         description: Acesso negado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Você não tem permissão para editar este fornecedor"
   *       404:
   *         description: Fornecedor não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Fornecedor não encontrado"
   */
  async update({ params, request, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    const supplier = await Supplier.find(params.id)

    if (!supplier) {
      return response.status(404).json({ message: 'Fornecedor não encontrado' })
    }

    if (supplier.ownerId !== user.id) {
      return response
        .status(403)
        .json({ message: 'Você não tem permissão para editar este fornecedor' })
    }

    const payload = await request.validateUsing(updateSupplierSchema)

    if (payload.photo) {
      const photoName = `${cuid()}.${payload.photo.extname}`
      await payload.photo.move(app.makePath('storage/uploads'), {
        name: photoName,
      })
      supplier.photo = photoName
    }

    if (payload.name) supplier.name = payload.name
    if (payload.description !== undefined) supplier.description = payload.description
    if (payload.address) supplier.address = payload.address

    await supplier.save()

    return response.json(supplier.serialize())
  }

  /**
   * @swagger
   * /suppliers/{id}:
   *   delete:
   *     tags:
   *       - Suppliers
   *     summary: Excluir fornecedor
   *     description: Exclui um fornecedor existente
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do fornecedor
   *         example: 1
   *     responses:
   *       200:
   *         description: Fornecedor excluído com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Fornecedor excluído com sucesso"
   *       401:
   *         description: Não autorizado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Token de acesso inválido"
   *       403:
   *         description: Acesso negado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Você não tem permissão para excluir este fornecedor"
   *       404:
   *         description: Fornecedor não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Fornecedor não encontrado"
   */
  async destroy({ params, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    const supplier = await Supplier.find(params.id)

    if (!supplier) {
      return response.status(404).json({ message: 'Fornecedor não encontrado' })
    }

    if (supplier.ownerId !== user.id) {
      return response
        .status(403)
        .json({ message: 'Você não tem permissão para excluir este fornecedor' })
    }

    await supplier.delete()

    return response.json({ message: 'Fornecedor excluído com sucesso' })
  }
}
