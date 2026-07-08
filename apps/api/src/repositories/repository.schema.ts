import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../users/users.schema';

@Schema({ timestamps: true })
export class Repository extends Document {
  @Prop({ required: true, trim: true, maxlength: 120 })
  owner!: string;

  @Prop({ required: true, trim: true, maxlength: 120 })
  name!: string;

  @Prop({ required: true, trim: true })
  fullName!: string;

  @Prop({ required: true })
  url!: string;

  @Prop({ required: false, maxlength: 500 })
  description?: string;

  @Prop({ required: false, maxlength: 120 })
  language?: string;

  @Prop({ required: false, default: 0 })
  stars!: number;

  @Prop({ required: false, default: 0 })
  forks!: number;

  @Prop({ required: false })
  defaultBranch?: string;

  @Prop({ type: Date, required: false, default: null })
  lastSyncedAt?: Date;

  @Prop({ required: true, type: Types.ObjectId, ref: User.name, index: true })
  user!: Types.ObjectId;

  @Prop()
  createdAt!: Date;

  @Prop()
  updatedAt!: Date;
}

export const RepositorySchema = SchemaFactory.createForClass(Repository);
RepositorySchema.index({ user: 1, fullName: 1 }, { unique: true });
