from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import numpy as np
import json
from typing import List

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()


@router.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket):
    """
    WebSocket endpoint for real-time streaming simulation.
    Streams time-series batches every second.
    """
    await manager.connect(websocket)
    try:
        while True:
            # Generate synthetic streaming data
            t = np.linspace(0, 2 * np.pi, 50)
            signal = np.sin(t) + 0.1 * np.random.randn(50)
            
            # Random anomaly injection
            if np.random.rand() > 0.8:
                spike_idx = np.random.randint(10, 40)
                signal[spike_idx:spike_idx + 3] += np.random.uniform(1, 3)
            
            stream_data = {
                "timestamp": asyncio.get_event_loop().time(),
                "timeseries": signal.tolist(),
                "metadata": {
                    "window_size": 50,
                    "sampling_rate": 1.0
                }
            }
            
            await websocket.send_json(stream_data)
            await asyncio.sleep(1)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
