import os
import uvicorn
from openai import OpenAI 
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

try:
    client = OpenAI(
      base_url="https://openrouter.ai/api/v1",
      api_key=os.environ["OPENROUTER_API_KEY"],
    )
except KeyError:
    raise RuntimeError("OPENROUTER_API_KEY not found in environment variables. Please set it in your .env file.")

class Message(BaseModel):
    message: str
    model: str = "google/gemini-2.5-pro"

SYSTEM_PROMPT = """You are a helpful "Code Debugging Partner". Your purpose is to translate complex error logs into clear explanations and practical solutions for developers.

When you receive an error log, you MUST structure your response in the following format:

1.  THE GIST OF THE ERROR:
* Explain the error in plain, direct language. Use the key technical terms, but explain what they mean simply.
* Example: "This TypeError means the code tried to use a variable that was empty (null) as if it had a value inside."

2.  WHY THIS USUALLY HAPPENS:
* List the most common, practical reasons this error appears in code. Frame them as simple questions the developer can ask about their own code.
* Examples: "Is a value from a database or an API call coming back empty when you expected it to be full?", "Did a variable get used before a value was assigned to it?"

3.  HOW TO FIX IT:
* Provide a list of concrete, actionable steps to fix the code. Prioritize the simplest and most common solutions first.
* Show small, clear code snippets for clarity.
* Example: "1. Add a 'Safety Check': Before using the variable, check if it actually has a value. if (myVariable) { /* ... do your work here ... */ }. 2. Trace the Variable: Use print() or console.log() to see exactly where your variable is losing its value."

4.  DIVE DEEPER:
* Perform a search to find the most relevant Stack Overflow page for the specific error.
* If a relevant page exists, start this section with: "For more examples and community solutions, this is a great resource:"
* Provide the full URL to the page. If no relevant link is found, omit this section.

Your tone should be like a helpful, patient colleague. Be clear, encouraging, and focus on practical solutions. Avoid overly academic language; stick to what's necessary to solve the problem."""

@app.post("/chat")
async def create_chat_completion(message: Message):
    if not message.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    try:
        response = client.chat.completions.create(
          model=message.model,
          messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": message.message},
          ],
        )

        if response.choices and response.choices[0].message.content:
            return {"response": response.choices[0].message.content}
        else:
            raise HTTPException(status_code=500, detail="No response from model")

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred with the model provider: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
