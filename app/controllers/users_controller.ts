import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  /**
   * @swagger
   * /users:
   *   get:
   *     tags:
   *       - Users
   *     summary: Listar usuários
   *     description: Lista usuários do sistema com filtros e paginação. Usuários não-admin devem fornecer um filtro de pesquisa e recebem dados limitados.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: query
   *         schema:
   *           type: string
   *           minLength: 1
   *         description: Filtro de pesquisa por username (obrigatório para usuários não-admin)
   *         example: "maria"
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Número da página para paginação
   *         example: 1
   *       - in: query
   *         name: perPage
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 25
   *         description: Quantidade de registros por página
   *         example: 25
   *     responses:
   *       200:
   *         description: Lista de usuários retornada com sucesso
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
   *                       description: Total de registros
   *                       example: 150
   *                     perPage:
   *                       type: integer
   *                       description: Registros por página
   *                       example: 25
   *                     currentPage:
   *                       type: integer
   *                       description: Página atual
   *                       example: 1
   *                     lastPage:
   *                       type: integer
   *                       description: Última página
   *                       example: 6
   *                     firstPage:
   *                       type: integer
   *                       description: Primeira página
   *                       example: 1
   *                     firstPageUrl:
   *                       type: string
   *                       description: URL da primeira página
   *                       example: "/?page=1"
   *                     lastPageUrl:
   *                       type: string
   *                       description: URL da última página
   *                       example: "/?page=6"
   *                     nextPageUrl:
   *                       type: string
   *                       nullable: true
   *                       description: URL da próxima página
   *                       example: "/?page=2"
   *                     previousPageUrl:
   *                       type: string
   *                       nullable: true
   *                       description: URL da página anterior
   *                       example: null
   *                 data:
   *                   type: array
   *                   description: Lista de usuários
   *                   items:
   *                     oneOf:
   *                       - type: object
   *                         title: UsuarioCompleto (Admin)
   *                         description: Dados completos retornados para usuários admin
   *                         properties:
   *                           id:
   *                             type: integer
   *                             description: ID único do usuário
   *                             example: 1
   *                           name:
   *                             type: string
   *                             nullable: true
   *                             description: Nome completo do usuário
   *                             example: "Maria Silva Santos"
   *                           username:
   *                             type: string
   *                             nullable: true
   *                             description: Nome de usuário único
   *                             example: "maria.santos"
   *                           email:
   *                             type: string
   *                             format: email
   *                             description: Email do usuário
   *                             example: "maria@email.com"
   *                           role:
   *                             type: string
   *                             enum: [customer, admin, professional, supplier]
   *                             description: Papel do usuário no sistema
   *                             example: "customer"
   *                           avatar:
   *                             type: string
   *                             format: uri
   *                             nullable: true
   *                             description: URL completa do avatar do usuário
   *                             example: "https://api.exemplo.com/uploads/avatar123.jpg"
   *                           phoneNumber:
   *                             type: string
   *                             nullable: true
   *                             description: Número de telefone formatado
   *                             example: "11987654321"
   *                           createdAt:
   *                             type: string
   *                             format: date-time
   *                             description: Data de criação do usuário
   *                             example: "2024-01-15T10:30:00.000Z"
   *                           updatedAt:
   *                             type: string
   *                             format: date-time
   *                             description: Data da última atualização
   *                             example: "2024-06-25T14:20:00.000Z"
   *                       - type: object
   *                         title: UsuarioLimitado (Não-Admin)
   *                         description: Dados limitados retornados para usuários não-admin
   *                         properties:
   *                           id:
   *                             type: integer
   *                             description: ID único do usuário
   *                             example: 1
   *                           name:
   *                             type: string
   *                             nullable: true
   *                             description: Nome completo do usuário
   *                             example: "Maria Silva Santos"
   *                           avatar:
   *                             type: string
   *                             format: uri
   *                             nullable: true
   *                             description: URL completa do avatar do usuário
   *                             example: "https://api.exemplo.com/uploads/avatar123.jpg"
   *                           username:
   *                             type: string
   *                             nullable: true
   *                             description: Nome de usuário único
   *                             example: "maria.santos"
   *       400:
   *         description: Filtro de pesquisa obrigatório para usuários não-admin
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Você deve enviar um filtro de pesquisa."
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
  async index({ request, auth, response }: HttpContext) {
    const role = auth.getUserOrFail().role
    const query = request.input('query')
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 25)

    if (role !== 'admin' && !query?.length) {
      return response.badRequest({
        message: 'Você deve enviar um filtro de pesquisa.',
      })
    }

    const users = await User.query()
      .if(role !== 'admin', (queryBuilder) =>
        queryBuilder.select('id', 'name', 'avatar', 'username')
      )
      .if(query, (q) => q.whereLike('username', `%${query.toLowerCase()}%`))
      .paginate(page, perPage)

    return users
  }
}
