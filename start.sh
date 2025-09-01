#!/bin/bash

cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID
    exit
}

# Trap the EXIT signal to run the cleanup function
trap cleanup EXIT

echo "Starting backend server..."

backend/venv/bin/python backend/main.py &
nd
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

echo "Starting frontend server..."
cd frontend
npm run dev