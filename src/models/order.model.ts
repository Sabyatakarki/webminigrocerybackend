import mongoose, { Schema, Document, Types } from "mongoose";

export interface IOrderProduct {
  product: Types.ObjectId;
  quantity: number;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  products: IOrderProduct[];
  totalAmount: number;
  paymentMethod: "cash";
  status: "pending" | "confirmed" | "delivered";
  shippingAddress: IShippingAddress;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["cash"],
      default: "cash",
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "delivered"],
      default: "pending",
    },

    shippingAddress: {
      fullName: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", orderSchema);