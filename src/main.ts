import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const options = new DocumentBuilder()
  .setTitle('Neofura-AuthAPI')
  .setDescription('The API description')
  .setVersion('1.0')
  .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('document', app, document);

  app.enableCors();
  app.use('/public', express.static(join(__dirname, '../../public')));
  const bodyParser = require('body-parser');
  app.use(bodyParser.json({limit: '5mb'}));
  app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
  app.useGlobalFilters(new AllExceptionsFilter());

  /* SECURITY */
  // app.enable("trust proxy");
  // app.use(helmet());
  //
  // app.use(rateLimit({
  //   windowMs: 15 * 60 * 1000, // 15 minutes
  //   max: 100, // limit each IP to 100 requests per windowMs
  //   message:
  //     "Too many requests from this IP, please try again later"
  // }));
  // const createAccountLimiter = rateLimit({
  //   windowMs: 60 * 60 * 1000, // 1 hour window
  //   max: 3, // start blocking after 3 requests
  //   message:
  //     "Too many accounts created from this IP, please try again after an hour"
  // });
  // app.use("/auth/email/register", createAccountLimiter);
  /******/

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));
  await app.listen(3000);
}
bootstrap();
