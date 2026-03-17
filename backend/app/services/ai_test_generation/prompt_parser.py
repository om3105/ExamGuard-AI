"""
prompt_parser.py — Natural language prompt parser for exam generation.

Extracts structured parameters (topic, difficulty, counts, language)
from free-text admin prompts using regex and keyword matching.
Falls back to sensible defaults when the prompt is vague.

Examples of supported prompts:
  - "Create a beginner Python test with 5 aptitude MCQs, 10 technical MCQs, and 2 coding questions"
  - "Generate a Java DSA screening test for intermediate students"
  - "Create an OOPs assessment with easy aptitude and medium coding problems"
"""
import re
from typing import Optional
from .schemas import ParsedPrompt


# ── Keyword → value mappings ──────────────────────────────────────────

DIFFICULTY_KEYWORDS = {
    "beginner": "easy", "easy": "easy", "basic": "easy", "simple": "easy",
    "intermediate": "medium", "medium": "medium", "moderate": "medium",
    "advanced": "hard", "hard": "hard", "difficult": "hard", "expert": "hard",
}

LANGUAGE_KEYWORDS = [
    "python", "java", "javascript", "js", "c++", "cpp", "c#", "csharp",
    "typescript", "ts", "go", "golang", "rust", "ruby", "php", "swift", "kotlin",
    "sql", "html", "css", "react", "node", "nodejs",
]

TOPIC_KEYWORDS = [
    "dsa", "data structures", "algorithms", "oops", "oop", "object oriented",
    "web development", "web dev", "database", "dbms", "networking", "networks",
    "operating systems", "os", "machine learning", "ml", "ai",
    "aptitude", "logical reasoning", "quantitative", "verbal",
    "arrays", "strings", "linked list", "trees", "graphs", "sorting",
    "dynamic programming", "dp", "recursion", "stacks", "queues",
    "sql", "nosql", "mongodb", "api", "rest", "frontend", "backend",
]

# ── Count extraction patterns ─────────────────────────────────────────

COUNT_PATTERNS = [
    # "5 aptitude MCQs" / "5 aptitude questions"
    (r"(\d+)\s*(?:aptitude|apt)\s*(?:mcq|question|q)s?", "aptitude"),
    # "10 technical MCQs"
    (r"(\d+)\s*(?:technical|tech)\s*(?:mcq|question|q)s?", "technical"),
    # "2 coding questions"
    (r"(\d+)\s*(?:coding|code|programming)\s*(?:question|problem|challenge|q)s?", "coding"),
    # Generic "N MCQs" → split evenly to aptitude + technical
    (r"(\d+)\s*mcqs?\b", "mcq_generic"),
    # Generic "N questions"
    (r"(\d+)\s*questions?\b", "generic"),
]

DURATION_PATTERN = re.compile(
    r"(\d+)\s*(?:min(?:ute)?s?|hrs?|hours?)", re.IGNORECASE
)


def parse_prompt(prompt: str) -> ParsedPrompt:
    """Parse a free-text prompt into structured generation parameters."""
    text = prompt.lower().strip()
    if not text:
        return ParsedPrompt()

    # ── Extract difficulty ────────────────────────────────────────
    difficulty = "medium"
    for kw, diff in DIFFICULTY_KEYWORDS.items():
        if kw in text:
            difficulty = diff
            break

    # ── Extract language ──────────────────────────────────────────
    language = None
    for lang in LANGUAGE_KEYWORDS:
        # Word boundary match to avoid "java" matching in "javascript"
        if re.search(rf"\b{re.escape(lang)}\b", text):
            # Normalize aliases
            if lang in ("js",):
                language = "javascript"
            elif lang in ("cpp", "c++"):
                language = "cpp"
            elif lang in ("csharp", "c#"):
                language = "csharp"
            elif lang in ("ts",):
                language = "typescript"
            elif lang in ("golang",):
                language = "go"
            elif lang in ("nodejs",):
                language = "javascript"
            else:
                language = lang
            break

    # ── Extract topic ─────────────────────────────────────────────
    topic = language  # Default topic to language if found
    for t in TOPIC_KEYWORDS:
        if t in text:
            topic = t
            break

    # ── Extract counts ────────────────────────────────────────────
    aptitude_count: Optional[int] = None
    technical_count: Optional[int] = None
    coding_count: Optional[int] = None

    for pattern, kind in COUNT_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            n = int(match.group(1))
            if kind == "aptitude":
                aptitude_count = min(n, 30)
            elif kind == "technical":
                technical_count = min(n, 30)
            elif kind == "coding":
                coding_count = min(n, 10)
            elif kind == "mcq_generic" and aptitude_count is None and technical_count is None:
                half = n // 2
                aptitude_count = half
                technical_count = n - half
            elif kind == "generic" and aptitude_count is None and technical_count is None and coding_count is None:
                aptitude_count = max(1, n // 3)
                technical_count = max(1, n // 3)
                coding_count = max(1, n - aptitude_count - technical_count)

    # ── Extract duration ──────────────────────────────────────────
    duration_minutes = 60
    dur_match = DURATION_PATTERN.search(text)
    if dur_match:
        val = int(dur_match.group(1))
        if "hour" in dur_match.group(0).lower() or "hr" in dur_match.group(0).lower():
            val *= 60
        duration_minutes = max(10, min(val, 300))

    # ── Build title ───────────────────────────────────────────────
    title_parts = []
    if difficulty != "medium":
        title_parts.append(difficulty.capitalize())
    if topic:
        title_parts.append(topic.upper() if len(topic) <= 4 else topic.title())
    title_parts.append("Assessment")
    title = " ".join(title_parts) if title_parts else "Generated Assessment"

    # ── Collect tags ──────────────────────────────────────────────
    tags = []
    if topic:
        tags.append(topic)
    if language and language != topic:
        tags.append(language)
    if difficulty:
        tags.append(difficulty)

    return ParsedPrompt(
        title=title,
        topic=topic or "general",
        language=language,
        difficulty=difficulty,
        aptitude_count=aptitude_count if aptitude_count is not None else 5,
        technical_count=technical_count if technical_count is not None else 5,
        coding_count=coding_count if coding_count is not None else 2,
        duration_minutes=duration_minutes,
        tags=tags,
    )
