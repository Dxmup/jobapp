# Landing Page Hero Interactive Tabs Implementation Plan

## Overview
Create an interactive hero section with three tabs showcasing core functionality: Resume Optimization, Cover Letter Generation, and Interview Practice. Each tab provides a limited demo experience with a usage counter that triggers signup after 3 actions.

## Architecture & Components

### 1. Main Hero Component Structure
\`\`\`
LandingHero (existing)
├── HeroInteractiveTabs (new)
    ├── TabNavigation
    ├── ResumeOptimizationTab
    ├── CoverLetterTab  
    ├── InterviewPracticeTab
    └── SignupPrompt (shows after 3 actions)
\`\`\`

### 2. State Management
- **Action Counter**: Track total actions across all tabs (max 3)
- **Active Tab**: Current selected tab
- **Loading States**: Per-tab loading indicators
- **Results Storage**: Store results for each tab to prevent re-processing

### 3. Resume Optimization Tab Implementation

#### Frontend Components
- **ResumeOptimizationTab**
  - Resume input (textarea + file upload)
  - Process button
  - Side-by-side diff viewer
  - Loading state

#### Backend API
- **New Endpoint**: `/api/landing/optimize-resume`
  - No authentication required
  - Rate limiting by IP
  - Simplified Gemini prompt for 2 professional improvements only
  - Returns: original text, optimized text, change summary

#### Diff Visualization
- Use a diff library (like `react-diff-viewer-continued`)
- Highlight exactly 2 changes made
- Show before/after side by side
- Mobile-responsive stacked view

### 4. Cover Letter Tab (Future)
- Job description input
- Basic personal info (name, role)
- Generate short cover letter sample
- Show generated result

### 5. Interview Practice Tab (Future)
- Job role selector dropdown
- Generate 3 sample interview questions
- Show questions with expandable "good answer" hints

## Technical Implementation Details

### API Endpoint Specifications

#### `/api/landing/optimize-resume`
\`\`\`typescript
POST /api/landing/optimize-resume
Body: {
  resumeText: string
}
Response: {
  original: string
  optimized: string
  changes: Array<{
    type: 'addition' | 'deletion' | 'modification'
    description: string
    lineNumber?: number
  }>
}
\`\`\`

### Gemini Prompt for Landing Page
\`\`\`
You are a professional resume optimizer. Make exactly 2 improvements to this resume to make it more professional and action-oriented.

Rules:
1. Make ONLY 2 changes total
2. Focus on making language more active and professional
3. Do not add new experiences or qualifications
4. Keep the same overall structure and length
5. Changes should be meaningful and noticeable

Return the improved resume with the same formatting.
\`\`\`

### Rate Limiting Strategy
- IP-based rate limiting: 5 requests per hour per IP
- Use Redis or in-memory cache for tracking
- Return 429 status when exceeded

### Usage Counter Implementation
\`\`\`typescript
// Local storage key: 'landing_demo_actions'
interface DemoUsage {
  count: number
  timestamp: number
  actionsUsed: ('resume' | 'cover-letter' | 'interview')[]
}
\`\`\`

## File Structure

### New Files to Create
\`\`\`
components/
├── landing/
│   ├── hero-interactive-tabs.tsx
│   ├── resume-optimization-tab.tsx
│   ├── cover-letter-tab.tsx
│   ├── interview-practice-tab.tsx
│   ├── tab-navigation.tsx
│   ├── signup-prompt.tsx
│   └── resume-diff-viewer.tsx
├── ui/
│   └── diff-viewer.tsx (wrapper for diff library)
app/api/landing/
├── optimize-resume/
│   └── route.ts
├── generate-cover-letter/
│   └── route.ts
└── interview-questions/
    └── route.ts
hooks/
├── use-demo-counter.ts
└── use-landing-demo.ts
lib/
└── landing-demo-utils.ts
\`\`\`

### Modified Files
\`\`\`
components/landing-hero.tsx (integrate new tabs)
package.json (add diff viewer dependency)
\`\`\`

## Dependencies to Add
\`\`\`json
{
  "react-diff-viewer-continued": "^3.3.1",
  "react-dropzone": "^14.2.3"
}
\`\`\`

## Implementation Phases

### Phase 1: Core Infrastructure
1. Create demo counter hook and utilities
2. Build tab navigation component
3. Set up basic tab structure
4. Implement signup prompt logic

### Phase 2: Resume Optimization Tab
1. Create resume input component with file upload
2. Build API endpoint for landing page resume optimization
3. Implement diff viewer component
4. Add loading states and error handling
5. Test end-to-end flow

### Phase 3: Cover Letter Tab
1. Create job description input
2. Build cover letter generation API
3. Implement result display
4. Add to demo counter

### Phase 4: Interview Practice Tab
1. Create role selector
2. Build interview questions API
3. Implement questions display with hints
4. Add to demo counter

### Phase 5: Polish & Testing
1. Mobile responsiveness
2. Accessibility improvements
3. Error handling and edge cases
4. Performance optimization
5. Analytics tracking

## User Experience Flow

### Resume Optimization Flow
1. User clicks "Resume Optimization" tab
2. User pastes resume text OR uploads file
3. User clicks "Optimize Resume" button
4. Loading spinner shows
5. Results display side-by-side with changes highlighted
6. Demo counter increments
7. After 3rd action across all tabs → signup prompt

### Rate Limiting UX
- Show friendly message: "You've reached the demo limit. Sign up for unlimited access!"
- Highlight signup button
- Don't break the experience

### Mobile Considerations
- Stack diff viewer vertically on mobile
- Ensure file upload works on mobile
- Touch-friendly tab navigation
- Readable text sizes

## Security & Performance

### Security Measures
- Input sanitization for resume text
- File type validation for uploads
- Rate limiting by IP
- No sensitive data storage
- CORS configuration

### Performance Optimizations
- Lazy load tab content
- Debounce API calls
- Cache results in component state
- Optimize diff rendering for large resumes
- Compress API responses

## Analytics & Tracking

### Events to Track
- Tab clicks
- Demo actions used
- Signup conversions from demo
- Error rates per tab
- Time spent in each tab

### Conversion Metrics
- Demo completion rate
- Demo-to-signup conversion
- Most popular tab
- Drop-off points

## Error Handling

### API Errors
- Network failures
- Rate limiting
- Gemini API errors
- Invalid input formats

### User-Friendly Messages
- "Something went wrong, please try again"
- "Please check your internet connection"
- "File format not supported"
- "Resume text is too long"

## Testing Strategy

### Unit Tests
- Demo counter logic
- API endpoint functionality
- Diff viewer component
- File upload handling

### Integration Tests
- End-to-end tab workflows
- Rate limiting behavior
- Error scenarios
- Mobile responsiveness

### User Testing
- Demo flow usability
- Signup conversion optimization
- Mobile experience
- Accessibility compliance

## Success Metrics

### Primary KPIs
- Demo engagement rate (% of visitors who try demo)
- Demo completion rate (% who try all 3 actions)
- Demo-to-signup conversion rate
- Time spent in demo section

### Secondary Metrics
- Most popular demo feature
- Error rates by feature
- Mobile vs desktop usage
- Return visitor demo usage

## Future Enhancements

### Advanced Features
- Resume scoring/analysis
- Industry-specific optimizations
- Multiple resume formats
- Export optimized resume
- Social sharing of improvements

### Personalization
- Remember user preferences
- Tailored suggestions
- Progress saving
- Custom demo limits for returning users

## Implementation Timeline

### Week 1: Infrastructure & Resume Tab
- Set up demo counter system
- Create tab navigation
- Build resume optimization tab
- Implement API endpoint

### Week 2: Additional Tabs & Polish
- Cover letter generation tab
- Interview practice tab
- Mobile optimization
- Error handling

### Week 3: Testing & Launch
- Comprehensive testing
- Performance optimization
- Analytics implementation
- Soft launch and monitoring

## Risk Mitigation

### Technical Risks
- Gemini API rate limits → Implement fallback responses
- Large file uploads → File size limits and compression
- Mobile performance → Lazy loading and optimization

### Business Risks
- Low conversion rates → A/B test different demo limits
- High API costs → Monitor usage and implement cost controls
- User confusion → Clear UX and onboarding tooltips
