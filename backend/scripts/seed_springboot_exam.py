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

    # Clean up old variants
    await db.exams.delete_many({"title": "Java Spring Boot"})
    await db.exams.delete_many({"title": "Java Spring Boot 1"})

    now = datetime.now(timezone.utc)
    start_time = now + timedelta(days=2)

    # ─── EXAM 1: Java Spring Boot (Original 50 Marks) ───
    exam_original = {
        "title": "Java Spring Boot",
        "description": "Comprehensive exam on Java, Spring Boot, SQL, and problem solving (Original).",
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
                        "text": "Write logic to reverse a string.",
                        "problem_statement": "Read a string from standard input (stdin) and print the reversed string to standard output (stdout).",
                        "points": 5,
                        "type": "coding",
                        "constraints": "String length between 1 and 100.",
                        "test_cases": [
                            {"input": "backend", "output": "dnekcab", "is_hidden": False},
                            {"input": "SpringBoot", "output": "tooBgnirpS", "is_hidden": False},
                            {"input": "a", "output": "a", "is_hidden": False}
                        ]
                    },
                    {
                        "id": oid(),
                        "text": "Write SQL query to fetch all employees with salary > 50000.",
                        "problem_statement": "Since the coding runner prioritizes general programming, select the correct query below.",
                        "points": 5,
                        "type": "mcq",
                        "options": [
                            {"text": "SELECT * FROM employees WHERE salary > 50000;", "is_correct": True},
                            {"text": "FETCH ALL FROM employees WHERE salary > 50000;", "is_correct": False},
                            {"text": "SELECT salary > 50000 FROM employees;", "is_correct": False},
                            {"text": "GET * FROM employees HAVING salary > 50000;", "is_correct": False}
                        ],
                        "correct_option_index": 0
                    }
                ]
            }
        ]
    }

    # ─── EXAM 2: Java Spring Boot 1 (Round 2 Setup - 70 Marks) ───
    exam_new = {
        "title": "Java Spring Boot 1",
        "description": "Comprehensive exam on Java, Spring Boot, SQL, and problem solving (Round 2 Variant).",
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
                        "problem_statement": "Read a string from standard input (stdin) and print the reversed string to standard output (stdout).",
                        "points": 10,
                        "type": "coding",
                        "constraints": "Input is a single word.",
                        "test_cases": [
                            {"input": "backend", "output": "dnekcab", "is_hidden": False},
                            {"input": "SpringBoot", "output": "tooBgnirpS", "is_hidden": False},
                            {"input": "code", "output": "edoc", "is_hidden": False}
                        ]
                    },
                    {
                        "id": oid(),
                        "text": "Find Largest of 3 Numbers",
                        "problem_statement": "Read three space-separated integers from stdin, and print the single largest integer.",
                        "points": 10,
                        "type": "coding",
                        "constraints": "Example: 10 50 30 -> 50.",
                        "test_cases": [
                            {"input": "10 50 30", "output": "50", "is_hidden": False},
                            {"input": "5 9 2", "output": "9", "is_hidden": False},
                            {"input": "-1 -5 -3", "output": "-1", "is_hidden": False}
                        ]
                    },
                    {
                        "id": oid(),
                        "text": "Count Vowels in String",
                        "problem_statement": "Read a string from stdin. Count only the vowels (A, E, I, O, U - case insensitive) and print the final tally.",
                        "points": 10,
                        "type": "coding",
                        "constraints": "Example: SpringBoot -> 3",
                        "test_cases": [
                            {"input": "SpringBoot", "output": "3", "is_hidden": False},
                            {"input": "AEIOU", "output": "5", "is_hidden": False},
                            {"input": "bcd", "output": "0", "is_hidden": False}
                        ]
                    },
                    {
                        "id": oid(),
                        "text": "SQL Query to Fetch Employees",
                        "problem_statement": "Write a query to fetch employees whose salary is greater than 50000.",
                        "points": 10,
                        "type": "mcq",
                        "options": [
                            {"text": "SELECT * FROM employees WHERE salary > 50000;", "is_correct": True},
                            {"text": "FETCH ALL FROM employees WHERE salary > 50000;", "is_correct": False},
                            {"text": "SELECT salary > 50000 FROM employees;", "is_correct": False},
                            {"text": "GET * FROM employees HAVING salary > 50000;", "is_correct": False}
                        ],
                        "correct_option_index": 0
                    }
                ]
            }
        ]
    }

    await db.exams.insert_one(exam_original)
    await db.exams.insert_one(exam_new)
    print("✅ Refactored variants successfully loaded!")

if __name__ == '__main__':
    asyncio.run(seed())
