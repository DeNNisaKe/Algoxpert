import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Class {
  @Prop({
    required: true,
    type: String,
  })
  name: string;

  @Prop({
    required: true,
  })
  specimens: any[];

  @Prop({
    required: true,
  })
  color: string;
}
export type ClassDocument = Class & Document;
export const ClassSchema = SchemaFactory.createForClass(Class);
