"""
CSST 106 - FastAPI Backend Server
Perception and Computer Vision Laboratory Suite
Laguna State Polytechnic University (LSPU)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from python_labs.lab01_images import router as lab01_router
from python_labs.lab02_edge_detection import router as lab02_router
from python_labs.lab03_histogram import router as lab03_router

app = FastAPI(
    title="CSST 106 - Computer Vision API",
    description="Backend processing endpoints for CSST 106 Computer Vision Laboratory Activities.",
    version="1.0.0"
)

# Enable CORS for local Vite development frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Laboratory Routers
app.include_router(lab01_router)
app.include_router(lab02_router)
app.include_router(lab03_router)

@app.get("/")
def root():
    return {
        "status": "online",
        "course": "CSST 106 - Perception and Computer Vision",
        "institution": "Laguna State Polytechnic University (LSPU)",
        "student": "Kean Gabriel Salvahan"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
