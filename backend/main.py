import uvicorn
import os
import tempfile
import whisper
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from gtts import gTTS
from pydantic import BaseModel
import aiofiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:3000"],  # Your Next.js frontend URL
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)
whisper_model = whisper.load_model("base")

class TextToSpeechRequest(BaseModel):
    text: str
    language: str = "en"

class SpeechToTextResponse(BaseModel):
    transcription: str

@app.get("/")
async def root():
    return {"message": "Welcome to the backend server!"}

@app.post("/text-to-speech")
async def text_to_speech(request: TextToSpeechRequest):
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")

        tts = gTTS(text=request.text, lang=request.language, slow=False)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_file:
            tts.save(temp_file.name)

        return FileResponse(
            path=temp_file.name,
            media_type="audio/mpeg",
            filename="speech.mp3",
            background=lambda: os.unlink(temp_file.name)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")

@app.post("/speech-to-text", response_model=SpeechToTextResponse)
async def speech_to_text(file: UploadFile = File(...)):
    try:
        allowed_extensions = [".mp3", ".wav", ".m4a", ".ogg", ".flac", ".mp4", ".avi", ".mov"]

        if not file.filename or not any(file.filename.lower().endswith(ext) for ext in allowed_extensions):
            raise HTTPException(status_code=400, detail="File must have a valid audio/video extension (.mp3, .wav, .m4a, .ogg, .flac, .mp4, .avi, .mov)")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            async with aiofiles.open(temp_file.name, 'wb') as f:
                content = await file.read()
                await f.write(content)

            result = whisper_model.transcribe(temp_file.name, fp16=False) # disable fp16, running on cpu
            transcription = result["text"].strip()

            os.unlink(temp_file.name)

        return SpeechToTextResponse(transcription=transcription)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error transcribing audio: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
