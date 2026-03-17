"""
template_repository.py — Curated question bank for exam generation.

Organized by category (aptitude/technical/coding), topic, and difficulty.
All templates are in-memory Python dicts — no external files needed.

To add new questions:
  1. Add entries to the appropriate dict (APTITUDE_TEMPLATES, TECHNICAL_TEMPLATES, CODING_TEMPLATES)
  2. Follow the existing structure
  3. That's it — the builders will pick them up automatically
"""
import random
from typing import List, Dict, Optional


# ═══════════════════════════════════════════════════════════════════════
#  APTITUDE MCQ TEMPLATES
# ═══════════════════════════════════════════════════════════════════════

APTITUDE_TEMPLATES: Dict[str, List[dict]] = {
    "easy": [
        {
            "text": "If a train travels 120 km in 2 hours, what is its speed?",
            "options": ["40 km/h", "60 km/h", "80 km/h", "100 km/h"],
            "correct_option_index": 1,
            "explanation": "Speed = Distance / Time = 120 / 2 = 60 km/h"
        },
        {
            "text": "What is the next number in the series: 2, 6, 12, 20, ?",
            "options": ["28", "30", "32", "36"],
            "correct_option_index": 1,
            "explanation": "Differences: 4, 6, 8, 10. Next = 20 + 10 = 30"
        },
        {
            "text": "A book costs $15. If you get a 20% discount, how much do you pay?",
            "options": ["$10", "$11", "$12", "$13"],
            "correct_option_index": 2,
            "explanation": "Discount = 15 × 0.20 = $3. Price = 15 - 3 = $12"
        },
        {
            "text": "If 5 workers can complete a task in 10 days, how many days will 10 workers take?",
            "options": ["2 days", "5 days", "15 days", "20 days"],
            "correct_option_index": 1,
            "explanation": "Workers × Days = constant. 5×10 = 50, so 10×d = 50, d = 5"
        },
        {
            "text": "Choose the odd one out: Apple, Mango, Potato, Banana",
            "options": ["Apple", "Mango", "Potato", "Banana"],
            "correct_option_index": 2,
            "explanation": "Potato is a vegetable; the rest are fruits."
        },
        {
            "text": "What is the average of 10, 20, 30, 40, 50?",
            "options": ["25", "30", "35", "40"],
            "correct_option_index": 1,
            "explanation": "Sum = 150, Count = 5. Average = 150/5 = 30"
        },
        {
            "text": "If today is Wednesday, what day will it be after 15 days?",
            "options": ["Wednesday", "Thursday", "Friday", "Saturday"],
            "correct_option_index": 1,
            "explanation": "15 = 2 weeks + 1 day. Wednesday + 1 = Thursday"
        },
        {
            "text": "A clock shows 3:15. What is the angle between the hour and minute hands?",
            "options": ["0°", "7.5°", "15°", "30°"],
            "correct_option_index": 1,
            "explanation": "At 3:15, minute hand at 90°, hour hand at 97.5°. Angle = 7.5°"
        },
        {
            "text": "Which number is both a perfect square and a perfect cube below 100?",
            "options": ["36", "49", "64", "81"],
            "correct_option_index": 2,
            "explanation": "64 = 8² = 4³"
        },
        {
            "text": "If A is twice as old as B, and B is 15 years old, how old is A?",
            "options": ["20", "25", "30", "35"],
            "correct_option_index": 2,
            "explanation": "A = 2 × 15 = 30"
        },
    ],
    "medium": [
        {
            "text": "A pipe can fill a tank in 6 hours and another can empty it in 8 hours. If both are opened, how long to fill the tank?",
            "options": ["12 hours", "18 hours", "24 hours", "30 hours"],
            "correct_option_index": 2,
            "explanation": "Rate = 1/6 - 1/8 = 1/24. Time = 24 hours"
        },
        {
            "text": "The ratio of two numbers is 3:5. If their sum is 160, find the larger number.",
            "options": ["60", "80", "100", "120"],
            "correct_option_index": 2,
            "explanation": "5/(3+5) × 160 = 5/8 × 160 = 100"
        },
        {
            "text": "A man walks 5 km North, then 3 km East. How far is he from the starting point?",
            "options": ["√34 km", "4 km", "8 km", "√16 km"],
            "correct_option_index": 0,
            "explanation": "Distance = √(5² + 3²) = √(25+9) = √34"
        },
        {
            "text": "In how many ways can the letters of 'LEAD' be arranged?",
            "options": ["12", "24", "48", "120"],
            "correct_option_index": 1,
            "explanation": "4! = 4 × 3 × 2 × 1 = 24"
        },
        {
            "text": "What is the probability of drawing a King from a standard deck of 52 cards?",
            "options": ["1/13", "1/26", "1/52", "4/13"],
            "correct_option_index": 0,
            "explanation": "4 Kings in 52 cards = 4/52 = 1/13"
        },
        {
            "text": "If the compound interest on $1000 at 10% per annum for 2 years is:",
            "options": ["$200", "$210", "$220", "$250"],
            "correct_option_index": 1,
            "explanation": "CI = 1000(1.1² - 1) = 1000 × 0.21 = $210"
        },
        {
            "text": "A, B, and C can do a work in 12, 15, and 20 days respectively. In how many days can they do it together?",
            "options": ["4 days", "5 days", "6 days", "8 days"],
            "correct_option_index": 1,
            "explanation": "Rate = 1/12 + 1/15 + 1/20 = 12/60 = 1/5. Time = 5 days"
        },
        {
            "text": "The HCF and LCM of two numbers are 12 and 360. If one number is 60, find the other.",
            "options": ["36", "48", "72", "84"],
            "correct_option_index": 2,
            "explanation": "HCF × LCM = product. 12 × 360 = 60 × x. x = 72"
        },
    ],
    "hard": [
        {
            "text": "A boat goes 30 km upstream and 44 km downstream in 10 hours. It goes 40 km upstream and 55 km downstream in 13 hours. Find the speed of the stream.",
            "options": ["3 km/h", "4 km/h", "5 km/h", "6 km/h"],
            "correct_option_index": 0,
            "explanation": "Let boat speed = x, stream = y. Solving: 30/(x-y) + 44/(x+y) = 10 and 40/(x-y) + 55/(x+y) = 13 gives y = 3"
        },
        {
            "text": "In a class, 60% students passed in English, 70% in Math, and 40% in both. What percentage passed in at least one subject?",
            "options": ["85%", "90%", "95%", "100%"],
            "correct_option_index": 1,
            "explanation": "P(A∪B) = P(A) + P(B) - P(A∩B) = 60 + 70 - 40 = 90%"
        },
        {
            "text": "A sum of $8000 is invested at 5% CI. After how many years will it exceed $10,000?",
            "options": ["3 years", "4 years", "5 years", "6 years"],
            "correct_option_index": 2,
            "explanation": "8000 × 1.05^n > 10000. 1.05^5 = 1.276 → 8000 × 1.276 = 10210 > 10000"
        },
        {
            "text": "How many 3-digit numbers are divisible by 7?",
            "options": ["126", "128", "130", "132"],
            "correct_option_index": 1,
            "explanation": "First = 105 (15×7), Last = 994 (142×7). Count = 142 - 15 + 1 = 128"
        },
        {
            "text": "A bag contains 5 red, 4 blue, and 3 green balls. If 3 balls are drawn, what is the probability that all are red?",
            "options": ["1/22", "1/44", "1/66", "1/11"],
            "correct_option_index": 0,
            "explanation": "C(5,3)/C(12,3) = 10/220 = 1/22"
        },
    ],
}


# ═══════════════════════════════════════════════════════════════════════
#  TECHNICAL MCQ TEMPLATES
# ═══════════════════════════════════════════════════════════════════════

TECHNICAL_TEMPLATES: Dict[str, Dict[str, List[dict]]] = {
    "python": {
        "easy": [
            {"text": "What is the output of `print(type([]))`?", "options": ["<class 'list'>", "<class 'tuple'>", "<class 'dict'>", "<class 'set'>"], "correct_option_index": 0, "explanation": "[] creates a list."},
            {"text": "Which keyword is used to define a function in Python?", "options": ["func", "function", "def", "define"], "correct_option_index": 2, "explanation": "The 'def' keyword defines functions."},
            {"text": "What does `len('hello')` return?", "options": ["4", "5", "6", "Error"], "correct_option_index": 1, "explanation": "'hello' has 5 characters."},
            {"text": "Which data type is immutable in Python?", "options": ["list", "dict", "set", "tuple"], "correct_option_index": 3, "explanation": "Tuples are immutable."},
            {"text": "What is the output of `print(2 ** 3)`?", "options": ["5", "6", "8", "9"], "correct_option_index": 2, "explanation": "** is the power operator. 2³ = 8"},
            {"text": "How do you create a comment in Python?", "options": ["// comment", "/* comment */", "# comment", "-- comment"], "correct_option_index": 2, "explanation": "# starts a single-line comment in Python."},
            {"text": "What is the output of `bool(0)`?", "options": ["True", "False", "0", "None"], "correct_option_index": 1, "explanation": "0 is falsy in Python."},
            {"text": "Which method adds an element to the end of a list?", "options": ["add()", "push()", "append()", "insert()"], "correct_option_index": 2, "explanation": "append() adds to the end of a list."},
        ],
        "medium": [
            {"text": "What is the output of `[x**2 for x in range(5)]`?", "options": ["[0, 1, 4, 9, 16]", "[1, 4, 9, 16, 25]", "[0, 1, 2, 3, 4]", "[1, 2, 3, 4, 5]"], "correct_option_index": 0, "explanation": "List comprehension: 0²=0, 1²=1, 2²=4, 3²=9, 4²=16"},
            {"text": "What does the `*args` syntax do in a function definition?", "options": ["Creates a list argument", "Accepts keyword arguments", "Accepts variable positional arguments", "Unpacks a dictionary"], "correct_option_index": 2, "explanation": "*args collects extra positional arguments into a tuple."},
            {"text": "What is the difference between `is` and `==` in Python?", "options": ["No difference", "`is` checks identity, `==` checks equality", "`is` checks equality, `==` checks identity", "`is` is faster"], "correct_option_index": 1, "explanation": "`is` checks if two references point to the same object, `==` checks value equality."},
            {"text": "What is the output of `'hello'[::-1]`?", "options": ["'hello'", "'olleh'", "'h'", "Error"], "correct_option_index": 1, "explanation": "[::-1] reverses a string."},
            {"text": "Which module is used for regular expressions in Python?", "options": ["regex", "re", "regexp", "pyregex"], "correct_option_index": 1, "explanation": "The 're' module provides regex support."},
            {"text": "What is a decorator in Python?", "options": ["A design pattern", "A function that modifies another function", "A class method", "A type annotation"], "correct_option_index": 1, "explanation": "Decorators wrap functions to extend behavior."},
        ],
        "hard": [
            {"text": "What is the output of `print([1,2,3] + [4,5] * 2)`?", "options": ["[1,2,3,4,5,4,5]", "[1,2,3,8,10]", "[2,4,6,4,5]", "Error"], "correct_option_index": 0, "explanation": "[4,5]*2 = [4,5,4,5], then concatenated."},
            {"text": "What is the purpose of `__slots__` in a Python class?", "options": ["To define class methods", "To restrict attribute creation and save memory", "To create properties", "To enable multiple inheritance"], "correct_option_index": 1, "explanation": "__slots__ prevents __dict__ creation, saving memory."},
            {"text": "What is a metaclass in Python?", "options": ["A class that inherits from object", "A class whose instances are classes", "A class decorator", "A type hint"], "correct_option_index": 1, "explanation": "Metaclasses define how classes themselves are created."},
            {"text": "What is the GIL in CPython?", "options": ["Global Import Lock", "Global Interpreter Lock", "General Interface Layer", "Generic Input Loop"], "correct_option_index": 1, "explanation": "The GIL prevents multiple threads from executing Python bytecode simultaneously."},
        ],
    },
    "java": {
        "easy": [
            {"text": "Which keyword is used to create an object in Java?", "options": ["create", "new", "object", "init"], "correct_option_index": 1, "explanation": "The 'new' keyword creates objects."},
            {"text": "What is the default value of an int variable in Java?", "options": ["null", "0", "undefined", "-1"], "correct_option_index": 1, "explanation": "Primitive int defaults to 0."},
            {"text": "Which method is the entry point of a Java program?", "options": ["start()", "init()", "main()", "run()"], "correct_option_index": 2, "explanation": "public static void main(String[] args) is the entry point."},
            {"text": "What does JVM stand for?", "options": ["Java Visual Machine", "Java Virtual Machine", "Java Variable Method", "Java Verified Module"], "correct_option_index": 1, "explanation": "JVM = Java Virtual Machine."},
        ],
        "medium": [
            {"text": "What is the difference between `==` and `.equals()` in Java?", "options": ["No difference", "`==` compares references, `.equals()` compares values", "`==` compares values, `.equals()` compares references", "`==` is faster"], "correct_option_index": 1, "explanation": "== checks reference equality; .equals() checks value equality."},
            {"text": "Which collection does not allow duplicate elements?", "options": ["ArrayList", "LinkedList", "HashSet", "Vector"], "correct_option_index": 2, "explanation": "HashSet implements Set, which forbids duplicates."},
            {"text": "What is the purpose of the `final` keyword?", "options": ["To end a program", "To prevent modification (immutable variable, uninheritable class, unoverridable method)", "To finalize garbage collection", "To close streams"], "correct_option_index": 1, "explanation": "final prevents variables from being reassigned, classes from being extended, methods from being overridden."},
            {"text": "What is an abstract class in Java?", "options": ["A class with no methods", "A class that cannot be instantiated directly", "A class with only static methods", "A class with private constructor"], "correct_option_index": 1, "explanation": "Abstract classes are templates that must be subclassed."},
        ],
        "hard": [
            {"text": "What is the diamond problem in Java?", "options": ["A compiler optimization issue", "An ambiguity in multiple inheritance", "A memory leak pattern", "A threading deadlock"], "correct_option_index": 1, "explanation": "The diamond problem occurs when a class inherits from two classes that have a common ancestor."},
            {"text": "What is the difference between `Comparable` and `Comparator` interfaces?", "options": ["No difference", "Comparable defines natural ordering, Comparator defines custom ordering", "Comparable is faster", "Comparator is deprecated"], "correct_option_index": 1, "explanation": "Comparable uses compareTo() for natural ordering; Comparator uses compare() for custom ordering."},
        ],
    },
    "javascript": {
        "easy": [
            {"text": "Which keyword declares a block-scoped variable in JavaScript?", "options": ["var", "let", "define", "dim"], "correct_option_index": 1, "explanation": "'let' declares block-scoped variables."},
            {"text": "What does `typeof null` return?", "options": ["'null'", "'undefined'", "'object'", "'boolean'"], "correct_option_index": 2, "explanation": "typeof null is 'object' — a well-known JS quirk."},
            {"text": "How do you write a single-line comment in JavaScript?", "options": ["# comment", "// comment", "/* comment */", "-- comment"], "correct_option_index": 1, "explanation": "// starts a single-line comment in JS."},
            {"text": "What is the output of `console.log(1 + '2')`?", "options": ["3", "12", "'12'", "Error"], "correct_option_index": 2, "explanation": "JS coerces 1 to string, resulting in '12'."},
        ],
        "medium": [
            {"text": "What is a closure in JavaScript?", "options": ["A way to close files", "A function with access to its outer scope", "A design pattern", "A loop construct"], "correct_option_index": 1, "explanation": "Closures remember their outer scope variables."},
            {"text": "What does `Array.prototype.reduce()` do?", "options": ["Removes elements", "Reduces array to a single value", "Makes array smaller", "Filters duplicates"], "correct_option_index": 1, "explanation": "reduce() accumulates array values into a single result."},
            {"text": "What is the event loop in JavaScript?", "options": ["A for loop for events", "The mechanism that handles async operations", "A DOM event handler", "A timer function"], "correct_option_index": 1, "explanation": "The event loop processes callbacks from async operations."},
            {"text": "What is the difference between `null` and `undefined`?", "options": ["No difference", "null is intentional absence, undefined means not assigned", "null is for numbers, undefined is for strings", "undefined is deprecated"], "correct_option_index": 1, "explanation": "null is explicitly set; undefined means variable exists but has no value."},
        ],
        "hard": [
            {"text": "What is the output of `console.log(0.1 + 0.2 === 0.3)`?", "options": ["true", "false", "undefined", "Error"], "correct_option_index": 1, "explanation": "Floating point: 0.1 + 0.2 = 0.30000000000000004"},
            {"text": "What is the purpose of `Symbol` in JavaScript?", "options": ["To create icons", "To create unique, immutable identifiers", "To define constants", "To encrypt data"], "correct_option_index": 1, "explanation": "Symbols are unique identifiers, useful for object property keys."},
        ],
    },
    "dsa": {
        "easy": [
            {"text": "What is the time complexity of accessing an element in an array by index?", "options": ["O(1)", "O(n)", "O(log n)", "O(n²)"], "correct_option_index": 0, "explanation": "Array index access is constant time."},
            {"text": "Which data structure follows LIFO (Last In First Out)?", "options": ["Queue", "Stack", "Array", "Linked List"], "correct_option_index": 1, "explanation": "Stacks use LIFO ordering."},
            {"text": "What is the time complexity of linear search?", "options": ["O(1)", "O(log n)", "O(n)", "O(n²)"], "correct_option_index": 2, "explanation": "Linear search checks each element once."},
            {"text": "Which data structure follows FIFO (First In First Out)?", "options": ["Stack", "Queue", "Tree", "Graph"], "correct_option_index": 1, "explanation": "Queues use FIFO ordering."},
        ],
        "medium": [
            {"text": "What is the time complexity of binary search?", "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"], "correct_option_index": 1, "explanation": "Binary search halves the search space each step."},
            {"text": "Which sorting algorithm has the best average-case time complexity?", "options": ["Bubble Sort O(n²)", "Merge Sort O(n log n)", "Selection Sort O(n²)", "Insertion Sort O(n²)"], "correct_option_index": 1, "explanation": "Merge sort consistently runs in O(n log n)."},
            {"text": "What is the worst-case time complexity of QuickSort?", "options": ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], "correct_option_index": 2, "explanation": "QuickSort degrades to O(n²) with poor pivot selection."},
            {"text": "What is a hash collision?", "options": ["When two keys map to the same hash index", "When the hash table is full", "When a key is not found", "When the hash function fails"], "correct_option_index": 0, "explanation": "Collisions occur when different keys produce the same hash."},
        ],
        "hard": [
            {"text": "What is the time complexity of building a min-heap from an unsorted array?", "options": ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], "correct_option_index": 0, "explanation": "Bottom-up heap construction is O(n) using sift-down."},
            {"text": "Which algorithm finds the shortest path in a weighted graph with no negative edges?", "options": ["BFS", "DFS", "Dijkstra's", "Bellman-Ford"], "correct_option_index": 2, "explanation": "Dijkstra's is optimal for non-negative weighted graphs."},
            {"text": "What is the amortized time complexity of inserting into a dynamic array?", "options": ["O(1)", "O(n)", "O(log n)", "O(n²)"], "correct_option_index": 0, "explanation": "Despite occasional resizing (O(n)), amortized cost is O(1)."},
        ],
    },
    "general": {
        "easy": [
            {"text": "What does HTML stand for?", "options": ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Main Language", "Home Tool Markup Language"], "correct_option_index": 0, "explanation": "HTML = Hyper Text Markup Language."},
            {"text": "What is an API?", "options": ["Application Programming Interface", "Advanced Program Integration", "Automated Protocol Interface", "Application Process Integration"], "correct_option_index": 0, "explanation": "API = Application Programming Interface."},
            {"text": "What does CSS stand for?", "options": ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Coded Style Sheets"], "correct_option_index": 1, "explanation": "CSS = Cascading Style Sheets."},
            {"text": "Which protocol is used for secure web communication?", "options": ["HTTP", "FTP", "HTTPS", "SMTP"], "correct_option_index": 2, "explanation": "HTTPS adds TLS encryption to HTTP."},
        ],
        "medium": [
            {"text": "What is the difference between SQL and NoSQL databases?", "options": ["SQL is newer", "SQL is relational, NoSQL is non-relational", "NoSQL is faster", "No real difference"], "correct_option_index": 1, "explanation": "SQL databases are structured/relational; NoSQL databases are flexible/document-based."},
            {"text": "What is REST in the context of APIs?", "options": ["A programming language", "Representational State Transfer — an architectural style", "A database query format", "A testing framework"], "correct_option_index": 1, "explanation": "REST is an architectural style for designing networked applications."},
            {"text": "What is version control?", "options": ["A testing method", "A system for tracking changes in code", "A deployment tool", "A code editor feature"], "correct_option_index": 1, "explanation": "Version control systems like Git track and manage code changes."},
        ],
        "hard": [
            {"text": "What is eventual consistency in distributed systems?", "options": ["Data is always consistent", "All replicas converge to the same value given enough time", "Data is lost eventually", "Consistency is not guaranteed"], "correct_option_index": 1, "explanation": "Eventual consistency ensures replicas synchronize over time."},
            {"text": "What is the CAP theorem?", "options": ["A sorting algorithm", "You can only guarantee 2 of: Consistency, Availability, Partition tolerance", "A design pattern", "A security model"], "correct_option_index": 1, "explanation": "CAP theorem states distributed systems can at most satisfy 2 of the 3 properties."},
        ],
    },
}


# ═══════════════════════════════════════════════════════════════════════
#  CODING PROBLEM TEMPLATES
# ═══════════════════════════════════════════════════════════════════════

CODING_TEMPLATES: Dict[str, Dict[str, List[dict]]] = {
    "python": {
        "easy": [
            {
                "text": "Two Sum",
                "problem_statement": "Given a list of integers `nums` and an integer `target`, return the indices of the two numbers that add up to the target.\n\nYou may assume that each input has exactly one solution.\n\nExample:\n  Input: nums = [2, 7, 11, 15], target = 9\n  Output: 0 1",
                "constraints": "2 <= len(nums) <= 1000\n-10^9 <= nums[i] <= 10^9",
                "test_cases": [
                    {"input": "4\n2 7 11 15\n9", "output": "0 1", "is_hidden": False},
                    {"input": "3\n3 2 4\n6", "output": "1 2", "is_hidden": False},
                    {"input": "2\n3 3\n6", "output": "0 1", "is_hidden": True},
                ],
                "starter_code": "# Read input and solve\nn = int(input())\nnums = list(map(int, input().split()))\ntarget = int(input())\n\n# Your code here\n",
            },
            {
                "text": "Reverse a String",
                "problem_statement": "Given a string, return it reversed.\n\nExample:\n  Input: hello\n  Output: olleh",
                "constraints": "1 <= len(s) <= 10000",
                "test_cases": [
                    {"input": "hello", "output": "olleh", "is_hidden": False},
                    {"input": "Python", "output": "nohtyP", "is_hidden": False},
                    {"input": "a", "output": "a", "is_hidden": True},
                    {"input": "racecar", "output": "racecar", "is_hidden": True},
                ],
                "starter_code": "s = input()\n# Your code here\n",
            },
            {
                "text": "Find the Maximum",
                "problem_statement": "Given a list of integers, find and print the maximum value.\n\nExample:\n  Input: 5\\n3 1 4 1 5\n  Output: 5",
                "constraints": "1 <= n <= 10000\n-10^6 <= nums[i] <= 10^6",
                "test_cases": [
                    {"input": "5\n3 1 4 1 5", "output": "5", "is_hidden": False},
                    {"input": "3\n-1 -2 -3", "output": "-1", "is_hidden": False},
                    {"input": "1\n42", "output": "42", "is_hidden": True},
                ],
                "starter_code": "n = int(input())\nnums = list(map(int, input().split()))\n# Your code here\n",
            },
            {
                "text": "Count Vowels",
                "problem_statement": "Given a string, count and print the number of vowels (a, e, i, o, u — case insensitive).\n\nExample:\n  Input: Hello World\n  Output: 3",
                "constraints": "1 <= len(s) <= 10000",
                "test_cases": [
                    {"input": "Hello World", "output": "3", "is_hidden": False},
                    {"input": "aeiou", "output": "5", "is_hidden": False},
                    {"input": "xyz", "output": "0", "is_hidden": True},
                ],
                "starter_code": "s = input()\n# Your code here\n",
            },
        ],
        "medium": [
            {
                "text": "Valid Parentheses",
                "problem_statement": "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string has valid (balanced) parentheses.\n\nPrint 'true' if valid, 'false' otherwise.\n\nExample:\n  Input: ()[]{}\n  Output: true",
                "constraints": "1 <= len(s) <= 10000",
                "test_cases": [
                    {"input": "()[]{}", "output": "true", "is_hidden": False},
                    {"input": "(]", "output": "false", "is_hidden": False},
                    {"input": "([{}])", "output": "true", "is_hidden": True},
                    {"input": "", "output": "true", "is_hidden": True},
                ],
                "starter_code": "s = input()\n# Your code here\n",
            },
            {
                "text": "Fibonacci Sequence",
                "problem_statement": "Given an integer n, print the first n Fibonacci numbers separated by spaces.\n\nThe Fibonacci sequence starts: 0 1 1 2 3 5 8 ...\n\nExample:\n  Input: 6\n  Output: 0 1 1 2 3 5",
                "constraints": "1 <= n <= 50",
                "test_cases": [
                    {"input": "6", "output": "0 1 1 2 3 5", "is_hidden": False},
                    {"input": "1", "output": "0", "is_hidden": False},
                    {"input": "10", "output": "0 1 1 2 3 5 8 13 21 34", "is_hidden": True},
                ],
                "starter_code": "n = int(input())\n# Your code here\n",
            },
            {
                "text": "Palindrome Check",
                "problem_statement": "Given a string, check if it is a palindrome (reads the same forwards and backwards). Consider only alphanumeric characters and ignore case.\n\nPrint 'true' or 'false'.\n\nExample:\n  Input: A man a plan a canal Panama\n  Output: true",
                "constraints": "1 <= len(s) <= 10000",
                "test_cases": [
                    {"input": "A man a plan a canal Panama", "output": "true", "is_hidden": False},
                    {"input": "racecar", "output": "true", "is_hidden": False},
                    {"input": "hello", "output": "false", "is_hidden": True},
                ],
                "starter_code": "s = input()\n# Your code here\n",
            },
        ],
        "hard": [
            {
                "text": "Longest Common Subsequence",
                "problem_statement": "Given two strings, find the length of their longest common subsequence.\n\nA subsequence is a sequence that can be derived from another sequence by deleting some elements without changing the order.\n\nExample:\n  Input:\n  abcde\n  ace\n  Output: 3",
                "constraints": "1 <= len(s1), len(s2) <= 1000",
                "test_cases": [
                    {"input": "abcde\nace", "output": "3", "is_hidden": False},
                    {"input": "abc\nabc", "output": "3", "is_hidden": False},
                    {"input": "abc\ndef", "output": "0", "is_hidden": True},
                    {"input": "abcdef\nbdf", "output": "3", "is_hidden": True},
                ],
                "starter_code": "s1 = input()\ns2 = input()\n# Your code here\n",
            },
            {
                "text": "Merge Intervals",
                "problem_statement": "Given a list of intervals, merge all overlapping intervals.\n\nInput format: First line is n (number of intervals), followed by n lines each with two integers (start end).\n\nOutput: Print merged intervals, one per line.\n\nExample:\n  Input:\n  4\n  1 3\n  2 6\n  8 10\n  15 18\n  Output:\n  1 6\n  8 10\n  15 18",
                "constraints": "1 <= n <= 10000\n0 <= start <= end <= 10^6",
                "test_cases": [
                    {"input": "4\n1 3\n2 6\n8 10\n15 18", "output": "1 6\n8 10\n15 18", "is_hidden": False},
                    {"input": "2\n1 4\n4 5", "output": "1 5", "is_hidden": False},
                    {"input": "1\n1 1", "output": "1 1", "is_hidden": True},
                ],
                "starter_code": "n = int(input())\nintervals = []\nfor _ in range(n):\n    a, b = map(int, input().split())\n    intervals.append([a, b])\n# Your code here\n",
            },
        ],
    },
    "java": {
        "easy": [
            {
                "text": "Sum of Array Elements",
                "problem_statement": "Given an array of integers, find and print the sum of all elements.\n\nInput: First line is n, second line has n space-separated integers.\n\nExample:\n  Input: 5\\n1 2 3 4 5\n  Output: 15",
                "constraints": "1 <= n <= 10000",
                "test_cases": [
                    {"input": "5\n1 2 3 4 5", "output": "15", "is_hidden": False},
                    {"input": "3\n-1 0 1", "output": "0", "is_hidden": False},
                    {"input": "1\n100", "output": "100", "is_hidden": True},
                ],
                "starter_code": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        // Your code here\n    }\n}\n",
            },
        ],
        "medium": [
            {
                "text": "Check Anagram",
                "problem_statement": "Given two strings, determine if they are anagrams of each other (contain the same characters with the same frequencies).\n\nPrint 'true' or 'false'.\n\nExample:\n  Input:\n  listen\n  silent\n  Output: true",
                "constraints": "1 <= len(s) <= 10000",
                "test_cases": [
                    {"input": "listen\nsilent", "output": "true", "is_hidden": False},
                    {"input": "hello\nworld", "output": "false", "is_hidden": False},
                    {"input": "a\na", "output": "true", "is_hidden": True},
                ],
                "starter_code": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s1 = sc.nextLine();\n        String s2 = sc.nextLine();\n        // Your code here\n    }\n}\n",
            },
        ],
        "hard": [
            {
                "text": "Binary Search Tree Validation",
                "problem_statement": "Given a binary tree represented as a level-order array (using -1 for null nodes), determine if it is a valid Binary Search Tree.\n\nPrint 'true' or 'false'.\n\nExample:\n  Input: 5\n  2 1 3 -1 -1 -1 -1\n  Output: true",
                "constraints": "1 <= n <= 1000",
                "test_cases": [
                    {"input": "3\n2 1 3", "output": "true", "is_hidden": False},
                    {"input": "5\n5 1 4 -1 -1 3 6", "output": "false", "is_hidden": False},
                ],
                "starter_code": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        // Your code here\n    }\n}\n",
            },
        ],
    },
    "general": {
        "easy": [
            {
                "text": "FizzBuzz",
                "problem_statement": "Print numbers from 1 to n. For multiples of 3, print 'Fizz'. For multiples of 5, print 'Buzz'. For multiples of both, print 'FizzBuzz'.\n\nExample:\n  Input: 5\n  Output:\n  1\n  2\n  Fizz\n  4\n  Buzz",
                "constraints": "1 <= n <= 1000",
                "test_cases": [
                    {"input": "5", "output": "1\n2\nFizz\n4\nBuzz", "is_hidden": False},
                    {"input": "15", "output": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz", "is_hidden": False},
                    {"input": "1", "output": "1", "is_hidden": True},
                ],
                "starter_code": "n = int(input())\n# Your code here\n",
            },
        ],
        "medium": [
            {
                "text": "Matrix Transpose",
                "problem_statement": "Given an m×n matrix, print its transpose.\n\nInput: First line: m n. Next m lines: n space-separated integers.\n\nExample:\n  Input:\n  2 3\n  1 2 3\n  4 5 6\n  Output:\n  1 4\n  2 5\n  3 6",
                "constraints": "1 <= m, n <= 100",
                "test_cases": [
                    {"input": "2 3\n1 2 3\n4 5 6", "output": "1 4\n2 5\n3 6", "is_hidden": False},
                    {"input": "1 1\n5", "output": "5", "is_hidden": True},
                ],
                "starter_code": "m, n = map(int, input().split())\nmatrix = []\nfor _ in range(m):\n    row = list(map(int, input().split()))\n    matrix.append(row)\n# Your code here\n",
            },
        ],
        "hard": [
            {
                "text": "N-Queens Count",
                "problem_statement": "Given an integer n, find the number of distinct solutions to the N-Queens puzzle.\n\nExample:\n  Input: 4\n  Output: 2",
                "constraints": "1 <= n <= 12",
                "test_cases": [
                    {"input": "4", "output": "2", "is_hidden": False},
                    {"input": "1", "output": "1", "is_hidden": False},
                    {"input": "8", "output": "92", "is_hidden": True},
                ],
                "starter_code": "n = int(input())\n# Your code here\n",
            },
        ],
    },
}


# ═══════════════════════════════════════════════════════════════════════
#  PUBLIC API
# ═══════════════════════════════════════════════════════════════════════

def get_aptitude_questions(difficulty: str, count: int) -> List[dict]:
    """Return up to `count` aptitude MCQ templates for the given difficulty."""
    pool = APTITUDE_TEMPLATES.get(difficulty, APTITUDE_TEMPLATES["medium"])
    return random.sample(pool, min(count, len(pool)))


def get_technical_questions(topic: str, difficulty: str, count: int) -> List[dict]:
    """Return up to `count` technical MCQ templates for the given topic + difficulty."""
    # Try exact topic match, then fall back to "general"
    topic_bank = TECHNICAL_TEMPLATES.get(topic, TECHNICAL_TEMPLATES.get("general", {}))
    pool = topic_bank.get(difficulty, topic_bank.get("medium", []))

    if len(pool) < count:
        # Supplement from other difficulties of the same topic
        for diff in ("easy", "medium", "hard"):
            if diff != difficulty:
                extra = topic_bank.get(diff, [])
                pool = pool + [q for q in extra if q not in pool]
                if len(pool) >= count:
                    break

    if len(pool) < count:
        # Supplement from general pool
        general = TECHNICAL_TEMPLATES.get("general", {})
        for diff in ("easy", "medium", "hard"):
            extra = general.get(diff, [])
            pool = pool + [q for q in extra if q not in pool]
            if len(pool) >= count:
                break

    return random.sample(pool, min(count, len(pool)))


def get_coding_questions(topic: str, difficulty: str, count: int) -> List[dict]:
    """Return up to `count` coding problem templates for the given topic + difficulty."""
    topic_bank = CODING_TEMPLATES.get(topic, CODING_TEMPLATES.get("general", {}))
    pool = topic_bank.get(difficulty, topic_bank.get("medium", []))

    if len(pool) < count:
        for diff in ("easy", "medium", "hard"):
            if diff != difficulty:
                extra = topic_bank.get(diff, [])
                pool = pool + [q for q in extra if q not in pool]
                if len(pool) >= count:
                    break

    if len(pool) < count:
        general = CODING_TEMPLATES.get("general", {})
        for diff in ("easy", "medium", "hard"):
            extra = general.get(diff, [])
            pool = pool + [q for q in extra if q not in pool]
            if len(pool) >= count:
                break

    return random.sample(pool, min(count, len(pool)))
