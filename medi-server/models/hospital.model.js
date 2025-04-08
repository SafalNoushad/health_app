const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Hospital:
 *       type: object
 *       required:
 *         - name
 *         - address
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the hospital
 *         name:
 *           type: string
 *           description: Hospital name
 *         address:
 *           type: string
 *           description: Hospital address
 *         phone:
 *           type: string
 *           description: Hospital contact number
 *         email:
 *           type: string
 *           description: Hospital email address
 *         website:
 *           type: string
 *           description: Hospital website URL
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when hospital was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date when hospital was last updated
 */

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Hospital address is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    website: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for doctors working at this hospital
hospitalSchema.virtual('doctors', {
  ref: 'User',
  localField: '_id',
  foreignField: 'hospitalId',
  match: { role: 'doctor' }
});

const Hospital = mongoose.model('Hospital', hospitalSchema);

module.exports = Hospital;