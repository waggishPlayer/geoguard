# SIH Web Dashboard

Next.js 14 web application for the Slope Monitoring & Risk Assessment System.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **Tailwind CSS** - Styling
- **Leaflet + React-Leaflet** - Maps
- **Chart.js** - Data visualization
- **Axios** - HTTP client
- **Socket.io-client** - Real-time updates
- **Zustand** - State management
- **React Hook Form** - Form handling
- **JWT Decode** - Token parsing

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
web-app/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main dashboard
│   ├── auth/              # Login/Register
│   ├── admin/             # Admin panel
│   └── govt/              # Government panel
├── components/            # Reusable components
├── services/              # API services
├── hooks/                 # Custom React hooks
└── public/                # Static assets
```

## Features

- ✅ Authentication (Login/Register)
- ✅ Dashboard with maps
- ✅ Real-time alerts
- ✅ Sensor data visualization
- ✅ Role-based access control
- ⏳ Admin management (coming soon)
- ⏳ Government advisories (coming soon)

