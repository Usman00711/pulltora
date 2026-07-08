import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Repository } from '../repository.schema';

export enum PullRequestRiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

@Schema({ timestamps: true })
export class PullRequestSnapshot extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: Repository.name, index: true })
  repository!: Types.ObjectId;

  @Prop({ required: true })
  githubId!: number;

  @Prop({ required: true })
  number!: number;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  author!: string;

  @Prop({ required: true, trim: true })
  state!: string;

  @Prop({ required: true })
  url!: string;

  @Prop({ required: true, type: Date })
  createdAtGithub!: Date;

  @Prop({ required: true, type: Date })
  updatedAtGithub!: Date;

  @Prop({ required: false, type: Date })
  closedAtGithub?: Date;

  @Prop({ required: false, type: Date })
  mergedAtGithub?: Date;

  @Prop({ required: false, default: 0 })
  filesChanged!: number;

  @Prop({ required: false, default: 0 })
  additions!: number;

  @Prop({ required: false, default: 0 })
  deletions!: number;

  @Prop({ required: false, type: [String], default: [] })
  changedFileNames!: string[];

  @Prop({ required: false, default: false })
  hasDescription!: boolean;

  @Prop({ required: false, default: 0 })
  reviewCount!: number;

  @Prop({ required: false, default: false })
  isDraft!: boolean;

  @Prop({ required: false, default: 0 })
  riskScore!: number;

  @Prop({
    required: false,
    enum: Object.values(PullRequestRiskLevel),
    default: PullRequestRiskLevel.LOW
  })
  riskLevel!: PullRequestRiskLevel;

  @Prop({ required: false, type: [String], default: [] })
  riskReasons!: string[];

  @Prop({ required: true, type: Date })
  syncedAt!: Date;
}

export const PullRequestSnapshotSchema = SchemaFactory.createForClass(PullRequestSnapshot);
PullRequestSnapshotSchema.index({ repository: 1, githubId: 1 }, { unique: true });
