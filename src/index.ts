import 'reflect-metadata';
import './bot/discordBot';
import express from 'express';
import { useExpressServer, useContainer } from 'routing-controllers';
import { MembersController } from './controllers/members.controller';
import { MessagesController } from './controllers/messages.controller';
import { container } from './config/inversify.config';
import { InversifyAdapter } from './config/inversify.adapter';
import { StatusController } from './controllers/status.controller';

async function bootstrap() {
  // Configurar DI con Inversify
  useContainer(new InversifyAdapter(container));

  // Crear instancia de Express
  const app = express();

  // Aplicar middleware para parsear JSON
  app.use(express.json());

  // Configurar routing-controllers sobre la app existente
  useExpressServer(app, {
    controllers: [MembersController, MessagesController, StatusController],
    classTransformer: true,
    validation: true,
    cors: true,
    routePrefix: '/api',
    defaultErrorHandler: true
  });

  // Levantar servidor
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
  });
}

bootstrap().catch(console.error);