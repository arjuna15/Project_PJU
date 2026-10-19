#!/bin/bash

# Script untuk menjalankan Backend Laravel dan Frontend Next.js secara bersamaan

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo "=========================================================="
echo "  PT PARKIT JAYA UTAMA - TRACKING UNIT & PROFIT ENGINE    "
echo "=========================================================="

echo "[1/2] Menjalankan Laravel 11 Backend (Port 8000)..."
cd "$DIR/backend"
php artisan serve --host=127.0.0.1 --port=8000 &
BACKEND_PID=$!

echo "[2/2] Menjalankan Next.js Frontend (Port 3000)..."
cd "$DIR/frontend"
npm run dev -- -p 3000 &
FRONTEND_PID=$!

echo ""
echo "Aplikasi siap diakses:"
echo "-> Frontend: http://localhost:3000"
echo "-> Backend API: http://127.0.0.1:8000/api"
echo ""
echo "Tekan CTRL+C untuk menghentikan server."

trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
