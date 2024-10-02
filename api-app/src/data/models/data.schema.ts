import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Data extends Document {
  @Prop({ type: Number })
  sensorIndex: number;

  @Prop({ type: Number })
  sensorID: number;

  @Prop({ type: Number })
  timeSincePowerOn: number;

  @Prop({ type: Number })
  realTimeClock: number;

  @Prop({ type: Number })
  temperature: number;

  @Prop({ type: Number })
  pressure: number;

  @Prop({ type: Number })
  relativeHumidity: number;

  @Prop({ type: Number })
  resistanceGasSensor: number;

  @Prop({ type: Number })
  heaterProfileStepIndex: number;

  @Prop({ type: Number })
  scanningEnabled: number;

  @Prop({ type: Number })
  labelTag: number;

  @Prop({ type: Number })
  errorCode: number;
}

export const DataSchema = SchemaFactory.createForClass(Data);
