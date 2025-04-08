const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Consultation:
 *       type: object
 *       required:
 *         - patientId
 *         - doctorId
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the consultation relationship
 *         patientId:
 *           type: string
 *           description: ID of the patient
 *         doctorId:
 *           type: string
 *           description: ID of the consulting doctor
 *         status:
 *           type: string
 *           description: Status of the consultation relationship
 *           enum: [active, inactive]
 *         lastConsultationDate:
 *           type: string
 *           format: date-time
 *           description: Date of the last consultation
 *         consultationHistory:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *           description: History of all consultations
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when consultation relationship was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date when consultation relationship was last updated
 */

const consultationHistorySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  notes: {
    type: String,
    trim: true,
  },
});

const consultationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID is required'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    lastConsultationDate: {
      type: Date,
      default: Date.now,
    },
    consultationHistory: [consultationHistorySchema],
  },
  {
    timestamps: true,
  }
);

// Add indexes for faster lookups
consultationSchema.index({ patientId: 1, doctorId: 1 }, { unique: true });
consultationSchema.index({ patientId: 1, status: 1 });
consultationSchema.index({ doctorId: 1, status: 1 });

const Consultation = mongoose.model('Consultation', consultationSchema);

module.exports = Consultation;