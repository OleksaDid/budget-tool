# Budget Tool - Next.js App

A budget tracking Progressive Web App built with Next.js, TypeScript, Material UI, and localStorage for offline data access.

## Security Improvement
This version of the Budget Tool has been migrated from a React app to Next.js to improve security. The key improvement is that sensitive API credentials are now stored securely on the server side, not exposed in the client-side code.

## Environment Variables
Create a `.env.local` file in the root of your project with the following variables:

```
# Tink API Credentials
TINK_CLIENT_ID=your_tink_client_id
TINK_CLIENT_SECRET=your_tink_client_secret
TINK_REDIRECT_URI=http://localhost:3000/callback
TINK_API_URL=https://api.tink.com
ACTIVO_BANK_PROVIDER_ID=activobank-pt
```

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- Dashboard with financial overview
- Transaction management
- Category management
- Bank connection integration via Tink API
- Automatic transaction import
- Offline support with localStorage

## Technologies

- Next.js
- TypeScript
- Material UI
- React Query
- Axios
- localStorage for offline data
- Server-side API handling for security

## PWA Features

- Installable on desktop and mobile devices
- Offline capabilities
- Responsive design

## Directory Structure

- `/pages` - Next.js pages and API routes
- `/components` - Reusable React components
- `/context` - React context providers
- `/services` - API services and utilities
- `/types` - TypeScript type definitions
- `/public` - Static assets

## License

ISC