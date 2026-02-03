import asyncio
import os
import sys

# Add the backend directory to sys.path so we can import app modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.db.session import init_db
from app.models.all_models import Exam, Section, MCQQuestion, MCQOption, CodingQuestion, TestCase
from datetime import datetime, timezone

async def seed_exam():
    await init_db()
    
    exam = Exam(
        title="Full Stack Developer Assessment (Refactored)",
        description="Comprehensive evaluation of frontend, backend, and system design skills.",
        total_marks=100,
        duration_minutes=140,  # Updated to 140 minutes
        start_time=datetime.now(timezone.utc),  # Current time (timezone-aware)
        sections=[
            Section(
                title="Frontend Knowledge",
                questions=[
                    MCQQuestion(
                        id="q1",
                        text="What is the primary purpose of React's useEffect hook?",
                        points=5,
                        options=[
                            MCQOption(text="To handle side effects in functional components", is_correct=True),
                            MCQOption(text="To modify the DOM directly", is_correct=False),
                            MCQOption(text="To create global state", is_correct=False),
                            MCQOption(text="To optimize rendering performance", is_correct=False)
                        ]
                    ),
                    MCQQuestion(
                        id="q2",
                        text="Which CSS property is used to create a flex container?",
                        points=5,
                        options=[
                            MCQOption(text="display: block", is_correct=False),
                            MCQOption(text="display: flex", is_correct=True),
                            MCQOption(text="display: grid", is_correct=False),
                            MCQOption(text="position: absolute", is_correct=False)
                        ]
                    )
                ]
            ),
            Section(
                title="Coding Challenge",
                questions=[
                    CodingQuestion(
                        id="q3",
                        text="Two Sum",
                        points=20,
                        problem_statement="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
                        constraints="2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
                        test_cases=[
                            TestCase(input="nums = [2,7,11,15], target = 9", output="[0, 1]"),
                            TestCase(input="nums = [3,2,4], target = 6", output="[1, 2]"),
                            TestCase(input="nums = [3,3], target = 6", output="[0, 1]")
                        ]
                    )
                ]
            )
        ]
    )
    
    await exam.insert()
    print(f"Seeding Complete! Exam ID: {exam.id}")
    return exam.id

if __name__ == "__main__":
    asyncio.run(seed_exam())
