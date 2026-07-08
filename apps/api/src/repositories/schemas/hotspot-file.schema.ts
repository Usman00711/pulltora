import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Repository } from '../repository.schema';

@Schema({ timestamps: true })
export class HotspotFile extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: Repository.name, index: true })
  repository!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  filePath!: string;

  @Prop({ required: true, trim: true })
  module!: string;

  @Prop({ required: true, default: 0 })
  changeCount!: number;

  @Prop({ required: true, default: 0 })
  riskScore!: number;

  @Prop({ required: false, type: [Number], default: [] })
  relatedPrNumbers!: number[];

  @Prop({ required: true, type: Date })
  lastTouchedAt!: Date;

  @Prop({ required: true, type: Date })
  analyzedAt!: Date;
}

export const HotspotFileSchema = SchemaFactory.createForClass(HotspotFile);
HotspotFileSchema.index({ repository: 1, filePath: 1 }, { unique: true });

