const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       required:
 *         - doctorId
 *         - patientId
 *         - date
 *         - time
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the appointment
 *         doctorId:
 *           type: string
 *           description: ID of the doctor
 *         doctorName:
 *           type: string
 *           description: Name of the doctor
 *         patientId:
 *           type: string
 *           description: ID of the patient
 *         speciality:
 *           type: string
 *           description: Doctor's speciality
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the appointment (yyyy-mm-dd)
 *         time:
 *           type: string
 *           description: Time of the appointment
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, completed, rescheduled]
 *           default: pending
 *           description: Status of the appointment
 *         hospitalId:
 *           type: string
 *           description: ID of the hospital
 *         notes:
 *           type: string
 *           description: Additional notes for the appointment
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when appointment was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date when appointment was last updated
 */

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID is required'],
    },
    doctorName: {
      type: String,
      required: [true, 'Doctor name is required'],
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
    },
    speciality: {
      type: String,
      required: [true, 'Speciality is required'],
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date in yyyy-mm-dd format'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'rescheduled'],
      default: 'pending',
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Hospital ID is required'],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;