import { UserAddress } from '#models/user_address'
import { createAddressSchema } from '#validators/address'
import type { HttpContext } from '@adonisjs/core/http'

export default class UserAddressesController {
  /**
   * @swagger
   * /user-addresses:
   *   get:
   *     tags:
   *       - User Addresses
   *     summary: Listar endereços do usuário
   *     description: Retorna todos os endereços cadastrados pelo usuário autenticado
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de endereços retornada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                     description: ID único do endereço
   *                     example: 1
   *                   userId:
   *                     type: integer
   *                     description: ID do usuário proprietário
   *                     example: 10
   *                   name:
   *                     type: string
   *                     description: Nome/apelido do endereço
   *                     example: "Casa"
   *                   streetName:
   *                     type: string
   *                     description: Nome da rua
   *                     example: "Rua das Flores"
   *                   number:
   *                     type: string
   *                     description: Número da residência
   *                     example: "123"
   *                   complement:
   *                     type: string
   *                     nullable: true
   *                     description: Complemento do endereço
   *                     example: "Apto 45"
   *                   neighborhood:
   *                     type: string
   *                     description: Bairro
   *                     example: "Centro"
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
   *                   country:
   *                     type: string
   *                     description: País
   *                     example: "Brasil"
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
   *             example:
   *               - id: 1
   *                 userId: 10
   *                 name: "Casa"
   *                 streetName: "Rua das Flores"
   *                 number: "123"
   *                 complement: "Apto 45"
   *                 neighborhood: "Centro"
   *                 city: "São Paulo"
   *                 state: "SP"
   *                 zipCode: "01234-567"
   *                 country: "Brasil"
   *                 createdAt: "2024-01-15T10:30:00.000Z"
   *                 updatedAt: "2024-01-15T10:30:00.000Z"
   *               - id: 2
   *                 userId: 10
   *                 name: "Trabalho"
   *                 streetName: "Av. Paulista"
   *                 number: "1000"
   *                 complement: "Sala 1501"
   *                 neighborhood: "Bela Vista"
   *                 city: "São Paulo"
   *                 state: "SP"
   *                 zipCode: "01310-100"
   *                 country: "Brasil"
   *                 createdAt: "2024-01-15T11:00:00.000Z"
   *                 updatedAt: "2024-01-15T11:00:00.000Z"
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
  async index({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const addresses = await UserAddress.query().where('user_id', user.id)
    return addresses
  }

  /**
   * @swagger
   * /user-addresses:
   *   post:
   *     tags:
   *       - User Addresses
   *     summary: Criar novo endereço
   *     description: Adiciona um novo endereço para o usuário autenticado
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - streetName
   *               - number
   *               - neighborhood
   *               - city
   *               - state
   *               - zipCode
   *             properties:
   *               name:
   *                 type: string
   *                 description: Nome/apelido para identificar o endereço
   *                 example: "Casa dos Pais"
   *               streetName:
   *                 type: string
   *                 description: Nome da rua, avenida, etc.
   *                 example: "Rua das Palmeiras"
   *               number:
   *                 type: string
   *                 description: Número da residência/estabelecimento
   *                 example: "456"
   *               complement:
   *                 type: string
   *                 description: Complemento (apartamento, sala, bloco, etc.)
   *                 example: "Bloco B, Apto 302"
   *               neighborhood:
   *                 type: string
   *                 description: Bairro
   *                 example: "Jardins"
   *               city:
   *                 type: string
   *                 description: Cidade
   *                 example: "Rio de Janeiro"
   *               state:
   *                 type: string
   *                 description: Estado (sigla)
   *                 example: "RJ"
   *               zipCode:
   *                 type: string
   *                 description: CEP (com ou sem formatação)
   *                 example: "22071-900"
   *               country:
   *                 type: string
   *                 description: País
   *                 example: "Brasil"
   *     responses:
   *       201:
   *         description: Endereço criado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   description: ID único do endereço criado
   *                   example: 3
   *                 userId:
   *                   type: integer
   *                   description: ID do usuário proprietário
   *                   example: 10
   *                 name:
   *                   type: string
   *                   example: "Casa dos Pais"
   *                 streetName:
   *                   type: string
   *                   example: "Rua das Palmeiras"
   *                 number:
   *                   type: string
   *                   example: "456"
   *                 complement:
   *                   type: string
   *                   nullable: true
   *                   example: "Bloco B, Apto 302"
   *                 neighborhood:
   *                   type: string
   *                   example: "Jardins"
   *                 city:
   *                   type: string
   *                   example: "Rio de Janeiro"
   *                 state:
   *                   type: string
   *                   example: "RJ"
   *                 zipCode:
   *                   type: string
   *                   example: "22071-900"
   *                 country:
   *                   type: string
   *                   example: "Brasil"
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T14:30:00.000Z"
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T14:30:00.000Z"
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
   *                     name: ["O nome do endereço é obrigatório"]
   *                     zipCode: ["O CEP é obrigatório"]
   */
  async store({ request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(createAddressSchema)
    payload.country = payload.country ?? 'Brasil'

    const address = await UserAddress.create({
      userId: user.id,
      ...payload,
    })

    return address
  }

  /**
   * @swagger
   * /user-addresses/{id}:
   *   get:
   *     tags:
   *       - User Addresses
   *     summary: Buscar endereço por ID
   *     description: Retorna um endereço específico do usuário autenticado
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do endereço
   *         example: 1
   *     responses:
   *       200:
   *         description: Endereço encontrado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   example: 1
   *                 userId:
   *                   type: integer
   *                   example: 10
   *                 name:
   *                   type: string
   *                   example: "Casa"
   *                 streetName:
   *                   type: string
   *                   example: "Rua das Flores"
   *                 number:
   *                   type: string
   *                   example: "123"
   *                 complement:
   *                   type: string
   *                   nullable: true
   *                   example: "Apto 45"
   *                 neighborhood:
   *                   type: string
   *                   example: "Centro"
   *                 city:
   *                   type: string
   *                   example: "São Paulo"
   *                 state:
   *                   type: string
   *                   example: "SP"
   *                 zipCode:
   *                   type: string
   *                   example: "01234-567"
   *                 country:
   *                   type: string
   *                   example: "Brasil"
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T10:30:00.000Z"
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-15T10:30:00.000Z"
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
   *         description: Endereço não encontrado ou não pertence ao usuário
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
    const addressId = request.param('id')

    const address = await UserAddress.query()
      .where('user_id', user.id)
      .where('id', addressId)
      .firstOrFail()

    return address.serialize()
  }

  /**
   * @swagger
   * /user-addresses/{id}:
   *   delete:
   *     tags:
   *       - User Addresses
   *     summary: Deletar endereço
   *     description: Remove um endereço específico do usuário autenticado
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do endereço a ser deletado
   *         example: 1
   *     responses:
   *       200:
   *         description: Endereço deletado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Ok."
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
   *         description: Endereço não encontrado ou não pertence ao usuário
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "E_ROW_NOT_FOUND: Row not found"
   */
  async destroy({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const addressId = request.param('id')

    const address = await UserAddress.query()
      .where('user_id', user.id)
      .where('id', addressId)
      .firstOrFail()

    await address.delete()

    return response.ok({ message: 'Ok.' })
  }
}
