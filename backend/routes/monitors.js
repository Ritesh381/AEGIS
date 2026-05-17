import { Router } from 'express';
import { db } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * POST /v1/monitors
 * Creates a new Living Contract Monitor with deadline events.
 */
router.post('/', async (req, res) => {
  try {
    const { analysis_id, contract_name, events } = req.body;
    const userId = req.user?.uid || 'anonymous';

    if (!analysis_id || !contract_name || !events || !events.length) {
      return res.status(400).json({
        error: 'analysis_id, contract_name, and events (array) are required.',
      });
    }

    // Validate events
    for (const event of events) {
      if (!event.type || !event.date) {
        return res.status(400).json({ error: 'Each event must have a type and date.' });
      }
    }

    const monitorId = `mon_${uuidv4().replace(/-/g, '').slice(0, 12)}`;

    await db.collection('monitors').doc(monitorId).set({
      monitorId,
      userId,
      analysisId: analysis_id,
      contractName: contract_name,
      events: events.map((e) => ({
        type: e.type,
        date: e.date,
        reminderDays: e.reminder_days || [30, 7, 1],
        messageTemplate: e.message_template || `Your contract event "${e.type}" is approaching.`,
        lastNotified: null,
      })),
      active: true,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ monitor_id: monitorId, status: 'active' });
  } catch (error) {
    console.error('Create monitor error:', error);
    res.status(500).json({ error: 'Failed to create monitor.' });
  }
});

/**
 * GET /v1/monitors
 * Lists all active monitors for the authenticated user.
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.uid || 'anonymous';
    const snapshot = await db
      .collection('monitors')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const monitors = snapshot.docs.map((doc) => ({
      ...doc.data(),
    }));

    res.json({ monitors });
  } catch (error) {
    console.error('List monitors error:', error);
    res.status(500).json({ error: 'Failed to list monitors.' });
  }
});

/**
 * DELETE /v1/monitors/:monitorId
 * Deactivates a monitor.
 */
router.delete('/:monitorId', async (req, res) => {
  try {
    const { monitorId } = req.params;
    const userId = req.user?.uid || 'anonymous';

    const doc = await db.collection('monitors').doc(monitorId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Monitor not found.' });
    }

    if (doc.data().userId !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await db.collection('monitors').doc(monitorId).update({ active: false });
    res.status(200).json({ status: 'deactivated' });
  } catch (error) {
    console.error('Delete monitor error:', error);
    res.status(500).json({ error: 'Failed to deactivate monitor.' });
  }
});

export default router;
