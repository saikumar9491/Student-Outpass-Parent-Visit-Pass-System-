const mongoose = require('mongoose');

const outpassSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    purpose: {
      type: String,
      required: [true, 'Purpose is required'],
      trim: true,
    },
    outingDate: {
      type: Date,
      required: [true, 'Outing date and time are required'],
    },
    expectedReturnDate: {
      type: Date,
      required: [true, 'Expected return date and time are required'],
    },
    emergencyContact: {
      type: String,
      required: [true, 'Emergency contact is required'],
      trim: true,
    },
    remarks: {
      type: String,
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

module.exports = mongoose.model('Outpass', outpassSchema);
