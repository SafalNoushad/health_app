const express = require('express');
const router = express.Router();
const Prescription = require('../models/prescription.model');
const { authenticate } = require('../middleware/auth.middleware');
const User = require('../models/user.model');

/**
 * @swagger
 * tags:
 *   name: Prescriptions
 *   description: Prescription management endpoints
 */

/**
 * @swagger
 * /api/prescriptions:
 *   post:
 *     summary: Add a new prescription for a patient
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - medicines
 *             properties:
 *               patientId:
 *                 type: string
 *                 description: ID of the patient receiving the prescription
 *               medicines:
 *                 type: array
 *                 description: List of medicines in the prescription
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - quantity
 *                     - intakeTime
 *                     - duration
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Name of the medicine
 *                     quantity:
 *                       type: string
 *                       description: Quantity of medicine to be taken (e.g., "1 tablet")
 *                     intakeTime:
 *                       type: array
 *                       description: Times of day to take the medicine
 *                       items:
 *                         type: string
 *                         example: "morning"
 *                     duration:
 *                       type: string
 *                       description: Duration of the prescription (e.g., "7 days")
 *                     instructions:
 *                       type: string
 *                       description: Additional instructions for taking the medicine
 *               notes:
 *                 type: string
 *                 description: General notes about the prescription
 *     responses:
 *       201:
 *         description: Prescription created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prescription'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized - only doctors can create prescriptions
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, async (req, res) => {
  try {
    // Only doctors can create prescriptions
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can create prescriptions' });
    }

    const { patientId, medicines, notes } = req.body;

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const prescription = new Prescription({
      patientId,
      doctorId: req.user._id,
      medicines,
      notes
    });

    await prescription.save();

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/prescriptions/patient/{patientId}:
 *   get:
 *     summary: Get all prescriptions for a patient
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the patient
 *     responses:
 *       200:
 *         description: List of prescriptions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prescription'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Access denied - can only view own prescriptions
 *       500:
 *         description: Server error
 */
router.get('/patient/:patientId', authenticate, async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verify access rights (patient can view their own, doctors can view their patients')
    if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const prescriptions = await Prescription.find({ patientId })
      .populate('doctorId', 'name speciality')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/prescriptions/doctor:
 *   get:
 *     summary: Get all prescriptions created by the logged-in doctor
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of prescriptions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prescription'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Access denied - only doctors can access this endpoint
 *       500:
 *         description: Server error
 */
router.get('/doctor', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const prescriptions = await Prescription.find({ doctorId: req.user._id })
      .populate('patientId', 'name')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;