const express = require('express');
const db = require('./db');
const { authMiddleware } = require('./auth');

const router = express.Router();

// ===== Public: Get config =====
router.get('/config', (req, res) => {
  const cfg = db.getConfig() || db.initConfig();
  res.json({
    awardList: cfg.awardList,
    forceQueue: cfg.forceQueue || [],
    rotateTime: cfg.rotateTime || 5
  });
});

// ===== Public: Execute draw =====
router.post('/draw', (req, res) => {
  const cfg = db.getConfig();
  const awardList = cfg.awardList;

  if (awardList.length < 2) {
    return res.status(400).json({ error: '至少2个奖项可抽奖' });
  }

  let targetAward, type = 'random';
  const forceQueue = cfg.forceQueue || [];

  // Check force queue
  if (forceQueue.length > 0) {
    const queuedId = forceQueue[0];
    targetAward = awardList.find(a => a.id === queuedId);
    if (targetAward) {
      type = 'force';
      forceQueue.shift();
      cfg.forceQueue = forceQueue;
      db.saveConfig(cfg);
    }
  }

  // Random draw
  if (!targetAward) {
    const totalWeight = awardList.reduce((s, a) => s + a.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const award of awardList) {
      rand -= award.weight;
      if (rand <= 0) { targetAward = award; break; }
    }
    if (!targetAward) targetAward = awardList[awardList.length - 1];
  }

  // Save record
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  db.addRecord({
    id: db.genId(),
    awardName: targetAward.name,
    type,
    time: timeStr
  });

  res.json({ award: targetAward, type });
});

// ===== Public: Get records =====
router.get('/records', (req, res) => {
  const data = db.getRecords();
  res.json(data);
});

// ===== Admin: Login =====
router.post('/admin/login', (req, res) => {
  const { ADMIN_PASSWORD, JWT_SECRET } = require('./auth');
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: '密码错误' });
  }
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

// ===== Admin: Update config =====
router.put('/admin/config', authMiddleware, (req, res) => {
  const { awardList, rotateTime } = req.body;
  if (!Array.isArray(awardList) || awardList.length < 2) {
    return res.status(400).json({ error: '至少需要2个奖项' });
  }
  for (const a of awardList) {
    if (!a.name || typeof a.weight !== 'number') {
      return res.status(400).json({ error: '奖项数据格式错误' });
    }
    a.weight = Math.max(1, Math.min(100, Math.round(a.weight)));
    if (!a.id) a.id = db.genId();
    if (!a.color) a.color = '#999';
  }
  const cfg = db.getConfig() || {};
  cfg.awardList = awardList;
  cfg.rotateTime = rotateTime || 5;
  db.saveConfig(cfg);
  res.json({ success: true });
});

// ===== Admin: Reset config =====
router.post('/admin/config/reset', authMiddleware, (req, res) => {
  const cfg = db.initConfig();
  res.json({ success: true, config: cfg });
});

// ===== Admin: Force queue =====
router.get('/admin/force-queue', authMiddleware, (req, res) => {
  const cfg = db.getConfig() || {};
  res.json({ queue: cfg.forceQueue || [] });
});

router.post('/admin/force-queue', authMiddleware, (req, res) => {
  const { queue } = req.body;
  if (!Array.isArray(queue)) {
    return res.status(400).json({ error: '队列格式错误' });
  }
  const cfg = db.getConfig() || {};
  cfg.forceQueue = queue;
  db.saveConfig(cfg);
  res.json({ success: true });
});

// ===== Admin: Clear records =====
router.delete('/admin/records', authMiddleware, (req, res) => {
  db.clearRecords();
  res.json({ success: true });
});

module.exports = router;
