#!/bin/bash

# This function will be called when the script exits
cleanup() {
    echo "Shutting down backend server..."
    # Kill the background backend process
    if kill $BACKEND_PID 2>/dev/null; then
        echo "Backend server stopped."
    fi
}

# Trap the EXIT signal to run the cleanup function, ensuring the backend stops
# when you stop the script (e.g., with Ctrl+C).
trap cleanup EXIT

# Start the Python backend server in the background
echo "Starting backend server..."
backend/venv/bin/python backend/main.py &

# Save the Process ID (PID) of the backend server
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Start the frontend server in the foreground
echo "Starting frontend server..."
cd frontend
# This command will run and the script will wait here until it's stopped.
npm run dev