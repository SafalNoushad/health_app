const express = require('express');
const router = express.Router();
const RFID = require('../models/rfid.model');
const User = require('../models/user.model');
const { authenticate, isAdmin, isAdminOrDoctor } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: RFID
 *   description: RFID card management endpoints
 */

/**
 * @swagger
 * /api/rfid/assign:
 *   post:
 *     summary: Assign RFID card to a patient (admin or doctor only)
 *     tags: [RFID]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rfidNumber
 *               - userId
 *             properties:
 *               rfidNumber:
 *                 type: string
 *                 description: RFID card number
 *               userId:
 *                 type: string
 *                 description: User ID (patient) to assign the RFID card to
 *     responses:
 *       201:
 *         description: RFID card assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 rfid:
 *                   $ref: '#/components/schemas/RFID'
 *       400:
 *         description: Invalid input or RFID already assigned
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/assign', authenticate, isAdminOrDoctor, async (req, res) => {
  try {
    const { rfidNumber, userId } = req.body;

    // Validate input
    if (!rfidNumber || !userId) {
      return res.status(400).json({ success: false, message: 'RFID number and User ID are required' });
    }

    // Check if RFID is already assigned
    const existingRFID = await RFID.findOne({ rfidNumber });
    if (existingRFID) {
      return res.status(400).json({ success: false, message: 'RFID card is already assigned' });
    }

    // Check if user exists and is a patient
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'patient') {
      return res.status(400).json({ success: false, message: 'RFID cards can only be assigned to patients' });
    }

    // Check if user already has an RFID card
    const userRFID = await RFID.findOne({ userId });
    if (userRFID) {
      return res.status(400).json({ success: false, message: 'User already has an RFID card assigned' });
    }

    // Create new RFID assignment
    const rfid = new RFID({
      rfidNumber,
      userId,
      assignedBy: req.user._id,
    });

    await rfid.save();

    res.status(201).json({
      success: true,
      message: 'RFID card assigned successfully',
      rfid,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/rfid/user/{rfidNumber}:
 *   get:
 *     summary: Get user details by RFID number
 *     tags: [RFID]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rfidNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: RFID card number
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: RFID card or user not found
 *       500:
 *         description: Server error
 */
router.get('/user/:rfidNumber', authenticate, async (req, res) => {
  try {
    const { rfidNumber } = req.params;

    // Find RFID record
    const rfid = await RFID.findOne({ rfidNumber });
    if (!rfid) {
      return res.status(404).json({ success: false, message: 'RFID card not found' });
    }

    // Find associated user
    const user = await User.findById(rfid.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/rfid:
 *   get:
 *     summary: Get all RFID assignments (admin only)
 *     tags: [RFID]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all RFID assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 rfids:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RFID'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const rfids = await RFID.find().populate('userId', 'name email').populate('assignedBy', 'name email');
    res.status(200).json({ success: true, rfids });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/rfid/{id}:
 *   get:
 *     summary: Get RFID assignment by ID
 *     tags: [RFID]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: RFID assignment ID
 *     responses:
 *       200:
 *         description: RFID assignment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 rfid:
 *                   $ref: '#/components/schemas/RFID'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: RFID assignment not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const rfid = await RFID.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('assignedBy', 'name email');
    
    if (!rfid) {
      return res.status(404).json({ success: false, message: 'RFID assignment not found' });
    }
    
    res.status(200).json({ success: true, rfid });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/rfid/{id}:
 *   put:
 *     summary: Update RFID assignment (admin or doctor only)
 *     tags: [RFID]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: RFID assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rfidNumber:
 *                 type: string
 *               userId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: RFID assignment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 rfid:
 *                   $ref: '#/components/schemas/RFID'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: RFID assignment not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticate, isAdminOrDoctor, async (req, res) => {
  try {
    const { rfidNumber, userId, isActive } = req.body;
    
    // Check if RFID exists
    const rfid = await RFID.findById(req.params.id);
    if (!rfid) {
      return res.status(404).json({ success: false, message: 'RFID assignment not found' });
    }
    
    // If changing RFID number, check if new number is already in use
    if (rfidNumber && rfidNumber !== rfid.rfidNumber) {
      const existingRFID = await RFID.findOne({ rfidNumber });
      if (existingRFID) {
        return res.status(400).json({ success: false, message: 'RFID number is already in use' });
      }
      rfid.rfidNumber = rfidNumber;
    }
    
    // If changing user, check if user exists and is a patient
    if (userId && userId !== rfid.userId.toString()) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      if (user.role !== 'patient') {
        return res.status(400).json({ success: false, message: 'RFID cards can only be assigned to patients' });
      }
      rfid.userId = userId;
    }
    
    // Update isActive status if provided
    if (isActive !== undefined) {
      rfid.isActive = isActive;
    }
    
    // Update assignedBy to current user
    rfid.assignedBy = req.user._id;
    
    await rfid.save();
    
    res.status(200).json({
      success: true,
      message: 'RFID assignment updated successfully',
      rfid,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/rfid/{id}:
 *   delete:
 *     summary: Delete RFID assignment (admin only)
 *     tags: [RFID]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: RFID assignment ID
 *     responses:
 *       200:
 *         description: RFID assignment deleted successfully
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
 *         description: Not authorized
 *       404:
 *         description: RFID assignment not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const rfid = await RFID.findById(req.params.id);
    if (!rfid) {
      return res.status(404).json({ success: false, message: 'RFID assignment not found' });
    }
    
    await RFID.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'RFID assignment deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;