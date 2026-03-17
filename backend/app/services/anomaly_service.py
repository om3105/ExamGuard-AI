"""
anomaly_service.py — Transparent, graduated risk scoring for exam integrity.

DESIGN PRINCIPLES:
- Risk score is a REVIEW PRIORITY indicator, not an accusation.
- Scoring is graduated: one accidental tab switch does not flag a student.
- All scoring is deterministic and explainable — no black boxes.
- risk_factors provides a human-readable breakdown of the score.
- False positives are minimized through conservative thresholds.

SCORING FORMULA (0-100):
  Tab switches:      min(count × 5, 25)     → gradual, caps at 25
  Paste attempts:    min(count × 8, 20)     → caps at 20
  Pasted chars >100: +10                    → large paste is more suspicious
  Typing speed >9:   +15                    → unusually fast
  Low clicks (<5):   +10                    → possible bot-like behavior
  High backspace:    +10                    → heavy editing after paste
  Total capped at 100.

RISK LEVELS:
  0-25:  LOW    — "No significant concerns"
  26-50: MEDIUM — "Review recommended"
  51-100: HIGH  — "Manual review required"
"""
from app.models.all_models import BehaviorLog, ExamSubmission


class AnomalyService:
    """
    Rule-based anomaly detection for exam integrity assessment.
    Produces a 0-100 risk score, a LOW/MEDIUM/HIGH label,
    and a list of human-readable risk factors explaining the score.
    """

    @staticmethod
    def _calculate_score(log: BehaviorLog) -> dict:
        """
        Calculate risk score with full transparency.
        Returns dict with score, level, factors list, and explanation string.
        """
        score = 0
        factors = []

        # --- Tab switches (graduated) ---
        if log.tab_switch_count > 0:
            tab_points = min(log.tab_switch_count * 5, 25)
            score += tab_points
            factors.append(
                f"{log.tab_switch_count} tab switch{'es' if log.tab_switch_count != 1 else ''} (+{tab_points})"
            )

        # --- Paste attempts (graduated) ---
        if log.paste_count > 0:
            paste_points = min(log.paste_count * 8, 20)
            score += paste_points
            factors.append(
                f"{log.paste_count} paste attempt{'s' if log.paste_count != 1 else ''} (+{paste_points})"
            )

        # --- Large paste volume ---
        if log.pasted_chars > 100:
            score += 10
            factors.append(f"{log.pasted_chars} characters pasted (+10)")

        # --- Unusually fast typing ---
        if log.avg_typing_speed > 9.0:
            score += 15
            factors.append(
                f"High typing speed: {log.avg_typing_speed:.1f} keys/sec (+15)"
            )

        # --- Very low mouse interaction (bot-like) ---
        if log.mouse_click_count < 5 and log.keystroke_count > 20:
            score += 10
            factors.append(
                f"Low mouse interaction: {log.mouse_click_count} clicks (+10)"
            )

        # --- Heavy backspace ratio (editing after paste) ---
        if log.backspace_ratio > 0.4:
            score += 10
            factors.append(
                f"High backspace ratio: {log.backspace_ratio:.1%} (+10)"
            )

        # Cap at 100
        score = min(score, 100)

        # Determine level
        if score <= 25:
            level = "LOW"
        elif score <= 50:
            level = "MEDIUM"
        else:
            level = "HIGH"

        # Build explanation
        if not factors:
            explanation = "No significant concerns detected."
        elif level == "LOW":
            explanation = "Minor activity noted. No action needed."
        elif level == "MEDIUM":
            explanation = "Some activity flagged for attention. Review recommended."
        else:
            explanation = "Multiple indicators suggest manual review is required."

        return {
            "anomaly_score": score,
            "risk_level": level,
            "risk_factors": factors,
            "risk_explanation": explanation,
        }

    @classmethod
    async def score_submission(cls, submission_id: str) -> dict:
        """
        Find the BehaviorLog for a submission, calculate anomaly score,
        and update the ExamSubmission with the result.
        Returns dict with anomaly_score, risk_level, risk_factors, risk_explanation.
        """
        submission = await ExamSubmission.get(submission_id)
        if not submission:
            return {
                "anomaly_score": 0,
                "risk_level": "LOW",
                "risk_factors": [],
                "risk_explanation": "No submission found.",
            }

        # Look up by user_id + exam_id (submission_id may be empty during exam)
        log = await BehaviorLog.find_one(
            BehaviorLog.user_id == submission.user_id,
            BehaviorLog.exam_id == submission.exam_id,
        )

        if not log:
            # No behavior data — benefit of the doubt
            submission.anomaly_score = 0
            submission.risk_level = "LOW"
            submission.risk_factors = []
            submission.risk_explanation = "No behavioral data captured."
            await submission.save()
            return {
                "anomaly_score": 0,
                "risk_level": "LOW",
                "risk_factors": [],
                "risk_explanation": "No behavioral data captured.",
            }

        result = cls._calculate_score(log)

        # Patch the BehaviorLog with the real submission ID
        log.submission_id = submission_id
        await log.save()

        # Persist results to the submission
        submission.anomaly_score = result["anomaly_score"]
        submission.risk_level = result["risk_level"]
        submission.risk_factors = result["risk_factors"]
        submission.risk_explanation = result["risk_explanation"]
        await submission.save()

        return result
