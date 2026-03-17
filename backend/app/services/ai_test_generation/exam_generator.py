"""
exam_generator.py — Orchestrator for AI exam generation.

Uses the Strategy pattern: the default TemplateStrategy builds exams
from curated question banks. In the future, a hosted LLM strategy
can be swapped in via the same interface, without changing the route
layer or frontend.

Flow:
  1. Parse admin prompt → ParsedPrompt
  2. Merge with explicit config (explicit values override parsed ones)
  3. Delegate to active GenerationStrategy
  4. Validate output
  5. Return GeneratedExam
"""
from abc import ABC, abstractmethod
from typing import Optional
from .schemas import GenerateTestRequest, ParsedPrompt, GeneratedExam, GeneratedSection
from .prompt_parser import parse_prompt
from .mcq_builder import build_aptitude_mcqs, build_technical_mcqs
from .coding_question_builder import build_coding_questions
import logging

logger = logging.getLogger("ai_test_generation")


# ═══════════════════════════════════════════════════════════════════════
#  Strategy Interface (for future LLM swap-in)
# ═══════════════════════════════════════════════════════════════════════

class GenerationStrategy(ABC):
    """Interface for exam generation strategies.
    
    Implement this to add alternative generation engines (e.g. hosted LLM).
    """
    @abstractmethod
    def generate(self, params: ParsedPrompt) -> GeneratedExam:
        """Generate a full exam from parsed parameters."""
        ...


# ═══════════════════════════════════════════════════════════════════════
#  Template Strategy (default — free, cloud-safe, no dependencies)
# ═══════════════════════════════════════════════════════════════════════

class TemplateStrategy(GenerationStrategy):
    """Produces exams from curated question templates."""

    def generate(self, params: ParsedPrompt) -> GeneratedExam:
        sections = []
        total_marks = 0
        topic = params.topic or "general"
        language = params.language or topic
        difficulty = params.difficulty

        # ── Section 1: Aptitude MCQs ──────────────────────────────
        if params.aptitude_count > 0:
            apt_questions = build_aptitude_mcqs(difficulty, params.aptitude_count)
            apt_marks = sum(q["points"] for q in apt_questions)
            total_marks += apt_marks
            sections.append(GeneratedSection(
                title="Aptitude MCQ",
                description=f"{len(apt_questions)} aptitude questions ({difficulty} difficulty)",
                questions=apt_questions,
            ))

        # ── Section 2: Technical MCQs ─────────────────────────────
        if params.technical_count > 0:
            tech_questions = build_technical_mcqs(language, difficulty, params.technical_count)
            tech_marks = sum(q["points"] for q in tech_questions)
            total_marks += tech_marks
            sections.append(GeneratedSection(
                title="Technical MCQ",
                description=f"{len(tech_questions)} technical questions on {language.title()} ({difficulty} difficulty)",
                questions=tech_questions,
            ))

        # ── Section 3: Coding Problems ────────────────────────────
        if params.coding_count > 0:
            code_questions = build_coding_questions(language, difficulty, params.coding_count)
            code_marks = sum(q["points"] for q in code_questions)
            total_marks += code_marks
            sections.append(GeneratedSection(
                title="Coding",
                description=f"{len(code_questions)} coding challenges ({difficulty} difficulty)",
                questions=code_questions,
            ))

        title = params.title or f"{topic.title()} Assessment"
        description = (
            f"Auto-generated {difficulty} assessment covering {topic}. "
            f"Contains {params.aptitude_count} aptitude MCQs, "
            f"{params.technical_count} technical MCQs, and "
            f"{params.coding_count} coding problems."
        )

        return GeneratedExam(
            title=title,
            description=description,
            sections=sections,
            total_marks=total_marks,
            duration_minutes=params.duration_minutes,
            tags=params.tags,
            generation_method="template",
        )


# ═══════════════════════════════════════════════════════════════════════
#  Public API
# ═══════════════════════════════════════════════════════════════════════

# Active strategy — change this to swap in an LLM engine in the future
_active_strategy: GenerationStrategy = TemplateStrategy()


def generate_exam(request: GenerateTestRequest) -> GeneratedExam:
    """Main entry point — parses prompt, merges with config, generates exam.
    
    Args:
        request: The generation request from the admin UI.
        
    Returns:
        A fully structured GeneratedExam ready for preview/editing.
    """
    # Step 1: Parse the free-text prompt
    parsed = parse_prompt(request.prompt) if request.prompt else ParsedPrompt()

    # Step 2: Explicit config values override parsed ones
    if request.topic:
        parsed.topic = request.topic
    if request.language:
        parsed.language = request.language
    if request.difficulty:
        parsed.difficulty = request.difficulty
    # Always use explicit counts (they have defaults in the schema)
    parsed.aptitude_count = request.aptitude_count
    parsed.technical_count = request.technical_count
    parsed.coding_count = request.coding_count
    parsed.duration_minutes = request.duration_minutes

    # Step 3: Generate via active strategy
    exam = _active_strategy.generate(parsed)

    # Step 4: Validate output
    _validate(exam, parsed)

    logger.info(
        "Generated exam: title=%s, sections=%d, total_marks=%d, method=%s",
        exam.title, len(exam.sections), exam.total_marks, exam.generation_method,
    )
    return exam


def _validate(exam: GeneratedExam, params: ParsedPrompt):
    """Validate generated exam — ensure no malformed data."""
    for section in exam.sections:
        for q in section.questions:
            if q.get("type") == "mcq":
                # Must have at least 2 options
                if len(q.get("options", [])) < 2:
                    raise ValueError(f"MCQ '{q.get('text', '')}' has fewer than 2 options")
                # Must have a valid correct index
                idx = q.get("correct_option_index", -1)
                if idx < 0 or idx >= len(q["options"]):
                    raise ValueError(f"MCQ '{q.get('text', '')}' has invalid correct_option_index")
            elif q.get("type") == "coding":
                # Must have at least 1 test case
                if not q.get("test_cases"):
                    raise ValueError(f"Coding question '{q.get('text', '')}' has no test cases")
