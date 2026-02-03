import asyncio
import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.db.session import init_db
from app.models.all_models import Exam, ExamSubmission

async def final_cleanup():
    """Keep only the latest Full Stack Assessment (Final) with 180 minutes"""
    await init_db()
    
    print("=" * 60)
    print("FINAL DATABASE CLEANUP")
    print("=" * 60)
    
    # Get all exams
    all_exams = await Exam.find_all().to_list()
    
    print(f"\nFound {len(all_exams)} exam(s):")
    for exam in all_exams:
        print(f"  - {exam.title}")
        print(f"    ID: {exam.id}")
        print(f"    Duration: {exam.duration_minutes} minutes")
        print(f"    Start: {exam.start_time}")
        print()
    
    # Find the correct 180-minute exam
    correct_exam = None
    exams_to_delete = []
    
    for exam in all_exams:
        if exam.title == "Full Stack Assessment (Final)" and exam.duration_minutes == 180:
            correct_exam = exam
        else:
            exams_to_delete.append(exam)
    
    if correct_exam:
        print(f"✅ Keeping the 180-minute exam:")
        print(f"  ID: {correct_exam.id}")
        print(f"  Access: http://localhost:5174/exam/{correct_exam.id}")
        
        # Delete all other exams
        for exam in exams_to_delete:
            await exam.delete()
            print(f"\n🗑️  Deleted: {exam.title} ({exam.duration_minutes}min, ID: {exam.id})")
        
        # Clean all submissions
        all_submissions = await ExamSubmission.find_all().to_list()
        for sub in all_submissions:
            await sub.delete()
        print(f"🗑️  Deleted {len(all_submissions)} submission(s)")
    else:
        print("⚠️  Could not find the 180-minute exam!")
    
    # Final count
    final_exam_count = await Exam.count()
    final_submission_count = await ExamSubmission.count()
    
    print(f"\n" + "=" * 60)
    print("✅ CLEANUP COMPLETE!")
    print(f"  Exams remaining: {final_exam_count}")
    print(f"  Submissions remaining: {final_submission_count}")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(final_cleanup())
