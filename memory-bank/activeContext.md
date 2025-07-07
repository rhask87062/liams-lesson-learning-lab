# Active Context: Liam's Lesson Learning Lab

## Current Session Focus
**Date**: Session Concluded - Ready for Next Command
**Primary Objective**: Successfully integrated custom audio clips with TTS fallback and in-app voice recording.
**Status**: Session concluded, all documented tasks completed for this session.

## Recent Changes Made

### Documentation Structure Created
- **projectbrief.md**: Comprehensive project overview with goals, features, and scope
- **productContext.md**: User-focused context explaining the why and for whom
- **systemPatterns.md**: High-level architecture and design patterns documentation
- **techContext.md**: Complete technology stack and constraint specifications
- **activeContext.md**: This file for tracking current session activities

### Project Analysis Completed
- Analyzed React 19 application structure with Vite build system
- Identified Convex backend integration for user management
- Documented PWA capabilities with service worker implementation
- Mapped learning activities: Spelling Games, Letter Learner, Matching Game, Magic Paint
- Confirmed accessibility-first design with keyboard navigation and TTS support

## Current Architecture Understanding

### Application Structure
```
Root Menu → Activity Selection → Learning Modes → Progress Tracking
```

### Key Components Identified
- **RootMenu**: Main navigation hub with 5 core activities
- **Learning Activities**: Spelling (4 modes), Letter Learning, Matching, Magic Paint
- **Progress System**: Dashboard and word list management
- **Authentication**: Therapist and parent account system
- **PWA Features**: Offline capability, installation prompts

### Technology Stack Confirmed
- Frontend: React 19 + Vite + Tailwind CSS + Radix UI
- Backend: Convex with TypeScript schema
- Audio: ResponsiveVoice + Web Speech API
- Animation: Framer Motion
- Package Manager: PNPM

## Immediate Next Steps

### Development Priorities
1. **Testing Strategy**: Need to implement Puppeteer-based E2E tests
2. **Progress Tracking**: Expand Convex schema for learning analytics
3. **Content Management**: Enhance word list management capabilities
4. **Accessibility**: Validate WCAG 2.1 AA compliance across all components

### Documentation Needs
1. **ADR Creation**: Architecture Decision Records for key technical choices
2. **Testing Strategy**: Comprehensive testing approach documentation
3. **Workflow Patterns**: Development and deployment procedures
4. **Coding Standards**: Consistent code style and patterns guide

## Known Technical Debt

### Immediate Issues
- Service Worker implementation needs review for optimal caching
- Audio integration could benefit from performance optimization
- Bundle size monitoring and optimization needed
- Cross-browser testing coverage gaps

### Future Considerations
- Multi-language internationalization support
- Advanced analytics and reporting features
- Enhanced parent/therapist dashboard
- Integration with educational platforms

## Development Environment Status
- **Build System**: Vite configured with React 19
- **Package Management**: PNPM with lock file present
- **Code Quality**: ESLint configured with React-specific rules
- **Convex Backend**: Schema and functions ready for development
- **PWA Setup**: Manifest and service worker infrastructure in place

## Project Health Indicators
✅ **Green**: Core application functionality and architecture  
✅ **Green**: PWA infrastructure and offline capabilities  
✅ **Green**: Accessibility foundation with keyboard navigation  
🟡 **Yellow**: Testing coverage and automated validation  
🟡 **Yellow**: Performance optimization and monitoring  
🔴 **Red**: Comprehensive documentation beyond memory bank  
✅ **Flash Cards Game Concept Documented**: Detailed plans for a new Flash Cards game with progressive difficulty levels (Easy, Medium, Hard, Hardest) and celebration particle/audio effects (confetti, fireworks, clap tracks), with difficulty settings integrated into the parent/teacher portal's curriculum tab.

## Current Session Changes

### Overflow and Viewport Handling - CORRECTED APPROACH
- **Simple Solution**: Enhanced viewport meta tag with `maximum-scale=1.0, user-scalable=no, viewport-fit=cover` for better mobile handling
- **Global Overflow**: Maintained `overflow: hidden` on body to prevent unwanted scrolling (crucial for Magic Paint)
- **Layout Preservation**: Reverted all component layouts back to original working `min-h-screen` approach
- **Desktop First**: Ensured desktop layouts work perfectly while improving mobile experience
- **Minimal Changes**: Avoided over-engineering - kept what worked, fixed only what was broken

### Problem Solved - Simplified Approach
The initial complex responsive solution broke desktop layouts. The corrected approach maintains:
- ✅ `overflow: hidden` globally (prevents unwanted scrolling)  
- ✅ Enhanced mobile viewport meta tag (better mobile browser handling)
- ✅ Original working layouts (desktop compatibility preserved)
- ✅ All content fits within viewport (no cut-off issues)

This minimal, targeted fix achieves the goal without breaking existing functionality.

### Lab Background Implementation - Simplified
- **User Request**: Add lab.png background image to RootMenu
- **Initial Over-Engineering**: Added complex lab equipment animations, science emojis, and glow effects without permission
- **User Correction**: Removed all extra elements per user feedback - they only wanted the background image
- **Final State**: Clean RootMenu with just lab.png background, simplified title, and original activity grid intact
- **Lesson Learned**: Follow user instructions precisely - don't add extra features without explicit request

### Lab Asset Navigation Implementation
- **Major UI Transformation**: Replaced gradient card buttons with interactive lab assets
- **Asset-to-Game Mapping**: 
  - Telescope → Spelling Games (positioned by window)
  - Microscope → Letter Learner (left counter)
  - Chemistry Set → Magic Paint (bottom left) 
  - Computer → Matching Game (bottom right)
  - Whiteboard → Progress Reports (top center)
- **Interactive Features**: Hover effects with scaling, opacity changes, and drop shadows
- **Permanent Labels**: Game names displayed below each asset with semi-transparent backgrounds
- **Immersive Experience**: Users now click on actual lab equipment to access learning activities
- **Accessibility Preserved**: Maintained keyboard navigation and tab indices

### Banner and Progress Button Enhancements
- **Banner Implementation**: Replaced text title with banner.png image, sized properly (h-16 md:h-20) and positioned at very top
- **Progress Button Upgrade**: Added blue glow effect, scale animation, and "Progress Data" label with Impact font
- **Layout Optimization**: Banner no longer displaces lab assets, maintains clean positioning
- **Consistent Interactions**: Progress button now has same hover effects as lab equipment (glow, scale, label animation)

## Session Conclusion
Successfully transformed the RootMenu into an immersive lab experience with interactive equipment serving as game navigation. The banner.png title is properly sized and positioned at the top, while all lab assets (telescope, microscope, computer, fossil) have engaging hover effects with colored glows, scaling animations, and styled labels. The progress button maintains consistent interaction patterns with glow effects and labeling. The entire interface now provides a cohesive, playful learning environment.

### Hover Area Fix - Final Session Task
- **Problem Identified**: Hover effects only triggered when hovering over label text, not the entire asset area
- **Solution Implemented**: Removed Button components and restructured clickable areas as divs with extended hover zones
- **Enhanced Accessibility**: Added tabIndex and onKeyDown handlers for proper keyboard navigation
- **Padding Extension**: Added `p-8` class to expand clickable/hoverable area around each lab asset
- **Navigation Preserved**: Maintained all original asset positions and click functionality for proper game routing

### Lab Asset Navigation Implementation
- **Major UI Transformation**: Replaced gradient card buttons with interactive lab assets
- **Asset-to-Game Mapping**: 
  - Telescope → Spelling Games (positioned by window)
  - Microscope → Matching Game (left counter) 
  - Computer → Magic Paint (center bottom)
  - Fossil → Letter Learner (left bottom)
- **Interactive Features**: Hover effects with scaling, colored glows, and smooth transitions
- **Permanent Labels**: Game names displayed below each asset with Impact font styling
- **Immersive Experience**: Users now click on actual lab equipment to access learning activities
- **Accessibility Preserved**: Full keyboard navigation with tab indices and Enter/Space key support 

### SpellingMenu Space Theme Asset Update - COMPLETE SESSION
- **Asset Integration**: Successfully replaced emoji space elements with PNG assets (moon.png, meteor.png, ufo.png, cow.png, rocket.png)
- **Asset Import**: Added imports for all new space-themed image assets at component level
- **Animation Enhancement**: Added missing animation keyframes for rocket-fly-by and gentle-bounce effects
- **Visual Consistency**: Maintained existing animations and positioning while upgrading to high-quality image assets
- **Selective Updates**: Kept star as emoji ⭐ per user specification, replaced all other space elements with images
- **Performance Optimized**: Properly sized image elements with responsive width/height classes for different screen sizes

### Session 18: Fix Navigation Lock Behavior
- **Issue**: Navigation lock was preventing all game interactions, not just navigation
- **Root Cause**: LetterLearner's handleLetterSelect was checking isNavigationLocked and returning early
- **Solution**: 
  - Removed isNavigationLocked check from handleLetterSelect
  - Now lock only prevents navigation (home button, escape key) while allowing game play
  - This ensures children can't accidentally exit the app but can still interact with the educational content

### Session 19: SpellingMenu Animation Enhancements
- **Task**: Improve the animations in the SpellingMenu for a more dynamic and immersive experience.
- **UFO Animation**:
  - Moved the UFO to the top-right corner.
  - Created a new `ufo-hover` animation with random darting, wobbling, and a pulsating rainbow `drop-shadow` for a glow effect.
- **Rocket & Satellite Animation**:
  - **Issue**: Rocket and satellite would appear statically on screen before their animations started.
  - **Solution**:
    - Ensured they start off-screen and invisible by setting their initial `opacity` to 0.
    - Implemented a `useEffect` hook to apply the animation classes with a randomized delay, making their appearances surprising and preventing them from appearing at fixed intervals.
    - Consolidated the `rocket-fly-by` animation into `SpellingMenu.jsx` to make the component more self-contained. 

### Session 20: OpenAI API Integration Refinement & Word List Enhancements
- **Task**: Address persistent OpenAI image generation errors and implement word list improvements.
- **OpenAI API `BadRequest: 400` Debugging**: 
  - **Issue**: Previously received "Unknown parameter: 'response_format'" and "Billing hard limit has been reached" errors from OpenAI.
  - **Solution**: Confirmed with OpenAI documentation that `gpt-image-1` model does not use `response_format` or `style` parameters. Corrected `src/services/OpenAI_API.js` to:
    - Change model to `"gpt-image-1"`.
    - Remove `response_format` and `style` parameters.
    - Set `quality` to `'auto'`.
  - **Note**: The "Billing hard limit" error is an account-specific issue on OpenAI's side, requiring direct resolution by the user (checking billing, usage tiers, or contacting OpenAI support).
- **Automatic Word Categorization**:
  - **Feature**: Added a `categorizeWord` function to `src/services/OpenAI_API.js` using `gpt-3.5-turbo` to automatically assign categories (animals, food, objects, nature, people, places, vehicles, clothes, music, fantasy, custom) to new words added to the list.
  - **Integration**: Modified `handleAddWord` in `src/components/ProgressDashboard.jsx` to call `categorizeWord` if no manual category is provided, incorporating loading states (`isCategorizing`) and error handling.
- **Alphabetical Word List Sorting**:
  - **Feature**: Ensured the word list is always displayed in alphabetical order.
  - **Implementation**: Added sorting logic (`.sort((a, b) => a.word.localeCompare(b.word))`) to `handleAddWord`, `handleSaveEdit`, and `handleResetWordList` in `src/components/ProgressDashboard.jsx`.
- **Extended Number Word List (11-20)**:
  - **Feature**: Expanded the default word database to include numbers 11 through 20 as word entries.
  - **Implementation**: Added entries like "eleven", "twelve", etc., to their respective alphabetical sections (`E`, `T`, etc.) in `src/lib/unifiedWordDatabase.js`, assigning them 'numbers' category and relevant emojis.

### Session 21: Visual Enhancements and Asset Integration
- **Task**: Improve visual display of word images and ensure correct asset usage for animations.
- **Word Image Thumbnails (Progress Dashboard)**:\n  - **Feature**: Replaced text display of image paths with small visual thumbnails for words in the `Word List Management` table.\n  - **Implementation**: Modified `src/components/ProgressDashboard.jsx` to intelligently render an `<img>` tag for base64 or path-based images, or a `<span>` for emojis, providing a more intuitive visual experience.\n- **Satellite Animation Asset Update (Spelling Menu)**:\n  - **Issue**: The satellite animation was still using an emoji and not the intended `satellite.png` asset.\n  - **Solution**: Imported `satellite.png` into `src/components/SpellingMenu.jsx` and replaced the emoji with an `<img>` tag, ensuring the image animates correctly with the existing `animate-satellite-pass` class.\n\n### Session 22: Animation Tilt Corrections (Rocket & Meteor)\n- **Task**: Correct the tilt direction of the rocket and meteor animations in the Spelling Menu.\n- **Rocket Animation Tilt**:\n  - **Issue**: The rocket was not tilting correctly along its trajectory.\n  - **Solution**: Adjusted the `rotate` property within the `@keyframes rocket-fly-by` in `src/components/SpellingMenu.jsx` to ensure it maintains a consistent tilt angle (`40deg`) throughout its path.\n- **Meteor Animation Tilt & Start Position**:\n  - **Issue**: The meteor (`animate-fly-by`) was not tilting correctly and appeared on screen before its animation started.\n  - **Solution**:\n    - Moved the `@keyframes fly-by` definition from `src/App.css` to `src/components/SpellingMenu.jsx` for better component encapsulation and to prevent style conflicts.\n    - Adjusted the `rotate` property within the `@keyframes fly-by` to ensure it tilts consistently (`-50deg`).\n    - Modified its initial keyframe (`0%`) to start off-screen and invisible (`opacity: 0`).\n    - Adjusted subsequent keyframes (`25%`, `50%`, `75%`, `100%`) to ensure it smoothly appears and disappears off-screen, maintaining visibility only during its intended flight path.\n    - Changed animation duration to 15s.\n\n### Session 23: Animation Commenting and Clarification\n- **Task**: Add comments to `SpellingMenu.jsx` to clarify the purpose and associated asset for each animation.\n- **Implementation**:\n  - Added a comment above `@keyframes satellite-pass` to indicate it's for the Satellite asset on the Spelling Menu app.\n  - Added a comment above `@keyframes fly-by` to indicate it's for the Meteor asset on the Spelling Menu app.\n  - Added a comment above `@keyframes rocket-fly-by` to indicate it's for the Rocket asset on the Spelling Menu app.\n\n### Session 24: Rocket Animation Tilt Correction (Finalized) & Meteor Visibility Fix
- **Task**: Ensure the rocket maintains a consistent tilt and the meteor is only visible when moving from off-screen, eliminating conflicting animation definitions.
- **Rocket Animation Tilt Fix**:
  - **Issue**: The rocket was changing course and its tilt was inconsistent, indicating a lingering conflicting animation definition.
  - **Solution**: Removed the duplicate `@keyframes rocket-fly-by` and `.animate-rocket-fly-by` rules from the inline `<style>` tag in `src/App.jsx`. This ensures that the single definition in `src/components/SpellingMenu.jsx` (with `rotate(40deg)` applied consistently across all keyframes) is the sole controller for the rocket's animation, allowing it to travel in a straight line with the correct tilt.
- **Meteor Animation Visibility Fix**:
  - **Issue**: The meteor was appearing statically on screen before its animation started.
  - **Solution**: Confirmed and ensured that the `0%` keyframe of the `@keyframes fly-by` animation in `src/components/SpellingMenu.jsx` has `opacity: 0` and `animation-fill-mode: backwards` is correctly applied. This guarantees the meteor is invisible until its animation begins moving it from off-screen.\n\n### Session 25: Final Animation Refinements (Rocket & Meteor) and Dynamic Start
- **Task**: Fine-tune the rocket and meteor animations for precise tilt, off-screen starts, and smooth trajectory, incorporating dynamic control for the meteor.
- **Rocket (`rocket-fly-by`) Animation Refinement**:\n  - **Issue**: The rocket's path was not perfectly straight, and its tilt seemed inconsistent despite previous adjustments.\n  - **Solution**: Adjusted the `transform` properties across all keyframes (0%, 25%, 75%, 100%) in `@keyframes rocket-fly-by` within `src/components/SpellingMenu.jsx`. Ensured a consistent `rotate(45deg)` for a linear, visually accurate flight path and confirmed `opacity: 0` at 0% and 100% to ensure it only appears when in motion.\n- **Meteor (`fly-by`) Animation Refinement & Dynamic Control**:\n  - **Issue**: The meteor was still appearing statically on load, and its trajectory needed further smoothing.\n  - **Solution**: Introduced `animateItems.meteor` state variable in `SpellingMenu.jsx` to dynamically control the meteor's animation, ensuring it starts with `opacity: 0` and only animates when triggered by a `setTimeout`. Adjusted `transform` properties in `@keyframes fly-by` (0%, 25%, 75%, 100%) to define a smooth, off-screen to off-screen trajectory with a consistent `rotate(-45deg)`. Increased animation duration to `20s` for a smoother appearance.\n\n### Session 25: Progress Dashboard ReferenceError Fix
- **Task**: Resolve the `ReferenceError: newWord is not defined` when navigating to Curriculum Settings.
- **Issue**: State variables (`newWord`, `newWordImage`, etc.) were declared in `ProgressDashboard` but used in `DashboardContent`, causing a `ReferenceError`.
- **Solution**: Manually removed the duplicate state declarations from the `ProgressDashboard` function, ensuring they are only declared within `DashboardContent` where they are used. (Note: Automated fix failed due to tooling limitations).

### Audio Recording and Playback Integration
- **Objective**: Implement playing custom audio clips (.wav) with TTS fallback, and add voice recording to the word list.
- **`src/utils/simpleTTS.js`**: Modified `speak` function to accept `audioPath` parameter, prioritizing playback of custom `.wav` files. Updated `speakSequence` to pass `audioPath` from word objects.
- **`src/lib/unifiedWordDatabase.js`**: Updated `speakWord` to accept a word object and pass its `audioPath` to `TTS.speak`. Ensured `getAllWords` includes `audioPath` for words from the database (e.g., 'apple.wav').
- **`src/components/ProgressDashboard.jsx`**: Implemented `MediaRecorder` to capture voice clips as WAV blobs, converted them to Base64 for `localStorage` persistence. Added a "Record" button next to the word input fields (both new and edit modes), with live recording indicators and audio previews. Added an "Audio" column to the word list table.
- **`src/components/LearnMode.jsx`**: Modified `handleSpeak` to pass the entire `currentWord` object to `speakWord`, ensuring custom audio paths are utilized when available.

### Problem Solved
- ✅ Seamless integration of custom audio clips for enhanced natural sound.
- ✅ Robust fallback to various TTS options (WaveNet, ResponsiveVoice, Browser TTS) when custom audio is unavailable.
- ✅ Empowered Master to effortlessly record and manage custom pronunciations directly within the application, ensuring personalized learning experiences.

### Bug Fix: Microphone Icon Error
- **Issue**: `Uncaught SyntaxError: The requested module '...lucide-react.js' does not provide an export named 'Microphone'` resulting in a blank page.
- **Solution**: Corrected the import of the `Microphone` icon to `Mic` in `src/components/ProgressDashboard.jsx`, as `Mic` is the correct export from `lucide-react`.
- **Impact**: Resolved the critical rendering error, allowing the application to load and function as intended.

### Pending Issues for Next Session:
- **UFO Glow**: Adjust glow to be concentrated around the middle/outer edge of the UFO with pulsating rainbow effect.
- **Image Saving**: Implement server-side solution for saving generated images as PNGs to `public/images/words/`.

## Current Focus
- Audio feature implementation for word list management
- Voice recording for custom words with Base64 storage
- Automatic image generation for words using OpenAI
- Letter audio playback using m4a files
- Spelling games audio reinforcement
- Responsive layout for mobile vs desktop
- Mobile scrolling and touch handling
- Audio volume normalization
- Flash Cards game development

## Recent Changes
- Added audio recording functionality to word list management with MediaRecorder API, Base64 conversion, and preview playback
- Fixed Lucide icon import error by changing from 'Microphone' to 'Mic' 
- Resolved blob URL conversion issues by converting audio to Base64 immediately in MediaRecorder onstop event
- Enhanced letter learning with automatic m4a audio playback for letters (a.m4a through z.m4a)
- Added Enter key audio feedback in all spelling modes with 2.5s delay before auto-advance
- Created responsive mobile layouts with separate designs for mobile vs desktop/tablet
- Implemented mobile-specific menus with card-based layouts and scrollable interfaces
- Added touch event prevention to MagicPaint to prevent scrolling while drawing
- Normalized audio volumes: letter audio at 100%, other audio at 80%
- Created mobile version of spelling menu with simplified card layout, night sky backdrop, and animated pulsing stars while removing all floating assets
- Simplified image handling in word list: automatically uses word.png format, shows thumbnails, allows click-to-edit images, removes manual path entry
- Unified color palette across mobile and desktop: spelling menu uses #000000, #4B0082, #6A0DAD gradient; root menu uses dark gray to light blue gradient
- Fixed body overflow to allow scrolling on mobile menus while keeping overflow hidden for activities that need it
- Updated root menu gradient to dark gray → yellow → orange; added child-like text styling with crooked/backwards letters that straighten on hover
- Added spelling game difficulty settings: max word length filter (3-15 letters) and fill-in-the-blanks percentage (10-70%)
- Fixed aspect ratio logic that was backwards (was checking > instead of <)
- **Desktop Layout Responsive Positioning Fix**: Converted all activity positions to percentage-based for responsive scaling; items now stay on lab counter at all aspect ratios.
- **Hitbox Alignment Fix**: Restored original visual layout and fixed hitboxes by attaching `onClick` event directly to the image and label containers, removed conflicting `overflow-hidden` from parent, and removed hardcoded `opacity-0` from image elements within animations.
- **Spelling Menu Animations**: Refined cow drift for subtle movement; ensured rocket, satellite, and meteor animations now move across the screen by correcting keyframes and re-adding `animation-fill-mode: backwards;`.
- **Browser Tab Name & Icon**: Confirmed correct display of "Liam's Lesson Learning Lab" and `favicon.png` after hard refresh, resolving caching issue.
- **Mobile/Desktop Layout Switch**: Simplified `useIsMobile` hook to use a standard 768px breakpoint for clear distinction between phones and tablets/desktops.

## Session 12 - Mobile Spelling Menu Card Width Update
- Made mobile spelling menu cards wider with responsive sizing (60-80% of screen width)
- Changed from fixed max-w-md to dynamic width using CSS calc: min(80%, max(60%, 100vw - 2rem))
- Desktop cards remain unchanged

## Session 12 - Audio Fix for Spelling Games
- Fixed audio in spelling games by passing full word object to speakWord() instead of just the word string
- Updated CopyMode and FillBlankMode to use speakWord(currentWord) instead of speakWord(currentWord.word)
- TestMode was already correct
- Word audio files don't exist yet (only apple.wav is defined but not present), so audio falls back to TTS

## Session 12 - Audio Storage and Image Format Updates
- Updated all words in unifiedWordDatabase to use .png format (e.g., /images/words/ant.png)
- Discovered audio recordings are being saved as base64 in localStorage, not to public/audio directory
- Created audioMigration.js utility to prepare for future file-based storage
- Audio currently works via base64 data URIs stored in localStorage
- To properly save audio files would require server-side implementation or Convex integration

## Current Status
- Letter audio files (a.m4a through z.m4a) are in public/audio/
- Letters will now play their m4a audio files before speaking the word
- Custom recorded audio from Progress Dashboard uses base64 encoding
- Spelling games now provide audio feedback on every submission
- Mobile users see simplified card-based menu with activity icons and names
- Desktop/tablet users see interactive lab environment with positioned assets
- Banner displays at top of screen on all devices
- Mobile layouts are scrollable except in MagicPaint
- MagicPaint prevents touch scrolling to enable drawing gestures
- Letter audio plays at maximum volume for consistency with word audio

## Session End
- Mobile spelling cards now responsive (60-80% width)
- Fixed audio playback in all spelling games
- Updated word database to use .png image format
- Created audio migration utility for future file storage
- Audio recordings currently stored as base64 in localStorage

## Session - Desktop Layout Responsive Positioning Fix
- **Issue**: Desktop RootMenu items were using fixed pixel positioning that didn't scale with viewport
- **Solution**: Converted all activity positions to percentage-based for responsive scaling
  - Telescope (Spelling): left-[12%] top-[25%] with w-[15%]
  - Microscope (Matching): left-[20%] bottom-[25%] with w-[12%]
  - Computer (Magic Paint): right-[20%] top-[25%] with w-[12%]
  - Fossil (Letter Learner): left-[55%] bottom-[30%] with w-[10%]
- **Layout Improvements**:
  - Background now in separate container layer for better control
  - Banner uses percentage width (20%) for consistent scaling
  - Progress/Install buttons positioned with percentages (5% from edges)
  - Text size uses viewport-relative units (1.2vw) for proportional scaling
  - Items maintain relative positions on lab counter at all desktop aspect ratios
