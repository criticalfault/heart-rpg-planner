# Heart RPG Planner - Startup Guide

## Current Issue
You're running Node.js v14.17.1, but this project requires Node.js 16+ to use Vite (the modern build tool).

## Option 1: Upgrade Node.js (Recommended)

### Windows:
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version (currently Node.js 18 or 20)
3. Run the installer
4. Restart your terminal/PowerShell
5. Verify with: `node --version`

### After upgrading Node.js:
```bash
# Install dependencies
npm install

# Start the development server
npm start
# OR
npm run dev
```

The app will be available at `http://localhost:5173`

## Option 2: Use Node Version Manager (Advanced)

### Windows (using nvm-windows):
1. Install nvm-windows from: https://github.com/coreybutler/nvm-windows
2. Open a new PowerShell as Administrator
3. Run:
```bash
nvm install 18.17.0
nvm use 18.17.0
```

### Then install and run:
```bash
npm install
npm start
```

## Option 3: Alternative Build Setup (If you can't upgrade Node.js)

If you absolutely cannot upgrade Node.js, I can help you set up an alternative build configuration using older tools, but this would require significant changes to the project structure.

## Troubleshooting

### If you get permission errors:
- Run PowerShell as Administrator
- Or use `npm install --no-optional`

### If you get dependency errors after upgrading:
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### If the development server doesn't start:
- Check that port 5173 isn't already in use
- Try: `npm run dev -- --port 3000` to use a different port

## Available Scripts

Once Node.js is upgraded:

- `npm start` or `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Check code quality

## Project Features

This Heart RPG Delve Map application includes:
- Interactive hex grid for placing landmarks and delves
- Drag and drop card placement
- Full keyboard navigation and accessibility
- Performance optimizations for large maps
- Import/export functionality
- Responsive design

## Need Help?

If you run into any issues after upgrading Node.js, let me know and I can help troubleshoot!