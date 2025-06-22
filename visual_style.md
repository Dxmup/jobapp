# CareerAI Visual Style Guide

This document outlines the visual design system for CareerAI to ensure consistency across all pages and components.

## Core Design Principles

### 1. Clean & Professional
- Minimal, clean layouts that focus on content
- Professional color palette suitable for career-focused application
- Consistent spacing and typography

### 2. Cohesive Rounded Design
- Generous use of rounded corners throughout the interface
- Creates a modern, friendly, and approachable feel
- Consistent border-radius values across components

### 3. Subtle Grid Pattern
- Grid overlay provides visual texture without being distracting
- Maintains professional appearance while adding visual interest
- Used consistently in hero sections

## Layout Structure

### Page Container
\`\`\`css
/* Main page wrapper */
.page-container {
  min-height: 100vh;
  background: linear-gradient(to bottom right, #f8fafc, #ffffff, #faf5ff);
}
\`\`\`

### Hero Sections
\`\`\`css
/* Hero section styling */
.hero-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1.5rem; /* rounded-3xl */
  background-image: 
    linear-gradient(to right, #8882 1px, transparent 1px),
    linear-gradient(to bottom, #8882 1px, transparent 1px);
  background-size: 14px 24px;
}
\`\`\`

**Implementation:**
- Use `bg-white border border-gray-200 rounded-3xl` for hero containers
- Add grid pattern with `bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px]`
- Text should be dark (`text-gray-900`) for readability on white background

### Content Containers
\`\`\`css
/* Main content area */
.content-container {
  max-width: 1280px; /* max-w-7xl */
  margin: 0 auto;
  padding: 3rem 1.5rem; /* py-12 px-6 */
  border-radius: 1rem; /* rounded-2xl */
}
\`\`\`

## Component Styling

### Cards
\`\`\`css
/* Standard card styling */
.card {
  border-radius: 1rem; /* rounded-2xl */
  border: none;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); /* shadow-2xl */
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(24px);
}

/* Action bar cards */
.action-card {
  border-radius: 1rem; /* rounded-2xl */
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
\`\`\`

**Implementation:**
- All Card components should use `rounded-2xl` class
- Action bars: `bg-white/80 backdrop-blur-xl border border-white/20`
- Content cards: `bg-white/80 backdrop-blur-sm shadow-2xl`

### Stats Cards (in Hero Sections)
\`\`\`css
/* Stats cards in hero sections */
.stats-card {
  background: rgba(249, 250, 251, 0.8); /* bg-gray-50/80 */
  backdrop-filter: blur(4px);
  border-radius: 0.75rem; /* rounded-xl */
  border: 1px solid #e5e7eb; /* border-gray-200 */
  color: #111827; /* text-gray-900 */
}
\`\`\`

### Buttons
\`\`\`css
/* Primary buttons */
.btn-primary {
  background: linear-gradient(to right, #9333ea, #4f46e5); /* from-purple-600 to-indigo-600 */
  border-radius: 0.75rem; /* rounded-xl */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* Secondary buttons */
.btn-secondary {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem; /* rounded-xl */
}
\`\`\`

## Color Palette

### Primary Colors
- **Purple**: `#9333ea` (purple-600) - Primary brand color
- **Indigo**: `#4f46e5` (indigo-600) - Secondary brand color
- **Cyan**: `#0891b2` (cyan-600) - Accent color

### Neutral Colors
- **White**: `#ffffff` - Primary background
- **Gray-50**: `#f9fafb` - Light background elements
- **Gray-200**: `#e5e7eb` - Borders and dividers
- **Gray-900**: `#111827` - Primary text color

### Background Gradients
\`\`\`css
/* Page background */
background: linear-gradient(to bottom right, #f8fafc, #ffffff, #faf5ff);

/* Button gradients */
background: linear-gradient(to right, #9333ea, #4f46e5);
\`\`\`

## Border Radius Scale

### Consistent Rounding
- **Small elements**: `rounded-lg` (0.5rem) - Small buttons, badges
- **Medium elements**: `rounded-xl` (0.75rem) - Standard buttons, input fields
- **Large elements**: `rounded-2xl` (1rem) - Cards, modals
- **Extra large elements**: `rounded-3xl` (1.5rem) - Hero sections, main containers

## Spacing System

### Container Spacing
- **Hero sections**: `py-16 px-6` (4rem vertical, 1.5rem horizontal)
- **Content sections**: `py-12 px-6` (3rem vertical, 1.5rem horizontal)
- **Card padding**: `p-6` (1.5rem all sides)

### Component Gaps
- **Grid gaps**: `gap-6` (1.5rem) for most layouts
- **Small gaps**: `gap-4` (1rem) for tight layouts
- **Large gaps**: `gap-8` (2rem) for section separation

## Typography

### Headings
- **Page titles**: `text-3xl lg:text-4xl font-bold` - Main page headings
- **Section titles**: `text-2xl font-bold` - Section headings
- **Card titles**: `text-lg font-semibold` - Card headings

### Body Text
- **Primary text**: `text-gray-900` - Main content
- **Secondary text**: `text-gray-600` - Supporting content
- **Muted text**: `text-gray-500` - Less important information

## Effects & Interactions

### Backdrop Blur
- **Strong blur**: `backdrop-blur-xl` (24px) - Action bars, important overlays
- **Medium blur**: `backdrop-blur-sm` (4px) - Cards, content areas

### Shadows
- **Dramatic shadows**: `shadow-2xl` - Hero cards, important elements
- **Standard shadows**: `shadow-lg` - Regular cards
- **Subtle shadows**: `shadow-sm` - Minor elements

### Hover Effects
\`\`\`css
/* Card hover effects */
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
}

/* Button hover effects */
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
\`\`\`

## Implementation Checklist

When creating new pages or components:

### ✅ Layout
- [ ] Use page background gradient: `bg-gradient-to-br from-slate-50 via-white to-purple-50/30`
- [ ] Hero section: white background with grid pattern and `rounded-3xl`
- [ ] Content container: `max-w-7xl mx-auto px-6 py-12 rounded-2xl`

### ✅ Components
- [ ] All cards use `rounded-2xl`
- [ ] Action bars use `bg-white/80 backdrop-blur-xl`
- [ ] Stats cards use `bg-gray-50/80 backdrop-blur-sm rounded-xl`
- [ ] Buttons use appropriate gradient and `rounded-xl`

### ✅ Colors
- [ ] Hero text uses `text-gray-900` (dark on white background)
- [ ] Consistent use of purple-indigo gradient for primary actions
- [ ] Proper contrast ratios for accessibility

### ✅ Spacing
- [ ] Consistent gap spacing (`gap-6` for most layouts)
- [ ] Proper padding on containers and cards
- [ ] Adequate white space for readability

## Examples

### Hero Section Template
\`\`\`jsx
<div className="relative overflow-hidden bg-white border border-gray-200 rounded-3xl bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px]">
  <div className="relative px-6 py-16">
    <div className="mx-auto max-w-7xl">
      {/* Hero content */}
    </div>
  </div>
</div>
\`\`\`

### Action Bar Template
\`\`\`jsx
<Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl rounded-2xl">
  <CardContent className="p-6">
    {/* Action bar content */}
  </CardContent>
</Card>
\`\`\`

### Stats Card Template
\`\`\`jsx
<div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
  <div className="flex items-center gap-2 mb-2">
    <Icon className="h-4 w-4 text-gray-600" />
    <span className="text-sm text-gray-600">Label</span>
  </div>
  <div className="text-2xl font-bold text-gray-900">Value</div>
</div>
\`\`\`

This style guide ensures visual consistency across all pages while maintaining the professional, modern aesthetic appropriate for a career-focused application.
