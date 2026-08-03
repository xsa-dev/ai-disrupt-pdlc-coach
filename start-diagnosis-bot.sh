#!/bin/bash
# Quick launcher for Disrupt PDLC Coach (Diagnosis MVP)

cd "$(dirname "$0")"

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ TELEGRAM_BOT_TOKEN не задан"
    echo "Создай бота у @BotFather и запусти так:"
    echo "TELEGRAM_BOT_TOKEN=123456:ABC... ./start-diagnosis-bot.sh"
    exit 1
fi

echo "🚀 Запускаю Disrupt PDLC Coach (Diagnosis)..."
echo "Токен: ${TELEGRAM_BOT_TOKEN:0:8}...${TELEGRAM_BOT_TOKEN: -4}"
echo "Логи: /tmp/pdlc-diagnosis-bot.log"

PYTHONPATH=. nohup python3 -m coach.telegram.diagnosis_bot \
    > /tmp/pdlc-diagnosis-bot.log 2>&1 &

BOT_PID=$!
echo $BOT_PID > /tmp/pdlc-diagnosis-bot.pid

echo "✅ Бот запущен (PID: $BOT_PID)"
echo "Чтобы остановить: kill \$(cat /tmp/pdlc-diagnosis-bot.pid)"
echo ""
echo "Теперь найди своего бота в Telegram и напиши ему /start или /diagnosis"
echo "Логи можно смотреть: tail -f /tmp/pdlc-diagnosis-bot.log"