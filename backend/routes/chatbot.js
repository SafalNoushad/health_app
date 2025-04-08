const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * @swagger
 * /api/chatbot:
 *   post:
 *     summary: Send message to OpenRouter API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message: { type: string }
 *     responses:
 *       200:
 *         description: Response from OpenRouter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/', async (req, res) => {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a health assistant, only reply with educational contents.',
          },
          {
            role: 'user',
            content: req.body.message, // Use the message from the request body
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;