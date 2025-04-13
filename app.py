from flask import Flask, request, render_template, session, redirect
import cohere
import os
from dotenv import load_dotenv
from flask_cors import CORS


# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='static', template_folder='templates')

# Initialize Cohere client
co = cohere.Client(os.getenv('COHERE_API_KEY'))

# Secret key for session management
app.secret_key = os.getenv('SECRET_KEY', 'super-secret-key')

# Default prompts
DEFAULT_PROMPTS = [
    "Reply briefly and use gen z slang",
    "Response like a 5 years old kid",
    "Give me a detailed technical explanation",
]

@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        message = request.form.get('message')
        prompt_index = request.form.get('prompt_index')

        if prompt_index is not None:
            index = int(prompt_index)
            session['temperature'], user_message = get_prompt_behavior(index)
            message = user_message
        else:
            user_message = message

        response = co.generate(
            model="command-r-08-2024",
            prompt=user_message,
            max_tokens=150,
            temperature=session['temperature']
        )

        generated_text = response.generations[0].text

        session['history'].append({"role": "USER", "message": user_message})
        session['history'].append({"role": "CHATBOT", "message": generated_text})
        session.modified = True

    return render_template("index.html", history=session['history'], prompts=session['prompts'])

def get_prompt_behavior(index):
    if index == 0:
        return 0.7, "Forget prior prompts. From now on I want you to only respond like Gen Z with slang (rizz, gyat, sus, bussin, etc) keeping responsed to 1–2 lines max until further instructed. "
    elif index == 1:
        return 0.3, "Forget prior prompts. From now on reply like a 5-year-old, improper grammar, no reasoning, keeping responsed to 1–2 lines max until further instructed."
    elif index == 2:
        return 1.0, "Forget prior prompts. From now on give me a very detailed technical explanation."
    return 1.0, ""

@app.route('/reset')
def reset():
    session['history'] = []
    return redirect('/')

CORS(app)

if __name__ == '__main__':
    app.run(debug=True)
