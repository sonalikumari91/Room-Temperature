const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/room_monitor', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// Schema & Model
const sensorSchema = new mongoose.Schema({
    temperature: Number,
    humidity: Number,
    timestamp: { type: Date, default: Date.now },
});

const SensorData = mongoose.model('SensorData', sensorSchema);

// Save data from frontend
app.post('/api/data', async (req, res) => {
    const { temperature, humidity } = req.body;
    const entry = new SensorData({ temperature, humidity });
    await entry.save();
    res.json({ message: 'Data saved successfully!' });
});

// Get latest data
app.get('/api/latest', async (req, res) => {
    const latest = await SensorData.findOne().sort({ timestamp: -1 });
    res.json(latest);
});
app.use(express.static(path.join(__dirname, 'public')));

// Optional: serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Get historical data
app.get('/api/history', async (req, res) => {
    const history = await SensorData.find().sort({ timestamp: 1 }).limit(100);
    res.json(history);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
