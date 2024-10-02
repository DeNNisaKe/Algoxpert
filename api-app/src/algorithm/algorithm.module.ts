import { Module } from '@nestjs/common';
import { AlgorithmController } from './controllers/algorithm.controller';
import { AlgorithmService } from './services/algorithm.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Algorithm, AlgorithmSchema } from './models/algorithm.model';
import { Constants } from 'src/shared/utils/constants.utils';
import { AlgorithmGateway } from './gateways/algorithm.gateway';
import { EventLogModule } from 'src/event-log/event-log.module';

const AlgorithmMongooseModule = MongooseModule.forFeature(
  [
    {
      name: Algorithm.name,
      schema: AlgorithmSchema,
      collection: 'algorithm',
    },
  ],
  Constants.MONGO_CONNECTION_NAME,
);

@Module({
  controllers: [AlgorithmController],
  providers: [AlgorithmService, AlgorithmGateway],
  imports: [AlgorithmMongooseModule, EventLogModule],
  exports: [AlgorithmMongooseModule],
})
export class AlgorithmModule {}
