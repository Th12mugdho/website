/* ============================================================
   knowledge.js — everything the ASK.TH assistant knows about
   Tasneemul. ONE source of truth, used two ways:

   • AI mode (server.js): the whole list goes into Claude's system
     prompt. Claude may only state facts about Tasneemul that are
     written here, so keep it accurate and up to date.
   • Offline mode (rag.js, when the backend is unreachable): each
     entry is a searchable chunk; `keywords` boost matching.

   After editing, restart / redeploy server.js so the AI picks it up.
============================================================ */

window.KNOWLEDGE_BASE = [
  {
    id: "summary",
    category: "About",
    keywords: ["who", "about", "summary", "background", "intro", "engineer"],
    text: "Md. Tasneemul Hassan is a BSc graduate in Electrical and Electronic Engineering from BRAC University (expected Dec 2026), specializing in robotics, intelligent systems, and electronics. He has built 8+ hands-on projects spanning robotics, embedded systems, and analog/digital electronics. He currently serves as President of the BRAC University Electrical and Electronics Club (BUEEC) and leads a five-member team building Payra, an autonomous delivery drone."
  },
  {
    id: "testimonials",
    category: "Testimonials",
    keywords: ["testimonial", "recommendation", "reference", "review", "quote", "endorsement"],
    text: "For references or recommendations from Tasneemul's professors, mentors, and collaborators, or to discuss his work, the best route is reaching out via email (tasneemulhassan12@gmail.com) or LinkedIn."
  },
  {
    id: "education",
    category: "Education",
    keywords: ["education", "university", "cgpa", "degree", "school", "hsc", "ssc", "brac"],
    text: "Tasneemul studied at BRAC University, earning a Bachelor's in Electrical and Electronics Engineering with a CGPA of 3.61/4.0. He completed his HSC and SSC (both Science) at Rajshahi University School with perfect 5.00/5.00 GPAs."
  },
  {
    id: "payra",
    category: "Robotics · FYDP",
    keywords: ["payra", "drone", "uav", "hexacopter", "delivery", "fydp", "final year", "px4", "pixhawk", "esp32", "ros2", "gazebo"],
    text: "Payra is Tasneemul's Final Year Design Project: a hexacopter-based, non-landing autonomous drone delivery system for urban food and medicine delivery in Dhaka. It uses a Pixhawk flight controller, an ESP32-based smart delivery box with IMU-driven active fan stabilization, and is simulated in Gazebo via PX4 SITL with a ROS2 pipeline. The FYDP design report covers system specifications, requirements, constraints, and trade-off analysis, built by a five-member team."
  },
  {
    id: "mechahex",
    category: "Robotics",
    keywords: ["mechahex", "hexapod", "six-legged", "gait", "arduino", "walking robot"],
    text: "MechaHex is a six-legged hexapod robot Tasneemul designed and built, using a bio-inspired tripod gait for terrain navigation. It runs on an Arduino-based control system with servo motors and ultrasonic sensors, with custom trajectory-planning algorithms for stable walking, turning, and obstacle avoidance, on a custom 3D-printed chassis. It also carries a live-feed camera for real-time video streaming and environmental sensors. Code: https://github.com/Th12mugdho/MechaHex"
  },
  {
    id: "surveillance",
    category: "Robotics · Embedded",
    keywords: ["surveillance", "raspberry pi", "flask", "camera", "streaming", "video"],
    text: "Tasneemul built a live surveillance node on a Raspberry Pi Zero 2W paired with a Flask-based web app for real-time video streaming and remote monitoring."
  },
  {
    id: "fusion-hexa",
    category: "Robotics · Simulation",
    keywords: ["fusion hexa", "simulation", "gazebo", "px4", "sitl", "hexacopter", "aruco", "mavsdk", "winch", "auto-hover", "opencv", "github"],
    text: "Fusion Hexa is Tasneemul's open-source (MIT) PX4 + Gazebo hexacopter simulation: a custom Hexarotor+ vehicle (PX4 airframe 7001) in PX4 SITL with Gazebo Harmonic, using a 5.575 kg first-pass flight model. It has a gimballed 1280x720 RGB camera and a dedicated downward landing camera, detects an ArUco landing pad (marker ID 33), runs OpenCV HOG person detection and frontal-face detection (detection only, no identity recognition), and uses a MAVSDK Offboard XY auto-hover controller to centre over the marker while holding altitude. It also includes a delivery payload/winch experiment controlled from a gamepad through a Gazebo Transport bridge. Code: https://github.com/Th12mugdho/hexacopter-gazebo-simulation"
  },
  {
    id: "human-detection",
    category: "Computer Vision",
    keywords: ["human detection", "person detection", "webcam", "hog", "opencv", "email", "alert", "aruco", "calibration"],
    text: "Tasneemul built a Human Detection Alert app in Python: a live webcam feed uses OpenCV's HOG people detector, and pressing S while a person is detected captures four timestamped photos and emails them as attachments via Gmail. An optional mode overlays an ArUco marker's estimated distance in metres using a camera calibration from his ArUco marker project. Code: https://github.com/Th12mugdho/Human_Detection"
  },
  {
    id: "gnn-bert",
    category: "Machine Learning",
    keywords: ["gnn", "bert", "graph neural network", "music", "multimodal", "fma", "genre", "tagging", "cross-attention", "deep learning"],
    text: "For a supervised neural network course (CSE425 / EEE474 / CSE715), Tasneemul built GNN-BERT for Music Context Understanding: audio segments become graph nodes with 320-dimensional log-mel, MFCC and chroma features, a fine-tuned BERT encodes FMA track metadata (excluding the genre label to avoid leakage), and cross-attention fuses the graph readout with the text tokens. It targets multi-label tagging and genre classification, with optional valence/arousal emotion regression and cross-modal retrieval, using a leakage-free split grouped by track. Code: https://github.com/Th12mugdho/gnn-bert-music-context"
  },
  {
    id: "churn",
    category: "Machine Learning",
    keywords: ["churn", "telco", "customer", "segmentation", "knn", "logistic regression", "k-means", "clustering", "data analysis"],
    text: "Tasneemul did a churn prediction and customer segmentation analysis on the Telco Customer Churn dataset, comparing KNN, Logistic Regression and a Neural Network for prediction and using K-Means clustering for segmentation, with a written report. Code: https://github.com/Th12mugdho/telco-churn-prediction-analysis"
  },
  {
    id: "alarm-clock",
    category: "Digital Design",
    keywords: ["systemverilog", "verilog", "rtl", "alarm clock", "pwm", "testbench", "synthesis", "fpga", "digital design"],
    text: "Tasneemul designed a digital alarm clock in SystemVerilog at register-transfer level with PWM output signal generation; the repository includes the RTL, a testbench, timing constraints and synthesis scripts, plus a written report. Code: https://github.com/Th12mugdho/digital-alarm-clock"
  },
  {
    id: "github",
    category: "GitHub",
    keywords: ["github", "repositories", "code", "repo", "source"],
    text: "Tasneemul's code is on GitHub at https://github.com/Th12mugdho, including the Fusion Hexa hexacopter simulation, MechaHex (https://github.com/Th12mugdho/MechaHex), Human Detection, GNN-BERT music model, Telco churn analysis and the SystemVerilog digital alarm clock."
  },
  {
    id: "filters",
    category: "Electronics",
    keywords: ["filter", "mfb", "twin-t", "bode", "analog", "eee308", "circuits"],
    text: "For EEE308 (Electronic Circuits II), Tasneemul worked on active filter design using Multiple Feedback (MFB) and Twin-T topologies, deriving transfer functions and Bode plots, with interactive Chart.js visualizations."
  },
  {
    id: "vlsi",
    category: "Electronics",
    keywords: ["cmos", "vlsi", "elmore", "delay", "transistor", "sizing", "kmap", "boolean"],
    text: "Tasneemul studied CMOS/VLSI digital circuit design, including Elmore delay modeling, transistor sizing for pull-up/pull-down networks, and Boolean minimization using Karnaugh maps."
  },
  {
    id: "signals",
    category: "Electronics",
    keywords: ["fourier", "laplace", "signals", "modulation", "vhdl", "am"],
    text: "Tasneemul has worked through signals-and-systems problem sets covering Fourier series/transforms, AM modulation-demodulation, Laplace transforms, and VHDL event-driven simulation with transport delays."
  },
  {
    id: "paper1",
    category: "Publications",
    keywords: ["biceptron", "publication", "paper", "ieee", "icict", "hebbian", "forward pass", "backpropagation"],
    text: "Tasneemul co-authored 'Biologically Inspired Network Design to Train Only Through Forward Pass' (IEEE ICICT 2024, Dhaka), introducing the Biceptron architecture, which integrates Hebbian learning and brain-criticality theory with a custom Connection Adjustment module and binary activation function to train neural networks without backpropagation. Published on IEEE Xplore: https://ieeexplore.ieee.org/document/10839663"
  },
  {
    id: "paper2",
    category: "Publications",
    keywords: ["g-buffer", "super-resolution", "rendering", "array", "elsevier", "fgsr", "film", "albedo"],
    text: "Tasneemul co-authored 'G-Buffer-Guided Feature Modulation for Lightweight Rendered Image Super-Resolution' with Md. Shahariar Hossain and Amirul Islam, published open access in Array (Elsevier), Volume 32, December 2026, article 101324 (https://www.sciencedirect.com/science/article/pii/S2590005626006478). It proposes a dual-image guided super-resolution framework for rendered frames that uses G-buffer albedo alongside the low-resolution color buffer, comparing convolution, attention, and FiLM-based designs. The FiLM-based FGSR-L model achieves the highest mean PSNR/SSIM across three scales and beats SwinIR by 1.82 dB at x4, and an 11,000-pair RGB-albedo dataset is released."
  },
  {
    id: "leadership-bueec",
    category: "Leadership",
    keywords: ["president", "bueec", "club", "leadership", "electrical electronics club"],
    text: "Tasneemul is President of the BRAC University Electrical and Electronics Club (BUEEC) since February 2026, having previously served as Assistant Director of Research & Development (Dec 2024–Mar 2026) and General Member (Oct 2022–Jan 2025). He directed research initiatives, led the club's involvement in the BSRM School of Engineering inauguration ceremony, planned technical workshops on embedded systems and ML, and directed Spectra 3.0 and the Intra EEE Football Tournament 2026."
  },
  {
    id: "leadership-other",
    category: "Leadership",
    keywords: ["natural sciences club", "robotics club", "apprentice", "director", "event management"],
    text: "Beyond BUEEC, Tasneemul was Director of Event Management at the BRAC University Natural Sciences Club (Dec 2024–Dec 2025), where he ran outreach programs like the 'Sunshine & Strength: Vitamin D Awareness Drive' and boosted club engagement by 30%. He was also an Apprentice in Research & Project Management at the Robotics Club of BRAC University (2022–2026), organizing the national robotics competition 'Traction 2025'."
  },
  {
    id: "achievements",
    category: "Achievements",
    keywords: ["award", "honor", "champion", "runner-up", "finalist", "competition", "nhspc"],
    text: "Tasneemul's honors include 1st Runner-up in a national-level technical competition, Champion at Traction (a national robotics competition), Champion in a departmental technical challenge, and 7th-rank Finalist at the National High School Programming Contest (NHSPC), which also earned him a national camper nomination."
  },
  {
    id: "cocurricular",
    category: "Co-curricular",
    keywords: ["duke of edinburgh", "mun", "cricket", "editor", "delegate", "volunteer"],
    text: "Tasneemul earned the Bronze Standard Award from The Duke of Edinburgh's International Award (2023), completing library assistance, photography, and sports coaching components. He was Editor-in-Chief of Tigers Cricket, a digital sports blog he helped transform into a global operation, and represented Sudan (WHO) and Uganda (UNICEF) as an MUN delegate."
  },
  {
    id: "skills",
    category: "Skills",
    keywords: ["skills", "toolchain", "stack", "programming", "languages", "tools", "matrix", "proficiency"],
    text: "Tasneemul's toolchain spans C++, Python & NumPy, ROS2 and Gazebo, PX4 Autopilot, Arduino/ESP32, SPICE/PCB design, CMOS/VLSI, and applied machine learning. His skills matrix groups these into Embedded & Firmware (Arduino/ESP32, Pixhawk/PX4, Raspberry Pi — applied in projects), Simulation & Hardware Design (ROS2/Gazebo applied in projects; SPICE, PCB design, and CMOS/VLSI from coursework and labs), and Software & ML (C++ and Python/NumPy applied in projects, machine learning applied in research). He's also comfortable with English, Bengali, and Spanish at a professional level."
  },
  {
    id: "contact",
    category: "Contact",
    keywords: ["contact", "email", "linkedin", "github", "reach", "hire", "connect"],
    text: "You can reach Tasneemul at tasneemulhassan12@gmail.com, on LinkedIn at linkedin.com/in/tasneemulhassan12, on GitHub at github.com/Th12mugdho, or through his personal site at bueec.com. He's open to robotics, embedded systems, and research-engineering roles."
  }
];
