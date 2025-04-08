const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     HealthCondition:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the health condition record
 *         userId:
 *           type: string
 *           description: ID of the user this health record belongs to
 *         diabetes:
 *           type: boolean
 *           description: Whether the patient has diabetes
 *           default: false
 *         hypertension:
 *           type: boolean
 *           description: Whether the patient has hypertension
 *           default: false
 *         asthma:
 *           type: boolean
 *           description: Whether the patient has asthma
 *           default: false
 *         heartDisease:
 *           type: boolean
 *           description: Whether the patient has heart disease
 *           default: false
 *         arthritis:
 *           type: boolean
 *           description: Whether the patient has arthritis
 *           default: false
 *         chronicKidneyDisease:
 *           type: boolean
 *           description: Whether the patient has chronic kidney disease
 *           default: false
 *         thyroidDisorders:
 *           type: boolean
 *           description: Whether the patient has thyroid disorders
 *           default: false
 *         documents:
 *           type: array
 *           description: Array of medical documents uploaded by the patient
 *           items:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *                 description: Name of the uploaded file
 *               path:
 *                 type: string
 *                 description: Path to the uploaded file
 *               uploadDate:
 *                 type: date
 *                 description: Date when the document was uploaded
 *               description:
 *                 type: string
 *                 description: Description of the document
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when health record was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date when health record was last updated
 */

const healthConditionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    diabetes: {
      type: Boolean,
      default: false,
    },
    hypertension: {
      type: Boolean,
      default: false,
    },
    asthma: {
      type: Boolean,
      default: false,
    },
    heartDisease: {
      type: Boolean,
      default: false,
    },
    arthritis: {
      type: Boolean,
      default: false,
    },
    chronicKidneyDisease: {
      type: Boolean,
      default: false,
    },
    thyroidDisorders: {
      type: Boolean,
      default: false,
    },
    documents: [
      {
        filename: {
          type: String,
          required: true,
        },
        path: {
          type: String,
          required: true,
        },
        uploadDate: {
          type: Date,
          default: Date.now,
        },
        description: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const HealthCondition = mongoose.model('HealthCondition', healthConditionSchema);

module.exports = HealthCondition;