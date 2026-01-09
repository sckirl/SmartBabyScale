import socketio
import time
import sys

# Create a Socket.IO client
sio = socketio.Client()

@sio.event
def connect():
    print("Connected to Next.js Server")

@sio.event
def connect_error(data):
    print("The connection failed!")

@sio.event
def disconnect():
    print("Disconnected from server")

def main():
    try:
        # Connect to the local server
        print("Attempting to connect to http://localhost:3000...")
        sio.connect('http://localhost:3000')
        
        while True:
            # Get input from user
            try:
                user_input = input("\n[SIMULATION] Enter Height (cm) to update dashboard (or 'q' to quit): ")
                if user_input.lower() == 'q':
                    break
                
                try:
                    val = float(user_input)
                    # Emit the data to the server
                    payload = {'type': 'length', 'value': val}
                    sio.emit('sensor_data', payload)
                    print(f"Sent: {payload}")
                except ValueError:
                    print("Invalid number. Please enter a valid float.")
                    
            except EOFError:
                break
                
    except Exception as e:
        print(f"An error occurred: {e}")
        print("Make sure the Next.js server is running via 'npm run dev' first!")
    finally:
        if sio.connected:
            sio.disconnect()

if __name__ == '__main__':
    main()
