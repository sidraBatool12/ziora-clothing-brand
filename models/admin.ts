import { Schema, model, models, type Model } from "mongoose";

export type ContactStatus = "unread" | "read" | "resolved";

export interface IContactMessage {
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: ContactStatus;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    subject: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["unread", "read", "resolved"],
      default: "unread",
      index: true,
    },
    adminNote: { type: String, trim: true },
  },
  { timestamps: true }
);

export const ContactMessage: Model<IContactMessage> =
  models.ContactMessage || model<IContactMessage>("ContactMessage", contactMessageSchema);

export interface IStoreSettings {
  key: "primary";
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  businessHours: string;
  currency: string;
  shippingFee: number;
  freeShippingThreshold: number;
  codEnabled: boolean;
  easypaisaEnabled: boolean;
  easypaisaAccountName: string;
  easypaisaAccountNumber: string;
  jazzcashEnabled: boolean;
  jazzcashAccountName: string;
  jazzcashAccountNumber: string;
  bankTransferEnabled: boolean;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankIban: string;
  paymentInstructions: string;
  orderPrefix: string;
  updatedAt: Date;
}

const storeSettingsSchema = new Schema<IStoreSettings>(
  {
    key: { type: String, enum: ["primary"], default: "primary", unique: true },
    storeName: { type: String, default: "ZIORA" },
    supportEmail: { type: String, default: "zioracollections137@gmail.com" },
    supportPhone: { type: String, default: "03144430551" },
    businessHours: { type: String, default: "Mon–Sat · 10:00–18:00 PKT" },
    currency: { type: String, default: "PKR" },
    shippingFee: { type: Number, default: 350, min: 0 },
    freeShippingThreshold: { type: Number, default: 10000, min: 0 },
    codEnabled: { type: Boolean, default: true },
    easypaisaEnabled: { type: Boolean, default: true },
    easypaisaAccountName: { type: String, default: "", trim: true },
    easypaisaAccountNumber: { type: String, default: "", trim: true },
    jazzcashEnabled: { type: Boolean, default: false },
    jazzcashAccountName: { type: String, default: "", trim: true },
    jazzcashAccountNumber: { type: String, default: "", trim: true },
    bankTransferEnabled: { type: Boolean, default: true },
    bankName: { type: String, default: "", trim: true },
    bankAccountName: { type: String, default: "", trim: true },
    bankAccountNumber: { type: String, default: "", trim: true },
    bankIban: { type: String, default: "", trim: true },
    paymentInstructions: { type: String, default: "", trim: true },
    orderPrefix: { type: String, default: "ZIO" },
  },
  { timestamps: true }
);

export const StoreSettings: Model<IStoreSettings> =
  models.StoreSettings || model<IStoreSettings>("StoreSettings", storeSettingsSchema);
