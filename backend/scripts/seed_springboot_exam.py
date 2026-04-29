import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime, timezone, timedelta

def oid():
    return str(ObjectId())

async def seed():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["examguard"]

    await db.exams.delete_many({"title": "Java Spring Boot"})

    now = datetime.now(timezone.utc)
    start_time = now + timedelta(days=2)

    exam = {
        "title": "Java Spring Boot",
        "description": "Comprehensive exam on Java, Spring Boot, SQL, and problem solving.",
        "total_marks": 50,
        "duration_minutes": 60,
        "start_time": start_time,
        "created_at": now,
        "sections": [
            {
                "title": "Section A: Quantitative Aptitude",
                "description": "(2 Marks each)",
                "questions": [
                    {
                        "id": oid(),
                        "text": "If a backend server handles 250 requests per minute, how many requests will it handle in 3 hours?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "30,000", "is_correct": False},
                            {"text": "45,000", "is_correct": True},
                            {"text": "50,000", "is_correct": False},
                            {"text": "60,000", "is_correct": False}
                        ],
                        "correct_option_index": 1
                    },
                    {
                        "id": oid(),
                        "text": "A database query execution time is reduced from 500 ms to 350 ms. What is the percentage improvement?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "20%", "is_correct": False},
                            {"text": "25%", "is_correct": False},
                            {"text": "30%", "is_correct": True},
                            {"text": "35%", "is_correct": False}
                        ],
                        "correct_option_index": 2
                    },
                    {
                        "id": oid(),
                        "text": "A microservice has 5 modules. Each module contains 8 APIs. Total APIs = ?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "35", "is_correct": False},
                            {"text": "40", "is_correct": True},
                            {"text": "45", "is_correct": False},
                            {"text": "50", "is_correct": False}
                        ],
                        "correct_option_index": 1
                    },
                    {
                        "id": oid(),
                        "text": "If 3 developers complete a task in 12 days, how many days will 4 developers take (same efficiency)?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "8", "is_correct": False},
                            {"text": "9", "is_correct": True},
                            {"text": "10", "is_correct": False},
                            {"text": "12", "is_correct": False}
                        ],
                        "correct_option_index": 1
                    },
                    {
                        "id": oid(),
                        "text": "The ratio of frontend bugs to backend bugs is 3:5. If frontend bugs are 24, backend bugs are:",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "30", "is_correct": False},
                            {"text": "36", "is_correct": False},
                            {"text": "40", "is_correct": True},
                            {"text": "48", "is_correct": False}
                        ],
                        "correct_option_index": 2
                    }
                ]
            },
            {
                "title": "Section B: Logical Reasoning",
                "description": "(2 Marks each)",
                "questions": [
                    {
                        "id": oid(),
                        "text": "Find the next number in the sequence: 2, 6, 12, 20, 30, ?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "36", "is_correct": False},
                            {"text": "40", "is_correct": False},
                            {"text": "42", "is_correct": True},
                            {"text": "44", "is_correct": False}
                        ],
                        "correct_option_index": 2
                    },
                    {
                        "id": oid(),
                        "text": "If API = 3125 and DB = 42, then JAVA = ?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "10122", "is_correct": False},
                            {"text": "101221", "is_correct": True},
                            {"text": "1012211", "is_correct": False},
                            {"text": "10221", "is_correct": False}
                        ],
                        "correct_option_index": 1
                    },
                    {
                        "id": oid(),
                        "text": "A developer is facing login issue. He checks Password → Database → API → UI. This follows:",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "Circular logic", "is_correct": False},
                            {"text": "Debugging flow", "is_correct": True},
                            {"text": "Reverse process", "is_correct": False},
                            {"text": "Random sequence", "is_correct": False}
                        ],
                        "correct_option_index": 1
                    },
                    {
                        "id": oid(),
                        "text": "Odd one out:",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "MySQL", "is_correct": False},
                            {"text": "PostgreSQL", "is_correct": False},
                            {"text": "MongoDB", "is_correct": False},
                            {"text": "Spring Boot", "is_correct": True}
                        ],
                        "correct_option_index": 3
                    },
                    {
                        "id": oid(),
                        "text": "If SERVICE is coded as TFSWJDF, then BACKEND is coded as:",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "CBDLFOE", "is_correct": True},
                            {"text": "DBDLFPE", "is_correct": False},
                            {"text": "CADLFOE", "is_correct": False},
                            {"text": "CBELFOE", "is_correct": False}
                        ],
                        "correct_option_index": 0
                    }
                ]
            },
            {
                "title": "Section C: Technical Aptitude",
                "description": "(2 Marks each)",
                "questions": [
                    {
                        "id": oid(),
                        "text": "Which of the following is OOP concept in Java?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "Polymorphism", "is_correct": True},
                            {"text": "Sorting", "is_correct": False},
                            {"text": "Searching", "is_correct": False},
                            {"text": "Parsing", "is_correct": False}
                        ],
                        "correct_option_index": 0
                    },
                    {
                        "id": oid(),
                        "text": "Which annotation is used to create REST API controller in Spring Boot?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "@Entity", "is_correct": False},
                            {"text": "@RestController", "is_correct": True},
                            {"text": "@Service", "is_correct": False},
                            {"text": "@Repository", "is_correct": False}
                        ],
                        "correct_option_index": 1
                    },
                    {
                        "id": oid(),
                        "text": "Which HTTP method is used to update data?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "GET", "is_correct": False},
                            {"text": "POST", "is_correct": False},
                            {"text": "PUT", "is_correct": True},
                            {"text": "FETCH", "is_correct": False}
                        ],
                        "correct_option_index": 2
                    },
                    {
                        "id": oid(),
                        "text": "Which database is relational?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "MongoDB", "is_correct": False},
                            {"text": "Redis", "is_correct": False},
                            {"text": "MySQL", "is_correct": True},
                            {"text": "Cassandra", "is_correct": False}
                        ],
                        "correct_option_index": 2
                    },
                    {
                        "id": oid(),
                        "text": "What does MVC stand for?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "Model View Controller", "is_correct": True},
                            {"text": "Main View Code", "is_correct": False},
                            {"text": "Model Variable Class", "is_correct": False},
                            {"text": "Memory View Control", "is_correct": False}
                        ],
                        "correct_option_index": 0
                    },
                    {
                        "id": oid(),
                        "text": "Which keyword is used for inheritance in Java?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "import", "is_correct": False},
                            {"text": "extends", "is_correct": True},
                            {"text": "implements", "is_correct": False},
                            {"text": "inherit", "is_correct": False}
                        ],
                        "correct_option_index": 1
                    },
                    {
                        "id": oid(),
                        "text": "Which SQL command is used to fetch data?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "GET", "is_correct": False},
                            {"text": "SELECT", "is_correct": True},
                            {"text": "FETCH", "is_correct": False},
                            {"text": "READ", "is_correct": False}
                        ],
                        "correct_option_index": 1
                    },
                    {
                        "id": oid(),
                        "text": "Which layer contains business logic in Spring Boot?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "Controller", "is_correct": False},
                            {"text": "Service", "is_correct": True},
                            {"text": "Repository", "is_correct": False},
                            {"text": "Config", "is_correct": False}
                        ],
                        "correct_option_index": 1
                    },
                    {
                        "id": oid(),
                        "text": "Which of the following improves API security?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "Authentication", "is_correct": True},
                            {"text": "Comments", "is_correct": False},
                            {"text": "CSS", "is_correct": False},
                            {"text": "UI Testing", "is_correct": False}
                        ],
                        "correct_option_index": 0
                    },
                    {
                        "id": oid(),
                        "text": "Which design pattern creates only one object instance?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "Factory", "is_correct": False},
                            {"text": "Singleton", "is_correct": True},
                            {"text": "MVC", "is_correct": False},
                            {"text": "Adapter", "is_correct": False}
                        ],
                        "correct_option_index": 1
                    }
                ]
            },
            {
                "title": "Section D: Coding/Problem Solving",
                "description": "(5 Marks each)",
                "questions": [
                    {
                        "id": oid(),
                        "text": "Write Java code to reverse a string.",
                        "problem_statement": "Given a string, return the reversed string.",
                        "points": 5,
                        "type": "coding",
                        "constraints": "Length of string between 1 and 100",
                        "test_cases": [
                            {"input": "backend", "output": "dnekcab", "is_hidden": False},
                            {"input": "SpringBoot", "output": "toobgnirpS", "is_hidden": False}
                        ]
                    },
                    {
                        "id": oid(),
                        "text": "Write SQL query to fetch all employees with salary > 50000.",
                        "problem_statement": "Write a query to fetch all rows from employees where salary is strictly greater than 50000.",
                        "points": 5,
                        "type": "coding",
                        "constraints": "Table name: employees",
                        "test_cases": [
                            {"input": "SELECT * FROM employees WHERE salary > 50000", "output": "Expected SQL query matched", "is_hidden": False}
                        ]
                    }
                ]
            }
        ]
    }

    result = await db.exams.insert_one(exam)
    print(f"✅ Java Spring Boot Exam seeded successfully! ID: {result.inserted_id}")

if __name__ == '__main__':
    asyncio.run(seed())
