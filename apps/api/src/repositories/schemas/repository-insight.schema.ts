import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Repository } from '../repository.schema';

export enum RepositoryInsightCategory {
  ARCHITECTURE = 'ARCHITECTURE',
  TESTING = 'TESTING',
  SECURITY = 'SECURITY',
  REVIEW_PROCESS = 'REVIEW_PROCESS',
  WORKLOAD = 'WORKLOAD',
  RELEASE_RISK = 'RELEASE_RISK',
  MAINTAINABILITY = 'MAINTAINABILITY',
  DX = 'DX'
}

export enum RepositoryInsightImpact {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum RepositoryInsightSource {
  RULES = 'RULES',
  LOCAL_AI = 'LOCAL_AI',
  GEMINI_AI = 'GEMINI_AI'
}

@Schema({ timestamps: true })
export class RepositoryInsight extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: Repository.name, index: true })
  repository!: Types.ObjectId;

  @Prop({ required: true, enum: Object.values(RepositoryInsightCategory) })
  category!: RepositoryInsightCategory;

  @Prop({ required: true, trim: true, maxlength: 160 })
  title!: string;

  @Prop({ required: true, trim: true, maxlength: 1200 })
  description!: string;

  @Prop({ required: true, trim: true, maxlength: 1200 })
  rationale!: string;

  @Prop({ required: true, enum: Object.values(RepositoryInsightImpact) })
  impact!: RepositoryInsightImpact;

  @Prop({ required: false, default: 0 })
  confidence!: number;

  @Prop({ required: true, enum: Object.values(RepositoryInsightSource) })
  source!: RepositoryInsightSource;

  @Prop({ required: false, type: [String], default: [] })
  relatedFiles!: string[];

  @Prop({ required: false, type: [Number], default: [] })
  relatedPrNumbers!: number[];

  @Prop({ required: false, type: [Number], default: [] })
  relatedIssueNumbers!: number[];

  @Prop({ required: true, type: Date })
  generatedAt!: Date;
}

export const RepositoryInsightSchema = SchemaFactory.createForClass(RepositoryInsight);
RepositoryInsightSchema.index({ repository: 1, generatedAt: -1 });
