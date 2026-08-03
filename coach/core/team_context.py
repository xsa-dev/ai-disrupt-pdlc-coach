"""
Minimal Team Context store for MVP.

Stores team profiles in JSON files under data/teams/.
"""

import json
import os
from datetime import datetime
from typing import Dict, Any, Optional, List
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data" / "teams"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_PROFILE = {
    "team_name": "",
    "current_l": 0,
    "current_r": 0,
    "last_assessment": None,
    "assessment_history": [],   # list of {date, l, r, report_path or summary}
}


def _get_profile_path(team_name: str) -> Path:
    safe_name = "".join(c if c.isalnum() or c in "-_" else "_" for c in team_name)
    return DATA_DIR / f"{safe_name}.json"


def load_team_profile(team_name: str) -> Dict[str, Any]:
    path = _get_profile_path(team_name)
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    profile = DEFAULT_PROFILE.copy()
    profile["team_name"] = team_name
    return profile


def save_team_profile(profile: Dict[str, Any]) -> None:
    team_name = profile.get("team_name", "unknown")
    path = _get_profile_path(team_name)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(profile, f, ensure_ascii=False, indent=2)


def record_assessment(team_name: str, l_level: int, r_level: int, summary: str) -> Dict[str, Any]:
    profile = load_team_profile(team_name)
    profile["current_l"] = l_level
    profile["current_r"] = r_level
    profile["last_assessment"] = datetime.now().isoformat()

    record = {
        "date": profile["last_assessment"],
        "l": l_level,
        "r": r_level,
        "summary": summary[:300]  # short summary
    }
    profile["assessment_history"].append(record)

    save_team_profile(profile)
    return profile


def get_status(team_name: str) -> str:
    profile = load_team_profile(team_name)
    if not profile["last_assessment"]:
        safe_name = _escape_md_v2(team_name) if team_name else "DefaultTeam"
        return f"Команда *{safe_name}* ещё не проходила диагностику."

    last = profile['last_assessment']
    # Make timestamp more readable
    try:
        from datetime import datetime
        dt = datetime.fromisoformat(last)
        last_str = dt.strftime("%Y-%m-%d %H:%M")
    except:
        last_str = last

    history_count = len(profile['assessment_history'])
    safe_name = _escape_md_v2(team_name)
    return (
        f"*{safe_name}*\n"
        f"Текущий уровень: *L{profile['current_l']} / R{profile['current_r']}*\n"
        f"Последняя диагностика: {last_str}\n"
        f"История оценок: {history_count}"
    )