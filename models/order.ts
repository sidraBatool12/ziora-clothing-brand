import { Schema, model, models, Types, Model } from "mongoose";

export type OrderStatus =
  | "pending" | "confirmed" | "processing" | "packed"
  | "shipped" | "out_for_delivery" | "delivered" | "cancelled";

export type PaymentMethod = "cod" | "easypaisa" | "bank_transfer";
export type PaymentStatus = "pending" | "verification_pending" | "paid" | "rejected" | "refunded";

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
}

export interface IAddressSnapshot {
  fullName: string; phone: string; line1: string;
  city: string; state: string; postalCode: string; country: string;
}

export interface IShippingDetails {
  courierName?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
}

export interface IOrder {
  orderNumber: string;
  user: Types.ObjectId;
  items: IOrderItem[];
  address: IAddressSnapshot;
  totalAmount: number;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; at: Date }[];
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentProof?: { url: string; publicId: string };
  transactionId?: string;
  shippingDetails: IShippingDetails;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: String, image: String, size: String, color: String,
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
  },
  { _id: false }
);

const addressSnapshotSchema = new Schema<IAddressSnapshot>(
  {
    fullName: String, phone: String, line1: String,
    city: String, state: String, postalCode: String, country: String,
  },
  { _id: false }
);

const shippingDetailsSchema = new Schema<IShippingDetails>(
  { courierName: String, trackingNumber: String, estimatedDelivery: Date },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    address: { type: addressSnapshotSchema, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    statusHistory: {
      type: [{ status: String, at: { type: Date, default: () => new Date() } }],
      default: [],
    },
    paymentMethod: { type: String, enum: ["cod", "easypaisa", "bank_transfer"], required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "verification_pending", "paid", "rejected", "refunded"],
      default: "pending",
      index: true,
    },
    paymentProof: { url: String, publicId: String },
    transactionId: String,
    shippingDetails: { type: shippingDetailsSchema, default: {} },
    cancelledAt: Date,
  },
  { timestamps: true }
);

export const Order: Model<IOrder> = models.Order || model<IOrder>("Order", orderSchema);
