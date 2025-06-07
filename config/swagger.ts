// config/swagger.ts
import path from 'node:path'
import url from 'node:url'
import swaggerJSDoc from 'swagger-jsdoc'

const currentDirname = path.dirname(url.fileURLToPath(import.meta.url))

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Simbora API',
      version: '1.0.0',
      description: 'Documentação da API Simbora',
    },
    servers: [
      {
        url: 'http://localhost:3333',
        description: 'Servidor de desenvolvimento',
      },
      {
        url: 'https://api.simbora.com',
        description: 'Servidor de produção',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token de autenticação JWT',
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints relacionados à autenticação',
      },
    ],
  },
  apis: [
    path.join(currentDirname, '../app/controllers/*.ts'),
    path.join(currentDirname, '../app/controllers/**/*.ts'),
  ],
}

export const swaggerSpec = swaggerJSDoc(options)

// Configurações adicionais específicas da aplicação
export const swaggerConfig = {
  // URL para servir a documentação
  docsUrl: '/docs',

  // URL para servir o JSON da especificação
  specUrl: '/openapi',

  // Configurações da UI
  uiOptions: {
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #3b82f6; }
    `,
    customSiteTitle: 'Simbora API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
    },
  },

  // Headers comuns para todas as requisições
  commonHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // Middlewares de autenticação que devem ser documentados
  authMiddlewares: ['auth'],

  // Ignorar certas rotas na documentação
  ignoreRoutes: ['/swagger', '/docs', '/openapi', '/health'],
}
