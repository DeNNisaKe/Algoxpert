import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class DataBlock {
  @Prop({
    type: String,
  })
  sessionName: string;

  @Prop()
  specimens: any[];

  @Prop()
  data: any[];
}
export const DataBlockSchema = SchemaFactory.createForClass(DataBlock);
