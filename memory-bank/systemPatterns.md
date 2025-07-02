# System Patterns: Liam's Lesson Learning Lab

## Architectural Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        PWA Client                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   React UI      │  │   Game Engine   │  │  Audio Engine   │ │
│  │   Components    │  │   (Activities)  │  │    (TTS)        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  State Mgmt     │  │   Local Storage │  │  Service Worker │ │
│  │  (React State)  │  │   (Progress)    │  │   (Offline)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │    Convex Backend       │
                    │  ┌─────────────────┐    │
                    │  │   User Mgmt     │    │
                    │  │  (Auth/Roles)   │    │
                    │  └─────────────────┘    │
                    │  ┌─────────────────┐    │
                    │  │  Progress DB    │    │
                    │  │  (Sessions)     │    │
                    │  └─────────────────┘    │
                    └─────────────────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   External Services     │
                    │  ┌─────────────────┐    │
                    │  │ Google Sheets   │    │
                    │  │     API         │    │
                    │  └─────────────────┘    │
                    │  ┌─────────────────┐    │
                    │  │   OpenAI API    │    │
                    │  │  (Enhancement)  │    │
                    │  └─────────────────┘    │
                    └─────────────────────────┘
```

## Core Design Patterns

### 1. Activity Pattern
Each learning activity follows a consistent structure:
- **Activity Controller**: Manages state and flow for the specific learning mode
- **Content Provider**: Supplies words, images, and audio content
- **Progress Tracker**: Records attempts, successes, and learning metrics
- **Accessibility Layer**: Ensures keyboard navigation and screen reader support

**Implementation**:
```javascript
// Each activity component implements:
// - handleKeyPress() for keyboard navigation
// - speakContent() for audio feedback
// - trackProgress() for learning analytics
// - resetActivity() for session management
```

### 2. State Management Pattern
**Centralized App State**: Single source of truth for navigation and global state
- Current activity and mode
- User progress and achievements
- Navigation lock status
- Audio preferences

**Local Component State**: Activity-specific state management
- Current word/question
- Input validation
- Animation states
- Temporary UI state

### 3. Progressive Web App Pattern
**Offline-First Design**:
- Service Worker caches all assets and core functionality
- Local storage maintains progress data
- Graceful degradation when offline
- Background sync when connection restored

**Installation Pattern**:
- Manifest.json defines app identity and capabilities
- Install prompts guide users to add to home screen
- Fullscreen mode for immersive learning experience

### 4. Accessibility Pattern
**Universal Design Approach**:
- Keyboard navigation as primary interaction method
- Screen reader compatibility with proper ARIA labels
- Visual feedback for all interactions
- Audio feedback for non-readers

**Input Handling Hierarchy**:
```
Window Event Listener → Activity Event Handler → Component Handler
```

### 5. Audio Integration Pattern
**Text-to-Speech Strategy**:
- ResponsiveVoice for cross-browser compatibility
- Fallback to native Web Speech API
- Volume and rate controls
- Word highlighting during playback

### 6. Progress Tracking Pattern
**Multi-Layer Tracking**:
- **Session Level**: Individual attempts and responses
- **Activity Level**: Completion rates and accuracy
- **Overall Progress**: Cross-activity learning trends
- **Professional Reporting**: Data formatting for therapists

## Data Flow Patterns

### 1. Learning Session Flow
```
Activity Start → Content Load → User Interaction → 
Validation → Feedback → Progress Update → Next Item
```

### 2. Navigation Flow
```
Root Menu → Activity Selection → Mode Selection → 
Learning Session → Progress Review → Return to Menu
```

### 3. Authentication Flow
```
Anonymous Use → Parent/Therapist Account Creation → 
Role-Based Access → Enhanced Features → Data Export
```

## Security & Privacy Patterns

### 1. Data Minimization
- No personally identifiable information stored
- Progress data anonymized
- Local storage preferred over cloud storage
- Optional data export only

### 2. Role-Based Access
- **Child Mode**: Full access to learning activities, limited settings
- **Parent Mode**: Progress viewing, content management, basic settings
- **Therapist Mode**: Advanced analytics, custom content, data export

### 3. Safe Environment
- No external links or communications
- Content validation and sanitization
- Secure API endpoints with authentication
- Encrypted data transmission

## Performance Patterns

### 1. Asset Optimization
- Image compression and lazy loading
- Component code splitting
- Service Worker caching strategy
- Preload critical resources

### 2. Rendering Optimization
- React.memo for expensive components
- Virtual scrolling for large lists
- Animation performance monitoring
- Responsive design breakpoints

### 3. Memory Management
- Cleanup of event listeners
- Audio resource disposal
- Component unmounting procedures
- Local storage size monitoring

## Integration Patterns

### 1. External Service Integration
- **Google Sheets**: Progress data backup and sharing
- **OpenAI**: Content enhancement and personalization
- **Convex**: Real-time data synchronization

### 2. Platform Integration
- **PWA Installation**: Native app-like experience
- **Keyboard Navigation**: Desktop accessibility
- **Touch Interaction**: Mobile-friendly controls
- **Screen Reader**: Assistive technology support 