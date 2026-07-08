import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Repository } from '../repository.schema';

@Schema({ timestamps: true })
export class IssueSnapshot extends Document {
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

  @Prop({ required: false, trim: true })
  assignee?: string;

  @Prop({ required: true, trim: true })
  state!: string;

  @Prop({ required: true })
  url!: string;

  @Prop({ required: false, type: [String], default: [] })
  labels!: string[];

  @Prop({ required: true, type: Date })
  createdAtGithub!: Date;

  @Prop({ required: true, type: Date })
  updatedAtGithub!: Date;

  @Prop({ required: false, type: Date })
  closedAtGithub?: Date;

  @Prop({ required: false, default: false })
  isStale!: boolean;

  @Prop({ required: false, default: false })
  isCritical!: boolean;

  @Prop({ required: true, type: Date })
  syncedAt!: Date;
}

export const IssueSnapshotSchema = SchemaFactory.createForClass(IssueSnapshot);
IssueSnapshotSchema.index({ repository: 1, githubId: 1 }, { unique: true });
