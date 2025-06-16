# Onboarding Flow Plans

## Current State
- Basic resume upload/entry only
- No profile setup
- No skip option
- Users must enter personal details repeatedly in cover letters

## Proposed Onboarding Flow

### Phase 1: Essential Improvements (Immediate)
1. **Profile Information Setup**
   - Personal details (name, email, phone, address)
   - Professional title/role
   - LinkedIn profile
   - Portfolio/website links
   - This eliminates repetitive data entry in cover letters

2. **Resume Upload with Skip Option**
   - Keep current resume upload functionality
   - Add prominent "Skip for now" button
   - Allow users to add resume later from dashboard

### Phase 2: Enhanced Onboarding (Next Sprint)
3. **Career Preferences**
   - Target job titles/roles
   - Preferred industries
   - Salary expectations
   - Location preferences (remote, hybrid, specific cities)
   - Company size preferences

4. **Skills & Experience**
   - Core technical skills
   - Years of experience
   - Key achievements/metrics
   - Certifications

### Phase 3: Advanced Features (Future)
5. **Job Search Goals**
   - Timeline for job search
   - Application volume goals
   - Interview preparation needs
   - Current employment status

6. **AI Preferences**
   - Tone preferences for cover letters (formal, casual, enthusiastic)
   - Resume customization level (conservative vs. aggressive)
   - Communication style preferences

7. **Optional Integrations**
   - Import from LinkedIn
   - Connect job boards
   - Calendar integration for interview scheduling

## Recommended Implementation Order

### Step 1: Profile Setup (This Sprint)
- Add profile form to onboarding
- Create user profile database schema
- Update cover letter generation to use profile data
- Add skip option for resume upload

### Step 2: Multi-step Flow (Next Sprint)
- Convert to multi-step wizard
- Add progress indicator
- Add career preferences section
- Add skills section

### Step 3: Advanced Features (Future Sprints)
- Job search goals
- AI preferences
- Third-party integrations

## Database Schema Updates Needed

### User Profile Table
\`\`\`sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  full_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(100),
  professional_title VARCHAR(255),
  linkedin_url VARCHAR(500),
  portfolio_url VARCHAR(500),
  website_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### Career Preferences Table (Future)
\`\`\`sql
CREATE TABLE career_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  target_roles TEXT[], -- Array of job titles
  preferred_industries TEXT[],
  salary_min INTEGER,
  salary_max INTEGER,
  location_preferences TEXT[],
  remote_preference VARCHAR(50), -- remote, hybrid, onsite, flexible
  company_size_preference VARCHAR(50), -- startup, small, medium, large, enterprise
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

## User Experience Flow

### Current Flow
1. Welcome message
2. Resume upload (required)
3. Redirect to dashboard

### Proposed Phase 1 Flow
1. Welcome message
2. Profile setup (name, email, phone, address, title)
3. Resume upload (with skip option)
4. Redirect to dashboard

### Future Complete Flow
1. Welcome & platform overview
2. Profile setup
3. Resume upload (optional)
4. Career preferences
5. Skills & experience
6. Job search goals
7. AI preferences
8. Complete setup & dashboard redirect

## Benefits

### For Users
- Faster cover letter generation (no repetitive data entry)
- More personalized AI recommendations
- Better job matching
- Streamlined workflow

### For Platform
- Higher completion rates (skip option reduces friction)
- Better user data for personalization
- Improved retention through better UX
- Foundation for advanced features

## Success Metrics
- Onboarding completion rate
- Time to first cover letter generation
- User retention after onboarding
- Reduction in cover letter generation time
- User satisfaction scores

## Technical Considerations
- Progressive disclosure (don't overwhelm users)
- Mobile-responsive design
- Form validation and error handling
- Data persistence between steps
- Ability to edit profile later
- Import/export capabilities for profile data
\`\`\`

Now let me implement the immediate changes you requested:

```typescriptreact file="app/(dashboard)/onboarding/page.tsx" isDeleted="true"
...deleted...
