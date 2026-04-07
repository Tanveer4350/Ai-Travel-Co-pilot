from fastapi import APIRouter
from models.schema import TravelRequest, ChatRequest
from services.ai_service import generate_itinerary, modify_itinerary
import traceback

router = APIRouter()

# -------------------------------
# 🚀 Generate New Trip
# -------------------------------
@router.post("/plan-trip")
def plan_trip(request: TravelRequest):
    try:
        result = generate_itinerary(request.model_dump())
        return {"itinerary": result}
    except Exception as e:
        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }

# -------------------------------
# 💬 Modify Existing Trip (Chat Feature)
# -------------------------------
@router.post("/modify-trip")
def modify_trip(request: ChatRequest):
    try:
        print("INPUT:", request.model_dump())  # debug
        result = modify_itinerary(request.model_dump())
        return {"updated_itinerary": result}
    except Exception as e:
        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }