import threading
from http.server import BaseHTTPRequestHandler,HTTPServer
from os.path import isfile

server = None
log = None

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if (self.path.strip('/').lower() == "sessions"):
            #Check file availability
            if not isfile("sessions.json"):
                self.send_response(404)
                self.send_header("Content-type","text/text")
                self.end_headers()
                self.wfile.write("404".encode("utf-8"))

            #All fine, send the info
            self.send_response(200)
            self.send_header("Content-type","text/json")
            self.end_headers()

            with open("sessions.json", 'r') as sessions:
                data = sessions.read().encode("utf-8")

            self.wfile.write(data)
        else:
            self.send_response(400)
            self.send_header("Content-type","text/text")
            self.end_headers()
            self.wfile.write("400".encode("utf-8"))
        return
    def log_message(self, format, *args):
        global log
        log("\033[95mHTTP Server\033[0m: \"" + " ".join(args) + "\"")

def start(port, logging_function):
    global log
    log = logging_function
    server_thread = threading.Thread(target=listen, args=(port,))
    server_thread.daemon = True
    server_thread.start()

def stop():
    global server, log
    if server is not None:
        log("Shutdownig the HTTP server...")

def listen(port):
    global server
    server = HTTPServer(("", port), Handler)
    server.serve_forever()