import User from '#models/user'
import { signUpSchema } from '#validators/auth'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

export default class AuthController {
  /**
   * @swagger
   * /auth/sign-in:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Login do usuário
   *     description: Realiza o login do usuário utilizando email e senha, retornando o token de acesso
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email do usuário
   *                 example: "joao@email.com"
   *               password:
   *                 type: string
   *                 format: password
   *                 minLength: 6
   *                 description: Senha do usuário
   *                 example: "senha123"
   *     responses:
   *       200:
   *         description: Login realizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       description: ID único do usuário
   *                       example: 1
   *                     name:
   *                       type: string
   *                       nullable: true
   *                       description: Nome completo do usuário
   *                       example: "João Silva"
   *                     email:
   *                       type: string
   *                       format: email
   *                       description: Email do usuário
   *                       example: "joao@email.com"
   *                     username:
   *                       type: string
   *                       nullable: true
   *                       description: Nome de usuário único
   *                       example: "joao.silva"
   *                     role:
   *                       type: string
   *                       enum: [customer, admin, professional, supplier]
   *                       description: Papel do usuário no sistema
   *                       example: "customer"
   *                     avatar:
   *                       type: string
   *                       format: uri
   *                       nullable: true
   *                       description: URL completa do avatar do usuário
   *                       example: "https://api.exemplo.com/uploads/avatar123.jpg"
   *                     phoneNumber:
   *                       type: string
   *                       description: Número de telefone formatado
   *                       example: "11987654321"
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       description: Data de criação do usuário
   *                       example: "2024-01-15T10:30:00.000Z"
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                       description: Data da última atualização
   *                       example: "2024-01-15T10:30:00.000Z"
   *                 token:
   *                   type: object
   *                   properties:
   *                     type:
   *                       type: string
   *                       description: Tipo do token
   *                       example: "bearer"
   *                     name:
   *                       type: string
   *                       description: Nome do token
   *                       example: "API Token"
   *                     token:
   *                       type: string
   *                       description: Hash do token para autenticação
   *                       example: "oat_1.abc123def456ghi789"
   *                     abilities:
   *                       type: array
   *                       items:
   *                         type: string
   *                       description: Permissões associadas ao token
   *                       example: ["*"]
   *                     lastUsedAt:
   *                       type: string
   *                       format: date-time
   *                       nullable: true
   *                       description: Data do último uso do token
   *                       example: null
   *                     expiresAt:
   *                       type: string
   *                       format: date-time
   *                       nullable: true
   *                       description: Data de expiração do token
   *                       example: null
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
   *                     email: ["O campo email é obrigatório"]
   *                     password: ["O campo senha é obrigatório"]
   *       401:
   *         description: Credenciais inválidas
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "E_INVALID_CREDENTIALS: Invalid user credentials"
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
   *                     email: ["O email deve ter um formato válido"]
   *                     password: ["A senha deve ter no mínimo 6 caracteres"]
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
  async signIn({ request }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user)
    return { user, token }
  }

  /**
   * @swagger
   * /auth/sign-up:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Cadastro de novo usuário
   *     description: Cria uma nova conta de usuário no sistema com os dados fornecidos, incluindo upload opcional de avatar
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - username
   *               - password
   *               - role
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 2
   *                 maxLength: 100
   *                 description: Nome completo do usuário
   *                 example: "João Silva"
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email único do usuário
   *                 example: "joao@email.com"
   *               username:
   *                 type: string
   *                 minLength: 3
   *                 maxLength: 50
   *                 pattern: "^[a-zA-Z0-9._-]+$"
   *                 description: Nome de usuário único (apenas letras, números, pontos, hífens e underscores)
   *                 example: "joao.silva"
   *               password:
   *                 type: string
   *                 format: password
   *                 minLength: 8
   *                 description: Senha do usuário (mínimo 8 caracteres, deve conter ao menos uma letra maiúscula, uma minúscula, um número e um caractere especial)
   *                 example: "MinhaSenh@123"
   *               role:
   *                 type: string
   *                 enum: [customer, admin, professional, supplier]
   *                 description: Papel do usuário no sistema
   *                 example: "customer"
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
   *             required:
   *               - name
   *               - email
   *               - username
   *               - password
   *               - role
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 2
   *                 maxLength: 100
   *                 description: Nome completo do usuário
   *                 example: "João Silva"
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email único do usuário
   *                 example: "joao@email.com"
   *               username:
   *                 type: string
   *                 minLength: 3
   *                 maxLength: 50
   *                 pattern: "^[a-zA-Z0-9._-]+$"
   *                 description: Nome de usuário único
   *                 example: "joao.silva"
   *               password:
   *                 type: string
   *                 format: password
   *                 minLength: 8
   *                 description: Senha do usuário
   *                 example: "MinhaSenh@123"
   *               role:
   *                 type: string
   *                 enum: [customer, admin, professional, supplier]
   *                 description: Papel do usuário no sistema
   *                 example: "customer"
   *               phoneNumber:
   *                 type: string
   *                 pattern: "^[0-9]{10,11}$"
   *                 description: Número de telefone brasileiro
   *                 example: "11987654321"
   *     responses:
   *       201:
   *         description: Usuário criado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       description: ID único do usuário
   *                       example: 2
   *                     name:
   *                       type: string
   *                       nullable: true
   *                       description: Nome completo do usuário
   *                       example: "João Silva"
   *                     email:
   *                       type: string
   *                       format: email
   *                       description: Email do usuário
   *                       example: "joao@email.com"
   *                     username:
   *                       type: string
   *                       nullable: true
   *                       description: Nome de usuário único
   *                       example: "joao.silva"
   *                     role:
   *                       type: string
   *                       enum: [customer, admin, professional, supplier]
   *                       description: Papel do usuário no sistema
   *                       example: "customer"
   *                     avatar:
   *                       type: string
   *                       format: uri
   *                       nullable: true
   *                       description: URL completa do avatar do usuário
   *                       example: "https://api.exemplo.com/uploads/avatar123.jpg"
   *                     phoneNumber:
   *                       type: string
   *                       description: Número de telefone formatado
   *                       example: "11987654321"
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       description: Data de criação do usuário
   *                       example: "2024-01-15T11:45:00.000Z"
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                       description: Data da última atualização
   *                       example: "2024-01-15T11:45:00.000Z"
   *                 token:
   *                   type: object
   *                   properties:
   *                     type:
   *                       type: string
   *                       description: Tipo do token
   *                       example: "bearer"
   *                     name:
   *                       type: string
   *                       description: Nome do token
   *                       example: "API Token"
   *                     token:
   *                       type: string
   *                       description: Token de autenticação (valor público do token)
   *                       example: "oat_2.xyz789abc123def456"
   *                     abilities:
   *                       type: array
   *                       items:
   *                         type: string
   *                       description: Permissões associadas ao token
   *                       example: ["*"]
   *                     lastUsedAt:
   *                       type: string
   *                       format: date-time
   *                       nullable: true
   *                       description: Data do último uso do token
   *                       example: null
   *                     expiresAt:
   *                       type: string
   *                       format: date-time
   *                       nullable: true
   *                       description: Data de expiração do token
   *                       example: null
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
   *                     email: ["O campo email é obrigatório"]
   *                     password: ["O campo senha é obrigatório"]
   *                     phoneNumber: ["Número de telefone inválido."]
   *       409:
   *         description: Email ou username já existem
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "E_ROW_DUPLICATE_KEY: UNIQUE constraint failed"
   *                 errors:
   *                   type: object
   *                   example:
   *                     email: ["Este email já está em uso"]
   *                     username: ["Este username já está em uso"]
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
   *                     email: ["O email deve ter um formato válido"]
   *                     password: ["A senha deve ter no mínimo 8 caracteres"]
   *                     name: ["O nome deve ter no mínimo 2 caracteres"]
   *                     username: ["O username deve ter no mínimo 3 caracteres"]
   *                     role: ["O role deve ser: customer, admin, professional ou supplier"]
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
  async signUp({ request }: HttpContext) {
    const payload = await request.validateUsing(signUpSchema)

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

    if (payload.phoneNumber) {
      // Import the function dynamically
      const { preparePhoneNumber } = await import('./profile_controller.js')
      payload.phoneNumber = preparePhoneNumber(payload.phoneNumber)
    }

    const user = await User.create({ ...payload, avatar: avatarName })
    const token = await User.accessTokens.create(user)
    return { user, token }
  }

  /**
   * @swagger
   * /auth/session:
   *   get:
   *     tags:
   *       - Authentication
   *     summary: Obter sessão atual
   *     description: Retorna os dados do usuário autenticado da sessão atual
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Dados da sessão retornados com sucesso
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
   *                   example: "João Silva"
   *                 username:
   *                   type: string
   *                   nullable: true
   *                   description: Nome de usuário único
   *                   example: "joao.silva"
   *                 email:
   *                   type: string
   *                   format: email
   *                   description: Email do usuário
   *                   example: "joao@email.com"
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
   *                   example: "2024-01-15T10:30:00.000Z"
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
  async getSession({ auth }: HttpContext) {
    const user = auth.getUserOrFail()

    return user
  }

  /**
   * @swagger
   * /auth/account:
   *   delete:
   *     tags:
   *       - Authentication
   *     summary: Deletar conta do usuário
   *     description: Remove permanentemente a conta do usuário autenticado, incluindo todos os dados relacionados e revogando todos os tokens de acesso
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Conta deletada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Conta deletada com sucesso"
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
   *                   example: "Erro ao deletar conta"
   */
  async deleteAccount({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    // Revoke all access tokens for this user
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)

    // Delete the user (cascade will handle related records)
    await user.delete()

    return response.ok({ message: 'Conta deletada com sucesso' })
  }
}
