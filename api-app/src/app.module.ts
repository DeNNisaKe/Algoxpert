import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Constants } from './shared/utils/constants.utils';
import { DataModule } from './data/data.module';
import { AlgorithmModule } from './algorithm/algorithm.module';
import { EventLogModule } from './event-log/event-log.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: Constants.MONGO_CONNECTION_URI,
      }),
      connectionName: Constants.MONGO_CONNECTION_NAME,
    }),
    DataModule,
    AlgorithmModule,
    EventLogModule,
  ],
})
export class AppModule {}
