import { MiddlewareConsumer, Module } from '@nestjs/common';
import { CalcModule } from './calc/calc.module';
import { LoggingMiddleware } from './logging.middleware';

@Module({
  imports: [CalcModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
