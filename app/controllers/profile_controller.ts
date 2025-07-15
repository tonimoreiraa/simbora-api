import User from '#models/user'
import { updateProfileSchema } from '#validators/profile'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

export function preparePhoneNumber(value: string) {
  value = value.replace(/\D+/g, '')
  if (value.length < 10 || value.length > 11) {
    throw new Error('Número de telefone inválido.')
  }
  if (value.startsWith('55') && value.length > 11) {
    throw new Error('Não inclua o código do país no número de telefone.')
  }
  return value
}

export default class ProfileController {
  /**
   * @swagger
   * /profile:
   *   put:
   *     tags:
   *       - Profile
   *     summary: Atualizar perfil do usuário
   *     description: Atualiza os dados do perfil do usuário autenticado, incluindo upload opcional de avatar
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 2
   *                 maxLength: 100
   *                 description: Nome completo do usuário
   *                 example: "Maria Silva Santos"
   *               username:
   *                 type: string
   *                 minLength: 3
   *                 maxLength: 50
   *                 pattern: "^[a-zA-Z0-9._-]+$"
   *                 description: Nome de usuário único (apenas letras, números, pontos, hífens e underscores)
   *                 example: "maria.santos"
   *               phoneNumber:
   *                 type: string
   *                 pattern: "^[0-9]{10,11}$"
   *                 description: Número de telefone brasileiro (10 ou 11 dígitos, sem código do país)
   *                 example: "11987654321"
   *               avatar:
   *                 type: string
   *                 format: binary
   *                 description: Arquivo de imagem para avatar (JPG, PNG ou JPEG, máximo 2MB)
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 2
   *                 maxLength: 100
   *                 description: Nome completo do usuário
   *                 example: "Maria Silva Santos"
   *               username:
   *                 type: string
   *                 minLength: 3
   *                 maxLength: 50
   *                 pattern: "^[a-zA-Z0-9._-]+$"
   *                 description: Nome de usuário único
   *                 example: "maria.santos"
   *               phoneNumber:
   *                 type: string
   *                 pattern: "^[0-9]{10,11}$"
   *                 description: Número de telefone brasileiro
   *                 example: "11987654321"
   *     responses:
   *       200:
   *         description: Perfil atualizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   description: ID único do usuário
   *                   example: 1
   *                 name:
   *                   type: string
   *                   description: Nome completo do usuário
   *                   example: "Maria Silva Santos"
   *                 username:
   *                   type: string
   *                   description: Nome de usuário único
   *                   example: "maria.santos"
   *                 email:
   *                   type: string
   *                   format: email
   *                   description: Email do usuário
   *                   example: "maria@email.com"
   *                 role:
   *                   type: string
   *                   enum: [customer, admin, professional, supplier]
   *                   description: Papel do usuário no sistema
   *                   example: "customer"
   *                 avatar:
   *                   type: string
   *                   format: uri
   *                   nullable: true
   *                   description: URL completa do avatar do usuário
   *                   example: "https://api.exemplo.com/uploads/avatar123.jpg"
   *                 phoneNumber:
   *                   type: string
   *                   description: Número de telefone formatado
   *                   example: "11987654321"
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   description: Data de criação do usuário
   *                   example: "2024-01-15T10:30:00.000Z"
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   description: Data da última atualização
   *                   example: "2024-06-25T14:20:00.000Z"
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
   *                     phoneNumber: ["Número de telefone inválido."]
   *                     avatar: ["O arquivo deve ser uma imagem JPG, PNG ou JPEG"]
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
   *       409:
   *         description: Username já existe
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "O usuário maria.santos já existe"
   *       413:
   *         description: Arquivo muito grande
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "O arquivo de avatar não pode exceder 2MB"
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
   *                     name: ["O nome deve ter no mínimo 2 caracteres"]
   *                     username: ["O username deve ter no mínimo 3 caracteres"]
   *                     phoneNumber: ["O telefone deve ter entre 10 e 11 dígitos"]
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
  async update({ request, auth, response }: HttpContext) {
    const payload = await request.validateUsing(updateProfileSchema)
    const user = auth.getUserOrFail()

    if (payload.username) {
      const userAlreadyExistsQuery = await User.query()
        .where('username', payload.username)
        .whereNot('id', user.id)
        .first()
      if (userAlreadyExistsQuery) {
        return response.status(409).send({
          message: `O usuário ${payload.username} já existe`,
        })
      }
    }

    if (payload.phoneNumber) {
      payload.phoneNumber = preparePhoneNumber(payload.phoneNumber)
    }

    const avatar = request.file('avatar', {
      size: '2mb',
      extnames: ['jpg', 'png', 'jpeg'],
    })
    let avatarName: string | undefined
    if (avatar) {
      avatarName = `${cuid()}.${avatar.extname}`
      await avatar.move(app.makePath('tmp/uploads'), {
        name: avatarName,
      })
    }

    user.merge({ ...payload, avatar: avatarName })
    await user.save()
    return user
  }

  /**
   * @swagger
   * /profile:
   *   get:
   *     tags:
   *       - Profile
   *     summary: Obter perfil do usuário
   *     description: Retorna os dados completos do perfil do usuário autenticado, incluindo endereços associados
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Dados do perfil retornados com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   description: ID único do usuário
   *                   example: 1
   *                 name:
   *                   type: string
   *                   nullable: true
   *                   description: Nome completo do usuário
   *                   example: "Maria Silva Santos"
   *                 username:
   *                   type: string
   *                   nullable: true
   *                   description: Nome de usuário único
   *                   example: "maria.santos"
   *                 email:
   *                   type: string
   *                   format: email
   *                   description: Email do usuário
   *                   example: "maria@email.com"
   *                 role:
   *                   type: string
   *                   enum: [customer, admin, professional, supplier]
   *                   description: Papel do usuário no sistema
   *                   example: "customer"
   *                 avatar:
   *                   type: string
   *                   format: uri
   *                   nullable: true
   *                   description: URL completa do avatar do usuário
   *                   example: "https://api.exemplo.com/uploads/avatar123.jpg"
   *                 phoneNumber:
   *                   type: string
   *                   description: Número de telefone formatado
   *                   example: "11987654321"
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   description: Data de criação do usuário
   *                   example: "2024-01-15T10:30:00.000Z"
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   description: Data da última atualização
   *                   example: "2024-06-25T14:20:00.000Z"
   *                 addresses:
   *                   type: array
   *                   description: Lista de endereços do usuário
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                         description: ID único do endereço
   *                         example: 1
   *                       userId:
   *                         type: integer
   *                         description: ID do usuário proprietário
   *                         example: 1
   *                       name:
   *                         type: string
   *                         description: Nome do endereço (ex Casa, Trabalho)
   *                         example: "Casa"
   *                       streetName:
   *                         type: string
   *                         description: Nome da rua/logradouro
   *                         example: "Rua das Flores"
   *                       number:
   *                         type: string
   *                         description: Número do endereço
   *                         example: "123"
   *                       complement:
   *                         type: string
   *                         nullable: true
   *                         description: Complemento do endereço
   *                         example: "Apartamento 45"
   *                       neighborhood:
   *                         type: string
   *                         description: Bairro
   *                         example: "Centro"
   *                       city:
   *                         type: string
   *                         description: Cidade
   *                         example: "São Paulo"
   *                       state:
   *                         type: string
   *                         description: Estado
   *                         example: "SP"
   *                       zipCode:
   *                         type: string
   *                         description: CEP
   *                         example: "01234-567"
   *                       country:
   *                         type: string
   *                         description: País
   *                         example: "Brasil"
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                         description: Data de criação do endereço
   *                         example: "2024-02-01T08:00:00.000Z"
   *                       updatedAt:
   *                         type: string
   *                         format: date-time
   *                         description: Data da última atualização
   *                         example: "2024-02-01T08:00:00.000Z"
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
  async index({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    await user.load('addresses')
    return user
  }
}
