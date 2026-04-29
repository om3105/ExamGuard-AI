import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime, timezone, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

def oid():
    return str(ObjectId())

async def seed():
    mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_url)
    db = client["examguard"]

    await db.exams.delete_many({"title": "Java Spring Boot"})

    now = datetime.now(timezone.utc)
    start_time = now + timedelta(days=2)

    exam = {
        "title": "Java Spring Boot",
        "description": "Comprehensive exam on Java, Spring Boot, SQL, and problem solving.",
        "total_marks": 70,
        "duration_minutes": 90,
        "start_time": start_time,
        "created_at": now,
        "sections": [
            {
                "title": "Section A: Quantitative",
                "description": "(2 Marks each)",
                "questions": [
                    {
                        "id": oid(),
                        "text": "A server processes 120 requests/minute. How many requests in 2 hours?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "12400", "is_correct": False},
                            {"text": "14400", "is_correct": True},
                            {"text": "15400", "is_correct": False},
                            {"text": "16400", "is_correct": False}
                        ],
                        "correct_option_index": 1
                    },
                    {
                        "id": oid(),
                        "text": "If response time reduced from 800 ms to 600 ms, improvement = ?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "20%", "is_correct": False},
                            {"text": "25%", "is_correct": True},
                            {"text": "30%", "is_correct": False},
                            {"text": "35%", "is_correct": False}
                        ],
                        "correct_option_index": 1
                    },
                    {
                        "id": oid(),
                        "text": "If 5 developers finish module in 10 days, 10 developers need?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "3", "is_correct": False},
                            {"text": "4", "is_correct": False},
                            {"text": "5", "is_correct": True},
                            {"text": "6", "is_correct": False}
                        ],
                        "correct_option_index": 2
                    },
                    {
                        "id": oid(),
                        "text": "A table has 250 rows, each row has 4 columns. Total values?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "500", "is_correct": False},
                            {"text": "750", "is_correct": False},
                            {"text": "1000", "is_correct": True},
                            {"text": "1250", "is_correct": False}
                        ],
                        "correct_option_index": 2
                    },
                    {
                        "id": oid(),
                        "text": "Ratio of GET APIs to POST APIs is 2:3. If GET = 10, POST = ?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "12", "is_correct": False},
                            {"text": "15", "is_correct": True},
                            {"text": "18", "is_correct": False},
                            {"text": "20", "is_correct": False}
                        ],
                        "correct_option_index": 1
                    }
                ]
            },
            {
                "title": "Section B: Logical Reasoning",
                "description": "(2 Marks each)",
                "questions": [
                    {
                        "id": oid(),
                        "text": "2, 4, 8, 16, ?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "18", "is_correct": False},
                            {"text": "24", "is_correct": False},
                            {"text": "32", "is_correct": True},
                            {"text": "36", "is_correct": False}
                        ],
                        "correct_option_index": 2
                    },
                    {
                        "id": oid(),
                        "text": "Odd one out:",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "Java", "is_correct": False},
                            {"text": "Python", "is_correct": False},
                            {"text": "MySQL", "is_correct": True},
                            {"text": "C++", "is_correct": False}
                        ],
                        "correct_option_index": 2
                    },
                    {
                        "id": oid(),
                        "text": "If API = BQJ, then DB = ?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "EC", "is_correct": True},
                            {"text": "DC", "is_correct": False},
                            {"text": "EB", "is_correct": False},
                            {"text": "FC", "is_correct": False}
                        ],
                        "correct_option_index": 0
                    },
                    {
                        "id": oid(),
                        "text": "Login → Auth → Token → Access follows:",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "Random", "is_correct": False},
                            {"text": "Security Flow", "is_correct": True},
                            {"text": "Loop", "is_correct": False},
                            {"text": "Error", "is_correct": False}
                        ],
                        "correct_option_index": 1
                    },
                    {
                        "id": oid(),
                        "text": "Find next: 1, 4, 9, 16, ?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "20", "is_correct": False},
                            {"text": "25", "is_correct": True},
                            {"text": "30", "is_correct": False},
                            {"text": "36", "is_correct": False}
                        ],
                        "correct_option_index": 1
                    }
                ]
            },
            {
                "title": "Section C: Technical MCQ",
                "description": "(2 Marks each)",
                "questions": [
                    {
                        "id": oid(),
                        "text": "Which framework is used with Java backend?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "Django", "is_correct": False},
                            {"text": "Spring Boot", "is_correct": True},
                            {"text": "Laravel", "is_correct": False},
                            {"text": "React", "is_correct": False}
                        ],
                        "correct_option_index": 1
                    },
                    {
                        "id": oid(),
                        "text": "Which DB is relational?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "MongoDB", "is_correct": False},
                            {"text": "PostgreSQL", "is_correct": True},
                            {"text": "Redis", "is_correct": False},
                            {"text": "Firebase", "is_correct": False}
                        ],
                        "correct_option_index": 1
                    },
                    {
                        "id": oid(),
                        "text": "Which method fetches data?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "POST", "is_correct": False},
                            {"text": "PUT", "is_correct": False},
                            {"text": "GET", "is_correct": True},
                            {"text": "UPDATE", "is_correct": False}
                        ],
                        "correct_option_index": 2
                    },
                    {
                        "id": oid(),
                        "text": "Which keyword is used for inheritance?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "extend", "is_correct": False},
                            {"text": "extends", "is_correct": True},
                            {"text": "inherit", "is_correct": False},
                            {"text": "using", "is_correct": False}
                        ],
                        "correct_option_index": 1
                    },
                    {
                        "id": oid(),
                        "text": "Which layer stores business logic?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "Controller", "is_correct": False},
                            {"text": "Service", "is_correct": True},
                            {"text": "UI", "is_correct": False},
                            {"text": "JSP", "is_correct": False}
                        ],
                        "correct_option_index": 1
                    }
                ]
            },
            {
                "title": "Round 2: Coding Test",
                "description": "(10 Marks each)",
                "questions": [
                    {
                        "id": oid(),
                        "text": "Reverse a String",
                        "problem_statement": "Write logic to reverse a given string.",
                        "points": 10,
                        "type": "coding",
                        "constraints": "Input: backend, Output: dnekcab",
                        "test_cases": [
                            {"input": "backend", "output": "dnekcab", "is_hidden": False}
                        ]
                    },
                    {
                        "id": oid(),
                        "text": "Find Largest of 3 Numbers",
                        "problem_statement": "Return the largest value among three space-separated numbers.",
                        "points": 10,
                        "type": "coding",
                        "constraints": "Input: 10, 50, 30, Output: 50",
                        "test_cases": [
                            {"input": "10 50 30", "output": "50", "is_hidden": False}
                        ]
                    },
                    {
                        "id": oid(),
                        "text": "Count Vowels in String",
                        "problem_statement": "Count only the vowels in the given string.",
                        "points": 10,
                        "type": "coding",
                        "constraints": "Input: SpringBoot, Output: 3",
                        "test_cases": [
                            {"input": "SpringBoot", "output": "3", "is_hidden": False}
                        ]
                    },
                    {
                        "id": oid(),
                        "text": "SQL Query",
                        "problem_statement": "Write query to fetch employees whose salary > 50000.",
                        "points": 10,
                        "type": "coding",
                        "constraints": "Output: SELECT * FROM employees WHERE salary > 50000;",
                        "test_cases": [
                            {"input": "SELECT * FROM employees WHERE salary > 50000", "output": "Expected SQL query matched", "is_hidden": False}
                        ]
                    }
                ]
            }
        ]
    }

    result = await db.exams.insert_one(exam)
    print(f"✅ Java Spring Boot (Round 2 Setup) seeded successfully! ID: {result.inserted_id}")

if __name__ == '__main__':
    asyncio.run(seed())
