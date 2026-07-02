const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require("socket.io");
const mysql = require('mysql2/promise');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0';
const port = parseInt(process.env.PORT || '3777', 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Database connection for the Socket server
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'smartbaby',
  database: process.env.DB_NAME || 'smartbabyscale_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Throttling State: { patientId: { vitals: [], lastInsert: timestamp, lastPrediction: null } }
const sessionStats = {};

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      if (pathname === '/a') {
        await app.render(req, res, '/a', query);
      } else if (pathname === '/b') {
        await app.render(req, res, '/b', query);
      } else {
        await handle(req, res, parsedUrl);
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('sensor_data', (data) => {
      // Broadcast to frontend instantly for real-time Dashboard updates
      io.emit('sensor_update', data);

      // Throttled Database Logging (60 seconds)
      const patientId = data?.demographics?.patient_id;
      if (patientId && data.vitals && data.prediction) {
        if (!sessionStats[patientId]) {
          sessionStats[patientId] = { vitals: [], lastInsert: Date.now(), lastPrediction: null };
        }
        
        sessionStats[patientId].vitals.push(data.vitals);
        sessionStats[patientId].lastPrediction = data.prediction;
        
        // If 60 seconds have passed, average and insert
        if (Date.now() - sessionStats[patientId].lastInsert >= 60000) {
          const v = sessionStats[patientId].vitals;
          if (v.length > 0) {
            const avgW = v.reduce((sum, curr) => sum + curr.weight_g, 0) / v.length;
            const avgL = v.reduce((sum, curr) => sum + curr.length_cm, 0) / v.length;
            const avgT = v.reduce((sum, curr) => sum + curr.temperature_celsius, 0) / v.length;
            const avgHR = v.reduce((sum, curr) => sum + curr.heart_rate_bpm, 0) / v.length;
            const avgSp = v.reduce((sum, curr) => sum + curr.spo2_percent, 0) / v.length;
            
            const pred = sessionStats[patientId].lastPrediction;
            
            // Background async insert
            pool.execute(
              `INSERT INTO vital_records (patient_id, weight_grams, length_cm, temperature_celsius, heart_rate_bpm, spo2_percent) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [patientId, avgW, avgL, avgT, avgHR, avgSp]
            ).then(() => {
               pool.execute(
                 `INSERT INTO predictions (patient_id, snappe_score, mortality_risk_prob, risk_level) 
                  VALUES (?, ?, ?, ?)`,
                 [patientId, pred.snappe_score, pred.svm.instability_probability, pred.risk_level]
               );
            }).catch(err => console.error('DB Insert Error:', err));
          }
          
          sessionStats[patientId].vitals = [];
          sessionStats[patientId].lastInsert = Date.now();
        }
      }
    });

    socket.on('demographics_update', (data) => {
      console.log('Relaying demographics update:', data);
      io.emit('demographics_update', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
