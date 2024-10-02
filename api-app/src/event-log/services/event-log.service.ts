import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventLog } from '../models/event-log.entity';
import { Constants } from 'src/shared/utils/constants.utils';

@Injectable()
export class EventLogService {
  constructor(
    @InjectModel(EventLog.name, Constants.MONGO_CONNECTION_NAME)
    protected eventLogModel: Model<EventLog>,
  ) {}

  async createEventLog(eventLog: Partial<EventLog>): Promise<EventLog> {
    const createdEventLog = await this.eventLogModel.create(eventLog);
    return createdEventLog.save();
  }

  async getEventLogs(): Promise<EventLog[]> {
    return this.eventLogModel.find().sort({ createdAt: -1 }).exec();
  }
}
