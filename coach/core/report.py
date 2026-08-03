"""
Report generator for Diagnosis scenario.

- Clean rich Markdown for Telegram (MarkdownV2, 2026 rich format)
- PDF generation for full reports
"""

from datetime import datetime
from typing import Dict, Any
from pathlib import Path
import os

from fpdf import FPDF

from .levels import get_l_level, get_r_level
from .assessment import AssessmentResult
from .grounding import get_relevant_excerpts
import re

from html import escape as html_escape


def _escape_md_v2(text: str) -> str:
    """Escape special characters for Telegram MarkdownV2.
    Use this ONLY on plain content strings, not on formatting syntax.
    """
    if not text:
        return ""
    escape_chars = r'_*[]()~`>#+-=|{}.!'
    for char in escape_chars:
        text = text.replace(char, f"\\{char}")
    return text



def generate_diagnosis_html(
    team_name: str,
    result: AssessmentResult,
    raw_answers: Dict[str, str] | None = None,
) -> str:
    """Generates report using Telegram HTML parse mode.
    More reliable than MarkdownV2 for Russian text and complex content.
    """
    l_info = get_l_level(result.l_level)
    r_info = get_r_level(result.r_level)
    now = datetime.now().strftime("%Y-%m-%d %H:%M")

    # Escape only dynamic content
    safe_team = html_escape(team_name)
    safe_l_name = html_escape(l_info['name'])
    safe_r_name = html_escape(r_info['name'])
    safe_horizon = html_escape(result.task_horizon)
    safe_just = html_escape(result.justification)

    lines = []

    # Title
    lines.append(f"<b>Диагностика зрелости команды: {safe_team}</b>")
    lines.append("")

    # Key metrics
    lines.append("<b>Ключевые показатели</b>")
    lines.append(f"• <b>Дата:</b> {now}")
    lines.append(f"• <b>Организационный уровень:</b> {safe_l_name}")
    lines.append(f"• <b>Уровень автономии агентов (R):</b> {safe_r_name}")
    lines.append(f"• <b>Горизонт задач:</b> {safe_horizon}")
    lines.append(f"• <b>Уверенность оценки:</b> {int(result.confidence * 100)}%")
    lines.append("")

    # Warnings
    if result.warnings:
        lines.append("<b>Важные предупреждения (guardrails)</b>")
        for w in result.warnings:
            lines.append(f"• {html_escape(w)}")
        lines.append("")

    # Justification
    lines.append("<b>Обоснование</b>")
    lines.append(safe_just)
    lines.append("")

    # Strengths
    lines.append("<b>Сильные стороны</b>")
    for s in result.strengths:
        lines.append(f"• {html_escape(s)}")
    lines.append("")

    # Gaps
    lines.append("<b>Зоны роста / Пробелы</b>")
    for g in result.gaps:
        lines.append(f"• {html_escape(g)}")
    lines.append("")

    # Recommendations
    lines.append("<b>Рекомендации и gate-критерии для следующего уровня</b>")
    for r in result.recommendations:
        lines.append(f"• {html_escape(r)}")
    lines.append("")

    # Principles - use <b> for key phrases
    lines.append("<b>Основные принципы AI-Disrupt PDLC</b>")
    lines.append("• <b>Среда важнее модели</b> — улучшаем harness, контекст и валидацию, а не только модель")
    lines.append("• Честная оценка зрелости важнее красивых цифр")
    lines.append("• Человек — субъект петли намерения, агент — петли реализации")
    lines.append("• Валидация встроена (Evidence Bundle + агент-ревьюер)")
    lines.append("")

    # Footer
    lines.append("<i>Полная версия отчёта с выдержками из белой книги доступна в PDF.</i>")
    lines.append("")
    lines.append("<i>Отчёт сгенерирован Disrupt PDLC Coach (2026).</i>")

    return "\n".join(lines)


def generate_diagnosis_markdown(
    team_name: str,
    result: AssessmentResult,
    raw_answers: Dict[str, str] | None = None,
    for_telegram: bool = True
) -> str:
    """
    Generates clean MarkdownV2 report for Telegram.
    Follows the report-formatting spec:
    - Formatting is controlled here
    - Only dynamic content is escaped
    - No visible escape sequences for structure
    """
    l_info = get_l_level(result.l_level)
    r_info = get_r_level(result.r_level)
    now = datetime.now().strftime("%Y-%m-%d %H:%M")

    # Pre-escape dynamic content only
    safe_team = _escape_md_v2(team_name)
    safe_l_name = _escape_md_v2(l_info['name'])
    safe_r_name = _escape_md_v2(r_info['name'])
    safe_horizon = _escape_md_v2(result.task_horizon)
    safe_just = _escape_md_v2(result.justification)

    lines = []

    # Title - bold instead of # (MDV2 does not support # headings)
    lines.append(f"*Диагностика зрелости команды: {safe_team}*")
    lines.append("")

    # Key info - using *bold* syntax (MarkdownV2 standard)
    lines.append("*Ключевые показатели*")
    lines.append(f"• *Дата:* {now}")
    lines.append(f"• *Организационный уровень:* {safe_l_name}")
    lines.append(f"• *Уровень автономии агентов (R):* {safe_r_name}")
    lines.append(f"• *Горизонт задач:* {safe_horizon}")
    lines.append(f"• *Уверенность оценки:* {int(result.confidence * 100)}%")
    lines.append("")

    # Warnings
    if result.warnings:
        lines.append("*Важные предупреждения (guardrails)*")
        for w in result.warnings:
            lines.append(f"• {_escape_md_v2(w)}")
        lines.append("")

    # Обоснование (plain escaped paragraph)
    lines.append("*Обоснование*")
    lines.append(safe_just)
    lines.append("")

    # Сильные стороны
    lines.append("*Сильные стороны*")
    for s in result.strengths:
        lines.append(f"• {_escape_md_v2(s)}")
    lines.append("")

    # Зоны роста
    lines.append("*Зоны роста / Пробелы*")
    for g in result.gaps:
        lines.append(f"• {_escape_md_v2(g)}")
    lines.append("")

    # Рекомендации
    lines.append("*Рекомендации и gate-критерии для следующего уровня*")
    for r in result.recommendations:
        lines.append(f"• {_escape_md_v2(r)}")
    lines.append("")

    # Принципы (intentional light formatting - these are static)
    lines.append("*Основные принципы AI-Disrupt PDLC*")
    lines.append("• *Среда важнее модели* - улучшаем harness, контекст и валидацию, а не только модель")
    lines.append("• Честная оценка зрелости важнее красивых цифр")
    lines.append("• Человек - субъект петли намерения, агент - петли реализации")
    lines.append("• Валидация встроена (Evidence Bundle + агент-ревьюер)")
    lines.append("")

    # Footer notes (use _ for italic in MDV2)
    lines.append("_Полная версия отчёта с выдержками из белой книги доступна в PDF._")
    lines.append("")
    lines.append("_Отчёт сгенерирован Disrupt PDLC Coach (2026)._")

    return "\n".join(lines)




class DiagnosisPDF(FPDF):
    """Custom FPDF subclass with proper headers/footers on every page."""
    def __init__(self):
        super().__init__()
        self.team_name = ""
        self.add_font("DejaVu", "", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
        self.add_font("DejaVu", "B", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")
        try:
            self.add_font("DejaVu", "I", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf")
        except:
            pass

    def header(self):
        if self.page_no() == 1:
            # Big title only on first page
            self.set_font("DejaVu", "B", 16)
            self.cell(0, 10, f"Диагностика зрелости команды: {self.team_name}", ln=True, align="C")
            self.ln(2)
        else:
            # Smaller header on continuation pages
            self.set_font("DejaVu", "B", 9)
            self.cell(0, 6, f"Диагностика: {self.team_name}", ln=True, align="C")
            self.set_draw_color(150, 150, 150)
            self.line(15, self.get_y(), self.w - 15, self.get_y())
            self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font("DejaVu", size=8)
        self.set_text_color(100, 100, 100)
        self.cell(0, 10, f"Disrupt PDLC Coach • 2026   |   Страница {self.page_no()}", align="C")


def generate_diagnosis_pdf(
    team_name: str,
    result: AssessmentResult,
    raw_answers: Dict[str, str] | None = None,
    output_path: str | None = None
) -> str:
    """
    Generates a clean, multi-page PDF report with proper headers and footers on every page.
    Follows the report-formatting spec for layout, pagination and professionalism.
    """
    if output_path is None:
        safe_name = "".join(c if c.isalnum() or c in "-_" else "_" for c in team_name)
        output_path = f"/tmp/diagnosis_{safe_name}_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"

    pdf = DiagnosisPDF()
    pdf.team_name = team_name
    pdf.add_page()
    pdf.set_left_margin(15)
    pdf.set_right_margin(15)
    pdf.set_auto_page_break(auto=True, margin=18)  # leave room for footer

    l_info = get_l_level(result.l_level)
    r_info = get_r_level(result.r_level)
    now = datetime.now().strftime("%Y-%m-%d %H:%M")

    # Key metrics (first page)
    pdf.set_font("DejaVu", size=11)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 7, f"Дата: {now}", ln=True)
    pdf.cell(0, 7, f"Организационный уровень: {l_info['name']}", ln=True)
    pdf.cell(0, 7, f"Автономия агентов (R): {r_info['name']}", ln=True)
    pdf.cell(0, 7, f"Горизонт задач: {result.task_horizon}", ln=True)
    pdf.cell(0, 7, f"Уверенность оценки: {int(result.confidence * 100)}%", ln=True)
    pdf.ln(5)

    # Warnings
    if result.warnings:
        pdf.set_font("DejaVu", "B", 11)
        pdf.set_text_color(180, 0, 0)
        pdf.cell(0, 7, "Важные предупреждения (guardrails)", ln=True)
        pdf.set_text_color(0, 0, 0)
        pdf.set_font("DejaVu", size=10)
        for w in result.warnings:
            pdf.multi_cell(pdf.w - pdf.l_margin - pdf.r_margin, 5.5, f"• {w}")
        pdf.ln(3)

    # Обоснование
    pdf.set_font("DejaVu", "B", 11)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 7, "Обоснование", ln=True)
    pdf.set_font("DejaVu", size=10)
    pdf.multi_cell(pdf.w - pdf.l_margin - pdf.r_margin, 5.5, result.justification)
    pdf.ln(3)

    # Сильные стороны
    pdf.set_font("DejaVu", "B", 11)
    pdf.cell(0, 7, "Сильные стороны", ln=True)
    pdf.set_font("DejaVu", size=10)
    for s in result.strengths:
        pdf.set_x(pdf.l_margin)
        pdf.multi_cell(pdf.w - pdf.l_margin - pdf.r_margin, 5.5, f"• {s}")
    pdf.ln(3)

    # Зоны роста
    pdf.set_font("DejaVu", "B", 11)
    pdf.cell(0, 7, "Зоны роста / Пробелы", ln=True)
    pdf.set_font("DejaVu", size=10)
    for g in result.gaps:
        pdf.set_x(pdf.l_margin)
        pdf.multi_cell(pdf.w - pdf.l_margin - pdf.r_margin, 5.5, f"• {g}")
    pdf.ln(4)
    pdf.set_x(pdf.l_margin)

    # Рекомендации
    pdf.set_font("DejaVu", "B", 11)
    pdf.cell(0, 7, "Рекомендации и gate-критерии для следующего уровня", ln=True)
    pdf.set_font("DejaVu", size=10)
    for r in result.recommendations:
        pdf.set_x(pdf.l_margin)
        pdf.multi_cell(pdf.w - pdf.l_margin - pdf.r_margin, 5.5, f"• {r}")



    # Релевантные выдержки из белой книги (clean placement at the end)
    pdf.add_page()
    pdf.set_font("DejaVu", "B", 10)
    pdf.cell(0, 7, "Релевантные выдержки из белой книги", ln=True)
    pdf.ln(3)

    try:
        query_parts = [result.justification]
        query_parts.extend(result.gaps)
        query_parts.extend(result.strengths)
        query_parts.append("среда важнее модели evidence bundle governance mesh")
        rich_query = " ".join(query_parts)

        excerpts = get_relevant_excerpts(rich_query, max_results=2)
        good = []
        for ex in excerpts:
            ex = ex.strip()
            ex = re.sub(r'^[•\-–—\s]+', '', ex)
            ex = re.sub(r'\s*•\s*', ' ', ex)
            ex = re.sub(r'\s+', ' ', ex).strip()
            ex = ex[:480]
            if len(ex) > 120:
                good.append(ex)

        if len(good) < 2:
            good = [
                "Практические следствия перехода к Governance Mesh: Ограничения управляемости мы фиксируем в спецификации (SDD) до начала реализации.",
                "Наставничество как замена bootcamp-модели. В ИИ-эпоху входной уровень требует full-stack-мышления и умения работать с валидацией."
            ]

        for ex in good[:2]:
            pdf.set_font("DejaVu", size=9)
            pdf.set_text_color(50, 50, 50)
            pdf.set_x(pdf.l_margin)
            pdf.multi_cell(pdf.w - pdf.l_margin - pdf.r_margin, 6, f"«{ex}»")
            pdf.ln(4)
        pdf.set_text_color(0, 0, 0)
    except:
        pass


    # Principles
    pdf.set_font("DejaVu", "B", 10)
    pdf.cell(0, 6, "Ключевые принципы (AI-Disrupt PDLC)", ln=True)
    pdf.set_font("DejaVu", size=9)
    principles = [
        "Среда важнее модели",
        "Честная оценка важнее завышения уровня",
        "Валидация встроена (Evidence Bundle)",
        "Governance Mesh как третья ось"
    ]
    for p in principles:
        pdf.cell(0, 5, f"• {p}", ln=True)
    pdf.ln(4)

    pdf.output(output_path)
    return output_path


# Backward compatibility
def generate_diagnosis_report(team_name: str, result: AssessmentResult, raw_answers=None) -> str:
    """Legacy function - returns clean Telegram Markdown."""
    return generate_diagnosis_markdown(team_name, result, raw_answers, for_telegram=True)