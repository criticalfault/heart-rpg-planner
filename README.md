# Heart RPG Delve Map Planner

A React.js single page application for planning Heart RPG delve maps. This tool allows Game Masters to create, edit, and organize interactive cards representing Landmarks and Delves with all necessary Heart RPG mechanics and information.

## Project Setup Status

✅ **COMPLETED**: React project foundation and development environment setup

This project has been initialized with:

- ✅ Vite React TypeScript project structure
- ✅ ESLint configuration for code quality
- ✅ Prettier configuration for code formatting  
- ✅ TypeScript configuration with strict settings
- ✅ Basic project structure with organized src folders
- ✅ Testing environment setup (Vitest + React Testing Library)

## Current Node.js Compatibility

**Note**: This project requires Node.js 16+ to run the development server and tests. The current environment has Node.js 14.17.1, which is not compatible with the latest Vite and Vitest versions.

### Available Commands

- `npm run check` - Run TypeScript type checking ✅ Working
- `npm run lint` - Run ESLint code quality checks ✅ Working
- `npm run dev` - Start development server (requires Node.js 16+)
- `npm run build` - Build for production (requires Node.js 16+)
- `npm test` - Run tests (requires Node.js 16+)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Modal, etc.)
│   ├── cards/          # Card components (LandmarkCard, DelveCard)
│   ├── forms/          # Form components for editing
│   └── ui/             # UI primitives (Input, Select, etc.)
├── pages/              # Page-level components
├── hooks/              # Custom React hooks
├── context/            # React Context providers
├── types/              # TypeScript type definitions
├── test/               # Test setup and utilities
├── App.tsx             # Main App component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## Technology Stack

- **Frontend Framework**: React 18+ with functional components and hooks
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: CSS with component-scoped styling
- **State Management**: React Context API for global state
- **Testing**: Vitest + React Testing Library
- **Type Safety**: TypeScript for enhanced developer experience
- **Code Quality**: ESLint + Prettier for consistent code style

## Next Steps

To continue development:

1. **Upgrade Node.js** to version 16+ to enable the development server and testing
2. **Implement TypeScript types** for Heart RPG domain models (Task 2)
3. **Create React Context** for delve map state management (Task 3)
4. **Build core UI components** and form primitives (Task 4)

## Requirements Covered

This setup addresses the following requirements from the specification:

- **Requirement 5.1**: Hex grid layout foundation prepared
- **Requirement 5.2**: Development environment configured for drag/drop functionality
- **Requirement 7.1**: Fast loading foundation with Vite build system
- **Requirement 7.2**: Responsive development environment prepared
- **Requirement 7.4**: Performance optimization tools configured
- **Requirement 7.5**: Error handling foundation with TypeScript and ESLint

## Development Notes

The project is configured with modern React development best practices:

- Strict TypeScript configuration for type safety
- ESLint rules for code quality and consistency
- Prettier for automatic code formatting
- Component-based architecture for maintainability
- Testing setup for reliable development workflow

To start development with full functionality, upgrade to Node.js 16+ and run `npm run dev`.