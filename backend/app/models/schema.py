from pydantic import BaseModel
from typing import Dict, Any

class TravelRequest(BaseModel):
    destination: str
    budget: int
    days: int
    preferences: str

class ChatRequest(BaseModel):
    itinerary: Dict[str, Any]
    user_input: str