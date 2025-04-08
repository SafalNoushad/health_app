const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Medicine:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the medicine
 *         quantity:
 *           type: string
 *           description: Quantity/dosage of medicine
 *         intakeTime:
 *           type: array
 *           items:
 *             type: string
 *           description: Times of day to take medicine (e.g., ["morning", "afternoon", "night"])
 *         duration:
 *           type: string
 *           description: Duration for which medicine should be taken
 *         instructions:
 *           type: string
 *           description: Additional instructions for taking the medicine
 *
 *     Prescription:
 *       type: object
 *       required:
 *         - patientId
 *         - doctorId
 *         - medicines
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the prescription
 *         patientId:
 *           type: string
 *           description: ID of the patient
 *         doctorId:
 *           type: string
 *           description: ID of the prescribing doctor
 *         medicines:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Medicine'
 *           description: List of prescribed medicines
 *         notes:
 *           type: string
 *           description: Additional notes from the doctor
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when prescription was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date when prescription was last updated
 */

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
  },
  quantity: {
    type: String,
    required: [true, 'Medicine quantity is required'],
    trim: true,
  },
  intakeTime: [{
    type: String,
    required: [true, 'Medicine intake time is required'],
    enum: ['morning', 'afternoon', 'evening', 'night', 'before_meal', 'after_meal'],
  }],
  duration: {
    type: String,
    required: [true, 'Medicine duration is required'],
    trim: true,
  },
  instructions: {
    type: String,
    trim: true,
  },
});

const prescriptionSchema = new mongoose.Schema(
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
    medicines: [medicineSchema],
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for faster lookups
prescriptionSchema.index({ patientId: 1, doctorId: 1 });

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;