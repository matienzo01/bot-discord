# Plan de Acción: Integración del Bot de Discord con LuckPerms REST API

Este documento detalla los pasos para integrar el servicio de sincronización de Discord (`bot-discord`) con la API REST de LuckPerms (`rest-api`), permitiendo la gestión de permisos multi-servidor en Minecraft a través de contextos, con un enfoque en la seguridad.

## Correcciones y Aclaraciones Previas

1.  **Soporte Multi-servidor en LuckPerms:** LuckPerms ya está diseñado para manejar múltiples servidores en una única base de datos utilizando el sistema de "contextos" (específicamente, `server=<server_id>`). No es necesario crear una nueva capa de abstracción o entidad de "servidor" en el núcleo de LuckPerms.
2.  **Configuración del Contexto del Servidor en LuckPerms:** Cada instancia de LuckPerms (Fabric/Standalone) debe tener configurado un identificador único para su servidor en su archivo `config.yml` (clave `server`).

## Arquitectura de Seguridad Revisada: Acceso Centralizado a la Base de Datos

Para abordar la preocupación de seguridad sobre el acceso de múltiples servidores a una base de datos compartida, la arquitectura se modificará de la siguiente manera:

*   **Acceso Centralizado a la Base de Datos:** Solo el componente `rest-api` tendrá acceso directo y completo de lectura/escritura a la base de datos de LuckPerms.
*   **Servidores de Minecraft como Clientes de la API:** Las instancias de LuckPerms que se ejecutan en los servidores de Minecraft (módulos Fabric/Standalone) **no se conectarán directamente a la base de datos**. En su lugar, se configurarán para utilizar la `rest-api` como su fuente de datos para todas las operaciones de LuckPerms. Esto se logrará mediante un nuevo módulo de almacenamiento personalizado.
*   **`rest-api` como Punto de Control de Acceso:** La `rest-api` se convertirá en el punto de aplicación de la seguridad. Será responsable de garantizar que las solicitudes provenientes de un servidor de Minecraft específico (identificado por su contexto `server`) solo puedan acceder o modificar datos relevantes para ese contexto `server`.

## Plan de Integración Detallado

Dado que la integración con la API REST de LuckPerms aún no está implementada en el proyecto `bot-discord`, y ahora se requiere un nuevo módulo de almacenamiento, el siguiente plan se enfoca en añadir esta funcionalidad de manera segura.

### Objetivo

Permitir que el bot de Discord envíe solicitudes a la API REST de LuckPerms, incluyendo el contexto `server` para diferenciar entre los servidores de Minecraft, y asegurar que los servidores de Minecraft interactúen con LuckPerms a través de esta API centralizada.

### Pasos

1.  **Crear un Nuevo Módulo de Almacenamiento en LuckPerms (`LuckPerms/rest-storage`)**
    *   **Ubicación:** Un nuevo módulo dentro del proyecto `LuckPerms` (por ejemplo, `LuckPerms/rest-storage`).
    *   **Implementación:** Este módulo implementará la interfaz `StorageImplementation` de LuckPerms.
    *   **Configuración:** Se configurará en el `config.yml` de las instancias de LuckPerms (Fabric/Standalone) como su `storage-method`.
    *   **Funcionalidad:** En lugar de conectarse directamente a la base de datos, este módulo realizará solicitudes HTTP a la `rest-api` para todas las operaciones de datos (cargar usuario, guardar grupo, etc.), pasando el contexto `server` apropiado.

2.  **Mejorar la Autorización en la `rest-api`**
    *   Añadir una lógica de autorización robusta a la `rest-api` para asegurar que las solicitudes (por ejemplo, de un servidor de Minecraft específico) solo puedan modificar datos asociados con su contexto `server`. Esto podría implicar:
        *   Requerir una clave API o token para las solicitudes de los servidores de Minecraft.
        *   Validar que el contexto `server` proporcionado en la solicitud coincida con el contexto `server` asociado a la clave API/token (o la fuente de la solicitud).
        *   Modificar los controladores existentes en la `rest-api` para filtrar/limitar las operaciones por el contexto `server`.

3.  **Crear un Nuevo Servicio para LuckPerms API en `bot-discord` (`LuckPermsService.ts`)**
    *   **Ubicación:** `bot-discord/src/services/LuckPermsService.ts`
    *   **Responsabilidad:** Encapsulará toda la lógica de interacción con la API REST de LuckPerms.
    *   **Cliente HTTP:** Utilizará una librería como `axios` o `node-fetch` para realizar las solicitudes HTTP.

4.  **Definir una Interfaz para el Cliente de la API de LuckPerms en `bot-discord`**
    *   Para garantizar la seguridad de tipos y contratos claros, se definirá una interfaz que represente la estructura de las solicitudes y respuestas de la API de LuckPerms, especialmente para los nodos y contextos.

5.  **Implementar Métodos Clave en `LuckPermsService.ts` en `bot-discord`**
    *   Se crearán métodos para las operaciones más comunes de gestión de permisos, asegurando que cada solicitud incluya el contexto `server` apropiado. Ejemplos de métodos:
        *   `addPermission(uniqueId: string, permission: string, serverId: string, value: boolean = true, expiry?: number)`: Añade un permiso a un usuario en un servidor específico.
        *   `removePermission(uniqueId: string, permission: string, serverId: string)`: Elimina un permiso de un usuario en un servidor específico.
        *   `promoteUser(uniqueId: string, trackName: string, serverId: string)`: Promueve a un usuario en un track de un servidor específico.
        *   `demoteUser(uniqueId: string, trackName: string, serverId: string)`: Degrada a un usuario en un track de un servidor específico.
    *   Cada uno de estos métodos construirá el payload (`NewNode`, `TrackRequest`, etc.) de la API REST, incluyendo el array `context` con `key: "server"` y `value: serverId`.

6.  **Configurar la URL Base de la API REST de LuckPerms en `bot-discord`**
    *   La URL base de la `rest-api` (por ejemplo, `http://localhost:8080`) se configurará en el proyecto `bot-discord` a través de variables de entorno para facilitar la gestión en diferentes entornos (desarrollo, producción).

7.  **Integrar `LuckPermsService` en la Lógica del Bot de Discord**
    *   El nuevo `LuckPermsService` se inyectará (utilizando InversifyJS) en los controladores o servicios existentes del bot de Discord (por ejemplo, `discordBot.ts` o `members.controller.ts`) donde los cambios de rol en Discord necesiten activar actualizaciones de permisos en Minecraft. Esto permitirá que el bot llame a los métodos del servicio LuckPerms para interactuar con la API.

Este plan proporciona una hoja de ruta clara para la integración, aprovechando las capacidades existentes de LuckPerms y su API REST, y abordando las preocupaciones de seguridad.