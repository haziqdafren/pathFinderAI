from fastapi import APIRouter
from pydantic import BaseModel
from ..services.gemini_service import gemini_service

router = APIRouter()

class QuestionRequest(BaseModel):
    question_index: int
    previous_answer: str

class QuestionResponse(BaseModel):
    question: str
    tip: str

@router.post("/question", response_model=QuestionResponse)
async def generate_next_question(request: QuestionRequest):
    """Generates the next dynamic question based on the previous answer using Gemini."""
    try:
        # We only dynamically generate Q2
        if request.question_index == 2:
            result = await gemini_service.generate_q2(request.previous_answer)
            return QuestionResponse(question=result["question"], tip=result["tip"])
        else:
            return QuestionResponse(
                question="Pertanyaan statis", 
                tip="Gunakan endpoint ini hanya untuk Q2."
            )
    except Exception as e:
        return QuestionResponse(
            question="Yang bikin kamu betah berjam-jam: mengurai data berantakan jadi grafik yang masuk akal.",
            tip="Scout perlu tahu juga mana yang bukan kamu — biar rekomendasinya lebih tajam."
        )
