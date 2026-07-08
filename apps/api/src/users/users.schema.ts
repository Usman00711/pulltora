import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../auth/interfaces/jwt-payload.interface';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, trim: true, maxlength: 120 })
  name!: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true, index: true })
  email!: string;

  @Prop({ required: true, select: false })
  passwordHash!: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.Viewer })
  role!: UserRole;

  @Prop({ required: false, select: false })
  refreshTokenHash?: string;

  @Prop()
  createdAt!: Date;

  @Prop()
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = User & Document;
