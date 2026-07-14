/* ============================================================
   knowledge.js — the "retrieval corpus" for the portfolio's
   RAG-style chat assistant.

   Each entry is one retrievable chunk: a short, self-contained
   fact about Tasneemul, tagged with keywords that boost search
   relevance beyond plain word-overlap. rag.js scores every chunk
   against the visitor's question and returns the best matches.

   ── Swapping this for a REAL generative backend ──
   This file only supplies the *retrieval* half of RAG. To get
   generated (not just extracted) answers, point RAG_CONFIG in
   rag.js at a backend endpoint that:
     1. receives { question, contextChunks } from rag.js,
     2. calls an LLM (e.g. the Anthropic Messages API) with the
        chunks inserted as context,
     3. returns { answer } as JSON.
   A minimal Node/Express example is sketched at the bottom of
   rag.js in a comment block — copy it into your own server.
============================================================ */

window.KNOWLEDGE_BASE = [
  {
    id: "summary",
    category: "About",
    keywords: ["who", "about", "summary", "background", "intro", "engineer"],
    text: "Md. Tasneemul Hassan is a BSc graduate in Electrical and Electronic Engineering from BRAC University (expected Dec 2026), specializing in robotics, intelligent systems, and electronics. He currently serves as President of the BRAC University Electrical and Electronics Club (BUEEC) and leads a five-member team building Payra, an autonomous delivery drone."
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
    text: "MechaHex is a six-legged hexapod robot Tasneemul designed and built, using a bio-inspired tripod gait for terrain navigation. It runs on an Arduino-based control system with servo motors and ultrasonic sensors, with custom trajectory-planning algorithms for stable walking, turning, and obstacle avoidance, on a custom 3D-printed chassis."
  },
  {
    id: "surveillance",
    category: "Robotics · Embedded",
    keywords: ["surveillance", "raspberry pi", "flask", "camera", "streaming", "video"],
    text: "Tasneemul built a live surveillance node on a Raspberry Pi Zero 2W paired with a Flask-based web app for real-time video streaming and remote monitoring."
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
    id: "epr",
    category: "Research",
    keywords: ["epr", "dpph", "allegheny", "spectroscopy", "physics", "research assistant"],
    text: "As a Research Assistant at Allegheny College (Sep–Dec 2021), Tasneemul studied electron paramagnetic resonance (EPR) of DPPH free radicals under Prof. Doros Petasis, using a Varian E-3 X-band EPR spectrometer with a liquid-nitrogen flow cryostat to examine unpaired-electron magnetic moments."
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
    keywords: ["g-buffer", "super-resolution", "rendering", "tvcg", "manuscript"],
    text: "Tasneemul is co-authoring 'G-Buffer-Guided Feature Modulation for Lightweight Rendered Image Super-Resolution', a manuscript in preparation targeting IEEE Transactions on Visualization and Computer Graphics (TVCG). It presents a lightweight neural architecture for rendered-image super-resolution using G-buffer-guided feature modulation."
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
    keywords: ["skills", "toolchain", "stack", "programming", "languages", "tools"],
    text: "Tasneemul's toolchain spans C++, Python & NumPy, ROS2 and Gazebo, PX4 Autopilot, Arduino/ESP32, SPICE/PCB design, and applied machine learning. He's also comfortable with English, Bengali, and Spanish at a professional level."
  },
  {
    id: "contact",
    category: "Contact",
    keywords: ["contact", "email", "linkedin", "github", "reach", "hire", "connect"],
    text: "You can reach Tasneemul at tasneemulhassan12@gmail.com, on LinkedIn at linkedin.com/in/tasneemulhassan12, on GitHub at github.com/Th12mugdho, or through his personal site at bueec.com. He's open to robotics, embedded systems, and research-engineering roles."
  }
];
