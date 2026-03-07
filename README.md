# BTC 5m Predict — Telegram Mini App

A Polymarket-style binary prediction market for the next 5-minute Bitcoin candle. Uses virtual balance only (no real money).

## Tech Stack

- **React 18** + Vite + TypeScript
- **Tailwind CSS** for styling
- **lightweight-charts** (TradingView) for dynamic area chart
- **@twa-dev/sdk** for Telegram Web App API
- **lucide-react** for icons

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output is in `dist/`. Deploy to any static host (Vercel, Netlify, etc.) and set the resulting URL as your Mini App URL in [@BotFather](https://t.me/BotFather).

## Features

- **Virtual Wallet**: $1,000 starting balance
- **Dynamic Chart**: Area series with gradient (Polymarket-style), updates ~every 250ms via Binance 1m kline stream
- **Strict 5-Minute Rounds**: Globally aligned rounds (12:00–12:05, 12:05–12:10, …)
- **Mark (Strike Price)**: Captured at round start, shown as horizontal line on chart
- **Next-Round Betting**: Bets placed during a round apply to the *next* round (no in-round betting)
- **Resolution**: At round end, compare close price to Mark; 1.9x payout on win
- **History**: Past resolved bets (Win/Loss)

## Project Structure

```
src/
├── main.tsx          # Entry + Telegram init
├── App.tsx           # Main layout, tabs
├── contexts/         # App state (balance, bets, history)
├── hooks/            # Price stream, round logic
├── components/       # Header, Chart, BettingCard, etc.
├── lib/              # Telegram initialization
└── types.ts
```
