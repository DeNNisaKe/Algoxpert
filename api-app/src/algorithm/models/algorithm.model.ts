import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Class, ClassSchema } from './class.model';

@Schema({ timestamps: true })
export class Algorithm {
  @Prop({
    required: true,
    type: String,
  })
  name: string;

  @Prop({
    required: true,
    type: [ClassSchema],
  })
  classes: Class[];
}
export type AlgorithmDocument = Algorithm & Document;
export const AlgorithmSchema = SchemaFactory.createForClass(Algorithm);
