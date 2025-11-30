# Color Coder - AI Agent Instructions

## Project Overview
Color Coder is a React web application that inspects live websites via iframe and generates intelligent color palette suggestions. It functions as a real-time design tool for analyzing and modifying website color schemes.

## Architecture Pattern: Iframe Communication System
The core architecture uses **cross-frame messaging** between the main app and target websites:

1. **Main App** (`src/App.jsx`) - Host application with three-panel layout
2. **Iframe Target** - External website loaded for inspection  
3. **Injected Script** - Dynamic script injection for cross-frame communication

### Critical Communication Flow
```javascript
// Script injection pattern in App.jsx
const remoteScriptLogic = `/* script string */`;
onLoad={() => sendMessageToIframe({ type: 'INJECT_SCRIPT', payload: remoteScriptLogic })}

// Message types system:
// INSPECT_ELEMENTS -> INSPECTION_RESULT
// APPLY_STYLES -> direct DOM manipulation
```

## Key Dependencies & Patterns

### Color Science with Colord
- **Library**: `colord` with `harmonies` and `names` plugins
- **Usage**: `extend([harmonies, names])` must be called before color operations
- **Palette Generation**: Uses color theory harmonies (analogous, complementary, triadic, etc.)
- **Luminance Sorting**: Smart color application by luminance values for text/background contrast

### Component Structure
```
src/
├── App.jsx              # Main app with iframe communication logic
├── main.jsx            # Standard React entry point  
└── components/
    ├── PaletteCard.jsx      # Color palette display with apply button
    └── InspectedElement.jsx # Individual element color visualization
```

## Development Conventions

### Element Naming Strategy
The `getElementName()` function creates readable element identifiers:
- Priority: `#id` > `.className` > `tagName`
- **Tailwind Filter**: Removes utility classes with `-` or `:` characters
- **Example**: `div.btn` instead of `div.bg-blue-500.hover:bg-blue-700.px-4.py-2`

### State Management Pattern
- **Inspection Flow**: URL → Connect → Inspect → Generate Palettes → Apply
- **Loading States**: Uses `isLoading` for async iframe operations
- **Element Deduplication**: Filters duplicate element names using `Set`

### Security Considerations  
- **Iframe Sandbox**: `allow-scripts allow-same-origin allow-forms`
- **Message Validation**: Optional origin checking in `handleMessage`
- **Script Injection**: Uses template literals with escape handling

## Working with This Codebase

### Adding New Color Harmonies
1. Extend the `generatePalettes()` function in `App.jsx`
2. Use `colord.harmonies()` methods for color theory calculations
3. Update the palette rendering loop in the right sidebar

### Modifying Element Inspection
1. Update the `querySelectorAll` selector in `remoteScriptLogic`
2. Modify the `getElementName()` function for different naming strategies
3. Adjust the 20-element limit as needed

### Cross-Frame Communication
- Always use `sendMessageToIframe()` wrapper function
- Follow the established message type pattern (`type`, `payload`)
- Test iframe loading states and error handling

## Development Setup & Commands

### Initial Setup
```bash
# Install dependencies (assuming npm/yarn)
npm install
# or
yarn install

# Key dependencies to expect:
# - react, react-dom
# - colord (with harmonies and names plugins)
# - lucide-react (for icons)
# - tailwindcss (utility-first CSS)
```

### Development Commands
```bash
# Start development server (typically Vite-based React)
npm run dev
# or
yarn dev

# Build for production
npm run build
# or
yarn build

# Preview production build
npm run preview
# or
yarn preview
```

### Local Testing Setup
1. **Primary App**: Run the Color Coder app (usually on `http://localhost:5173` for Vite)
2. **Target Website**: Run a separate local server on `http://localhost:3000` for testing
3. **Cross-Origin Testing**: Test with external sites to validate iframe communication

### Development Workflow
1. Start the dev server: `npm run dev`
2. Open browser to the local dev URL
3. Enter target URL (local or external) in the input field
4. Click "Connect" to load target site in iframe
5. Click "Inspect Page" to analyze colors and generate palettes

## Common Development Tasks

### Testing Iframe Communication
The app defaults to `http://localhost:3000` - ensure a local server is running on this port for testing, or update the default URL. For cross-origin testing, be aware of CORS policies and iframe restrictions.

### Debugging Cross-Frame Messages
- Use browser DevTools Console to monitor `postMessage` events
- Add `console.log` statements in `remoteScriptLogic` for iframe-side debugging
- Check the Network tab for iframe loading issues

### Style Application Logic
The `applyPalette()` function uses luminance-based color assignment:
- Darkest color → text
- Lightest color → background  
- Middle colors → accents/buttons

### Component Updates
- `PaletteCard`: Modify for different color display styles
- `InspectedElement`: Update for additional element properties (fonts, spacing, etc.)

### Adding New Dependencies
When adding color-related libraries, ensure compatibility with `colord`. For UI components, verify Tailwind CSS class compatibility.

## File Relationships
- `App.jsx` contains all business logic and communication handling
- Components are purely presentational with prop-based interfaces
- No external state management - uses React useState for simplicity
- Tailwind CSS for styling throughout (note the utility class filtering logic)