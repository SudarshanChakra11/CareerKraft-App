
import express from 'express';
import {
  createRoadmap,
  getUserRoadmap,
  getRoadmapById,
  getDailyTasks,
  updateProgress,
  regenerateRoadmap,
  deleteRoadmap,
  getCompletionStats,
} from '../controllers/roadmapController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Roadmap API',
    timestamp: new Date().toISOString(),
  });
});



router.post('/generate', authMiddleware, createRoadmap);


router.get('/stats/completion', authMiddleware, getCompletionStats);


router.post('/regenerate', authMiddleware, regenerateRoadmap);


router.get('/user/:userId', authMiddleware, getUserRoadmap);


router.get('/:roadmapId', authMiddleware, getRoadmapById);


router.get('/:roadmapId/daily-tasks', authMiddleware, getDailyTasks);

router.post('/progress', authMiddleware, updateProgress);


router.delete('/:roadmapId', authMiddleware, deleteRoadmap);



router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Roadmap endpoint not found: ${req.method} ${req.path}`,
    availableEndpoints: [
      'POST /api/roadmap/generate',
      'GET /api/roadmap/stats/completion',
      'POST /api/roadmap/regenerate',
      'GET /api/roadmap/user/:userId',
      'GET /api/roadmap/:roadmapId',
      'GET /api/roadmap/:roadmapId/daily-tasks?day=1',
      'POST /api/roadmap/progress',
      'DELETE /api/roadmap/:roadmapId',
    ],
  });
});

export default router;