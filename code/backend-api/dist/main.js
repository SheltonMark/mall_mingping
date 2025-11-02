"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const prisma_service_1 = require("./prisma.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: ['http://localhost:3000'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'public'), {
        prefix: '/',
    });
    const uploadsDir = process.env.UPLOAD_DIR || './uploads';
    app.useStaticAssets((0, path_1.join)(process.cwd(), uploadsDir), {
        prefix: '/uploads/',
    });
    app.setGlobalPrefix('api');
    const prismaService = app.get(prisma_service_1.PrismaService);
    await prismaService.enableShutdownHooks(app);
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Server is running on: http://localhost:${port}/api`);
    console.log(`📁 Static files served from: /uploads/`);
}
bootstrap();
//# sourceMappingURL=main.js.map