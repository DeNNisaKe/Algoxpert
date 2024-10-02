import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { DataService } from '../services/data.service';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Get()
  async getData() {
    return this.dataService.getData();
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async importData(@UploadedFile() file: Express.Multer.File) {
    const data = file.buffer.toString();

    try {
      const jsonData = JSON.parse(data);

      return this.dataService.importData(jsonData);
    } catch (error) {
      return { error: 'Invalid JSON format' };
    }
  }

  @Post('save')
  async saveData(
    @Body() body: { sessionName: string; specimens: any[]; data: any[] },
  ): Promise<any> {
    return this.dataService.saveData(body);
  }
}
