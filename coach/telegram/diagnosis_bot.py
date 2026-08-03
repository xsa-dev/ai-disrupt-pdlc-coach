"""
Telegram bot for Disrupt PDLC Coach - Diagnosis MVP.

Uses clean MarkdownV2 (2026 rich Telegram format) + PDF reports.
"""

import os
import logging
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes, ConversationHandler, MessageHandler, filters

from coach.core.assessment import run_simple_assessment, DIAGNOSTIC_QUESTIONS
from coach.core.report import generate_diagnosis_markdown, generate_diagnosis_pdf, _escape_md_v2
from coach.core.team_context import record_assessment, get_status

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

WAITING_ANSWERS = range(1)
active_sessions: dict[int, dict] = {}


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Привет\! Я *Disrupt PDLC Coach*.\n\n"
        "Доступные команды:\n"
        "/diagnosis — запустить диагностику зрелости команды\n"
        "/status — текущий статус команды\n"
        "/help — помощь",
        parse_mode="MarkdownV2"
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Как пользоваться диагностикой:\n"
        "1. /diagnosis\n"
        "2. Отвечайте на вопросы буквами \(A, B, C...\)\n"
        "3. В конце получите чистый отчёт \(MarkdownV2 + PDF\)\n\n"
        "_Совет: отвечайте максимально честно. Завышение уровня не помогает._",
        parse_mode="MarkdownV2"
    )


async def status(update: Update, context: ContextTypes.DEFAULT_TYPE):
    team = context.user_data.get("team_name", "DefaultTeam")
    text = get_status(team)
    await update.message.reply_text(text, parse_mode="MarkdownV2")


async def start_diagnosis(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    team_name = context.user_data.get("team_name")

    if not team_name:
        context.user_data["awaiting_team"] = True
        await update.message.reply_text("Назовите название команды (или используйте /team <название>):")
        return ConversationHandler.END

    active_sessions[chat_id] = {
        "team_name": team_name,
        "answers": {},
        "current_question": 0,
    }

    await _ask_next_question(update, chat_id)
    return WAITING_ANSWERS


async def _ask_next_question(update: Update, chat_id: int):
    session = active_sessions.get(chat_id)
    if not session:
        return

    q_index = session["current_question"]
    if q_index >= len(DIAGNOSTIC_QUESTIONS):
        await finish_diagnosis(update, chat_id)
        return

    question = DIAGNOSTIC_QUESTIONS[q_index]

    # Clean plain text - no MarkdownV2, no escaping issues
    text = (
        f"Вопрос {q_index + 1}/{len(DIAGNOSTIC_QUESTIONS)}\n\n"
        + question["text"] + "\n\n"
    )
    for letter, desc, *_ in question["options"]:
        text += f"{letter}. {desc}\n"
    text += "\nОтветьте буквой (A/B/C/...):"

    await update.message.reply_text(text)


async def handle_answer(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id

    # Handle team name input if user was asked for it
    if context.user_data.get("awaiting_team"):
        team_name = update.message.text.strip()
        if team_name and not team_name.startswith("/"):
            context.user_data["team_name"] = team_name
            context.user_data["awaiting_team"] = False
            safe = _escape_md_v2(team_name)
            await update.message.reply_text(f"Команда установлена: *{safe}*", parse_mode="MarkdownV2")
            # Now start the diagnosis
            active_sessions[chat_id] = {
                "team_name": team_name,
                "answers": {},
                "current_question": 0,
            }
            await _ask_next_question(update, chat_id)
            return WAITING_ANSWERS
        else:
            await update.message.reply_text("Пожалуйста, введите название команды текстом (без слеша).")
            return ConversationHandler.END

    session = active_sessions.get(chat_id)

    if not session:
        await update.message.reply_text("Сессия диагностики не найдена. Начните заново командой /diagnosis")
        return ConversationHandler.END

    answer = update.message.text.strip().upper()
    q_index = session["current_question"]
    question = DIAGNOSTIC_QUESTIONS[q_index]

    valid_letters = [opt[0] for opt in question["options"]]
    if answer not in valid_letters:
        await update.message.reply_text(f"Пожалуйста, выберите один из вариантов: {', '.join(valid_letters)}")
        return WAITING_ANSWERS

    q_id = question["id"]
    session["answers"][q_id] = answer
    session["current_question"] += 1

    if session["current_question"] >= len(DIAGNOSTIC_QUESTIONS):
        await finish_diagnosis(update, chat_id)
        return ConversationHandler.END

    await _ask_next_question(update, chat_id)
    return WAITING_ANSWERS


async def finish_diagnosis(update: Update, chat_id: int):
    session = active_sessions.pop(chat_id, None)
    if not session:
        return

    team_name = session["team_name"]
    answers = session["answers"]

    result = run_simple_assessment(answers)
    md_report = generate_diagnosis_markdown(team_name, result, answers)

    # Send MarkdownV2 report (per OpenSpec spec)
    await update.message.reply_text(
        "✅ *Диагностика завершена\!*\n\nВот ваш отчёт:",
        parse_mode="MarkdownV2"
    )

    # Send the main report (MarkdownV2 per spec)
    try:
        if len(md_report) > 4000:
            await update.message.reply_text(md_report[:3900] + "\n\n\(продолжение в PDF\)", parse_mode="MarkdownV2")
        else:
            await update.message.reply_text(md_report, parse_mode="MarkdownV2")
    except Exception as e:
        logger.warning(f"MarkdownV2 send failed, falling back: {e}")
        await update.message.reply_text("Отчёт (текстовая версия):\n\n" + md_report[:3500])

    # Generate and send PDF
    try:
        pdf_path = generate_diagnosis_pdf(team_name, result, answers)
        with open(pdf_path, "rb") as pdf_file:
            await update.message.reply_document(
                document=pdf_file,
                filename=os.path.basename(pdf_path),
                caption="Полный отчёт в PDF (с выдержками из белой книги)"
            )
    except Exception as e:
        logger.error(f"Failed to generate/send PDF: {e}")
        await update.message.reply_text("Не удалось сформировать PDF. Отчёт выше — в текстовом виде.")

    # Save to team profile
    record_assessment(team_name, result.l_level, result.r_level, "PDF + Markdown report generated")

    safe_team = _escape_md_v2(team_name)
    await update.message.reply_text(
        f"Команда сохранена как *{safe_team}*.\nИспользуйте /status чтобы посмотреть текущий уровень.",
        parse_mode="MarkdownV2"
    )


async def set_team(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if context.args:
        team_name = " ".join(context.args)
        context.user_data["team_name"] = team_name
        safe_team = _escape_md_v2(team_name)
        await update.message.reply_text(f"Команда установлена: *{safe_team}*", parse_mode="MarkdownV2")
    else:
        await update.message.reply_text("Используйте: /team <название команды>")  # plain text is safer here



async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Log the error and send a message to the user."""
    logger.error("Exception while handling an update:", exc_info=context.error)
    if update and hasattr(update, 'message') and update.message:
        try:
            await update.message.reply_text("Произошла ошибка. Попробуйте /start или /diagnosis заново.")
        except:
            pass

def main():
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        print("Error: TELEGRAM_BOT_TOKEN environment variable is required")
        return

    application = Application.builder().token(token).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("status", status))
    application.add_handler(CommandHandler("team", set_team))

    conv_handler = ConversationHandler(
        entry_points=[CommandHandler("diagnosis", start_diagnosis)],
        states={
            WAITING_ANSWERS: [MessageHandler(filters.TEXT & ~filters.COMMAND, handle_answer)],
        },
        fallbacks=[CommandHandler("cancel", lambda u, c: ConversationHandler.END)],
    )
    application.add_handler(conv_handler)

    application.add_error_handler(error_handler)
    print("Disrupt PDLC Coach (Diagnosis MVP) запущен с MarkdownV2 reports (per OpenSpec)")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()