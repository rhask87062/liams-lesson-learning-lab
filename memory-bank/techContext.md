# Tech Context: Liam's Lesson Learning Lab

## Technology Stack

### Frontend Framework
**React 19.1.0**
- Latest stable version with improved performance
- Concurrent features for smooth animations
- Enhanced error boundaries and suspense
- Server Components capability (future-ready)

**Vite 6.3.5**
- Lightning-fast development server
- Optimized production builds
- Hot Module Replacement (HMR)
- ES modules native support
- Plugin ecosystem integration

### UI & Styling
**Tailwind CSS 4.1.7**
- Utility-first CSS framework
- Custom animations and transitions
- Responsive design system
- Dark mode support (planned)
- Performance-optimized builds

**Radix UI Components**
- Accessible component primitives
- Unstyled, customizable components
- Keyboard navigation built-in
- Screen reader compatibility
- Focus management

**Framer Motion 12.18.1**
- Smooth animations and transitions
- Gesture handling for touch devices
- Layout animations
- Scroll-triggered animations
- Performance optimizations

### Backend & Database
**Convex 1.24.8**
- Real-time database with live queries
- Built-in authentication system
- Serverless functions
- TypeScript-first approach
- Automatic caching and optimization

**Schema Design**:
```typescript
// Current schema supports:
// - User management (parents/therapists)
// - Role-based access control
// - Extensible for progress tracking
```

### PWA Technology
**Service Worker**
- Custom caching strategies
- Offline functionality
- Background sync capabilities
- Asset preloading
- Update management

**Web App Manifest**
- Fullscreen display mode
- Landscape orientation preference
- Custom icons and branding
- Installation prompts
- Platform integration

### Audio & Accessibility
**ResponsiveVoice**
- Cross-browser text-to-speech
- Multiple voice options
- Rate and volume controls
- Pronunciation customization
- Fallback mechanisms

**Web Speech API**
- Native browser speech synthesis
- Backup to ResponsiveVoice
- Voice selection and controls
- Speech rate adjustment

### Development Tools
**ESLint 9.25.0**
- Modern JavaScript linting
- React-specific rules
- Hook dependencies validation
- Accessibility linting
- Custom rule configurations

**TypeScript Support**
- JSDoc for type annotations
- Convex schema typing
- Component prop validation
- API response typing

## Architecture Constraints

### Browser Compatibility
**Target Browsers**:
- Chrome 90+ (primary)
- Safari 14+ (iOS/macOS)
- Firefox 88+ (desktop)
- Edge 90+ (Windows)

**Progressive Enhancement**:
- Core functionality without JavaScript
- Enhanced experience with modern features
- Graceful degradation for older browsers
- Accessibility baseline compliance

### Performance Requirements
**Loading Performance**:
- First Contentful Paint: <2 seconds
- Time to Interactive: <3 seconds
- Cumulative Layout Shift: <0.1
- Service Worker activation: <1 second

**Runtime Performance**:
- 60 FPS animations
- Audio latency: <100ms
- Keyboard response: <50ms
- Memory usage: <100MB mobile

### Accessibility Standards
**WCAG 2.1 Level AA Compliance**:
- Keyboard navigation for all functionality
- Screen reader compatibility
- Color contrast ratios: 4.5:1 minimum
- Focus indicators clearly visible
- Text resizable to 200% without scrolling

**Additional Accessibility**:
- Audio alternatives for visual content
- Simple language and clear instructions
- Consistent navigation patterns
- Error messages with clear guidance

### Security Constraints
**Data Protection**:
- No PII collection without consent
- Local storage encryption
- Secure API communications (HTTPS)
- Content Security Policy implementation
- XSS and CSRF protection

**Child Safety**:
- No external communications
- Content validation and sanitization
- Safe browsing environment
- Parental controls for sensitive features

## Development Environment

### Package Management
**PNPM 10.4.1**
- Fast, disk-efficient package manager
- Strict dependency resolution
- Workspace support for monorepos
- Better security with content addressable storage

### Build Process
**Production Build**:
```bash
pnpm build
# - Vite optimization
# - Asset compression
# - Code splitting
# - Service Worker generation
```

**Development Workflow**:
```bash
pnpm dev
# - Hot module replacement
# - Convex dev server
# - Proxy configuration
# - Source maps enabled
```

### Testing Strategy
**Browser Testing**:
- Puppeteer for automated E2E tests
- Cross-browser compatibility testing
- PWA functionality validation
- Accessibility testing with axe-core

**Performance Testing**:
- Lighthouse CI integration
- Bundle size monitoring
- Memory leak detection
- Audio latency measurements

## Integration Constraints

### External Services
**Google Sheets API**:
- OAuth 2.0 authentication required
- Rate limiting: 100 requests/100 seconds
- Data export/import functionality
- Offline capability with sync

**OpenAI API**:
- API key management and rotation
- Rate limiting and cost monitoring
- Content moderation and filtering
- Fallback mechanisms for outages

### Platform Limitations
**iOS Safari**:
- Service Worker limitations
- Audio autoplay restrictions
- Viewport handling differences
- Home screen app behavior

**Android Chrome**:
- PWA installation differences
- Background sync limitations
- Audio focus management
- Battery optimization conflicts

### Deployment Constraints
**Static Hosting**:
- No server-side rendering required
- CDN-friendly asset structure
- Environment variable management
- Automated deployment pipeline

**Convex Deployment**:
- Function deployment coordination
- Schema migration handling
- Environment synchronization
- Monitoring and alerting setup

## Future Technical Considerations

### Scalability Planning
- Component library extraction
- Micro-frontend architecture
- Database sharding strategies
- CDN optimization

### Technology Evolution
- React 19 features adoption
- Web Components integration
- WebAssembly for performance
- AI/ML feature integration

### Platform Expansion
- Native mobile app considerations
- Desktop application packaging
- Educational platform integrations
- Multi-language support infrastructure 