import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.all_models import Exam, ExamSubmission
from app.db.session import init_db
import os

# Mock settings if needed or ensure environment is set
if not os.getenv("MONGODB_URL"):
    os.environ["MONGODB_URL"] = "mongodb+srv://omdeo:Omdeo2004@cluster0.le8f9.mongodb.net/examguard_db?retryWrites=true&w=majority&appName=Cluster0"

async def recalculate():
    await init_db()
    
    submissions = await ExamSubmission.find({"score": None}).to_list()
    print(f"Found {len(submissions)} submissions with no score.")
    
    for sub in submissions:
        print(f"Processing submission {sub.id} for exam {sub.exam_id}")
        exam = await Exam.get(sub.exam_id)
        if not exam:
            print(f"Exam {sub.exam_id} not found, skipping.")
            continue
            
        total_score = 0
        user_answers = sub.answers
        
        for section_idx, section in enumerate(exam.sections):
            for question_idx, question in enumerate(section.questions):
                s_idx_str = str(section_idx)
                q_idx_str = str(question_idx)
                
                # Check both string and int keys just in case
                answer = None
                if s_idx_str in user_answers and q_idx_str in user_answers[s_idx_str]:
                    answer = user_answers[s_idx_str][q_idx_str]
                elif section_idx in user_answers and question_idx in user_answers[section_idx]: # Fallback for int keys
                     answer = user_answers[section_idx][question_idx]

                if answer is not None:
                    if question.type == 'mcq':
                        is_correct = False
                        
                        # Correct logic from exam_service
                        if question.correct_option_index is not None:
                            if int(answer) == question.correct_option_index:
                                is_correct = True
                        elif question.options:
                            try:
                                selected_opt_idx = int(answer)
                                if 0 <= selected_opt_idx < len(question.options):
                                    if question.options[selected_opt_idx].is_correct:
                                        is_correct = True
                            except (ValueError, IndexError):
                                pass
                        
                        if is_correct:
                            total_score += question.points
        
        sub.score = total_score
        # Check if we should update status? Maybe leave it as is if it's already COMPLETED
        if not sub.status:
             sub.status = "COMPLETED"
             
        await sub.save()
        print(f"Updated score to {total_score}")

if __name__ == "__main__":
    asyncio.run(recalculate())
