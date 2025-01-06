from flask import Flask, request, jsonify
import os
import base64
from email.mime.text import MIMEText
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

app = Flask(__name__)

SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def authenticate():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    return creds

def create_message(sender, to, subject, message_text):
    message = MIMEText(message_text)
    message['to'] = to
    message['from'] = sender
    message['subject'] = subject
    raw = base64.urlsafe_b64encode(message.as_bytes())
    return {'raw': raw.decode()}

@app.route('/send-email', methods=['POST'])
def send_email():
    try:
        data = request.get_json()
        user_name = data.get('name')

        if not user_name:
            return jsonify({"error": "Nom requis"}), 400

        creds = authenticate()
        service = build('gmail', 'v1', credentials=creds)

        message = create_message(
            sender='votre_email@gmail.com',
            to='cyprien.guillaume@outlook.com',
            subject='Nouveau visiteur sur le site',
            message_text=f"Un nouvel utilisateur a visité le site.\n\nNom de l'utilisateur : {user_name}"
        )
        service.users().messages().send(userId='me', body=message).execute()

        return jsonify({"success": "Email envoyé avec succès"}), 200
    except Exception as e:
        print(f"Erreur : {e}")
        return jsonify({"error": "Impossible d'envoyer l'email"}), 500

if __name__ == '__main__':
    app.run(port=8080)
