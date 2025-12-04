require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const ClientError = require('../../Commons/exceptions/ClientError');
const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');

// plugin API
const users = require('../../Interfaces/http/api/users');
const authentications = require('../../Interfaces/http/api/authentications');
const threads = require('../../Interfaces/http/api/threads');
const comments = require('../../Interfaces/http/api/comments');


const createServer = async (container) => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // 1. Register JWT terlebih dahulu
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // 2. Definisikan strategy 'forum_jwt'
  server.auth.strategy('forum_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // 3. Register plugin API
  await server.register([
    {
      plugin: users,
      options: { container },
    },
    {
      plugin: authentications,
      options: { container },
    },
    {
      plugin: threads,
      options: { container },
    },
    {
      plugin: comments,
      options: { container },
    },
  ]);

  // 4. Global error handler (ikut pola starter)
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    // Hanya proses kalau ini memang Error
    if (response instanceof Error) {
      // Terjemahkan pesan error (REGISTER_USER.*, LOGIN_USER.*, dll)
      const translatedError = DomainErrorTranslator.translate(response);

      // a. Error bisnis (ClientError → 4xx, status 'fail')
      if (translatedError instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: translatedError.message,
        });
        newResponse.code(translatedError.statusCode);
        return newResponse;
      }

      // b. Error non-server (404 route tidak ditemukan, dsb)
      if (!response.isServer) {
        return h.continue;
      }

      // c. Error server (5xx)
      console.error(response);
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    // Kalau bukan error, lanjutkan saja
    return h.continue;
  });

  return server;
};

module.exports = createServer;
