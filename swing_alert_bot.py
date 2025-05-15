import requests
import pandas as pd
import ta
import time
import schedule
from datetime import datetime

# === CONFIG ===
WATCHLIST = [
    "BTCUSD", "ETHUSD", "AAVEUSD", "AVAXUSD", "SANDUSD", "XMRUSD",
    "SOLUSD", "XRPUSD", "RENDERUSD", "LINKUSD", "UNIUSD", "DOTUSD",
    "ARBUSD", "MATICUSD", "ATOMUSD", "SUIUSD", "TONUSD", "TRXUSD",
    "NEARUSD", "DOGEUSD", "ENAUSD", "TITCOINUSD"
]
INTERVAL = 60  # 1H
BUY_RSI_THRESHOLD = 30
SELL_RSI_THRESHOLD = 70
VOLUME_MULTIPLIER = 1.5

TELEGRAM_BOT_TOKEN = "7857153760:AAGeI-4Rrb95t68hAC0R5dp7n3vrGzmJgfs"
TELEGRAM_CHAT_ID = "1904533725"

def send_telegram(message):
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    data = {"chat_id": TELEGRAM_CHAT_ID, "text": message}
    requests.post(url, data=data)

def fetch_ohlc(pair, interval):
    url = f"https://api.kraken.com/0/public/OHLC?pair={pair}&interval={interval}"
    response = requests.get(url).json()
    key = list(response["result"].keys())[0]
    data = pd.DataFrame(response["result"][key], columns=[
        'time','open','high','low','close','vwap','volume','count'
    ])
    data['time'] = pd.to_datetime(data['time'], unit='s')
    data.set_index('time', inplace=True)
    data = data.astype(float)
    return data

def check_signals():
    for pair in WATCHLIST:
        try:
            df = fetch_ohlc(pair, INTERVAL)
            df['rsi'] = ta.momentum.RSIIndicator(close=df['close']).rsi()

            avg_volume = df['volume'][:-1].mean()
            last_volume = df['volume'].iloc[-1]
            last_open = df['open'].iloc[-1]
            last_close = df['close'].iloc[-1]
            bullish = last_close > last_open
            bearish = last_close < last_open
            rsi = df['rsi'].iloc[-1]

            if (
                rsi < BUY_RSI_THRESHOLD and
                last_volume > VOLUME_MULTIPLIER * avg_volume and
                bullish
            ):
                msg = (
                    f"[{datetime.now().strftime('%H:%M %d-%m')}] BUY SIGNAL: {pair}\n"
                    f"RSI: {rsi:.2f} (Oversold)\n"
                    f"Volume Spike: {last_volume:.2f} > {avg_volume:.2f}\n"
                    f"Bullish Candle\n"
                    f"Entry: ${last_close:.2f}"
                )
                print(msg)
                send_telegram(msg)

            elif (
                rsi > SELL_RSI_THRESHOLD and
                last_volume < avg_volume and
                bearish
            ):
                msg = (
                    f"[{datetime.now().strftime('%H:%M %d-%m')}] SELL SIGNAL: {pair}\n"
                    f"RSI: {rsi:.2f} (Overbought)\n"
                    f"Volume Dropping: {last_volume:.2f} < {avg_volume:.2f}\n"
                    f"Rejection Candle\n"
                    f"Exit: ${last_close:.2f}"
                )
                print(msg)
                send_telegram(msg)

        except Exception as e:
            print(f"Error on {pair}: {e}")

schedule.every(1).hours.do(check_signals)
print("Swing Long Bot Running... Monitoring entries and exits.")

while True:
    schedule.run_pending()
    time.sleep(10)
