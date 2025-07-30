from backend.crew_agents import ambiguity_task, framework_task, summarizer_task, obligation_task, risk_assessment_task
from backend.text_store import get_contract_text
from crewai import Crew

AGENT_MAP = {
    "ambiguity": ambiguity_task,
    "framework": framework_task,
    "summary": summarizer_task,
    "obligation": obligation_task,
    "risk": risk_assessment_task,
}

def run_agentic_analysis(document_id: str, agent_type: str) -> str:
    text = get_contract_text(document_id)
    print(f"ANALYZE: Text for document_id={document_id} (first 500 chars):\n{text[:500]}")
    if agent_type not in AGENT_MAP:
        raise ValueError(f"Unknown agent_type: {agent_type}")
    task = AGENT_MAP[agent_type](text)
    crew = Crew(
        agents=[task.agent],
        tasks=[task]
    )
    result = crew.kickoff()
    if isinstance(result, dict):
        result_str = result.get("raw") or str(result)
    else:
        result_str = str(result)
    return result_str 