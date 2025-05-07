"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("reflect-metadata");
const routing_controllers_1 = require("routing-controllers");
const express_1 = __importDefault(require("express"));
const inversify_config_1 = require("./config/inversify.config");
const types_1 = require("./config/types");
const rcon_controller_1 = require("./controllers/rcon.controller");
const inversify_adapter_1 = require("./config/inversify.adapter");
async function bootstrap() {
    // Configurar inversify con routing-controllers
    (0, routing_controllers_1.useContainer)(new inversify_adapter_1.InversifyAdapter(inversify_config_1.container));
    // Crear la aplicación Express
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    // Configurar routing-controllers
    (0, routing_controllers_1.useExpressServer)(app, {
        controllers: [rcon_controller_1.RconController],
        routePrefix: '/api'
    });
    // Inicializar servicios
    const rconService = inversify_config_1.container.get(types_1.TYPES.RconService);
    const discordService = inversify_config_1.container.get(types_1.TYPES.DiscordService);
    try {
        await rconService.initialize();
        await discordService.connect();
        // Iniciar el servidor
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Servidor escuchando en el puerto ${port}`);
        });
        // Manejar el cierre de la aplicación
        process.on('SIGTERM', async () => {
            console.log('Cerrando aplicación...');
            await rconService.shutdown();
            process.exit(0);
        });
        process.on('SIGINT', async () => {
            console.log('Cerrando aplicación...');
            await rconService.shutdown();
            process.exit(0);
        });
    }
    catch (error) {
        console.error('Error al iniciar la aplicación:', error);
        process.exit(1);
    }
}
bootstrap();
