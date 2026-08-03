"""
Improved grounding / lightweight RAG over the whitepaper.

Features:
- Chunking of the whitepaper text
- Keyword + simple relevance scoring
- Retrieval of relevant excerpts for reports and justifications
"""

import re
from pathlib import Path
from typing import List, Tuple

WHITEPAPER_PATH = Path("/home/admin/.hermes/cache/whitepaper_full_ru.txt")

# Key concepts we care about for retrieval
CONCEPT_KEYWORDS = {
    "среда важнее модели": ["среда", "модель", "harness", "контекст"],
    "evidence bundle": ["evidence bundle", "проверочный пакет", "валидация"],
    "агент-ревьюер": ["агент-ревьюер", "reviewer", "guardian"],
    "governance mesh": ["governance mesh", "контур управления", "guardrails"],
    "sdd": ["sdd", "спецификация", "spec-first"],
    "уровни зрелости": ["l0", "l1", "l2", "l3", "l4", "l5", "уровень зрелости"],
    "r-уровни": ["r0", "r1", "r2", "r3", "r4", "r5", "автономия"],
}


def _is_toc_like(text: str) -> bool:
    """Detect table of contents, index, or header garbage."""
    t = text.lower()
    
    # Many dotted leaders
    if len(re.findall(r'\.{4,}', text)) >= 2:
        return True
    
    # Starts with typical TOC headers
    if t.startswith("оглавление") or "резюме для руководства" in t[:40]:
        return True
    
    # Classic TOC line pattern
    if re.search(r'\w\s+\.{5,}\s*\d{1,3}', text):
        return True
    
    # Too many short dotted lines
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    if len(lines) >= 2:
        dotted = sum(1 for l in lines if len(l) < 90 and "....." in l)
        if dotted >= 2:
            return True
    
    return False


def _content_quality(text: str) -> float:
    """Higher score for real explanatory paragraphs, lower for headings/TOC/summaries."""
    score = 0.0
    # Prefer multiple real sentences
    sentences = len(re.findall(r'[.!?]', text))
    score += min(sentences, 5) * 1.0
    
    # Penalize heavy formatting artifacts
    if '\f' in text:
        score -= 2
    if len(re.findall(r'\.{4,}', text)) > 0:
        score -= 3
    
    # Strongly penalize "Часть X — summary" style
    if re.match(r'^\s*Часть\s+\d+\s*[—-]', text):
        score -= 4.0
    
    # Penalize pure heading style
    if re.match(r'^\s*(Часть|Раздел|Глава)\s+\d', text):
        score -= 2.5
    
    # Bonus for explanatory words
    good_words = ['потому что', 'важно', 'необходимо', 'это означает', 'в результате', 
                  'например', 'в частности', 'основной принцип', 'в отличие от']
    for w in good_words:
        if w in text.lower():
            score += 0.8
            break
    
    # Length bonus (real paragraphs)
    if 250 < len(text) < 1200:
        score += 1.5
    
    return score


class WhitepaperRetriever:
    def __init__(self):
        self.chunks: List[str] = []
        self._load_and_chunk()

    def _load_and_chunk(self):
        if not WHITEPAPER_PATH.exists():
            self.chunks = ["Белая книга не найдена в кэше."]
            return

        text = WHITEPAPER_PATH.read_text(encoding="utf-8", errors="ignore")

        # Simple paragraph-based chunking (roughly 400-800 chars)
        paragraphs = re.split(r'\n\s*\n', text)
        current = ""
        for p in paragraphs:
            p = p.strip()
            if not p:
                continue
            if len(current) + len(p) < 700:
                current += " " + p if current else p
            else:
                if current:
                    self.chunks.append(current.strip())
                current = p
        if current:
            self.chunks.append(current.strip())

        # Keep only meaningful chunks + remove obvious TOC garbage
        self.chunks = [
            c for c in self.chunks 
            if len(c) > 180 and not _is_toc_like(c)
        ][:400]

    def retrieve(self, query: str, max_results: int = 3) -> List[str]:
        """Retrieve most relevant chunks for a query."""
        if not self.chunks or "не найдена" in self.chunks[0].lower():
            return ["Полный текст белой книги доступен в репозитории проекта."]

        query_lower = query.lower()
        scores = []

        for i, chunk in enumerate(self.chunks):
            if _is_toc_like(chunk):
                continue

            chunk_lower = chunk.lower()
            score = 0

            # Keyword overlap
            for concept, kws in CONCEPT_KEYWORDS.items():
                if concept in query_lower or any(kw in query_lower for kw in kws):
                    if any(kw in chunk_lower for kw in kws) or concept in chunk_lower:
                        score += 3

            # General word overlap
            query_words = set(re.findall(r'\w{4,}', query_lower))
            chunk_words = set(re.findall(r'\w{4,}', chunk_lower))
            overlap = len(query_words & chunk_words)
            score += overlap * 0.8

            # Bonus for real text + quality
            quality = _content_quality(chunk)
            score += quality

            if score > 0:
                # Clean leading junk
                clean = chunk.strip()
                clean = re.sub(r'^[•\-–—\s]+', '', clean)
                scores.append((score, i, clean[:650]))

        scores.sort(reverse=True)

        if not scores:
            # Fallback: return chunks that mention levels or key terms
            # Prefer higher quality chunks
            candidates = []
            for i, c in enumerate(self.chunks[:50]):
                if any(k in c.lower() for k in ["l0", "l1", "l2", "l3", "evidence", "sdd", "среда важнее", "governance"]):
                    if not _is_toc_like(c):
                        candidates.append(( _content_quality(c), c[:650] ))
            if candidates:
                candidates.sort(reverse=True)
                return [candidates[0][1]]
            # last resort - first decent chunk
            for c in self.chunks[5:20]:
                if not _is_toc_like(c) and len(c) > 250:
                    return [c[:650]]
            return [self.chunks[5][:600]] if len(self.chunks) > 5 else ["Белая книга доступна в репозитории."]

        # Re-rank by combined quality (score + length + sentence density)
        scored = []
        for s, _, text in scores:
            length_bonus = min(len(text) / 400, 2.0)
            sent_bonus = min(text.count('.') + text.count('!') + text.count('?'), 4) * 0.4
            quality = s + length_bonus + sent_bonus
            scored.append((quality, text))

        scored.sort(reverse=True)

        results = []
        seen = set()
        for quality, text in scored:
            # Skip Часть summary chunks
            if re.match(r'^Часть\s+\d+\s*[—-]', text, re.IGNORECASE):
                continue
            key = text[:60]
            if key not in seen:
                results.append(text[:780])
                seen.add(key)
            if len(results) >= max_results:
                break

        # Ensure we always try to return 2 if possible (after filtering)
        if len(results) < max_results and len(scored) > 0:
            for _, text in scored:
                if re.match(r'^Часть\s+\d+\s*[—-]', text, re.IGNORECASE):
                    continue
                key = text[:60]
                if key not in seen:
                    results.append(text[:780])
                    seen.add(key)
                if len(results) >= max_results:
                    break

        return results[:max_results]


# Global instance for convenience
_retriever = None

def get_relevant_excerpts(query: str, max_results: int = 2) -> List[str]:
    global _retriever
    if _retriever is None:
        _retriever = WhitepaperRetriever()
    return _retriever.retrieve(query, max_results)