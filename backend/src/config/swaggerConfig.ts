import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Laptop Service Management API',
      version: '1.0.0',
      description: 'API for managing laptop services'
    },
    servers: [
      {
        url: `http://localhost:3000`,
        description: 'Development server'
      }
    ]
  },
  apis: ['./src/doc/swaggerdoc.yaml']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;