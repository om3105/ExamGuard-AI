import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta, timezone
from bson import ObjectId
import math

MONGO_URL = "mongodb://localhost:27017"

async def create_full_exam():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.examguard_db
    exams_collection = db.exams

    # --- Section 1: Aptitude (30 MCQs) ---
    aptitude_questions = []
    for i in range(1, 31):
        aptitude_questions.append({
            "id": str(ObjectId()),
            "type": "mcq",
            "text": f"Aptitude Question {i}: If a train travels {100+i} km in {2+i%3} hours, what is its average speed?",
            "points": 1,
            "options": [
                {"text": f"{math.floor((100+i)/(2+i%3))} km/h", "is_correct": True},
                {"text": "55 km/h", "is_correct": False},
                {"text": "65 km/h", "is_correct": False},
                {"text": "70 km/h", "is_correct": False}
            ]
        })

    # --- Section 2: Technical (30 MCQs) ---
    technical_questions = []
    tech_topics = ["Python", "JavaScript", "React", "Database", "Networking"]
    for i in range(1, 31):
        topic = tech_topics[i % len(tech_topics)]
        technical_questions.append({
            "id": str(ObjectId()),
            "type": "mcq",
            "text": f"Technical Question {i} ({topic}): Which of the following is true about {topic}?",
            "points": 1,
            "options": [
                {"text": f"{topic} is a popular technology.", "is_correct": True},
                {"text": f"{topic} is a type of food.", "is_correct": False},
                {"text": f"{topic} is deprecated.", "is_correct": False},
                {"text": "None of the above", "is_correct": False}
            ]
        })

    # --- Section 3: Coding (2 Questions) ---
    coding_questions = [
        {
            "id": str(ObjectId()),
            "type": "coding",
            "text": "Two Sum",
            "points": 20,
            "problem_statement": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
            "constraints": "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
            "test_cases": [
                {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "is_hidden": False},
                {"input": "nums = [3,2,4], target = 6", "output": "[1,2]", "is_hidden": False},
                {"input": "nums = [3,3], target = 6", "output": "[0,1]", "is_hidden": True}
            ]
        },
        {
            "id": str(ObjectId()),
            "type": "coding",
            "text": "Check Palindrome",
            "points": 20,
            "problem_statement": "Write a function to determine if a given string is a palindrome. A string is a palindrome if it reads the same forward and backward, ignoring case and non-alphanumeric characters.",
            "constraints": "1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.",
            "test_cases": [
                {"input": "'A man, a plan, a canal: Panama'", "output": "true", "is_hidden": False},
                {"input": "'race a car'", "output": "false", "is_hidden": False},
                {"input": "' '", "output": "true", "is_hidden": True}
            ]
        }
    ]

    # --- specific start time for immediate visibility ---
    # Start time is NOW
    start_time = datetime.now(timezone.utc)

    full_exam = {
        "title": "Comprehensive Full Stack Assessment",
        "description": "A complete assessment covering Aptitude, Technical Knowledge, and Coding Skills. Duration: 140 mins.",
        "total_marks": 100,  # 30*1 + 30*1 + 2*20 = 100
        "duration_minutes": 140,
        "start_time": start_time,
        "created_at": datetime.now(timezone.utc),
        "sections": [
            {
                "title": "General Aptitude",
                "description": "30 questions testing your logical reasoning and quantitative aptitude.",
                "questions": aptitude_questions
            },
            {
                "title": "Technical Knowledge",
                "description": "30 questions covering core CS concepts and web technologies.",
                "questions": technical_questions
            },
            {
                "title": "Coding Challenge",
                "description": "2 programming problems to test your algorithmic thinking.",
                "questions": coding_questions
            }
        ]
    }

    # Insert
    result = await exams_collection.insert_one(full_exam)
    print(f"Successfully created exam with ID: {result.inserted_id}")
    print(f"Title: {full_exam['title']}")
    print(f"Total Questions: {len(aptitude_questions) + len(technical_questions) + len(coding_questions)}")
    print(f"Duration: {full_exam['duration_minutes']} mins")

if __name__ == "__main__":
    asyncio.run(create_full_exam())
