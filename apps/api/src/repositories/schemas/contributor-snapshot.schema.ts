import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Repository } from '../repository.schema';

export enum ContributorWorkloadLevel {
  BALANCED = 'BALANCED',
  BUSY = 'BUSY',
  OVERLOADED = 'OVERLOADED',
  AT_RISK = 'AT_RISK'
}

@Schema({ timestamps: true })
export class ContributorSnapshot extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: Repository.name, index: true })
  repository!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  username!: string;

  @Prop({ required: false })
  avatarUrl?: string;

  @Prop({ required: false })
  profileUrl?: string;

  @Prop({ required: false, default: 0 })
  commits!: number;

  @Prop({ required: false, default: 0 })
  openPrs!: number;

  @Prop({ required: false, default: 0 })
  assignedIssues!: number;

  @Prop({ required: false, default: 0 })
  pendingReviews!: number;

  @Prop({ required: false, default: 0 })
  staleItems!: number;

  @Prop({ required: false, default: 0 })
  workloadScore!: number;

  @Prop({
    required: false,
    enum: Object.values(ContributorWorkloadLevel),
    default: ContributorWorkloadLevel.BALANCED
  })
  workloadLevel!: ContributorWorkloadLevel;

  @Prop({ required: true, type: Date })
  syncedAt!: Date;
}

export const ContributorSnapshotSchema = SchemaFactory.createForClass(ContributorSnapshot);
ContributorSnapshotSchema.index({ repository: 1, username: 1 }, { unique: true });
