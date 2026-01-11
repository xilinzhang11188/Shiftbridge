# ShiftBridge Frontend

Next.js frontend application for the ShiftBridge healthcare staffing and scheduling platform.

## Features

- **Multi-Role Dashboards**: Separate interfaces for Clients, Workers, and Admins
- **Real-Time Notifications**: In-app notification system with "new" badges
- **Shift Management**: Complete shift lifecycle from creation to assignment
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Built with Radix UI and shadcn/ui components

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI + shadcn/ui
- **Forms:** React Hook Form + Zod validation
- **State Management:** React Context API (to be implemented)
- **API Client:** Fetch API with custom hooks (to be implemented)

## Getting Started

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager

### Installation

1. Navigate to the frontend directory:
```bash
cd ShiftBridge/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your settings:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To run on a different port (e.g., 3001):
```bash
npm run dev:3001
```

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js 15 app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   ├── (auth)/            # Authentication pages (to be added)
│   ├── client/            # Client dashboard (to be added)
│   ├── worker/            # Worker dashboard (to be added)
│   └── admin/             # Admin dashboard (to be added)
├── components/            # React components
│   ├── ui/               # shadcn/ui components (to be added)
│   └── ...               # Custom components (to be added)
├── lib/                  # Utilities and helpers
│   ├── utils.ts          # Utility functions
│   ├── api.ts            # API client (to be added)
│   └── types.ts          # TypeScript types (to be added)
├── hooks/                # Custom React hooks (to be added)
├── context/              # React context providers (to be added)
└── public/               # Static assets
```

## Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run dev:3001` - Start development server on port 3001
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## User Roles & Views

### Client Dashboard
- Profile management
- Site management
- Shift requests
- View assigned workers
- Cancel shifts

### Worker Dashboard
- Profile management
- View available shifts (based on eligibility)
- Claim shifts
- View assigned shifts
- Confirm assignments

### Admin Dashboard
- Manage all clients
- Manage all workers
- Manage services
- Create and assign shifts
- View all shift claimants
- Assign workers to shifts

## API Integration

The frontend communicates with the FastAPI backend at `http://localhost:8000`.

Key API endpoints:
- `/api/auth/*` - Authentication
- `/api/clients/*` - Client management
- `/api/workers/*` - Worker management
- `/api/shifts/*` - Shift management
- `/api/services/*` - Service management
- `/api/notifications/*` - Notifications

## Styling

The application uses Tailwind CSS with a custom design system:

- **Primary Color**: Blue (#3B82F6)
- **Typography**: System fonts
- **Components**: Radix UI primitives with custom styling
- **Dark Mode**: Supported via Tailwind's dark mode

## Development Guidelines

### Adding New Pages

1. Create page in appropriate directory under `app/`
2. Use TypeScript for type safety
3. Follow Next.js 15 App Router conventions
4. Use server components by default, client components when needed

### Adding UI Components

1. Use shadcn/ui CLI to add components:
```bash
npx shadcn-ui@latest add button
```

2. Customize in `components/ui/`
3. Import and use in your pages

### State Management

- Use React Context for global state
- Use React hooks for local state
- Keep state close to where it's used

### API Calls

- Create custom hooks in `hooks/`
- Handle loading and error states
- Use TypeScript for request/response types

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Other Platforms

Build the application:
```bash
npm run build
```

The output will be in `.next/` directory. Serve with:
```bash
npm start
```

## Testing

(To be implemented)

```bash
npm test
```

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

MIT