const mongoose = require('mongoose');

const visitPassSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    visitorName: {
      type: String,
      required: [true, 'Visitor name is required'],
      trim: true,
    },
    relationship: {
      type: String,
      required: [true, 'Relationship is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    visitDate: {
      type: Date,
      required: [true, 'Visit date is required'],
    },
    arrivalTime: {
      type: String, // format e.g. "10:00 AM" or "14:00"
      required: [true, 'Arrival time is required'],
    },
    departureTime: {
      type: String, // format e.g. "05:00 PM" or "18:00"
      required: [true, 'Departure time is required'],
    },
    purpose: {
      type: String,
      required: [true, 'Purpose of visit is required'],
      trim: true,
    },
    visitorCount: {
      type: Number,
      required: true,
      default: 1,
    },
    visitorNames: [
      {
        type: String,
        trim: true,
      },
    ],
    idProofType: {
      type: String,
      required: [true, 'ID Proof type is required'],
      trim: true,
    },
    idProofNumber: {
      type: String,
      required: [true, 'ID Proof number is required'],
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED'],
      default: 'PENDING',
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    passId: {
      type: String,
      unique: true,
      sparse: true,
    },
    qrCode: {
      type: String, // Data URL of the generated QR code
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('VisitPass', visitPassSchema);
