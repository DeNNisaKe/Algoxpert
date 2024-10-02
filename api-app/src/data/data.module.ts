import { MongooseModule } from '@nestjs/mongoose';
import { Constants } from 'src/shared/utils/constants.utils';
import { Module } from '@nestjs/common';
import { DataController } from './controllers/data.controller';
import { DataService } from './services/data.service';
import { DataBlock, DataBlockSchema } from './models/data-block.schema';

const DataMongooseModule = MongooseModule.forFeature(
  [
    {
      name: DataBlock.name,
      schema: DataBlockSchema,
      collection: 'data',
    },
  ],
  Constants.MONGO_CONNECTION_NAME,
);

@Module({
  controllers: [DataController],
  providers: [DataService],
  imports: [DataMongooseModule],
  exports: [DataMongooseModule],
})
export class DataModule {}
