import mongoose, { Schema } from 'mongoose';

export interface IConversion {
  _id: string;
  userId: string;
  mode: 'png-to-svg' | 'svg-to-png';
  fileName: string;
  fileSizeBytes: number;
  outputSizeBytes: number;
  width: number;
  height: number;
  pathCount?: number;
  executionTimeMs?: number;
  previewSvgSnippet?: string;
  createdAt: Date;
}

const ConversionSchema = new Schema<IConversion>({
  userId: { type: String, required: true, index: true },
  mode: { type: String, enum: ['png-to-svg', 'svg-to-png'], required: true },
  fileName: { type: String, required: true },
  fileSizeBytes: { type: Number, required: true },
  outputSizeBytes: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  pathCount: { type: Number },
  executionTimeMs: { type: Number },
  previewSvgSnippet: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Conversion = mongoose.models.Conversion || mongoose.model<IConversion>('Conversion', ConversionSchema);
