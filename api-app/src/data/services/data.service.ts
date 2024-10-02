import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Constants } from 'src/shared/utils/constants.utils';
import { Data } from '../models/data.schema';
import { DataBlock } from '../models/data-block.schema';

@Injectable()
export class DataService {
  constructor(
    @InjectModel(DataBlock.name, Constants.MONGO_CONNECTION_NAME)
    protected readonly dataModel: Model<DataBlock>,
  ) {}

  async importData(rawDataBody: any) {
    if (
      rawDataBody &&
      rawDataBody.rawDataBody &&
      rawDataBody.rawDataBody.dataBlock
    ) {
      const dataBlock = rawDataBody.rawDataBody.dataBlock;

      return { data: dataBlock };
    } else {
      console.log('rawDataBody or rawDataBody.dataBlock is undefined');
    }
  }

  async saveData(processedData: any) {
    return this.dataModel.create(processedData);
  }

  async getData() {
    return this.dataModel.find().exec();
  }
}
