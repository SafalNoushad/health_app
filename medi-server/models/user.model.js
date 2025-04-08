const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - role
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the user
 *         name:
 *           type: string
 *           description: User's full name
 *         email:
 *           type: string
 *           description: User's email address
 *           unique: true
 *         password:
 *           type: string
 *           description: User's password (hashed)
 *         role:
 *           type: string
 *           description: User's role in the system
 *           enum: [patient, doctor, admin]
 *         phone:
 *           type: string
 *           description: User's phone number
 *         address:
 *           type: string
 *           description: User's address
 *         speciality:
 *           type: string
 *           description: Doctor's speciality (only for doctors)
 *         hospitalId:
 *           type: string
 *           description: Hospital ID where doctor works (only for doctors)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date when user was last updated
 */

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      default: 'patient',
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    speciality: {
      type: String,
      trim: true,
      // Only required for doctors
      validate: {
        validator: function(v) {
          return this.role !== 'doctor' || (this.role === 'doctor' && v);
        },
        message: 'Speciality is required for doctors'
      }
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      // Only for doctors
      validate: {
        validator: function(v) {
          return this.role !== 'doctor' || (this.role === 'doctor' && v);
        },
        message: 'Hospital ID is required for doctors'
      }
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;