"""
Simple CLI simulator for testing the Diagnosis flow without Telegram.
Useful for development and validation.
"""

from coach.core.assessment import run_simple_assessment, DIAGNOSTIC_QUESTIONS
from coach.core.report import generate_diagnosis_report
from coach.core.team_context import record_assessment, get_status


def simulate():
    print("=== Disrupt PDLC Coach - Diagnosis Simulator ===\n")

    team_name = input("Название команды: ").strip() or "TestTeam"

    answers = {}
    for i, q in enumerate(DIAGNOSTIC_QUESTIONS):
        print(f"\nВопрос {i+1}/{len(DIAGNOSTIC_QUESTIONS)}: {q['text']}")
        for opt in q["options"]:
            print(f"  {opt[0]}. {opt[1]}")
        ans = input("Ваш ответ (буква): ").strip().upper()
        answers[q["id"]] = ans

    print("\n--- Обрабатываем ответы ---")
    result = run_simple_assessment(answers)

    report = generate_diagnosis_report(team_name, result, answers)
    print("\n" + "="*60)
    print(report)
    print("="*60)

    record_assessment(team_name, result.l_level, result.r_level, report[:400])
    print("\n[Сохранено в профиль команды]")

    print("\nТекущий статус:")
    print(get_status(team_name))


if __name__ == "__main__":
    simulate()