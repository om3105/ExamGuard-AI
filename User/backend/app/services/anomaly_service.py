from app.models.all_models import BehaviorLog, ExamSubmission


class AnomalyService:
    """
    Rule-based anomaly detection for exam integrity assessment.
    Produces a 0-100 risk score and a LOW/MEDIUM/HIGH label.
    """

    # Risk rules: (field_name, comparator, threshold, points)
    RULES = [
        ("tab_switch_count",  ">",  3,    30),
        ("tab_switch_count",  ">",  1,    10),  # Even 1-3 switches adds some risk
        ("paste_count",       ">",  2,    25),
        ("paste_count",       ">",  0,    10),  # Any paste is suspicious in an exam
        ("pasted_chars",      ">",  100,  20),
        ("avg_typing_speed",  ">",  9.0,  15),  # Suspiciously fast (e.g., copied then typed fast)
        ("mouse_click_count", "<",  5,    10),  # Very low interaction (bot-like)
        ("backspace_ratio",   ">",  0.4,  10),  # Heavy editing = possibly pasting then adjusting
    ]

    @staticmethod
    def _apply_rules(log: BehaviorLog) -> int:
        score = 0
        for field, comparator, threshold, points in AnomalyService.RULES:
            value = getattr(log, field, 0)
            if comparator == ">" and value > threshold:
                score += points
            elif comparator == "<" and value < threshold:
                score += points
        return min(score, 100)  # Cap at 100

    @staticmethod
    def _score_to_level(score: int) -> str:
        if score <= 30:
            return "LOW"
        elif score <= 60:
            return "MEDIUM"
        return "HIGH"

    @classmethod
    async def score_submission(cls, submission_id: str) -> dict:
        """
        Find the BehaviorLog for a submission, calculate anomaly score,
        and update the ExamSubmission with the result.
        Returns dict with anomaly_score and risk_level.
        """
        submission = await ExamSubmission.get(submission_id)
        if not submission:
            return {"anomaly_score": 0, "risk_level": "LOW"}

        # Look up by user_id and exam_id since submission_id is generated late
        log = await BehaviorLog.find_one(
            BehaviorLog.user_id == submission.user_id,
            BehaviorLog.exam_id == submission.exam_id
        )

        # No behavior data — score is 0 (benefit of the doubt)
        if not log:
            submission.anomaly_score = 0
            submission.risk_level = "LOW"
            await submission.save()
            return {"anomaly_score": 0, "risk_level": "LOW"}

        anomaly_score = cls._apply_rules(log)
        risk_level = cls._score_to_level(anomaly_score)

        # Update log with the real submission ID
        log.submission_id = submission_id
        await log.save()

        # Persist back to the submission
        submission.anomaly_score = anomaly_score
        submission.risk_level = risk_level
        await submission.save()

        return {"anomaly_score": anomaly_score, "risk_level": risk_level}
