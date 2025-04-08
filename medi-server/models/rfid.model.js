const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     RFID:
 *       type: object
 *       required:
 *         - rfidNumber
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the RFID record
 *         rfidNumber:
 *           type: string
 *           description: Unique RFID card number
 *           unique: true
 *         userId:
 *           type: string
 *           description: ID of the user (patient) associated with this RFID card
 *         isActive:
 *           type: boolean
 *           description: Whether the RFID card is active or not
 *         assignedBy:
 *           type: string
 *           description: ID of the admin/doctor who assigned this RFID card
 *         assignedAt:
 *           type: string
 *           format: date-time
 *           description: Date when the RFID card was assigned
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date when the RFID record was last updated
 */

const rfidSchema = new mongoose.Schema(
  {
    rfidNumber: {
      type: String,
      required: [true, 'RFID number is required'],
      unique: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Add index for faster lookups
rfidSchema.index({ userId: 1 });

const RFID = mongoose.model('RFID', rfidSchema);

module.exports = RFID;