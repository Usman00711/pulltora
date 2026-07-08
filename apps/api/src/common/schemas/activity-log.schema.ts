import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Repository } from '../../repositories/repository.schema';
import { User } from '../../users/users.schema';

@Schema({ timestamps: true })
export class ActivityLog extends Document {
  @Prop({ required: false, type: Types.ObjectId, ref: User.name, index: true })
  user?: Types.ObjectId;

  @Prop({ required: false, type: Types.ObjectId, ref: Repository.name, index: true })
  repository?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  action!: string;

  @Prop({ required: true, trim: true })
  entity!: string;

  @Prop({ required: false, trim: true })
  entityId?: string;

  @Prop({ required: false, type: Object })
  metadata?: Record<string, unknown>;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
