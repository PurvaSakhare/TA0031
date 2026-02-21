import cv2
import mediapipe as mp
import pyttsx3
import math
import threading
import time

from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# -------- VOICE --------
engine = pyttsx3.init()
engine.setProperty('rate', 150)

def speak(text):
    threading.Thread(
        target=lambda: (engine.say(text), engine.runAndWait()),
        daemon=True
    ).start()

# -------- MODEL --------
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
cap = cv2.VideoCapture(0)

previous_sign = ""
word = ""
sentence = ""
last_add_time = time.time()
frame_timestamp = 0

def distance(p1, p2):
    return math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2)

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

    sign = ""

    if result.hand_landmarks:
        landmarks = result.hand_landmarks[0]

        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        middle_tip = landmarks[12]
        ring_tip = landmarks[16]
        pinky_tip = landmarks[20]

        index_open = index_tip.y < landmarks[6].y
        middle_open = middle_tip.y < landmarks[10].y
        ring_open = ring_tip.y < landmarks[14].y
        pinky_open = pinky_tip.y < landmarks[18].y

        thumb_index_dist = distance(thumb_tip, index_tip)

        # ----- LETTER LOGIC -----
        if not index_open and not middle_open and not ring_open and not pinky_open:
            sign = "A"

        elif index_open and middle_open and ring_open and pinky_open:
            sign = "SPACE"

        elif 0.05 < thumb_index_dist < 0.15:
            sign = "C"

        else:
            if index_open and not middle_open:
                sign = "B"

        # ----- ADD LETTER -----
        if sign != "" and sign != previous_sign:
            current_time = time.time()

            if current_time - last_add_time > 1:

                if sign == "SPACE":
                    if word != "":
                        sentence += word + " "
                        word = ""
                else:
                    word += sign
                    speak(sign)

                last_add_time = current_time

        previous_sign = sign

    # -------- DISPLAY UI --------
    cv2.rectangle(frame, (0, 0), (640, 150), (0, 0, 0), -1)

    cv2.putText(frame, f"Sentence: {sentence}", (20, 50),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)

    cv2.putText(frame, f"Word: {word}", (20, 100),
                cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)

    cv2.imshow("Sign Language Sentence Builder", frame)

    key = cv2.waitKey(1) & 0xFF

    # S = Speak full sentence
    if key == ord('s'):
        speak(sentence + word)

    # C = Clear all
    if key == ord('c'):
        word = ""
        sentence = ""

    if key == 27 or key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()