
# Frontend Admin

Admin dashboard for TaxiTrack application.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Build

```bash
npm run build
```

Builds the app for production to the `build` folder.

## Project Structure

```
frontend-admin/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## Configuration

Create a `.env` file in the root directory with necessary environment variables:

```
REACT_APP_API_URL=http://localhost:5000
```

## Testing

```bash
npm test
```

## Deployment

See [deployment documentation](./docs/deployment.md) for production setup.

## License

MIT
