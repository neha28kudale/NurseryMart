const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const sharp = require('sharp');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key');

// @route   POST /api/plant-care/analyze
// @desc    Analyze plant photo and provide care tips
// @access  Private
router.post('/analyze', authenticateToken, upload.single('plantImage'), [
  body('plantName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Plant name must be between 2 and 100 characters'),
  body('additionalInfo')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Additional information cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Plant image is required'
      });
    }

    const { plantName, additionalInfo } = req.body;

    // Process image with Sharp
    const processedImage = await sharp(req.file.buffer)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Convert to base64
    const base64Image = processedImage.toString('base64');
    const mimeType = req.file.mimetype;

    // Prepare prompt for AI
    let prompt = `You are an expert plant care specialist. Analyze this plant image and provide detailed care instructions.`;
    
    if (plantName) {
      prompt += ` The plant appears to be a ${plantName}.`;
    }
    
    if (additionalInfo) {
      prompt += ` Additional context: ${additionalInfo}`;
    }
    
    prompt += ` Please provide:
    1. Plant identification (if possible)
    2. Watering schedule and requirements
    3. Light requirements
    4. Soil type recommendations
    5. Fertilizing schedule
    6. Common problems and solutions
    7. Seasonal care tips
    8. Repotting recommendations
    
    Be specific, practical, and easy to understand. Format your response in a clear, structured way.`;

    try {
      // Get the generative model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Generate content
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        }
      ]);

      const response = await result.response;
      const careTips = response.text();

      res.json({
        success: true,
        data: {
          careTips,
          plantName: plantName || 'Unknown',
          analyzedAt: new Date().toISOString(),
          imageProcessed: true
        }
      });

    } catch (aiError) {
      console.error('AI Analysis Error:', aiError);
      
      // Fallback response if AI fails
      const fallbackTips = `
        I apologize, but I'm having trouble analyzing your plant image at the moment. 
        However, here are some general plant care tips:
        
        🌱 **General Plant Care Guidelines:**
        
        **Watering:**
        - Check soil moisture by inserting your finger 1-2 inches deep
        - Water when the top inch of soil feels dry
        - Water thoroughly until it drains from the bottom
        - Avoid overwatering - most plants prefer slightly dry to soggy
        
        **Light:**
        - Most houseplants prefer bright, indirect light
        - Avoid direct sunlight which can burn leaves
        - Rotate plants weekly for even growth
        
        **Soil & Fertilizing:**
        - Use well-draining potting mix
        - Fertilize monthly during growing season (spring/summer)
        - Reduce fertilizing in fall/winter
        
        **Common Issues:**
        - Yellow leaves often indicate overwatering
        - Brown tips suggest low humidity or over-fertilizing
        - Drooping leaves may mean underwatering
        
        Please try uploading a clearer image or contact our support for more specific advice.
      `;

      res.json({
        success: true,
        data: {
          careTips: fallbackTips,
          plantName: plantName || 'Unknown',
          analyzedAt: new Date().toISOString(),
          imageProcessed: false,
          note: 'AI analysis temporarily unavailable, showing general care tips'
        }
      });
    }

  } catch (error) {
    console.error('Plant care analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze plant image. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/plant-care/tips
// @desc    Get general plant care tips by category
// @access  Public
router.get('/tips', async (req, res) => {
  try {
    const { category } = req.query;
    
    const tipsByCategory = {
      indoor: {
        title: "Indoor Plant Care Tips",
        tips: [
          "Water when soil feels dry 1-2 inches deep",
          "Provide bright, indirect light",
          "Maintain humidity with pebble trays or humidifiers",
          "Rotate plants weekly for even growth",
          "Clean leaves regularly to remove dust",
          "Use well-draining potting mix",
          "Fertilize monthly during growing season"
        ]
      },
      outdoor: {
        title: "Outdoor Plant Care Tips",
        tips: [
          "Water deeply but less frequently",
          "Mulch around plants to retain moisture",
          "Provide adequate spacing for air circulation",
          "Check for pests and diseases regularly",
          "Prune dead or damaged branches",
          "Protect from extreme weather conditions",
          "Choose plants suitable for your climate zone"
        ]
      },
      herbs: {
        title: "Herb Garden Care Tips",
        tips: [
          "Harvest regularly to encourage growth",
          "Pinch off flowers to maintain leaf production",
          "Water at soil level to avoid wetting leaves",
          "Provide 6-8 hours of sunlight daily",
          "Use well-draining soil with compost",
          "Trim back leggy growth",
          "Divide perennials every 2-3 years"
        ]
      },
      flowering: {
        title: "Flowering Plant Care Tips",
        tips: [
          "Deadhead spent flowers to encourage blooming",
          "Provide adequate light for flowering",
          "Use bloom-boosting fertilizer",
          "Maintain consistent watering schedule",
          "Prune after flowering season",
          "Protect from frost and extreme temperatures",
          "Ensure good air circulation"
        ]
      }
    };

    if (category && tipsByCategory[category]) {
      res.json({
        success: true,
        data: tipsByCategory[category]
      });
    } else {
      res.json({
        success: true,
        data: {
          title: "General Plant Care Tips",
          categories: Object.keys(tipsByCategory),
          message: "Use ?category=indoor|outdoor|herbs|flowering to get specific tips"
        }
      });
    }

  } catch (error) {
    console.error('Plant care tips error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plant care tips'
    });
  }
});

module.exports = router;
