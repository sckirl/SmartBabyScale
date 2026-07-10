# System Architecture & God Nodes

## God Nodes
1. **Frontend**: `Interface/src/components/Dashboard.tsx`
   - **Why**: Renders the realtime data (0-162 point tally, UI colors) and displays [[NICU Recommendations]]. Also handles PDF Export functionality.
   - **Confidence**: EXTRACTED
2. **Backend Server**: `Interface/server.js`
   - **Why**: Custom Node.js server that runs Next.js and Socket.io server to maintain persistent WebSocket connections.
   - **Surprising Connection**: Cannot be deployed on Vercel/Netlify due to stateless environments killing websockets. Must be deployed to Dokploy/Railway/VPS. (Confidence: EXTRACTED)
3. **Hardware Streaming**: `Sensors/pi_hardware_reader.py` (and `Sensors/simulation.py`)
   - **Why**: Reads Raspberry Pi GPIO/I2C and streams to frontend via Socket.io. Must maintain < 500ms latency.
   - **Confidence**: EXTRACTED
4. **ML Pipeline**: `MachineLearning/`
   - **Why**: Edge AI pipeline for predicting the SNAPPE-II score.
   - **God File**: `train_regression.py` (To be created, replacing `SmartBabyScale_Training.ipynb`)
   - **Confidence**: INFERRED (from [[The Pivot]])
5. **Database**: `schema.sql` (MySQL)
   - **Why**: Raw SQL database tailored for Indonesian health administration. Stores historical averages, not high-frequency raw data.
   - **Surprising Connection**: Specifically avoiding heavy ORMs (like Prisma) in favor of raw SQL for optimization. (Confidence: EXTRACTED from ORCHESTRATION.md)

## System Constraints
- **Latency**: Strict requirement of < 500ms for edge-to-frontend communication.
- **Edge Deployment**: Models must run efficiently on Raspberry Pi.
