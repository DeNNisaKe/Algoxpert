import { Controller, Get } from '@nestjs/common';
import { EventLogService } from '../services/event-log.service';

@Controller('event-log')
export class EventLogController {
  constructor(private readonly eventLogService: EventLogService) {}

  @Get()
  async findAll() {
    return this.eventLogService.getEventLogs();
  }
}
