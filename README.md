# Togethera

Cozy, mobile-first couple planner with local-first architecture and dark theme UI.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Features

✨ **Local-First Architecture**
- No backend required - data stored in localStorage
- Hardcoded authentication (maha/him, momo/her)
- Shared passphrase: "meow"
- Works completely offline

📱 **Mobile-Responsive Design**
- Collapsible sidebar with hamburger menu
- Touch-friendly interface
- Optimized for all screen sizes
- Dark cozy theme

💰 **Finance Tracking**
- Track deposits, expenses, and savings
- Monthly statistics and totals
- Category-based organization
- Visual remaining balance

✅ **Task Management**
- Task feed on dashboard
- Mark tasks as complete
- Priority levels
- Full task database view

💕 **Date & Buy Planning**
- Plan dates together
- Shopping list management
- Status tracking (planned/done/bought)

🩺 **Period Tracker** (Her profile only)
- Track menstrual cycle
- Predict next period date
- Days countdown with color coding
- Prominent dashboard banner

## Profile System

- **Him Profile**: For Maha - Finance, Tasks, Dates, Buy List
- **Her Profile**: For Momo - All features + Period Tracker

## Tech Stack

- React + Vite
- TypeScript
- Local Storage for persistence
- Context API for state management
- Date planner: romantic dates with notes/budget in description; reminders enabled.
- Period tracker (Her): period start events + predicted next cycle; partner only sees reminder text.

## Notes

- Minimal API calls; refresh pulls from Google Calendar on demand.
- All data lives in Google Calendar. Reloading the page clears local in-memory state.
- Update styling in `src/App.css` and logic in `src/App.tsx`.
