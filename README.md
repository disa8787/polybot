# BTC 5m Predict — Telegram Mini App

A Polymarket-style binary prediction market for the next 5-minute Bitcoin candle. Uses virtual balance only (no real money).

## Tech Stack

- **React 18** + Vite + TypeScript
- **Tailwind CSS** for styling
- **lightweight-charts** (TradingView) for 5m candlestick chart
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
- **Live BTC/USD Data**: Binance WebSocket for real-time 5m candles
- **Prediction**: "Will BTC close higher in 5 minutes?" — Yes / No
- **Active Bets**: Countdown timer until resolution
- **Resolution**: Payout 1.9x on correct prediction
- **History**: Past resolved bets (Win/Loss)

## Project Structure

```
src/
├── main.tsx          # Entry + Telegram init
├── App.tsx           # Main layout, tabs
├── contexts/         # App state (balance, bets, history)
├── hooks/            # Binance WebSocket, countdown
├── components/       # Header, Chart, BettingCard, etc.
├── lib/              # Telegram initialization
└── types.ts
```
