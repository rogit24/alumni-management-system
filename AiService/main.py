import os
import re
import requests
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import py_eureka_client.eureka_client as eureka_client

# LangChain Imports (Optional loading based on API key)
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser

# --- Service Registry Integration (Eureka) ---
EUREKA_SERVER = os.environ.get("EUREKA_CLIENT_SERVICEURL_DEFAULTZONE", "http://localhost:8761/eureka/")
INSTANCE_IP = os.environ.get("EUREKA_INSTANCE_IP_ADDRESS", "localhost")
INSTANCE_PORT = int(os.environ.get("PORT", "8000"))

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        await eureka_client.init_async(
            eureka_server=EUREKA_SERVER,
            app_name="AI-SERVICE",
            instance_port=INSTANCE_PORT,
            instance_host=INSTANCE_IP
        )
        print("AI-SERVICE registered with Eureka successfully!")
    except Exception as e:
        print(f"Eureka discovery registration bypassed or failed: {e}")
    yield
    # Shutdown
    try:
        await eureka_client.stop_async()
        print("AI-SERVICE unregistered from Eureka successfully.")
    except Exception as e:
        print(f"Eureka discovery deregistration bypassed or failed: {e}")

app = FastAPI(title="AlumniConnect AI Service", lifespan=lifespan)

# Enable CORS for local testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Helper to resolve downstream microservices ---
# In Docker compose, we call container hostnames directly. Locally, we use localhost.
USER_SERVICE_URL = os.environ.get("USER_SERVICE_URL", "http://localhost:8081")
PROFILE_SERVICE_URL = os.environ.get("PROFILE_SERVICE_URL", "http://localhost:8082")
JOB_SERVICE_URL = os.environ.get("JOB_SERVICE_URL", "http://localhost:8083")


class GenerateJobRequest(BaseModel):
    prompt: str

class ChatbotRequest(BaseModel):
    query: str


# --- Fallback Heuristic Matcher & LLM Simulator ---
# This ensures the service runs immediately without needing external OpenAI/Gemini accounts.
def mock_generate_job(prompt: str) -> dict:
    # Quick regex extracts
    prompt_lower = prompt.lower()
    title = "Software Engineer"
    if "java" in prompt_lower:
        title = "Senior Java Developer"
    elif "react" in prompt_lower or "frontend" in prompt_lower:
        title = "React Frontend Engineer"
    elif "python" in prompt_lower:
        title = "Python AI/ML Developer"
    elif "dot net" in prompt_lower or ".net" in prompt_lower:
        title = "C# .NET Backend Developer"

    company = "Alumni Connect Partner"
    location = "Remote, India"
    if "hybrid" in prompt_lower:
        location = "Hybrid, Bangalore"
    elif "onsite" in prompt_lower:
        location = "Onsite, Mumbai"

    job_type = "FULL_TIME"
    if "intern" in prompt_lower:
        job_type = "INTERNSHIP"

    salary = "8.5 LPA"
    if "senior" in prompt_lower or "5 year" in prompt_lower:
        salary = "15 LPA"

    description = (
        f"We are looking for a qualified candidate to fill our {title} opening. \n\n"
        f"Key Responsibilities:\n"
        f"- Design, write, and deploy secure modules based on code requirements.\n"
        f"- Partner with core team members on sprint releases.\n\n"
        f"Required background / requirements based on prompt: {prompt}"
    )

    return {
        "title": title,
        "company": company,
        "location": location,
        "salary": salary,
        "description": description,
        "jobType": job_type
    }

def calculate_cosine_similarity(text1: str, text2: str) -> float:
    # Simple word overlap similarity coefficient acting as embedding-similarity
    words1 = set(re.findall(r'\w+', text1.lower()))
    words2 = set(re.findall(r'\w+', text2.lower()))
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    if not union:
        return 0.0
    return float(len(intersection)) / len(union)


# --- API Endpoint 1: Automated Job Creator ---
@app.post("/api/v1/ai/job/generate")
async def generate_job_description(payload: GenerateJobRequest):
    openai_key = os.environ.get("OPENAI_API_KEY")
    gemini_key = os.environ.get("GEMINI_API_KEY")

    if not openai_key and not gemini_key:
        print("Using self-contained Mock Job Generator (No API keys configured)")
        return mock_generate_job(payload.prompt)

    try:
        # Prompt template to enforce JSON output format
        prompt_template = PromptTemplate(
            template=(
                "You are an expert HR assistant. Draft a professional job description based on the draft requirements:\n"
                "\"{requirements}\"\n\n"
                "You MUST return the output ONLY as a JSON object with these keys:\n"
                "- 'title': The professional job title\n"
                "- 'company': Company name (default to 'Partner Company')\n"
                "- 'location': Remote/City\n"
                "- 'salary': String representation of salary (e.g. '12 LPA')\n"
                "- 'description': Detailed description with roles/requirements\n"
                "- 'jobType': Either 'FULL_TIME' or 'INTERNSHIP'\n"
            ),
            input_variables=["requirements"]
        )

        # Dynamic LLM binding
        if gemini_key:
            from langchain_google_genai import ChatGoogleGenerativeAI
            llm = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=gemini_key)
        else:
            from langchain_openai import ChatOpenAI
            llm = ChatOpenAI(model="gpt-3.5-turbo", openai_api_key=openai_key)

        chain = prompt_template | llm | JsonOutputParser()
        result = chain.invoke({"requirements": payload.prompt})
        return result
    except Exception as e:
        print(f"LangChain pipeline failed: {e}. Falling back to mock generator.")
        return mock_generate_job(payload.prompt)


# --- API Endpoint 2: RAG Career Chatbot & Job Recommendation ---
@app.post("/api/v1/ai/career/chatbot")
async def career_chatbot(payload: ChatbotRequest, x_user_id: str = Header(None)):
    if not x_user_id:
        # For testing fallback
        x_user_id = "1"

    # 1. Fetch Student Profile
    profile = {}
    try:
        headers = {"X-User-Id": x_user_id, "X-User-Role": "STUDENT"}
        # Check direct container resolution or localhost port mapping
        r = requests.get(f"{PROFILE_SERVICE_URL}/api/v1/profiles/user/{x_user_id}", headers=headers, timeout=3)
        if r.status_code == 200:
            profile = r.json()
    except Exception as e:
        print(f"Could not reach ProfileMS at {PROFILE_SERVICE_URL}: {e}")

    # 2. Fetch Active Jobs
    jobs = []
    try:
        headers = {"X-User-Id": x_user_id, "X-User-Role": "STUDENT"}
        r = requests.get(f"{JOB_SERVICE_URL}/api/v1/jobs", headers=headers, timeout=3)
        if r.status_code == 200:
            jobs = r.json()
    except Exception as e:
        print(f"Could not reach JobMS at {JOB_SERVICE_URL}: {e}")

    # 3. Compile Profile context text
    skills = profile.get("skills", "Java, SQL")
    department = profile.get("department", "Computer Science")
    profile_text = f"Skills: {skills}. Department: {department}."

    # 4. RAG Vector/Overlap Matching
    matches = []
    for job in jobs:
        job_content = f"{job.get('title', '')} {job.get('description', '')} {job.get('company', '')}"
        score = calculate_cosine_similarity(profile_text, job_content)
        # We also boost if the user query mentions the job title keywords
        query_boost = calculate_cosine_similarity(payload.query, job.get('title', ''))
        total_score = (score * 0.6) + (query_boost * 0.4)
        
        matches.append({
            "id": job.get("id"),
            "title": job.get("title"),
            "company": job.get("company"),
            "location": job.get("location"),
            "salary": job.get("salary"),
            "jobType": "Internship" if job.get("jobType") == "INTERNSHIP" else "Full Time",
            "matchScore": round(total_score, 2)
        })

    # Sort matching jobs by similarity score descending, take top 3
    matches = sorted(matches, key=lambda x: x["matchScore"], reverse=True)[:3]

    # Generate chatbot response text
    openai_key = os.environ.get("OPENAI_API_KEY")
    gemini_key = os.environ.get("GEMINI_API_KEY")

    matches_summary = ", ".join([f"'{m['title']}' at {m['company']}" for m in matches if m["matchScore"] > 0])
    
    if not openai_key and not gemini_key:
        # Mock RAG LLM Response
        if not matches_summary:
            reply = (
                f"Based on your profile skills ({skills}), I couldn't find any direct matching job openings in our system right now.\n\n"
                f"Recommendations:\n"
                f"- Consider adding additional certifications to your profile.\n"
                f"- Request career referrals from active alumni using the Referrals tab!"
            )
        else:
            reply = (
                f"I analyzed your skills ({skills}) against our active catalog and found relevant matches: {matches_summary}.\n\n"
                f"My Advice:\n"
                f"- Apply for the **{matches[0]['title']}** position because it closely matches your profile.\n"
                f"- Reach out to the alumnus who posted it to ask for a referral to increase your chance of selection!"
            )
        return {"reply": reply, "matches": matches if matches_summary else []}

    # If keys exist, run dynamic LangChain QA template
    try:
        if gemini_key:
            from langchain_google_genai import ChatGoogleGenerativeAI
            llm = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=gemini_key)
        else:
            from langchain_openai import ChatOpenAI
            llm = ChatOpenAI(model="gpt-3.5-turbo", openai_api_key=openai_key)

        prompt_template = PromptTemplate(
            template=(
                "You are an expert career chatbot. You have access to a student's profile and matching job openings.\n"
                "Student Profile: {student_profile}\n"
                "Top Matching Job Listings: {matches}\n\n"
                "Question: {query}\n\n"
                "Provide helpful, concise, and structured career advice. Suggest which jobs they should target."
            ),
            input_variables=["student_profile", "matches", "query"]
        )

        chain = prompt_template | llm
        reply = chain.invoke({
            "student_profile": profile_text,
            "matches": str(matches),
            "query": payload.query
        })
        
        # If response is a LangChain Message object, extract content
        reply_text = getattr(reply, 'content', str(reply))
        return {"reply": reply_text, "matches": matches}
    except Exception as e:
        print(f"LangChain career QA chain failed: {e}. Falling back to default advice.")
        return {"reply": f"Based on your profile, I recommend reviewing matches like: {matches_summary}.", "matches": matches}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=INSTANCE_PORT, reload=True)
