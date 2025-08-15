


import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class AgriGPT:
    def __init__(self, user_id=None):
        self.model = genai.GenerativeModel("models/gemini-2.0-flash")
        self.chat = self.model.start_chat()
        self.system_instruction = (
            "You are AgriGPT, a helpful agriculture assistant. "
            "You should only answer questions related to agriculture. "
            "If the question is not related to agriculture, politely decline to answer."
        )
        self.user_id = user_id
        self.profile_data = self.load_profile_data()

    def load_profile_data(self):
        """Load user profile data from the JSON file."""
        if not self.user_id:
            return None  # Explicitly return None if user_id is not provided
        profile_path = os.path.join("users", self.user_id, "profile.json")
        if os.path.exists(profile_path):
            with open(profile_path, "r") as file:
                return json.load(file)
        return None  # Return None if profile not found

    def save_chat_history(self, message, response):
        """Save the user's message and the bot's response to the chat history."""
        if not self.user_id:
            return  # No user ID, so don't save the chat history
        history_path = os.path.join("users", self.user_id, "chat_history.json")
        history = []
        if os.path.exists(history_path):
            with open(history_path, "r") as file:
                history = json.load(file)
        # Append new chat message to history
        history.append({"user": message, "bot": response})
        with open(history_path, "w") as file:
            json.dump(history, file, indent=4)

    def personalize_prompt(self, user_input):
        """Create a personalized prompt for the AI model based on the user's profile."""
        context = ""
        if self.profile_data:
            # Build context from profile data if available
            context_parts = [
                f"User owns {self.profile_data.get('land_owned', 'unknown')} acres of land.",
                f"Community: {self.profile_data.get('community', 'unknown')}.",
                f"Annual income: {self.profile_data.get('annual_income', 'unknown')}.",
                f"Preferred language: {self.profile_data.get('language', 'unknown')}.",
            ]
            context = "\n".join(context_parts)
        # Construct the final prompt for the model
        return f"{self.system_instruction}\n{context}\nUser: {user_input}"

    def ask(self, user_input):
        """Send a user input to the AI model and return the generated response."""
        try:
            # Build the personalized prompt for the model
            prompt = self.personalize_prompt(user_input)
            # Send the message to the generative model
            response = self.chat.send_message(prompt)
            reply = response.text.strip()  # Clean the response

            # Save chat history
            self.save_chat_history(user_input, reply)

            return reply
        except Exception as e:
            # Handle any errors that might occur (e.g., API issues, etc.)
            print(f"Error occurred: {e}")
            return "Sorry, there was an error processing your request."
