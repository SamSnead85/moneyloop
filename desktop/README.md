# MoneyLoop Desktop App

Native desktop application for MoneyLoop, built with Electron.

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
npm install
```

### Run Development
```bash
npm run dev
```

This will start the Electron app pointing to your local Next.js dev server at `http://localhost:3000`.

### Build for Distribution

#### macOS
```bash
npm run package  # Creates .app
npm run make     # Creates .dmg installer
```

#### Windows
```bash
npm run package  # Creates .exe
npm run make     # Creates installer
```

## Features

- **Native Menu Bar**: Quick navigation with keyboard shortcuts
  - `Cmd+1`: Dashboard
  - `Cmd+2`: Transactions
  - `Cmd+3`: Budgets
  - `Cmd+4`: Goals
  - `Cmd+.`: Quick Capture
  
- **Native Notifications**: System-level notifications for tasks and updates

- **Secure**: Sandboxed with context isolation enabled

## Configuration

### Environment Variables (for development)
Create a `.env` file:
```
NODE_ENV=development
```

### Production URL
Edit `src/main.ts` to change the production URL:
```typescript
const PRODUCTION_URL = 'https://moneyloop.app';
```

## Publishing

### macOS App Store
1. Configure code signing in `forge.config.js`
2. Set environment variables:
   - `APPLE_ID`
   - `APPLE_PASSWORD` (app-specific password)
   - `APPLE_TEAM_ID`
3. Run: `npm run publish`

### Windows Store
1. Configure Windows signing certificate
2. Run: `npm run publish`

## Architecture

```
desktop/
├── src/
│   ├── main.ts      # Main process (Electron)
│   └── preload.ts   # Preload script (bridge)
├── forge.config.js  # Electron Forge config
├── package.json
└── tsconfig.json
```
