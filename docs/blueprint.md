# **App Name**: Visionary Assistant

## Core Features:

- Voice Command Recognition: Utilize Speech-to-Text API for voice commands, ensuring 100% voice-driven interaction. It can discern commands like 'Read text', 'Detect objects', 'Navigate', and 'Emergency' and ensures clarity and adjustable speech speed. Prioritizes offline support for essential features using on-device processing.
- Object and Obstacle Detection with Distance Awareness: Use Google ML Kit / Vision AI to identify objects (people, vehicles, doors) and obstacles via the smartphone camera. The tool announces the object and the proximity of the object and the distance from the objects using an audio description.
- Real-time Text Recognition and Narration: Employ camera-based OCR (Google ML Kit / Vision AI) to convert text from various sources into voice output. Converts the images stored temporarily on Firebase Storage.  Offers multi-language support, reading printed material, signboards, and digital screens and converts recognized text into voice output.
- GPS-Based Navigation Assistance: Integrate GPS for providing step-by-step voice guidance. Ensures safe path instructions and alerts for upcoming obstacles. Offers step-by-step navigation.
- Emergency Assistance with Location Sharing: Activate SOS via voice command to call predefined contacts.  The tool uses location services to share user's real-time location and provide emergency alert confirmation using Firebase Cloud Messaging.
- User Profile Management: Stores user-specific settings in Firestore, like preferred language, voice speed, and emergency contacts.

## Style Guidelines:

- Primary color: Dark blue (#2C3E50) to convey trust and reliability, important for an emergency assistance app.
- Background color: Very dark gray (#34495E), almost black, creating high contrast for readability and a modern feel.
- Accent color: Bright yellow (#F1C40F) to draw attention to critical information and interactive elements.
- Body and headline font: 'PT Sans' (sans-serif) for clear, accessible readability, with high differentiation of weights for headlines vs body
- Use simple, high-contrast icons to represent key functions, ensuring clarity for users with impaired vision.
- Voice-first interaction. Use of clear audio cues and feedback.
- Subtle, non-distracting animations to provide feedback on voice command processing and function activation.