// app/controllers/swagger_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import { swaggerSpec } from '#config/swagger'

export default class SwaggerController {
  /**
   * Serve a interface do Swagger UI
   */
  async index({ response }: HttpContext) {
    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Simbora API - Documentação</title>
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
        <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.9.0/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.9.0/favicon-16x16.png" sizes="16x16" />
        <style>
          html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
          }
          *, *:before, *:after {
            box-sizing: inherit;
          }
          body {
            margin: 0;
            background: #fafafa;
          }
          
          /* Customizações */
          .swagger-ui .topbar { 
            display: none; 
          }
          .swagger-ui .info .title { 
            color: #3b82f6; 
            font-size: 2.5rem;
          }
          .swagger-ui .info .description {
            font-size: 1.1rem;
            margin: 20px 0;
          }
          .swagger-ui .scheme-container {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
          }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        
        <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = function() {
            const ui = SwaggerUIBundle({
              spec: ${JSON.stringify(swaggerSpec)},
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
              ],
              layout: "StandaloneLayout",
              
              // Configurações de UI
              persistAuthorization: true,
              displayRequestDuration: true,
              docExpansion: 'list',
              filter: true,
              showExtensions: true,
              showCommonExtensions: true,
              tryItOutEnabled: true,
              supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
              
              // Configurações de request
              requestInterceptor: (request) => {
                // Adicionar headers padrão se necessário
                if (!request.headers['Content-Type'] && request.method !== 'GET') {
                  request.headers['Content-Type'] = 'application/json';
                }
                return request;
              },
              
              // Callback quando a UI carrega
              onComplete: () => {
                console.log('✅ Swagger UI carregado com sucesso!');
              }
            });
            
            // Adicionar evento de erro global
            window.addEventListener('error', (e) => {
              console.error('❌ Erro no Swagger UI:', e.error);
            });
          };
        </script>
      </body>
    </html>
    `

    response.type('text/html')
    return html
  }

  /**
   * Serve o JSON da especificação OpenAPI
   */
  async json({ response }: HttpContext) {
    response.type('application/json')
    response.header('Access-Control-Allow-Origin', '*')
    response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    return swaggerSpec
  }

  /**
   * Redireciona /docs para /docs/ (caso necessário)
   */
  async redirect({ response }: HttpContext) {
    return response.redirect('/docs/')
  }
}
