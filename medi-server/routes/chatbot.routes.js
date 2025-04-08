const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticate } = require('../middleware/auth.middleware');

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
    
    // Prepare conversation history if available
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
    
    res.json({
      success: true,
      data: {
        message: assistantMessage,
        conversationId: conversationId || Date.now().toString() // Generate a new conversation ID if not provided
      }
    });
  } catch (err) {
    console.error('Chatbot error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error communicating with the chatbot service',
      error: err.message 
    });
  }
});

module.exports = router;