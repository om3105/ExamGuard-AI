import requests
from datetime import datetime, timezone

# Use current UTC time for the exam start
start_time = datetime.now(timezone.utc).isoformat()

def generate_mcq(section_name, count, start_index=1):
    """Generate MCQ questions for a given section"""
    questions = []
    for i in range(count):
        q_num = start_index + i
        questions.append({
            "text": f"Sample {section_name} Question {q_num}: What is the output of standard logic?",
            "type": "mcq",
            "points": 1,
            "options": [
                {"text": "Option A (Correct)", "is_correct": True},
                {"text": "Option B", "is_correct": False},
                {"text": "Option C", "is_correct": False},
                {"text": "Option D", "is_correct": False}
            ]
        })
    return questions

# Generate 30 aptitude MCQs
aptitude_questions = generate_mcq("Aptitude", 30)

# Generate 30 technical MCQs
technical_questions = generate_mcq("Technical", 30)

# Coding questions
coding_questions = [
    {
        "text": "Sum of Two Numbers",
        "type": "coding",
        "points": 10,
        "problem_statement": "Write a program that takes two integers as input (separated by a space or newline) and prints their sum.",
        "constraints": "1 <= a, b <= 1000",
        "test_cases": [
            {"input": "2 3", "output": "5", "is_hidden": False},
            {"input": "10 20", "output": "30", "is_hidden": False},
            {"input": "100 200", "output": "300", "is_hidden": True}
        ]
    },
    {
        "text": "Reverse String",
        "type": "coding",
        "points": 10,
        "problem_statement": "Write a program that takes a single word as input and prints it reversed.",
        "constraints": "Length of string <= 100",
        "test_cases": [
            {"input": "hello", "output": "olleh", "is_hidden": False},
            {"input": "python", "output": "nohtyp", "is_hidden": False},
            {"input": "racecar", "output": "racecar", "is_hidden": True}
        ]
    }
]

payload = {
    "title": "Full Stack Assessment (Final)",
    "description": "Comprehensive exam covering Aptitude (30), Technical (30), and Coding (2).",
    "total_marks": 80,  # 30 + 30 + 20
    "duration_minutes": 180,  # 3 hours
    "start_time": start_time,
    "sections": [
        {
            "title": "Aptitude MCQ",
            "description": "General logical reasoning and quantitative aptitude.",
            "questions": aptitude_questions
        },
        {
            "title": "Technical MCQ",
            "description": "Core computer science and web development concepts.",
            "questions": technical_questions
        },
        {
            "title": "Coding",
            "description": "Programming challenges.",
            "questions": coding_questions
        }
    ]
}

print("Creating Full Stack Assessment (Final)...")
print(f"Start Time: {start_time}")
print(f"Duration: 180 minutes (3 hours)")
print(f"Total Questions: 62 (30 Aptitude + 30 Technical + 2 Coding)")
print(f"Total Marks: 80")
print("=" * 60)

try:
    response = requests.post("http://127.0.0.1:8000/exams/", json=payload)
    if response.status_code == 201:
        exam_data = response.json()
        exam_id = exam_data.get('_id') or exam_data.get('id')
        print("\n✅ Exam Created Successfully!")
        print(f"Exam ID: {exam_id}")
        print(f"\nAccess the exam at:")
        print(f"http://localhost:5174/exam/{exam_id}")
    else:
        print(f"\n❌ Failed to create exam. Status: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"\n❌ Error: {e}")
