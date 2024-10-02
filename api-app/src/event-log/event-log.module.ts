import { Constants } from 'src/shared/utils/constants.utils';
import { EventLog, EventLogSchema } from './models/event-log.entity';
import { Module } from '@nestjs/common';
import { EventLogService } from './services/event-log.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EventLogController } from './controllers/event-log.controller';

const EventLogMongooseModule = MongooseModule.forFeature(
  [
    {
      name: EventLog.name,
      schema: EventLogSchema,
      collection: 'event-log',
    },
  ],
  Constants.MONGO_CONNECTION_NAME,
);
@Module({
  controllers: [EventLogController],
  providers: [EventLogService],
  imports: [EventLogMongooseModule],
  exports: [EventLogMongooseModule, EventLogService],
})
export class EventLogModule {}
