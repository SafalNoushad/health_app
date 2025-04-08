const express = require('express');
const router = express.Router();
const Hospital = require('../models/hospital.model');
const User = require('../models/user.model');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Hospitals
 *   description: Hospital management endpoints
 */

/**
 * @swagger
 * /api/hospitals:
 *   post:
 *     summary: Create a new hospital (admin only)
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               website:
 *                 type: string
 *     responses:
 *       201:
 *         description: Hospital created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 hospital:
 *                   $ref: '#/components/schemas/Hospital'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as admin
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, address, phone, email, website } = req.body;
    
    // Validate required fields
    if (!name || !address) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and address are required' 
      });
    }
    
    // Create hospital
    const hospital = new Hospital({
      name,
      address,
      phone,
      email,
      website
    });
    
    await hospital.save();
    
    res.status(201).json({
      success: true,
      message: 'Hospital created successfully',
      hospital
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/hospitals:
 *   get:
 *     summary: Get all hospitals
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all hospitals
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 hospitals:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Hospital'
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.status(200).json({ success: true, hospitals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/hospitals/{id}:
 *   get:
 *     summary: Get hospital by ID
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hospital ID
 *     responses:
 *       200:
 *         description: Hospital details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 hospital:
 *                   $ref: '#/components/schemas/Hospital'
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }
    
    res.status(200).json({ success: true, hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/hospitals/{id}:
 *   put:
 *     summary: Update hospital (admin only)
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hospital ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               website:
 *                 type: string
 *     responses:
 *       200:
 *         description: Hospital updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 hospital:
 *                   $ref: '#/components/schemas/Hospital'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as admin
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, address, phone, email, website } = req.body;
    
    const hospital = await Hospital.findById(req.params.id);
    
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }
    
    // Update hospital
    const updatedHospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { $set: { name, address, phone, email, website } },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Hospital updated successfully',
      hospital: updatedHospital
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/hospitals/{id}:
 *   delete:
 *     summary: Delete hospital (admin only)
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hospital ID
 *     responses:
 *       200:
 *         description: Hospital deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as admin
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }
    
    // Check if there are doctors associated with this hospital
    const doctorsCount = await User.countDocuments({ hospitalId: req.params.id, role: 'doctor' });
    
    if (doctorsCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete hospital with associated doctors. Reassign or delete doctors first.' 
      });
    }
    
    await Hospital.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Hospital deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/hospitals/{id}/doctors:
 *   get:
 *     summary: Get all doctors in a hospital
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hospital ID
 *     responses:
 *       200:
 *         description: List of doctors in the hospital
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 doctors:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Server error
 */
router.get('/:id/doctors', authenticate, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }
    
    const doctors = await User.find({ 
      hospitalId: req.params.id, 
      role: 'doctor' 
    }).select('-password');
    
    res.status(200).json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/hospitals/{id}/doctors:
 *   post:
 *     summary: Add a doctor to a hospital (admin only)
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hospital ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *             properties:
 *               doctorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Doctor added to hospital successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 doctor:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as admin
 *       404:
 *         description: Hospital or doctor not found
 *       500:
 *         description: Server error
 */
router.post('/:id/doctors', authenticate, isAdmin, async (req, res) => {
  try {
    const { doctorId } = req.body;
    
    if (!doctorId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Doctor ID is required' 
      });
    }
    
    const hospital = await Hospital.findById(req.params.id);
    
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }
    
    const doctor = await User.findById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    if (doctor.role !== 'doctor') {
      return res.status(400).json({ 
        success: false, 
        message: 'User is not a doctor' 
      });
    }
    
    // Update doctor's hospital
    doctor.hospitalId = req.params.id;
    await doctor.save();
    
    // Return doctor without password
    const doctorResponse = doctor.toObject();
    delete doctorResponse.password;
    
    res.status(200).json({
      success: true,
      message: 'Doctor added to hospital successfully',
      doctor: doctorResponse
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;