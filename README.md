# Green Metro Bus Route Planner - Frontend

A modern React frontend for the Green Metro Bus Route Planner system, providing an intuitive interface for route planning and AI-powered travel assistance.

## Features

- 🚌 **Route Planning**: Find optimal routes between any two stops
- 🤖 **AI Assistant**: Chat with AI conductor for travel guidance
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- ⚡ **Real-time Search**: Stop search with autocomplete
- 🎨 **Modern UI**: Clean, intuitive interface with Tailwind CSS
- 🔄 **Live Updates**: Real-time route optimization

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **Lucide React** for icons

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:8000`

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Navigation header
│   ├── RoutePlanner.tsx # Main route planning interface
│   ├── ChatAssistant.tsx # AI chat interface
│   └── About.tsx       # About page
├── services/           # API services
│   └── api.ts         # API communication
├── App.tsx            # Main app component
├── index.tsx          # App entry point
└── index.css          # Global styles
```

## API Integration

The frontend communicates with the FastAPI backend through the following endpoints:

- `GET /health` - Health check
- `GET /stops` - Get all stops
- `GET /search-stops` - Search stops
- `POST /plan-route` - Plan routes
- `POST /chat` - AI chat
- `POST /explain-route` - Route explanations
- `POST /travel-tips` - Travel tips

## Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:8000
```

## Usage

1. **Route Planning**:
   - Enter origin and destination stops
   - Optionally set preferred time
   - Click "Find Route" to get optimized routes

2. **AI Assistant**:
   - Navigate to the Chat tab
   - Ask questions about routes, schedules, or travel tips
   - Get personalized travel guidance

3. **Stop Search**:
   - Type in the search fields to find stops
   - Select from autocomplete suggestions

## Development

### Adding New Components

1. Create component file in `src/components/`
2. Import and add to routing in `App.tsx`
3. Add navigation link in `Header.tsx`

### Styling

- Use Tailwind CSS classes for styling
- Custom styles in `src/App.css`
- Theme colors defined in `tailwind.config.js`

### API Integration

- Add new API functions in `src/services/api.ts`
- Use TypeScript interfaces for type safety
- Handle loading and error states

## Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy the `build` folder** to your hosting service

3. **Update API URL** in production environment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Green Metro Bus Route Planner system. 