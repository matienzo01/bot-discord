import 'reflect-metadata';
// import './bot/discordBot'; // Comentado temporalmente para testing
import express from 'express';
import { useExpressServer, useContainer, UnauthorizedError } from 'routing-controllers';
import { MembersController } from './controllers/members.controller';
import { MessagesController } from './controllers/messages.controller';
import { TenantController } from './controllers/tenant.controller';
import { SyncController } from './controllers/sync.controller';
import { container } from './config/inversify.config';
import { InversifyAdapter } from './config/inversify.adapter';
import { StatusController } from './controllers/status.controller';
import { ErrorHandler } from './middleweres/errors/defaultErrors';
import { authorizationChecker } from './middleweres/auth/authorizationChecker';
import { DatabaseService } from './services/database.service';

async function bootstrap() {
  try {
    // Conectar a la base de datos
    const databaseService = container.get<DatabaseService>('DatabaseService');
    await databaseService.connect();

    // Configurar DI con Inversify
    useContainer(new InversifyAdapter(container));

    // Crear instancia de Express
    const app = express();

    // Aplicar middleware para parsear JSON
    app.use(express.json());

    // Configurar routing-controllers sobre la app existente
    useExpressServer(app, {
      controllers: [MembersController, MessagesController, TenantController, SyncController, StatusController],
      //classTransformer: true,
      //validation: true,
      cors: true,
      routePrefix: '/api',
      defaultErrorHandler: false,
      authorizationChecker,
      middlewares: [ErrorHandler]
    });

    // Levantar servidor
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
      console.log(`API de tenants disponible en http://localhost:${PORT}/api/tenants`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('Cerrando conexiones...');
      await databaseService.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('Error al inicializar la aplicación:', error);
    process.exit(1);
  }
}

bootstrap().catch(console.error);