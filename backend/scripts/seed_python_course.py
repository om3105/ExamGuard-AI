"""
Seed script: Python Ultimate Course
Inserts 46 videos (8 modules), 8 quizzes, and 4 coding problems into MongoDB.
Run: python -m scripts.seed_python_course
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId


def oid():
    return str(ObjectId())


# ── Module 1: Python Basics (Videos #1-#8 from playlist, skip intro) ──
m1_lessons = [
    {"id": oid(), "title": "What is Python (Visually Explained)", "video_url": "https://www.youtube.com/watch?v=GRNI9T9R8gQ", "duration": 647},
    {"id": oid(), "title": "How to Install Python and VS Code", "video_url": "https://www.youtube.com/watch?v=uge4A1LHsNk", "duration": 851},
    {"id": oid(), "title": "Python Comments: Visually Explained", "video_url": "https://www.youtube.com/watch?v=GEOnKhm940k", "duration": 320},
    {"id": oid(), "title": "Python Print Function: Visually Explained", "video_url": "https://www.youtube.com/watch?v=IdXTxbBfDbc", "duration": 1289},
    {"id": oid(), "title": "Python Variables: Visually Explained", "video_url": "https://www.youtube.com/watch?v=YHgkADDCWJg", "duration": 819},
    {"id": oid(), "title": "Python Input Function: Visually Explained", "video_url": "https://www.youtube.com/watch?v=we54H-T1AL0", "duration": 556},
    {"id": oid(), "title": "Python Data Types: Visually Explained", "video_url": "https://www.youtube.com/watch?v=0uY2qNAsAWs", "duration": 1823},
    {"id": oid(), "title": "Python String Functions Explained", "video_url": "https://www.youtube.com/watch?v=Yveo5hCrGLE", "duration": 4477},
]

m1_quiz = {
    "id": oid(),
    "title": "Python Basics Quiz",
    "questions": [
        {"question": "What is the correct way to declare a variable in Python?", "options": ["var x = 5", "int x = 5", "x = 5", "declare x = 5"], "correct_answer_index": 2},
        {"question": "Which function is used to get user input?", "options": ["scan()", "input()", "read()", "get()"], "correct_answer_index": 1},
        {"question": "What does the type() function return?", "options": ["The value of a variable", "The data type of a variable", "The memory address", "The variable name"], "correct_answer_index": 1},
        {"question": "Which of these is a valid Python string?", "options": ["'hello'", '"hello"', "'''hello'''", "All of the above"], "correct_answer_index": 3},
        {"question": "What does int('42') return?", "options": ["'42'", "42", "Error", "None"], "correct_answer_index": 1},
    ]
}

# ── Module 2: Numbers & Control Flow (Videos #10-#13) ──
m2_lessons = [
    {"id": oid(), "title": "Python Numbers Mastery | Math Functions, Round & Random", "video_url": "https://www.youtube.com/watch?v=5ZOxqAGWy70", "duration": 1731},
    {"id": oid(), "title": "Python Control Flow: Visually Explained", "video_url": "https://www.youtube.com/watch?v=9XbeXpKMR_E", "duration": 420},
    {"id": oid(), "title": "Python Boolean Functions | bool, all, any, isinstance", "video_url": "https://www.youtube.com/watch?v=v8tuWg_rvjE", "duration": 520},
    {"id": oid(), "title": "Python Comparison Operators (Visually Explained)", "video_url": "https://www.youtube.com/watch?v=OZ7AinsDYVo", "duration": 428},
]

m2_quiz = {
    "id": oid(),
    "title": "Numbers & Control Flow Quiz",
    "questions": [
        {"question": "What does round(3.7) return?", "options": ["3", "4", "3.7", "3.0"], "correct_answer_index": 1},
        {"question": "What does bool(0) return?", "options": ["True", "False", "0", "None"], "correct_answer_index": 1},
        {"question": "Which operator checks equality?", "options": ["=", "==", "===", "!="], "correct_answer_index": 1},
        {"question": "What does all([True, True, False]) return?", "options": ["True", "False", "Error", "None"], "correct_answer_index": 1},
    ]
}

m2_coding = {
    "id": oid(),
    "title": "Even or Odd Checker",
    "description": "Write a function that takes an integer and returns 'Even' if the number is even, or 'Odd' if the number is odd.",
    "constraints": "Input will be a single integer between -1000 and 1000.",
    "input_format": "A single integer n",
    "output_format": "Print 'Even' or 'Odd'",
    "starter_code": "n = int(input())\n# Write your code here\n",
    "language_id": 71,
    "test_cases": [
        {"input": "4", "expected_output": "Even"},
        {"input": "7", "expected_output": "Odd"},
        {"input": "0", "expected_output": "Even"},
    ]
}

# ── Module 3: Logic & Conditionals (Videos #14-#17) ──
m3_lessons = [
    {"id": oid(), "title": "Python Logical Operators | and, or, not, Execution Order", "video_url": "https://www.youtube.com/watch?v=yFaYylK1yCE", "duration": 1075},
    {"id": oid(), "title": "Python Membership & Identity Operators | IN & IS", "video_url": "https://www.youtube.com/watch?v=qtTs03rI7W0", "duration": 752},
    {"id": oid(), "title": "Python If Elif Else Statements", "video_url": "https://www.youtube.com/watch?v=7s-zyoaaBOY", "duration": 3107},
    {"id": oid(), "title": "Python If-Else One Line and Match-Case", "video_url": "https://www.youtube.com/watch?v=wP18POH-uM0", "duration": 851},
]

m3_quiz = {
    "id": oid(),
    "title": "Logic & Conditionals Quiz",
    "questions": [
        {"question": "What does 'not True' evaluate to?", "options": ["True", "False", "None", "Error"], "correct_answer_index": 1},
        {"question": "What does '5 in [1,2,3,4,5]' return?", "options": ["True", "False", "5", "Error"], "correct_answer_index": 0},
        {"question": "What is the output of: x = 10; print('yes' if x > 5 else 'no')?", "options": ["yes", "no", "Error", "None"], "correct_answer_index": 0},
    ]
}

# ── Module 4: Loops (Videos #18-#22) ──
m4_lessons = [
    {"id": oid(), "title": "Python For Loops (Visually Explained)", "video_url": "https://www.youtube.com/watch?v=HWaQttu8_O0", "duration": 1433},
    {"id": oid(), "title": "Python Break vs Continue vs Pass", "video_url": "https://www.youtube.com/watch?v=fx8MJxW8wb4", "duration": 1244},
    {"id": oid(), "title": "Python For-Else Loop | Hidden Control Flow Trick", "video_url": "https://www.youtube.com/watch?v=KlVXZu8V1VM", "duration": 1029},
    {"id": oid(), "title": "Python Nested Loops are Easy", "video_url": "https://www.youtube.com/watch?v=ck1AzCDs0ss", "duration": 1003},
    {"id": oid(), "title": "Python While Loops | For vs While Loops", "video_url": "https://www.youtube.com/watch?v=gD8ePxAhjUM", "duration": 1716},
]

m4_quiz = {
    "id": oid(),
    "title": "Loops Quiz",
    "questions": [
        {"question": "What does 'break' do in a loop?", "options": ["Skips current iteration", "Exits the loop", "Pauses the loop", "Restarts the loop"], "correct_answer_index": 1},
        {"question": "What does 'continue' do?", "options": ["Exits the loop", "Skips to next iteration", "Does nothing", "Breaks the program"], "correct_answer_index": 1},
        {"question": "How many times does 'for i in range(3)' iterate?", "options": ["2", "3", "4", "1"], "correct_answer_index": 1},
        {"question": "What is the output of: for i in range(2): print(i)?", "options": ["0 1", "1 2", "0 1 2", "1 2 3"], "correct_answer_index": 0},
    ]
}

m4_coding = {
    "id": oid(),
    "title": "FizzBuzz",
    "description": "Print numbers from 1 to n. For multiples of 3 print 'Fizz', for multiples of 5 print 'Buzz', for multiples of both print 'FizzBuzz'.",
    "constraints": "1 <= n <= 100",
    "input_format": "A single integer n",
    "output_format": "Print each result on a new line",
    "starter_code": "n = int(input())\n# Write your code here\n",
    "language_id": 71,
    "test_cases": [
        {"input": "5", "expected_output": "1\n2\nFizz\n4\nBuzz"},
        {"input": "15", "expected_output": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz"},
    ]
}

# ── Module 5: Lists Part 1 (Videos #23-#27) ──
m5_lessons = [
    {"id": oid(), "title": "Introduction to Data Structures in Python", "video_url": "https://www.youtube.com/watch?v=SVjXp22ddFQ", "duration": 611},
    {"id": oid(), "title": "How to Create a List in Python", "video_url": "https://www.youtube.com/watch?v=LWeS6R9IPf4", "duration": 726},
    {"id": oid(), "title": "How to Access Lists | Indexing & Slicing", "video_url": "https://www.youtube.com/watch?v=oPZ5xoKZ6Og", "duration": 1011},
    {"id": oid(), "title": "Python Unpacking | Asterisk * and Underscore _", "video_url": "https://www.youtube.com/watch?v=mSUBfY-Geuc", "duration": 1079},
    {"id": oid(), "title": "How to Explore & Analyze Lists in Python", "video_url": "https://www.youtube.com/watch?v=zVt7oaBUsHk", "duration": 843},
]

m5_quiz = {
    "id": oid(),
    "title": "Lists Fundamentals Quiz",
    "questions": [
        {"question": "What is the index of the first element in a Python list?", "options": ["1", "0", "-1", "None"], "correct_answer_index": 1},
        {"question": "What does my_list[-1] return?", "options": ["First element", "Last element", "Error", "None"], "correct_answer_index": 1},
        {"question": "What does len([1,2,3]) return?", "options": ["2", "3", "4", "Error"], "correct_answer_index": 1},
    ]
}

# ── Module 6: Lists Part 2 (Videos #28-#35) ──
m6_lessons = [
    {"id": oid(), "title": "How to Add, Remove, and Update Lists", "video_url": "https://www.youtube.com/watch?v=qtANRuRxiEo", "duration": 1398},
    {"id": oid(), "title": "How to Order Lists | sort(), sorted(), reverse()", "video_url": "https://www.youtube.com/watch?v=BUsmwsk8Des", "duration": 606},
    {"id": oid(), "title": "How to Copy Python Lists Safely | Shallow vs Deepcopy", "video_url": "https://www.youtube.com/watch?v=zBEwm_IBVxI", "duration": 1024},
    {"id": oid(), "title": "How to Combine Lists | 4 Simple Ways and ZIP", "video_url": "https://www.youtube.com/watch?v=9BZu1jgs2Dk", "duration": 608},
    {"id": oid(), "title": "Python Iterator vs Iterable | enumerate, map, filter", "video_url": "https://www.youtube.com/watch?v=hgQD2znCc_I", "duration": 1407},
    {"id": oid(), "title": "Python Lambda Functions", "video_url": "https://www.youtube.com/watch?v=LmTOAMpNYFA", "duration": 951},
    {"id": oid(), "title": "Python List Comprehension | The Cleanest Way to Code", "video_url": "https://www.youtube.com/watch?v=6bHDQtVfsCM", "duration": 584},
    {"id": oid(), "title": "30 Python List Operations in 5 Minutes", "video_url": "https://www.youtube.com/watch?v=c3FRTlncSWM", "duration": 361},
]

m6_quiz = {
    "id": oid(),
    "title": "Advanced Lists Quiz",
    "questions": [
        {"question": "What does [1,2,3].append(4) do?", "options": ["Returns [1,2,3,4]", "Modifies the list in place", "Creates a new list", "Error"], "correct_answer_index": 1},
        {"question": "What is the difference between sort() and sorted()?", "options": ["No difference", "sort() returns new list", "sorted() returns new list", "sorted() modifies in place"], "correct_answer_index": 2},
        {"question": "What does [x**2 for x in range(3)] produce?", "options": ["[0, 1, 4]", "[1, 4, 9]", "[0, 2, 4]", "Error"], "correct_answer_index": 0},
        {"question": "What does lambda x: x+1 do?", "options": ["Defines a named function", "Creates an anonymous function", "Throws error", "Creates a class"], "correct_answer_index": 1},
    ]
}

m6_coding = {
    "id": oid(),
    "title": "List Comprehension Challenge",
    "description": "Given a list of numbers, use list comprehension to create a new list containing only the squares of even numbers. Print each square on a new line.",
    "constraints": "Input is space-separated integers. Output each square on a new line.",
    "input_format": "Space-separated integers",
    "output_format": "Squares of even numbers, one per line",
    "starter_code": "nums = list(map(int, input().split()))\n# Write your code here\n",
    "language_id": 71,
    "test_cases": [
        {"input": "1 2 3 4 5", "expected_output": "4\n16"},
        {"input": "2 4 6", "expected_output": "4\n16\n36"},
    ]
}

# ── Module 7: Collections (Videos #36-#39) ──
m7_lessons = [
    {"id": oid(), "title": "Python Tuples (Visually Explained)", "video_url": "https://www.youtube.com/watch?v=TTkifjHCPWo", "duration": 495},
    {"id": oid(), "title": "Python Sets (Visually Explained)", "video_url": "https://www.youtube.com/watch?v=D5R9Iq3KaPI", "duration": 1109},
    {"id": oid(), "title": "Python Dictionaries (Visually Explained)", "video_url": "https://www.youtube.com/watch?v=rpsYzPv1HiQ", "duration": 1644},
    {"id": oid(), "title": "Python Data Structures: When to Use List, Tuple, Set, Dict", "video_url": "https://www.youtube.com/watch?v=h-zcj4DmqHk", "duration": 234},
]

m7_quiz = {
    "id": oid(),
    "title": "Collections Quiz",
    "questions": [
        {"question": "Which data structure is immutable?", "options": ["List", "Set", "Tuple", "Dictionary"], "correct_answer_index": 2},
        {"question": "Which data structure does NOT allow duplicates?", "options": ["List", "Tuple", "Set", "All allow duplicates"], "correct_answer_index": 2},
        {"question": "How do you access a dictionary value?", "options": ["dict[key]", "dict.key", "dict(key)", "dict->key"], "correct_answer_index": 0},
    ]
}

# ── Module 8: Functions (Videos #40-#47) ──
m8_lessons = [
    {"id": oid(), "title": "Python Functions Made Simple", "video_url": "https://www.youtube.com/watch?v=FSYoWPXfJxc", "duration": 1092},
    {"id": oid(), "title": "Python Parameters vs Arguments", "video_url": "https://www.youtube.com/watch?v=ysoVpKxefzM", "duration": 650},
    {"id": oid(), "title": "Python Parameters vs Global vs Local Variables", "video_url": "https://www.youtube.com/watch?v=3TxcPKu9ec4", "duration": 647},
    {"id": oid(), "title": "Python Positional vs Keyword Arguments | Default Parameters", "video_url": "https://www.youtube.com/watch?v=fuqCGh06hRw", "duration": 735},
    {"id": oid(), "title": "Python *Args and **Kwargs Finally Make Sense", "video_url": "https://www.youtube.com/watch?v=A9j2V2SPq3g", "duration": 492},
    {"id": oid(), "title": "Python Return Vs Print()", "video_url": "https://www.youtube.com/watch?v=DZ2yBGzvlXk", "duration": 709},
    {"id": oid(), "title": "Python Functions Types You Must Know", "video_url": "https://www.youtube.com/watch?v=aXjwdOaPrMg", "duration": 1567},
    {"id": oid(), "title": "8 Python Function Habits for Clean Code", "video_url": "https://www.youtube.com/watch?v=QipWozUPnOU", "duration": 891},
]

m8_quiz = {
    "id": oid(),
    "title": "Functions Quiz",
    "questions": [
        {"question": "What keyword is used to define a function?", "options": ["func", "def", "function", "define"], "correct_answer_index": 1},
        {"question": "What does *args do?", "options": ["Accepts keyword arguments", "Accepts positional arguments as tuple", "Creates a list", "Error"], "correct_answer_index": 1},
        {"question": "What is the difference between return and print()?", "options": ["No difference", "return sends value back, print displays it", "print sends value back", "Both send values"], "correct_answer_index": 1},
        {"question": "What is the scope of a variable defined inside a function?", "options": ["Global", "Local", "Both", "None"], "correct_answer_index": 1},
        {"question": "What does **kwargs accept?", "options": ["Positional args", "Keyword arguments as dict", "A list", "A tuple"], "correct_answer_index": 1},
    ]
}

m8_coding = {
    "id": oid(),
    "title": "Build a Calculator Function",
    "description": "Write a function 'calculate' that takes two numbers and an operator (+, -, *, /) and returns the result. Handle division by zero by returning 'Error'.",
    "constraints": "Operator is one of: +, -, *, /",
    "input_format": "Three lines: number1, number2, operator",
    "output_format": "The result (integer if whole, float otherwise) or 'Error'",
    "starter_code": "def calculate(a, b, op):\n    # Write your code here\n    pass\n\na = float(input())\nb = float(input())\nop = input().strip()\nresult = calculate(a, b, op)\nprint(int(result) if isinstance(result, float) and result == int(result) else result)\n",
    "language_id": 71,
    "test_cases": [
        {"input": "10\n5\n+", "expected_output": "15"},
        {"input": "10\n0\n/", "expected_output": "Error"},
        {"input": "7\n3\n*", "expected_output": "21"},
    ]
}


# ── Build full course document ──
def build_course():
    modules = [
        {"id": oid(), "title": "Module 1: Python Basics", "description": "Variables, data types, input, strings, and type conversion.", "lessons": m1_lessons, "quizzes": [m1_quiz], "coding_problems": []},
        {"id": oid(), "title": "Module 2: Numbers & Control Flow", "description": "Numbers, math functions, booleans, and comparison operators.", "lessons": m2_lessons, "quizzes": [m2_quiz], "coding_problems": [m2_coding]},
        {"id": oid(), "title": "Module 3: Logic & Conditionals", "description": "Logical operators, membership checks, and if/elif/else.", "lessons": m3_lessons, "quizzes": [m3_quiz], "coding_problems": []},
        {"id": oid(), "title": "Module 4: Loops", "description": "For loops, while loops, break/continue/pass, and nested loops.", "lessons": m4_lessons, "quizzes": [m4_quiz], "coding_problems": [m4_coding]},
        {"id": oid(), "title": "Module 5: Lists — Fundamentals", "description": "Creating, accessing, slicing, and analyzing lists.", "lessons": m5_lessons, "quizzes": [m5_quiz], "coding_problems": []},
        {"id": oid(), "title": "Module 6: Lists — Advanced", "description": "Mutation, sorting, comprehension, lambda, iterators.", "lessons": m6_lessons, "quizzes": [m6_quiz], "coding_problems": [m6_coding]},
        {"id": oid(), "title": "Module 7: Collections", "description": "Tuples, sets, dictionaries, and choosing the right data structure.", "lessons": m7_lessons, "quizzes": [m7_quiz], "coding_problems": []},
        {"id": oid(), "title": "Module 8: Functions", "description": "Function definition, arguments, scope, *args/**kwargs, and best practices.", "lessons": m8_lessons, "quizzes": [m8_quiz], "coding_problems": [m8_coding]},
    ]

    return {
        "title": "Python Ultimate Course",
        "description": "Learn Python from scratch in this complete 13-hour course designed for beginners who want to build real programming confidence. Covers variables, control flow, loops, data structures, and functions with visual explanations.",
        "instructor_id": "system",
        "thumbnail_url": None,
        "modules": modules,
        "enrolled_students": [],
    }


async def seed():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["examguard"]

    # Remove existing seeded course if any
    await db.courses.delete_many({"title": "Python Ultimate Course"})

    course = build_course()
    result = await db.courses.insert_one(course)
    print(f"✅ Course seeded successfully! ID: {result.inserted_id}")
    print(f"   Modules: {len(course['modules'])}")
    total_lessons = sum(len(m['lessons']) for m in course['modules'])
    total_quizzes = sum(len(m['quizzes']) for m in course['modules'])
    total_coding = sum(len(m['coding_problems']) for m in course['modules'])
    print(f"   Lessons: {total_lessons}")
    print(f"   Quizzes: {total_quizzes}")
    print(f"   Coding Problems: {total_coding}")


if __name__ == "__main__":
    asyncio.run(seed())
