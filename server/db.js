const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const RECORDS_FILE = path.join(DATA_DIR, 'records.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function genId() {
  return Math.random().toString(36).substr(2, 9);
}

function loadJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// --- Config ---
function getConfig() {
  return loadJSON(CONFIG_FILE, null);
}

function initConfig() {
  const defaultAwards = [
    { id: genId(), name: '一等奖', color: '#E74C3C', weight: 10 },
    { id: genId(), name: '二等奖', color: '#F5A623', weight: 20 },
    { id: genId(), name: '三等奖', color: '#E8734A', weight: 30 },
    { id: genId(), name: '谢谢参与', color: '#F7DC6F', weight: 40 }
  ];
  const cfg = { awardList: defaultAwards, forceQueue: [], rotateTime: 5 };
  saveJSON(CONFIG_FILE, cfg);
  return cfg;
}

function saveConfig(cfg) {
  saveJSON(CONFIG_FILE, cfg);
}

// Init on first load
if (!getConfig()) initConfig();

// --- Records ---
function getRecords() {
  const data = loadJSON(RECORDS_FILE, null);
  return data && Array.isArray(data.recordList) ? data : { recordList: [] };
}

function addRecord(record) {
  const data = getRecords();
  data.recordList.unshift(record);
  saveJSON(RECORDS_FILE, data);
}

function clearRecords() {
  saveJSON(RECORDS_FILE, { recordList: [] });
}

module.exports = { getConfig, saveConfig, initConfig, getRecords, addRecord, clearRecords, genId };
