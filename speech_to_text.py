import speech_recognition as sr

r = sr.Recognizer()

while True:
    with sr.Microphone() as source:
        print("Speak Something...")
        audio = r.listen(source)

    text = ""   # IMPORTANT: initialize before try

    try:
        text = r.recognize_google(audio)
        print("You said:", text)
    except sr.UnknownValueError:
        print("Could not understand")
    except sr.RequestError:
        print("Internet error")

    # Safe exit condition
    if text.lower() == "exit":
        print("Exiting program...")
        break