from datetime import datetime
from os.path import isfile
from os import system
import json, time, argparse, sys, server, traceback
#Import libraries
root = sys.path
sys.path.insert(0,"libs")
import requests
sys.path = root

API = "https://api.vk.com/method/"
TOKEN = ""
#Just insert your token insted two lines of code below
#Or create a file named "token.txt" with your auth token
with open("token.txt", 'r') as token:
    TOKEN = token.read()

#Initialization
system("color")
parser = argparse.ArgumentParser()
parser.add_argument("--important", "-i", dest="NAMES", 
    help="Underlines the important names(splited with ',') in the log", default=" ")
parser.add_argument("--liten", "-l", dest="PORT", 
    help="Listens on the port and serves session.json file", default=0)

args = parser.parse_args()
IMPORTANTS = args.NAMES.split(',')
PORT = int(args.PORT)
#Define util functions
def get_time():
    return int(time.time())

def log(*messages):
    print(
        datetime.fromtimestamp(get_time()).strftime("[%H:%M:%S]:"),
        " ".join(map(lambda x: str(x), messages))
    )

#Define API functions
def get_friends():
    friends = requests.post(API + "friends.get", {
        "access_token": TOKEN,
        "fields": "online",
        "v": "5.101"
    }).json()["response"]["items"]

    return friends

def get_online():
    online = map(lambda x: str(x), requests.post(API + "friends.getOnline", {
        "access_token": TOKEN,
        "online_mobile": "0",
        "v": "5.101"
    }).json()["response"])

    return list(online)

def get_offline(id):
    response = requests.post(API + "users.get", {
        "access_token": TOKEN,
        "user_ids": str(id),
        "fields": "last_seen,online",
        "v": "5.101"
    }).json()["response"][0]

    if int(response["online"]) == 1:
        return None

    offline_time = int(response["last_seen"]["time"])
    platform = int(response["last_seen"]["platform"])

    return (offline_time, platform)

#Crash proof
exit = False
while not exit:
    try:
        #Setup the server
        if PORT != 0:
            server.start(PORT, log)
            log("Started the HTTP server on", PORT)
            log("Sessions are available on \033[4mhttp://localhost:" + str(PORT) + "/sessions\033[0m")

        #Assemble all friends into a data stucture
        if isfile("sessions.json"):
            #Load existing data
            log("Found saved data in sessions.json")
            with open("sessions.json", 'r') as sessions:
                data = json.loads(sessions.read())
                priviousOnline = []
                #Generate previous onlines from the known data
                for id, user in data.items():
                    if ("to" not in user["sessions"][-1]) and ("from" in user["sessions"][-1]):
                        priviousOnline.append(str(id))

                log("Saved data loaded!")
        else:
            #First start
            log("Getting data of friends...")
            friends = get_friends()

            log("Assebling data of friends...")
            data = {}
            def asseble_data(user):
                data[str(user["id"])] = {
                    "name": user["first_name"] + " " + user["last_name"],
                    "sessions": [{}]
                }

            list(map(asseble_data,friends))

            log("Looking for friends online...")
            #First fill online friends
            online = get_online()
            for id in online:
                data[id]["sessions"][-1]["from"] = get_time()

            priviousOnline = online
            #Save the data
            log("Generating sessions.json to save the data...")
            with open("sessions.json", 'w') as sessions:
                sessions.write(json.dumps(data))

        log("Setup is done! Starting the main loop:")
        log("===========================================")

        log(len(priviousOnline), "users are currenty online.")
        #Main check online loop
        try:
            while True:
                online = get_online()
                any_changes = False

                for id in data.keys():
                    #Importance prefix
                    if any(map(lambda x: (x in data[id]["name"] or str(x) in id), IMPORTANTS)):
                        prefix = "\033[4m"
                    else:
                        prefix = ""

                    #User left offline
                    if (id in priviousOnline) and (id not in online):
                        offline_time = get_offline(id)
                        if offline_time is not None:
                            data[id]["sessions"][-1]["to"] = offline_time[0]
                            data[id]["sessions"][-1]["platform"] = offline_time[1]
                            data[id]["sessions"].append({})
                            log(prefix + "\033[1m" + data[id]["name"] + "\033[0m", "left \033[33moffline\033[0m.")
                            any_changes = True
                    #User back online
                    if (id not in priviousOnline) and (id in online):
                        data[id]["sessions"][-1]["from"] = get_time()
                        log(prefix + "\033[1m" + data[id]["name"] + "\033[0m", "back \033[94monline\033[0m.")
                        any_changes = True

                if any_changes:
                    with open("sessions.json", 'w') as sessions:
                        sessions.write(json.dumps(data))

                priviousOnline = online
                #Sleep for half a minute before the next check
                time.sleep(30)
        except KeyboardInterrupt:
            exit = True
            log("Stopping script...")
            #Save the data
            with open("sessions.json", 'w') as sessions:
                sessions.write(json.dumps(data))
            server.stop()
            log("Done!")
    except Exception as ex:
        log("\033[91mException:", ex, "\033[0m")
        #Write crash report
        with open("crashes.txt", 'a') as crash:
            crash.write(datetime.fromtimestamp(get_time()).strftime("[%Y %m.%d %H:%M:%S]: "))
            crash.write(str(ex))
            crash.write("\r\n")
            crash.write(str(traceback.format_exc()))
            crash.write("\r\n")
            crash.write('=' * 40)
            crash.write("\r\n\r\n")
        log("Restarting...")
        #Save the data
        with open("sessions.json", 'w') as sessions:
            sessions.write(json.dumps(data))
        server.stop()
        time.sleep(3)
        pass