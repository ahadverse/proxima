import { Schema, model, type Types } from 'mongoose';

export interface IDownloadLog {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  product: Types.ObjectId;
  ip: string;
  userAgent: string;
  createdAt: Date;
}

const downloadLogSchema = new Schema<IDownloadLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

downloadLogSchema.index({ user: 1, product: 1, createdAt: -1 });

export const DownloadLog = model<IDownloadLog>('DownloadLog', downloadLogSchema);
