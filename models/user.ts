import { Schema, model, models, Model } from "mongoose";

export interface IAddress {
  _id?: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface IUser {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: "customer" | "admin";
  isVerified: boolean;
  avatar?: string;
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>({
  label: { type: String, default: "Home" },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  line1: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: "Pakistan" },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    isVerified: { type: Boolean, default: false },
    avatar: String,
    addresses: { type: [addressSchema], default: [] },
  },
  { timestamps: true }
);

export const User: Model<IUser> = models.User || model<IUser>("User", userSchema);

export interface IOtpToken {
  email: string;
  otpHash: string;
  purpose: "verify" | "reset";
  expiresAt: Date;
  createdAt: Date;
}

const otpSchema = new Schema<IOtpToken>(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    otpHash: { type: String, required: true },
    purpose: { type: String, enum: ["verify", "reset"], required: true },
    expiresAt: { type: Date, required: true, expires: 0 }, // TTL — Mongo auto-deletes
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const OtpToken: Model<IOtpToken> = models.OtpToken || model<IOtpToken>("OtpToken", otpSchema);
