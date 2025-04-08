const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticate } = require('../middleware/auth.middleware');
const Conversation = require('../models/conversation.model');
const mongoose = require('mongoose');

/**
 * @swagger
 * tags:
 *   name: Chatbot
 *   description: Patient health assistant chatbot
 */

/**
 * @swagger
 * /api/chatbot:
 *   post:
 *     summary: Send message to health assistant chatbot
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: User's message to the chatbot
 *               conversationId:
 *                 type: string
 *                 description: Optional conversation ID for maintaining context
 *     responses:
 *       200:
 *         description: Response from the chatbot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     conversationId:
 *                       type: string
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    
    // Use the helper function to process the message
    const result = await processChatbotMessage(req, res, message, conversationId);
    res.json(result);
  } catch (err) {
    console.error('Chatbot error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error communicating with the chatbot service',
      error: err.message 
    });
  }
});

/**
 * @swagger
 * /api/chatbot/conversations:
 *   get:
 *     summary: Get user's conversation history
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 conversations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const conversations = await Conversation.find({ 
      userId: req.user._id,
      isActive: true
    })
    .select('_id title createdAt updatedAt')
    .sort({ updatedAt: -1 });
    
    res.json({
      success: true,
      conversations
    });
  } catch (err) {
    console.error('Error fetching conversations:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching conversation history'
    });
  }
});

/**
 * @swagger
 * /api/chatbot/conversations/{id}:
 *   get:
 *     summary: Get a specific conversation
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 conversation:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           role:
 *                             type: string
 *                           content:
 *                             type: string
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Server error
 */
router.get('/conversations/:id', authenticate, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid conversation ID format'
      });
    }
    
    const conversation = await Conversation.findOne({ 
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });
    
    if (!conversation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Conversation not found'
      });
    }
    
    res.json({
      success: true,
      conversation
    });
  } catch (err) {
    console.error('Error fetching conversation:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching conversation'
    });
  }
});

/**
 * @swagger
 * /api/chatbot/conversations/{id}:
 *   delete:
 *     summary: Delete a conversation
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation deleted successfully
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
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Server error
 */
router.delete('/conversations/:id', authenticate, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid conversation ID format'
      });
    }
    
    // Soft delete by setting isActive to false
    const result = await Conversation.findOneAndUpdate(
      { 
        _id: req.params.id,
        userId: req.user._id
      },
      { isActive: false },
      { new: true }
    );
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: 'Conversation not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting conversation:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting conversation'
    });
  }
});

/**
 * @swagger
 * /api/chatbot/health-query:
 *   post:
 *     summary: Send a specialized health-related query
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - queryType
 *             properties:
 *               queryType:
 *                 type: string
 *                 enum: [symptoms, medication, prevention, nutrition, exercise]
 *                 description: Type of health query
 *               specificQuery:
 *                 type: string
 *                 description: Additional specific details for the query
 *               conversationId:
 *                 type: string
 *                 description: Optional conversation ID for maintaining context
 *     responses:
 *       200:
 *         description: Response from the chatbot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     conversationId:
 *                       type: string
 *       400:
 *         description: Invalid query type
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
// Helper function to process chatbot messages
async function processChatbotMessage(req, res, message, conversationId) {
  try {
    let conversation;
    let previousMessages = [];
    
    // If conversationId is provided, retrieve the conversation
    if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
      conversation = await Conversation.findOne({ 
        _id: conversationId,
        userId: req.user._id,
        isActive: true
      });
      
      if (conversation) {
        // Get the last 10 messages for context
        previousMessages = conversation.messages
          .slice(-10)
          .map(msg => ({ role: msg.role, content: msg.content }));
      }
    }
    
    // Prepare conversation history
    let messages = [
      {
        role: 'system',
        content: 'You are a medical assistant for patients. Provide accurate, educational health information. Do not diagnose, but help patients understand medical concepts, healthy habits, and when they should consult a healthcare professional. Always clarify you are an AI assistant and not a doctor.'
      }
    ];
    
    // Add user context information if available
    if (req.user) {
      messages[0].content += ` The user's name is ${req.user.name} and their role is ${req.user.role}.`;
    }
    
    // Add previous messages for context if available
    if (previousMessages.length > 0) {
      messages = [...messages, ...previousMessages];
    }
    
    // Add the current message
    messages.push({
      role: 'user',
      content: message
    });
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-4o',
        messages: messages,
        max_tokens: 800,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    // Extract the assistant's response
    const assistantMessage = response.data.choices[0].message.content;
    
    // Save the conversation
    if (!conversation) {
      // Create a new conversation
      conversation = new Conversation({
        userId: req.user._id,
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        messages: [
          {
            role: 'user',
            content: message
          },
          {
            role: 'assistant',
            content: assistantMessage
          }
        ]
      });
    } else {
      // Update existing conversation
      conversation.messages.push(
        {
          role: 'user',
          content: message
        },
        {
          role: 'assistant',
          content: assistantMessage
        }
      );
      conversation.updatedAt = Date.now();
    }
    
    await conversation.save();
    
    return {
      success: true,
      data: {
        message: assistantMessage,
        conversationId: conversation._id
      }
    };
  } catch (err) {
    console.error('Chatbot error:', err.message);
    throw err;
  }
}

router.post('/health-query', authenticate, async (req, res) => {
  try {
    const { queryType, specificQuery, conversationId } = req.body;
    
    // Validate query type
    const validQueryTypes = ['symptoms', 'medication', 'prevention', 'nutrition', 'exercise'];
    if (!validQueryTypes.includes(queryType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query type. Must be one of: ' + validQueryTypes.join(', ')
      });
    }
    
    // Prepare template based on query type
    let queryTemplate = '';
    switch (queryType) {
      case 'symptoms':
        queryTemplate = `What are the common symptoms of ${specificQuery || 'this health condition'}? What should I watch for and when should I see a doctor?`;
        break;
      case 'medication':
        queryTemplate = `Can you provide general information about ${specificQuery || 'this medication'}? What is it typically used for and what are common side effects?`;
        break;
      case 'prevention':
        queryTemplate = `What are effective prevention strategies for ${specificQuery || 'this health condition'}? What lifestyle changes might help?`;
        break;
      case 'nutrition':
        queryTemplate = `What nutritional recommendations are there for ${specificQuery || 'general health'}? What foods should I include or avoid?`;
        break;
      case 'exercise':
        queryTemplate = `What exercise recommendations are appropriate for ${specificQuery || 'general health'}? What precautions should I take?`;
        break;
    }
    
    // Process the message using our helper function
    const result = await processChatbotMessage(req, res, queryTemplate, conversationId);
    res.json(result);
    
  } catch (err) {
    console.error('Health query error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing health query',
      error: err.message 
    });
  }
});

module.exports = router;