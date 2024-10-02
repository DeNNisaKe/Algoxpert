import { Provider } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import mongoose, { Model, PipelineStage } from 'mongoose';
import { Constants } from './constants.utils';

export class MongoUtils {
  public static ObjectId = (id: string | mongoose.Types.ObjectId) =>
    new mongoose.Types.ObjectId(id);

  public static isValidObjectId = (id: string | mongoose.Types.ObjectId) =>
    mongoose.Types.ObjectId.isValid(id);

  public static buildLookup(
    from: string,
    localField: string,
    foreignField: string,
    as: string,
  ): (PipelineStage.Lookup | PipelineStage.Unwind)[] {
    return [
      { $lookup: { from, localField, foreignField, as } },
      {
        $unwind: {
          path: `$${as}`,
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
  }

  public static getMigrationToken(
    modelName: string,
    dbConnectionName: string = Constants.MONGO_CONNECTION_NAME,
  ) {
    return getModelToken(modelName, dbConnectionName) + 'Migration';
  }

  public static generateMigrationProvider<Document>(
    modelName: string,
    dbConnectionName: string = Constants.MONGO_CONNECTION_NAME,
  ): Provider {
    return {
      inject: [getModelToken(modelName, dbConnectionName)],
      provide: MongoUtils.getMigrationToken(modelName, dbConnectionName),
      useFactory: (model: Model<Document>) => model,
    };
  }
}
