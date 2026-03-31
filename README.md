# 🍳 Save the Fridge

**Save the Fridge** is a food shelf sharing and cook-together app built with Expo SDK 55 and Supabase.

## Features

- 📦 Log items in your **fridge** and **pantry** (name, quantity, expiry date, category)
- 🤝 **Share your shelf** with friends (selectively or fully)
- 👀 Browse **friends' shelves** to see what they have
- 🍳 Get **AI-suggested recipes** using ingredients pooled from multiple users ("Mingle to Cook")

## Tech Stack

| Layer | Choice |
|---|---|
| Mobile Framework | Expo SDK 55 (React Native) |
| Navigation | Expo Router v3 (file-based) |
| Backend / DB | Supabase (Postgres + Realtime) |
| Auth | Supabase Auth (email/password) |
| Storage | Supabase Storage (item photos) |
| AI Suggestions | Anthropic Claude API |
| State Management | Zustand |
| UI Components | Custom components with StyleSheet |

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- A Supabase project
- (Optional) An Anthropic API key for AI recipe suggestions

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/shawnjung/save-the-fridge.git
   cd save-the-fridge
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment template and fill in your values:
   ```bash
   cp .env.example .env
   ```

4. Run the Supabase migrations in your Supabase SQL editor:
   - `supabase/migrations/00001_initial_schema.sql` — Tables, triggers, indexes, helper functions
   - `supabase/migrations/00002_rls_policies.sql` — Row Level Security policies

5. Start the development server:
   ```bash
   npx expo start
   ```

## Project Structure

```
app/                          # Expo Router screens
  _layout.tsx                 # Root layout with auth gate
  (auth)/                     # Auth flow (login, register)
  (app)/                      # Tab navigator (shelf, friends, mingle, profile)
  item/[id].tsx               # Item detail/edit
  friend/[id].tsx             # Friend's shelf view
  mingle/[id].tsx             # Active mingle session

components/                   # Reusable UI components
  shelf/                      # Shelf-related components
  friends/                    # Friend-related components
  mingle/                     # Mingle-related components
  ui/                         # Generic UI components (Button, Avatar, Badge)

lib/                          # Business logic
  supabase.ts                 # Supabase client
  anthropic.ts                # Claude API helper
  store/                      # Zustand stores (auth, shelf, friends, mingle)

constants/                    # App constants (categories, units, theme)
supabase/migrations/          # SQL migration files
```