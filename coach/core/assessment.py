"""
Assessment engine for Disrupt PDLC Coach (MVP Diagnosis).

Improved version:
- More questions covering key dimensions from the whitepaper.
- Separate scoring for L-level (organizational maturity) and R-level (agent autonomy).
- Guardrails to prevent over-estimation (honesty principle).
- Better task horizon awareness.
"""

from typing import Dict, List, Any
from .levels import get_l_level, get_r_level

class AssessmentResult:
    def __init__(self, l_level: int, r_level: int, task_horizon: str, 
                 justification: str, strengths: List[str], gaps: List[str],
                 recommendations: List[str], confidence: float = 0.7,
                 warnings: List[str] | None = None):
        self.l_level = max(0, min(5, l_level))
        self.r_level = max(0, min(5, r_level))
        self.task_horizon = task_horizon
        self.justification = justification
        self.strengths = strengths
        self.gaps = gaps
        self.recommendations = recommendations
        self.confidence = confidence
        self.warnings = warnings or []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "l_level": self.l_level,
            "r_level": self.r_level,
            "task_horizon": self.task_horizon,
            "justification": self.justification,
            "strengths": self.strengths,
            "gaps": self.gaps,
            "recommendations": self.recommendations,
            "confidence": self.confidence,
            "warnings": self.warnings,
        }


# Expanded diagnostic questions (more comprehensive coverage of the book)
DIAGNOSTIC_QUESTIONS = [
    {
        "id": "ai_usage",
        "text": "Как сейчас в команде используется ИИ в разработке?",
        "options": [
            ("A", "В основном как умное автодополнение (Copilot и т.п.)", 1, "L"),
            ("B", "Генерация кода и тестов для рутинных задач (до 30 мин)", 2, "L"),
            ("C", "Агенты работают над задачами до 2 часов под ревью", 3, "L"),
            ("D", "Параллельная работа нескольких агентов над сложными задачами", 4, "L"),
            ("E", "Скоординированные команды агентов с длительным горизонтом", 5, "L"),
            ("F", "ИИ почти не используется систематически", 0, "L"),
        ]
    },
    {
        "id": "sdd",
        "text": "Используете ли вы разработку через спецификацию (SDD / spec-first)?",
        "options": [
            ("A", "Нет, код пишется сразу", 0, "L"),
            ("B", "Иногда пишем промпты или описания, но не системно", 1, "L"),
            ("C", "Есть обязательный этап спецификации перед кодом (SDD-lite)", 2, "L"),
            ("D", "Полноценный SDD + агент-ревьюер проверяет работу", 3, "L"),
            ("E", "SDD + сильная валидация + библиотека паттернов", 4, "L"),
        ]
    },
    {
        "id": "validation",
        "text": "Как происходит валидация результатов работы ИИ?",
        "options": [
            ("A", "Только ручной ревью разработчиком", 1, "L"),
            ("B", "Есть AI-gate в CI (автоматические проверки)", 2, "L"),
            ("C", "Агент-ревьюер + Evidence Bundle (проверочный пакет)", 3, "L"),
            ("D", "Интегрированная методика валидации + контрольные точки", 4, "L"),
            ("E", "Полная объяснимость в реальном времени + ADLC", 5, "L"),
        ]
    },
    {
        "id": "governance",
        "text": "Есть ли в команде guardrails / Governance Mesh для работы с агентами?",
        "options": [
            ("A", "Нет, всё отдано на откуп разработчикам", 0, "L"),
            ("B", "Базовые правила и политики (промпты, безопасность)", 1, "L"),
            ("C", "Guardian Agents + политики доступа", 3, "L"),
            ("D", "Полноценный Governance Mesh + аудит и объяснимость", 4, "L"),
        ]
    },
    {
        "id": "environment_vs_model",
        "text": "Когда что-то не работает с ИИ, что вы меняете в первую очередь?",
        "options": [
            ("A", "Пробуем другую модель или более мощный промпт", 0, "L"),
            ("B", "Улучшаем контекст, инструменты, harness, процесс", 3, "L"),
            ("C", "Меняем и модель, и среду в зависимости от проблемы", 2, "L"),
        ]
    },
    {
        "id": "task_horizon",
        "text": "Какие по длительности задачи вы доверяете агентам прямо сейчас?",
        "options": [
            ("A", "Только автодополнение и мелкие правки (минуты)", 0, "L"),
            ("B", "Рутинные задачи до 30 минут", 2, "L"),
            ("C", "Задачи до 1-2 часов с последующим ревью", 3, "L"),
            ("D", "Сложные задачи до половины рабочего дня", 4, "L"),
            ("E", "Длительные задачи с несколькими сессиями и контрольными точками", 5, "L"),
        ]
    },
    {
        "id": "agent_reviewer",
        "text": "Используете ли вы отдельного 'агент-ревьюера' (или эквивалент) для проверки работы основного агента?",
        "options": [
            ("A", "Нет, только человек ревьюит", 0, "R"),
            ("B", "Иногда просим агента проверить себя", 1, "R"),
            ("C", "Да, есть отдельный агент-ревьюер + Evidence Bundle", 3, "R"),
            ("D", "Полноценный процесс с Guardian Agents и аудитом", 4, "R"),
        ]
    },
    {
        "id": "measurement",
        "text": "Как вы измеряете эффективность работы с ИИ?",
        "options": [
            ("A", "Вообще не измеряем", 0, "L"),
            ("B", "Субъективно: 'стало быстрее'", 1, "L"),
            ("C", "Есть метрики по времени на задачу и качеству (PR acceptance)", 2, "L"),
            ("D", "Системные метрики + evals + I/V Tempo Ratio", 3, "L"),
        ]
    },
]


def _apply_guardrails(l_score: float, r_score: float, answers: Dict[str, str]) -> tuple[int, int, list[str]]:
    """
    Apply honesty guardrails based on the whitepaper principles.
    Prevents over-estimation of maturity.
    """
    warnings = []
    orig_l = int(round(l_score))
    orig_r = int(round(r_score))

    # Guardrail 1: High L but weak SDD / validation
    sdd = answers.get("sdd", "A")
    validation = answers.get("validation", "A")
    if orig_l >= 3 and sdd in ("A", "B") and validation in ("A", "B"):
        new_l = min(orig_l, 2)
        warnings.append(
            "Оценка снижена: заявлен высокий уровень, но отсутствует системный SDD и встроенная валидация (Evidence Bundle)."
        )
        orig_l = new_l

    # Guardrail 2: Environment vs model mindset
    env = answers.get("environment_vs_model", "A")
    if orig_l >= 3 and env == "A":
        warnings.append(
            "Предупреждение: при высоком уровне преобладает подход 'меняем модель вместо среды'. Это противоречит принципу 'Среда важнее модели'."
        )
        orig_l = min(orig_l, 2)

    # Guardrail 3: R-level should not be much higher than L
    if orig_r > orig_l + 1:
        warnings.append(
            "Автономия агентов (R) не может сильно опережать организационную зрелость (L). R снижен."
        )
        orig_r = min(orig_r, orig_l + 1)

    # Guardrail 4: No Guardian/Reviewer but claiming high autonomy
    reviewer = answers.get("agent_reviewer", "A")
    if orig_r >= 3 and reviewer in ("A", "B"):
        warnings.append(
            "Высокая автономия (R) без агент-ревьюера / Guardian Agents выглядит нереалистично."
        )
        orig_r = min(orig_r, 2)

    return orig_l, orig_r, warnings


def run_simple_assessment(answers: Dict[str, str]) -> AssessmentResult:
    """
    Improved assessment with separate L/R scoring + guardrails.
    """
    l_scores = []
    r_scores = []

    for q in DIAGNOSTIC_QUESTIONS:
        answer = answers.get(q["id"])
        if not answer:
            continue
        for opt in q["options"]:
            if opt[0] == answer:
                score = opt[2]
                axis = opt[3] if len(opt) > 3 else "L"
                if axis == "L":
                    l_scores.append(score)
                else:
                    r_scores.append(score)
                break

    if not l_scores:
        return AssessmentResult(
            l_level=0, r_level=0, task_horizon="Нет данных",
            justification="Недостаточно ответов для оценки.",
            strengths=[], gaps=["Нет данных"], recommendations=["Пройдите диагностику заново."],
            confidence=0.2, warnings=["Диагностика не завершена."]
        )

    # Calculate raw scores
    l_raw = sum(l_scores) / len(l_scores) if l_scores else 0
    r_raw = sum(r_scores) / len(r_scores) if r_scores else max(0, l_raw * 0.7)

    # Apply guardrails (the most important part for honesty)
    final_l, final_r, warnings = _apply_guardrails(l_raw, r_raw, answers)

    l_info = get_l_level(final_l)
    r_info = get_r_level(final_r)

    # Build justification (plain text only — formatting is added in the report generator)
    justification = (
        f"На основании ответов команда оценивается на уровне {l_info['name']}. "
        f"Горизонт задач примерно соответствует «{l_info['task_horizon']}». "
        f"Уровень автономии агентов — {r_info['name']}."
    )

    # Strengths and gaps (more nuanced)
    strengths = []
    gaps = []

    if final_l >= 2:
        strengths.append("Есть начальная дисциплина использования ИИ для реальных задач.")
    if final_l >= 3:
        strengths.append("Появляются элементы SDD и встроенной валидации.")
    if answers.get("environment_vs_model") == "B":
        strengths.append("Команда демонстрирует правильный фокус на улучшении среды, а не только модели.")

    if final_l < 2:
        gaps.append("ИИ используется в основном эпизодически или как автодополнение.")
    if final_l < 3 and answers.get("sdd") in ("A", "B"):
        gaps.append("Отсутствует системный подход к спецификациям (SDD).")
    if answers.get("validation") in ("A", "B") and final_l >= 2:
        gaps.append("Валидация остаётся преимущественно ручной.")

    # Recommendations
    recommendations = []
    next_level = min(5, final_l + 1)
    next_info = get_l_level(next_level)
    recommendations.append(f"Для перехода к уровню {next_info['name']}: {next_info.get('next_gate', 'см. книгу')}")

    if final_r < final_l:
        recommendations.append("Рассмотрите возможность повысить автономию агентов (внедрить агент-ревьюера).")

    confidence = 0.7 if len(l_scores) >= 5 else 0.5

    return AssessmentResult(
        l_level=final_l,
        r_level=final_r,
        task_horizon=l_info["task_horizon"],
        justification=justification,
        strengths=strengths or ["Пока недостаточно данных для сильных сторон"],
        gaps=gaps or ["Пока недостаточно данных о пробелах"],
        recommendations=recommendations,
        confidence=confidence,
        warnings=warnings
    )