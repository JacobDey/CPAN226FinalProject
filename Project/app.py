from flask import Flask, request, jsonify, render_template
import cohere
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Initialize Cohere client
co = cohere.Client(os.getenv('COHERE_API_KEY'))

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    conversation_history = data.get('history', [])

    try:
        # Generate response using Cohere's chat endpoint
        response = co.chat(
            message=user_message,
            chat_history=conversation_history,
            model="command",
            temperature=0.7
        )
        
        bot_response = response.text
        
        return jsonify({
            'response': bot_response,
            'history': conversation_history + [
                {"role": "USER", "message": user_message},
                {"role": "CHATBOT", "message": bot_response}
            ]
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)