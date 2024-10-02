import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import {
  AlgorithmSchema,
  Algorithm,
} from 'src/algorithm/models/algorithm.model';

@Schema({ timestamps: true })
export class EventLog {
  @Prop({
    required: true,
    type: String,
  })
  algorithmId: string;

  @Prop({
    required: true,
    type: AlgorithmSchema,
  })
  algorithm: Algorithm;

  @Prop({
    type: Number,
  })
  accuracy?: number;

  @Prop({
    type: Number,
  })
  loss?: number;

  @Prop({
    type: Number,
  })
  totalPredictions?: number;

  @Prop({
    type: Number,
  })
  correctPredictions?: number;

  @Prop({
    type: Number,
  })
  batches: number;

  @Prop({
    type: Number,
  })
  trainingRounds: number;

  @Prop({
    type: String,
  })
  trainingAlgorithm: string;

  @Prop({
    type: Number,
  })
  mse?: number;
}

export type EventLogDocument = EventLog & Document;
export const EventLogSchema = SchemaFactory.createForClass(EventLog);
