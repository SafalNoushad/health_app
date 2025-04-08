const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const HealthCondition = require('../models/health.model');
const { authenticate } = require('../middleware/auth.middleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '%20'));
  }
});

// File filter to only allow PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Health conditions and document management endpoints
 */

/**
 * @swagger
 * /api/health:
 *   post:
 *     summary: Create or update health conditions for a patient
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               diabetes:
 *                 type: boolean
 *               hypertension:
 *                 type: boolean
 *               asthma:
 *                 type: boolean
 *               heartDisease:
 *                 type: boolean
 *               arthritis:
 *                 type: boolean
 *               chronicKidneyDisease:
 *                 type: boolean
 *               thyroidDisorders:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Health conditions updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 healthCondition:
 *                   $ref: '#/components/schemas/HealthCondition'
 *       201:
 *         description: Health conditions created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 healthCondition:
 *                   $ref: '#/components/schemas/HealthCondition'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, async (req, res) => {
  try {
    // Only patients can update their health conditions
    if (req.user.role !== 'patient') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only patients can update health conditions' 
      });
    }

    const { 
      diabetes, 
      hypertension, 
      asthma, 
      heartDisease, 
      arthritis, 
      chronicKidneyDisease, 
      thyroidDisorders 
    } = req.body;

    // Find existing health condition or create new one
    let healthCondition = await HealthCondition.findOne({ userId: req.user._id });
    
    if (healthCondition) {
      // Update existing record
      healthCondition = await HealthCondition.findOneAndUpdate(
        { userId: req.user._id },
        { 
          $set: { 
            diabetes, 
            hypertension, 
            asthma, 
            heartDisease, 
            arthritis, 
            chronicKidneyDisease, 
            thyroidDisorders 
          } 
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Health conditions updated successfully',
        healthCondition
      });
    } else {
      // Create new record
      healthCondition = new HealthCondition({
        userId: req.user._id,
        diabetes, 
        hypertension, 
        asthma, 
        heartDisease, 
        arthritis, 
        chronicKidneyDisease, 
        thyroidDisorders
      });

      await healthCondition.save();

      return res.status(201).json({
        success: true,
        message: 'Health conditions created successfully',
        healthCondition
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Get health conditions for the authenticated patient
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Health conditions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 healthCondition:
 *                   $ref: '#/components/schemas/HealthCondition'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Health conditions not found
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, async (req, res) => {
  try {
    // Only patients can view their own health conditions or doctors/admins can view any
    const healthCondition = await HealthCondition.findOne({ userId: req.user._id });
    
    if (!healthCondition) {
      return res.status(404).json({ 
        success: false, 
        message: 'Health conditions not found for this user' 
      });
    }
    
    res.status(200).json({
      success: true,
      healthCondition
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/health/patient/{id}:
 *   get:
 *     summary: Get health conditions for a specific patient (doctors and admins only)
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Health conditions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 healthCondition:
 *                   $ref: '#/components/schemas/HealthCondition'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Health conditions not found
 *       500:
 *         description: Server error
 */
router.get('/patient/:id', authenticate, async (req, res) => {
  try {
    // Only doctors and admins can view other patients' health conditions
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this data' 
      });
    }

    const healthCondition = await HealthCondition.findOne({ userId: req.params.id });
    
    if (!healthCondition) {
      return res.status(404).json({ 
        success: false, 
        message: 'Health conditions not found for this patient' 
      });
    }
    
    res.status(200).json({
      success: true,
      healthCondition
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/health/documents:
 *   post:
 *     summary: Upload medical documents (PDF only)
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: PDF document to upload
 *               description:
 *                 type: string
 *                 description: Description of the document
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 document:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                     path:
 *                       type: string
 *                     uploadDate:
 *                       type: string
 *                       format: date-time
 *                     description:
 *                       type: string
 *       400:
 *         description: Invalid file format or missing file
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/documents', authenticate, upload.single('document'), async (req, res) => {
  try {
    // Only patients can upload their documents
    if (req.user.role !== 'patient') {
      // Remove uploaded file if user is not a patient
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(403).json({ 
        success: false, 
        message: 'Only patients can upload documents' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No document uploaded' 
      });
    }

    const newDocument = {
      filename: req.file.filename,
      path: req.file.path,
      uploadDate: new Date(),
      description: req.body.description || ''
    };

    // Find existing health condition or create new one
    let healthCondition = await HealthCondition.findOne({ userId: req.user._id });
    
    if (healthCondition) {
      // Add document to existing record
      healthCondition = await HealthCondition.findOneAndUpdate(
        { userId: req.user._id },
        { $push: { documents: newDocument } },
        { new: true }
      );
    } else {
      // Create new health condition record with document
      healthCondition = new HealthCondition({
        userId: req.user._id,
        documents: [newDocument]
      });

      await healthCondition.save();
    }

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      document: newDocument
    });
  } catch (error) {
    // Remove uploaded file if there's an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/health/documents:
 *   get:
 *     summary: Get all documents for the authenticated patient
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 documents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       filename:
 *                         type: string
 *                       path:
 *                         type: string
 *                       uploadDate:
 *                         type: string
 *                         format: date-time
 *                       description:
 *                         type: string
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: No documents found
 *       500:
 *         description: Server error
 */
router.get('/documents', authenticate, async (req, res) => {
  try {
    const healthCondition = await HealthCondition.findOne({ userId: req.user._id });
    
    if (!healthCondition || !healthCondition.documents || healthCondition.documents.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No documents found for this user' 
      });
    }
    
    res.status(200).json({
      success: true,
      documents: healthCondition.documents
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/health/documents/{documentId}:
 *   delete:
 *     summary: Delete a specific document
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document deleted successfully
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
 *         description: Document not found
 *       500:
 *         description: Server error
 */
router.delete('/documents/:documentId', authenticate, async (req, res) => {
  try {
    const healthCondition = await HealthCondition.findOne({ 
      userId: req.user._id,
      'documents._id': req.params.documentId 
    });
    
    if (!healthCondition) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }
    
    // Find the document to get its path
    const document = healthCondition.documents.find(
      doc => doc._id.toString() === req.params.documentId
    );
    
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }
    
    // Delete the file from the filesystem
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }
    
    // Remove the document from the database
    await HealthCondition.updateOne(
      { userId: req.user._id },
      { $pull: { documents: { _id: req.params.documentId } } }
    );
    
    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;