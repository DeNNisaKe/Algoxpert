import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AlgorithmService } from '../services/algorithm.service';
import { DataStructureDto } from '../dtos/data-structure.dto';

@Controller('algorithm')
export class AlgorithmController {
  constructor(private readonly algorithmService: AlgorithmService) {}

  @Post()
  async create(@Body() body: any) {
    return this.algorithmService.create(body);
  }

  @Get()
  async findAll() {
    return this.algorithmService.findAll();
  }

  @Post('run/:id')
  async run(@Param('id') algorithmId: any, @Body() body: DataStructureDto) {
    let algorithmName;
    switch (body.algorithmName) {
      case 'ADAM Optimizer':
        algorithmName = 'adam';
        break;
      case 'SGD Optimizer':
        algorithmName = 'sgd';
        break;
      case 'Random Forest Classifier':
        algorithmName = 'random-forest';
        break;
      default:
        return;
    }

    return this.algorithmService.run(
      algorithmName,
      algorithmId,
      body.trainingDataValue,
      body.validationDataValue,
      body.batchSize,
      body.trainingRounds,
    );
  }
}
