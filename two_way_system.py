import cv2
import mediapipe as mp
import speech_recognition as sr
import pyttsx3
import math

from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# ---------- TEXT TO SPEECH ----------
engine = pyttsx3.init()
engine.setProperty('rate', 150)

def speak(text):
    engine.say(text)
    engine.runAndWait()

# ---------- SPEECH RECOGNIZER ----------
recognizer = sr.Recognizer()

# ---------- HAND LANDMARKER SETUP ----------
model_path = "hand_landmarker.task"

BaseOptions = python.BaseOptions
HandLandmarker = vision.HandLandmarker
HandLandmarkerOptions = vision.HandLandmarkerOptions
VisionRunningMode = vision.RunningMode

options = HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=model_path),
    running_mode=VisionRunningMode.VIDEO,
    num_hands=1
)

landmarker = HandLandmarker.create_from_options(options)

# ---------- CAMERA ----------
cap = cv2.VideoCapture(0)
previous_gesture = ""
speech_text = ""
frame_timestamp = 0

def distance(p1, p2):
    return math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=rgb
    )

    result = landmarker.detect_for_video(mp_image, frame_timestamp)
    frame_timestamp += 1

    gesture = "Detecting..."

    if result.hand_landmarks:
        for landmarks in result.hand_landmarks:

            thumb_tip = landmarks[4]
            index_tip = landmarks[8]
            middle_tip = landmarks[12]

            d1 = distance(thumb_tip, index_tip)
            d2 = distance(index_tip, middle_tip)

            if d1 < 0.05 and d2 < 0.05:
                gesture = "FIST"
            elif d1 > 0.1 and d2 > 0.1:
                gesture = "OPEN PALM"
            else:
                gesture = "PEACE"

            # Draw landmarks
            for lm in landmarks:
                h, w, _ = frame.shape
                cx, cy = int(lm.x * w), int(lm.y * h)
                cv2.circle(frame, (cx, cy), 5, (0, 255, 0), -1)

    # Speak gesture only if changed
    if gesture != previous_gesture and gesture != "Detecting...":
        speak(gesture)
        previous_gesture = gesture

    # Display text
    cv2.putText(frame, "Sign: " + gesture, (10, 50),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 3)

    cv2.putText(frame, "Speech: " + speech_text, (10, 100),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 3)

    cv2.imshow("Two Way Communication System (HandLandmarker)", frame)

    key = cv2.waitKey(1)

    # Press S to activate speech recognition
    if key == ord('s'):
        with sr.Microphone() as source:
            print("Speak now...")
            audio = recognizer.listen(source)

        try:
            speech_text = recognizer.recognize_google(audio)
            print("You said:", speech_text)
            speak(speech_text)
        except sr.UnknownValueError:
            speech_text = "Not understood"
        except sr.RequestError:
            speech_text = "Internet error"

    # ESC or Q to exit
    if key == 27 or key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()