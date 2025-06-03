import mongoose, { type Document, Schema } from "mongoose"

export interface IChargingStation extends Document {
  _id: string
  name: string
  latitude: number
  longitude: number
  address?: string
  connectorType?: string
  powerOutput?: number
  status: "available" | "occupied" | "maintenance"
  pricePerKwh?: number
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ChargingStationSchema = new Schema<IChargingStation>(
  {
    name: {
      type: String,
      required: [true, "Station name is required"],
      trim: true,
      maxlength: [100, "Station name cannot exceed 100 characters"],
    },
    latitude: {
      type: Number,
      required: [true, "Latitude is required"],
      min: [-90, "Latitude must be between -90 and 90"],
      max: [90, "Latitude must be between -90 and 90"],
      validate: {
        validator: (v: number) => !isNaN(v) && isFinite(v),
        message: "Latitude must be a valid number",
      },
    },
    longitude: {
      type: Number,
      required: [true, "Longitude is required"],
      min: [-180, "Longitude must be between -180 and 180"],
      max: [180, "Longitude must be between -180 and 180"],
      validate: {
        validator: (v: number) => !isNaN(v) && isFinite(v),
        message: "Longitude must be a valid number",
      },
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
    connectorType: {
      type: String,
      enum: ["Type 1", "Type 2", "CCS", "CHAdeMO", "Tesla"],
      trim: true,
    },
    powerOutput: {
      type: Number,
      min: [1, "Power output must be at least 1 kW"],
      max: [1000, "Power output cannot exceed 1000 kW"],
    },
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance"],
      default: "available",
      required: true,
    },
    pricePerKwh: {
      type: Number,
      min: [0, "Price per kWh cannot be negative"],
      max: [10, "Price per kWh cannot exceed $10"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
    },
  },
  {
    timestamps: true,
  },
)

// Compound index for geospatial queries
ChargingStationSchema.index({ latitude: 1, longitude: 1 })
ChargingStationSchema.index({ status: 1 })
ChargingStationSchema.index({ createdBy: 1 })
ChargingStationSchema.index({ connectorType: 1 })
ChargingStationSchema.index({ pricePerKwh: 1 })

// Prevent re-compilation during development
const ChargingStation =
  mongoose.models.ChargingStation || mongoose.model<IChargingStation>("ChargingStation", ChargingStationSchema)

export default ChargingStation
