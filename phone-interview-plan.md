# Mock Phone Interview Feature - Implementation Plan

## Overview
Redesign the mock phone interview to use discrete audio files from Gemini Live API, creating a structured turn-based interview experience that simulates a real phone interview.

## Key Requirements
- Interviewer introduces themselves at the start
- Random voice selection for each session
- Audio-only questions (no text display during interview)
- 2-minute response time limit per question
- Minimum 13 technical + 3 behavioral questions (randomly selected from available pool)
- Random conversational tone (professional, conversational, casual)
- Sequential question delivery with speech detection between answers

## Randomization Variables
1. **Voice Selection**: Randomly choose from available Gemini Live API voices
2. **Question Selection**: Random subset ensuring minimum counts
3. **Conversational Tone**: Random selection from three styles
4. **Interview Personality**: Slight variations in interviewer character

## Detailed Task List

### Phase 1: API Integration & Audio Generation
- [ ] **Task 1.1**: Create new API endpoint `/api/interview/generate-audio-questions`
  - Accept job details, selected questions array, and interview context
  - Implement random voice selection from available Gemini voices
  - Implement random conversational tone selection
  - Send structured prompt to Gemini Live API requesting discrete audio responses
  - Generate introduction audio + all question audio files
  - Return array of audio files with metadata (question_id, audio_url, duration)

- [ ] **Task 1.2**: Enhance Gemini Live API integration
  - Create method to request multiple discrete audio responses in batch
  - Implement voice randomization (Puck, Charon, Kore, Fenrir, Aoede)
  - Add conversational tone instructions:
    - **Professional**: Formal, structured, corporate interview style
    - **Conversational**: Friendly but professional, natural flow
    - **Casual**: Relaxed, startup-like, informal but respectful
  - Handle batch audio generation with proper error handling
  - Implement retry mechanisms for failed audio generation

- [ ] **Task 1.3**: Question selection algorithm
  - Randomly select questions ensuring minimums (13 technical, 3 behavioral)
  - Shuffle question order for variety
  - Mix technical and behavioral questions naturally
  - Store selected questions for session tracking

### Phase 2: Speech Detection & Audio Management
- [ ] **Task 2.1**: Implement robust speech detection
  - Use Web Audio API for voice activity detection (VAD)
  - Detect speech start with volume threshold
  - Detect speech end with configurable silence duration (2-3 seconds)
  - Add ambient noise calibration
  - Visual feedback for speech detection status
  - Manual "I'm finished" button as backup

- [ ] **Task 2.2**: Create audio playback manager
  - Sequential audio queue system
  - Automatic progression: play question → wait for speech → detect silence → next question
  - 2-minute response timer with visual countdown
  - Audio preloading for smooth transitions
  - Volume controls and audio normalization

- [ ] **Task 2.3**: Response recording system
  - Record user responses for each question
  - Associate recordings with specific questions
  - Provide playback functionality
  - Optional: Save recordings for later review

### Phase 3: Interview State Management
- [ ] **Task 3.1**: Design interview state machine
  - States: 
    - `preparing` → generating audio files
    - `introduction` → playing interviewer introduction
    - `playing_question` → playing current question
    - `listening_for_answer` → waiting for user to start speaking
    - `recording_answer` → user is speaking
    - `processing_silence` → waiting for silence confirmation
    - `question_complete` → moving to next question
    - `interview_complete` → all questions finished
  - Handle state transitions with proper timing
  - Add pause/resume functionality
  - Emergency stop functionality

- [ ] **Task 3.2**: Timer and progression management
  - 2-minute countdown per question
  - Automatic progression after time limit
  - Grace period for finishing thoughts
  - Question skip functionality (if needed)
  - Progress tracking (question X of Y)

### Phase 4: User Interface Updates
- [ ] **Task 4.1**: Redesign interview interface
  - Clean, phone-call inspired design
  - Current state indicators:
    - "Interviewer speaking..."
    - "Your turn to speak..."
    - "Listening..." (with speech level visualization)
    - "Processing..." (silence detection)
  - Progress indicator: "Question 3 of 16"
  - Response timer with visual countdown
  - Speech level meter for microphone feedback

- [ ] **Task 4.2**: Add interview controls
  - Start interview button (with randomization preview)
  - Pause/resume interview
  - End interview early
  - "I'm finished speaking" manual button
  - Replay last question (if needed)
  - Microphone sensitivity adjustment

- [ ] **Task 4.3**: Session information display
  - Show selected voice and tone at start
  - Display interview progress
  - Show remaining time per question
  - Indicate question type (technical/behavioral) subtly

### Phase 5: Error Handling & Edge Cases
- [ ] **Task 5.1**: Handle audio generation failures
  - Fallback to text-to-speech if Gemini audio fails
  - Retry mechanisms for failed audio generation
  - Graceful degradation with error messages
  - Continue interview with available audio files

- [ ] **Task 5.2**: Handle speech detection edge cases
  - Very quiet speakers (sensitivity adjustment)
  - Background noise interference
  - Long pauses in responses (distinguish from completion)
  - Accidental interruptions or false starts
  - Microphone permission issues

- [ ] **Task 5.3**: Handle timing edge cases
  - User speaks beyond 2-minute limit
  - User doesn't speak at all
  - Technical interruptions during interview
  - Browser/tab switching during interview

### Phase 6: Interview Experience Enhancement
- [ ] **Task 6.1**: Interviewer personality variations
  - Slight personality differences based on tone selection
  - Varied introduction styles
  - Different transition phrases between questions
  - Consistent character throughout session

- [ ] **Task 6.2**: Post-interview features
  - Interview summary with question count and duration
  - Playback of recorded responses
  - Option to restart with different randomization
  - Performance feedback (speaking time, pace, etc.)

### Phase 7: Testing & Polish
- [ ] **Task 7.1**: Comprehensive testing
  - Test all voice and tone combinations
  - Test speech detection with various microphone setups
  - Test timing accuracy and state transitions
  - Test error recovery scenarios

- [ ] **Task 7.2**: Performance optimization
  - Preload all audio files before starting
  - Optimize speech detection algorithms
  - Minimize latency between state transitions
  - Efficient memory management for audio files

## Technical Implementation Details

### Audio Generation Prompt Structure
\`\`\`
You are conducting a phone interview for a [TONE] [COMPANY] interview for the position of [JOB_TITLE].

TONE INSTRUCTIONS:
- Professional: Use formal language, structured questions, corporate interview style
- Conversational: Be friendly but professional, natural conversational flow
- Casual: Relaxed startup-style, informal but respectful tone

VOICE: [SELECTED_VOICE]

Please generate the following audio segments:
1. Introduction (30-45 seconds)
2. Individual questions (each as separate audio file)

Introduction should include:
- Greeting and your name
- Company and position
- Brief overview of interview structure
- Encouragement to take time with answers

For each question, ask it naturally and then pause, indicating you're waiting for their response.
\`\`\`

### Speech Detection Algorithm
- **Start Detection**: Volume threshold + 500ms confirmation
- **End Detection**: Silence threshold + 2-3 second confirmation
- **Adaptive Thresholds**: Adjust based on ambient noise during calibration
- **Manual Override**: "I'm finished" button always available

### Randomization Implementation
\`\`\`javascript
// Voice selection
const voices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede']
const selectedVoice = voices[Math.floor(Math.random() * voices.length)]

// Tone selection
const tones = ['professional', 'conversational', 'casual']
const selectedTone = tones[Math.floor(Math.random() * tones.length)]

// Question selection
const minTechnical = 13
const minBehavioral = 3
const selectedQuestions = selectRandomQuestions(allQuestions, minTechnical, minBehavioral)
\`\`\`

### State Machine Flow
\`\`\`
START → PREPARING → INTRODUCTION → QUESTION_1 → LISTENING → RECORDING → SILENCE_CHECK → QUESTION_2 → ... → COMPLETE
\`\`\`

## Success Metrics
- Smooth audio transitions with minimal latency
- Accurate speech detection (>95% accuracy)
- Natural interview flow and timing
- Variety in interview experience through randomization
- Robust error handling and recovery
- User satisfaction with interview realism

## Future Enhancements (Post-MVP)
- AI feedback on responses
- Industry-specific interviewer personalities
- Multi-language support
- Integration with calendar for scheduled practice
- Team interview simulations
- Custom question import functionality
