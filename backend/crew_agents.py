from crewai import Agent, Task
import os

# Agent: Ambiguity Detector
ambiguity_agent = Agent(
    name="Ambiguity Detector",
    role="Legal Language Expert",
    goal="Detect and clarify ambiguous language in legal contracts.",
    backstory="You are a seasoned legal editor with a keen eye for ambiguity and clarity in contract language. Your job is to help users identify and improve unclear or confusing terms.",
    prompt="You are an expert in legal writing. Detect ambiguous sentences, words, or phrases in the provided contract text. For each, explain why it is ambiguous and suggest a clearer alternative.",
    llm="gpt-3.5-turbo"
)

def ambiguity_task(text):
    return Task(
        agent=ambiguity_agent,
        input=text,
        description="Detect ambiguities and suggest improvements.",
        expected_output="A list of ambiguous sentences/phrases, explanations, and suggested improvements."
    )

# Agent: Framework Analyzer
framework_agent = Agent(
    name="Framework Analyzer",
    role="Jurisdiction Law Analyst",
    goal="Map and interpret governing law provisions, identify conflicts and harmonization needs.",
    backstory="You are a legal analyst specializing in cross-jurisdictional contracts. You help users understand how different legal frameworks interact and where conflicts may arise.",
    prompt=(
        "You are a legal analyst. Given the following contract text, map and interpret all governing law provisions across jurisdictions. "
        "Identify any potential conflicts between jurisdictions and explain any harmonization requirements. "
        "Be specific and reference the relevant sections of the contract."
    ),
    llm="gpt-3.5-turbo"
)

def framework_task(text):
    print(f"FRAMEWORK ANALYZER INPUT (first 500 chars):\n{text[:500]}")
    return Task(
        agent=framework_agent,
        input=text,
        description=(
            "Analyze the contract for governing law provisions, identify conflicts between jurisdictions, "
            "and explain harmonization requirements. Provide a detailed summary."
        ),
        expected_output=(
            "A detailed summary of governing law provisions, identified conflicts, and harmonization requirements, "
            "with references to relevant contract sections."
        )
    )

# Agent: Summarizer
summarizer_agent = Agent(
    name="Summarizer",
    role="Contract Summarizer",
    goal="Summarize contracts, extract key details, keywords, and explanations.",
    backstory="You are a legal assistant with expertise in distilling complex contracts into clear, concise summaries for busy professionals.",
    prompt="You are a legal summarizer. Summarize the contract, providing important details, keywords, and brief explanations for each section.",
    llm="gpt-3.5-turbo"
)

def summarizer_task(text):
    return Task(
        agent=summarizer_agent,
        input=text,
        description="Summarize the contract and extract key details.",
        expected_output="A concise summary of the contract, including key details, keywords, and brief explanations."
    )

# Agent: Deadline & Obligation Tracker
obligation_agent = Agent(
    name="Deadline & Obligation Tracker",
    role="Contract Manager",
    goal="Extract all critical dates, deliverables, deadlines, and obligations from contracts.",
    backstory="You are a contract manager who ensures all parties are aware of their obligations and deadlines. You help users track important dates and deliverables.",
    prompt="You are a contract manager. Extract all critical dates, deliverables, deadlines, and obligations from the contract, such as payment dates and contract durations.",
    llm="gpt-3.5-turbo"
)

def obligation_task(text):
    return Task(
        agent=obligation_agent,
        input=text,
        description="Extract deadlines, obligations, and critical dates.",
        expected_output="A list of all critical dates, deliverables, deadlines, and obligations found in the contract."
    )

risk_agent = Agent(
    name="Risk Assessment Agent",
    role="Contract Risk Analyst",
    goal="Identify and explain risky clauses in legal contracts.",
    backstory="You are an expert in contract risk analysis, skilled at spotting clauses that may pose legal or business risks.",
    prompt=(
        '''Analyse the following contract text and identify clauses that may pose potential risks.

###Contract text:
{input}

### **Output Format & Constraints**
for each risky clause, return a structured JSON response **without adding or modifying any information not explicitly stated in the contract**

-**Clause type: **[the legal category of the clause, eg, Termination, liability, Indemnification, etc ]
-**Clause text: **[Exact wording of the risky clause]
-**Risk Description:**[Why might this be a concern?]

### **Strict Constraints:**
-**Do NOT add any extra details such as monetary values, dates, locations, or parties that are not explicitly mentioned in the contract,**
-**Do NOT infer or assume any additional conditions beyond what is directly stated**
-**Do NOT modify legal terms, obligations, or add any hypothetical scenarios.**

**Example Output:**
[
  {
    "clause type": "Termination",
    "clause text": "The company reserves the right to terminate the contract at any time,",
    "risk description": "This clause allows one party to unilaterally terminate the contract, potentially creating instability."
  },
  {
    "clause type": "Liability",
    "clause text": "The service provider is not liable for any indirect damages.",
    "risk description": "This limits liability in a way that might exclude valid claims."
  }
]
'''
    ),
    llm="gpt-3.5-turbo"
)

def risk_assessment_task(text):
    return Task(
        agent=risk_agent,
        input=text,
        description="Identify risky clauses in the contract and explain why they are a concern, following strict output constraints.",
        expected_output="A JSON array of risky clauses, each with clause type, exact clause text, and risk description, following the strict constraints."

    ) 
