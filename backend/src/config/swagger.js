const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TaxiTrack API',
            version: '1.0.0',
            description: 'Documentation de l\'API pour la plateforme de VTC TaxiTrack',
            contact: {
                name: 'Équipe TaxiTrack',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
                description: 'Serveur de développement Local',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    // Chemins vers les fichiers contenant les annotations Swagger
    apis: [
        './src/routes/*.js',
        './src/controllers/*.js',
        './src/server.js'
    ],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
