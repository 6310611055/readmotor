from typing import Union
import math
import dbControl
from fastapi import FastAPI, Response, status, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
from datetime import datetime, date
import csv
import RPi.GPIO as GPIO
import time
import numpy as np
from apscheduler.schedulers.background import BackgroundScheduler
#import myencoder
from myencoder import Encoder


enc = Encoder(24, 25, 1000)  # Change this pin 
startSensor = 0 
# Define the GPIO pins
channel_A = 24
channel_B = 25

# Set up GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setup(channel_A, GPIO.IN)
GPIO.setup(channel_B, GPIO.IN)

# Variables
counter = 0
last_state = GPIO.input(channel_A)
pulse_per_round = 2000

# Create FastAPI instance
app = FastAPI()

# Enable CORS
origins = [
    "*"
]

default_value = 1.7

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize data lists
nums = []
nums50 = []
nums150 = []
start = False
# Database instance
db = dbControl.MstDB()

# Item model for request payload
class Item(BaseModel):
    name: str

test_list = ["1"] * 10

fileName = ""
    
def check_list_len():
    global test_list
    print(f"check_list_len：{len(test_list)}")



# Endpoint to add a filename
@app.post("/filename")
async def addFileName(item: Item):
    global fileName
    fileName = item.name + "_" + str(datetime.now())
    print(fileName)
    return {"Status": "Success", "fileName": fileName}

@app.get("/variable/{id}")
async def editVariable(id):
    global default_value
    print("value", id)
    #default_value = id    
    if id == "reset":
        default_value = 1.7
        print("Value was reset")
    else:
        default_value = id
        print("Value was set")
    print("Value was set")
    return {"Status": "Success", "Varible": default_value}

# Endpoint to save the data to a file
@app.get("/save")
async def savefile(response: Response):
    global fileName
    if len(fileName) < 3:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return "Error: Set filename first!"
    else:
        path_to_file = "./data/" + fileName + ".csv"
        mst = 600
        task = (fileName, datetime.now(), path_to_file, mst)
        db.updateDB(task)
        with open(path_to_file, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(nums)
            writer.writerow(nums50)
            writer.writerow(nums150)
        return "Success"

# Endpoint to retrieve all data from the database
@app.get("/alldata")
async def queryDB():
    response = db.readDB()
    print(response)
    return {"data": response}

# Endpoint to remove data from the database
@app.get("/remove/{id}")
async def removeDB(id):
    response = db.editDB(id)
    response = db.readDB()
    print(response)
    return {"data": response}

# Endpoint to open a file and retrieve data
@app.get("/open/{id}")
async def openFile(id):
    global default_value
    response = db.queryDB(id)
    if response is None:
        print(default_value)
       
        return {"error": "not found"}
    
    with open(response[3], "r") as f:
        csv_reader = csv.reader(f)
        rows = list(csv_reader)
        data = [round(float(value), 2) for value in rows[0]]  # Convert data to float values
        data50 = [round(float(value), 2) for value in rows[1]]  # Convert data50 to float values
        data150 = [round(float(value), 2) for value in rows[2]]  # Convert data150 to float values

    mst_data = response[4]

    # Find the indices where the difference between data50 and data150 is greater than or equal to 1.5
    diff_values_gap_50 = []
    diff_values_indices = []

    start_index = 200
    gap_size = 50  
    # default_value = 1.7
    print(default_value)
    
    i = start_index
    while i < len(data50):
        threshold = (1.04167 * 1e-6 * (i ** 2) - (0.002290 * i) + float(default_value))
        
        diff = data50[i] - data150[i]
        #print(i , threshold , diff)
        if i == 875:
            print(diff, threshold)
            
        if diff >= threshold:
            diff_values_gap_50.append(diff)
            diff_values_indices.append(i)

            if len(diff_values_indices) == 3:
                break

            # Skip the next gap_size indices to create a gap
            i += gap_size
        else:
            i += 1

    return {
        "data": data,
        "data50": data50,
        "data150": data150,
        "mst": mst_data,
        "diff_values_gap_50": diff_values_gap_50,
        "diff_values_indices": diff_values_indices,
    }






@app.get("/getdata")
def read_root(response: Response):
    if not start:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"Message": "Can't get data"}
    
    # Format the data with two decimal places
    data = [f"{value:.2f}" for value in nums]
    
    window = np.ones(50) / 50
    avg_50 = np.convolve(nums, window, mode='valid')
    nums50.append(avg_50[-1])
    data50 = [f"{value:.2f}" for value in nums50]

    window = np.ones(150) / 150
    avg_150 = np.convolve(nums, window, mode='valid')
    nums150.append(avg_150[-1])
    data150 = [f"{value:.2f}" for value in nums150]
    
    diff_values = [nums50[i] - nums150[i] for i in range(len(nums50))]

    diff_values_gap_50 = []
    diff_values_indices = []

    start_index = 200
    gap_size = 50  

    
    i = start_index
    while i < len(data50):
        threshold = (1.04167 * 1e-6 * (i ** 2) - (0.002290 * i) + 1.7)
        
        diff = data50[i] - data150[i]
        #print(i , threshold , diff)
        if i == 875:
            print(diff, threshold)
        if diff >= threshold:
            diff_values_gap_50.append(diff)
            diff_values_indices.append(i)

            if len(diff_values_indices) == 3:
                break

            # Skip the next gap_size indices to create a gap
            i += gap_size
        else:
            i += 1

    return {
        "data": data,
        "data50": data50,
        "data150": data150,
        "detected": "not detect",
        "diff_values_gap_50": diff_values_gap_50,
        "diff_values_indices": diff_values_indices,
    }



@app.get("/reset")
def  reset_count():
    global counter, angle , startSensor
    counter = 0 
    angle = 0 
    enc.reset()
    return {"OK"}


@app.get("/start")
def start_record():
    global counter, angle, startSensor 
    startSensor = enc.read() 
    angle = 0
    nums.clear()
    counter = 0
    nums50.clear()
    nums150.clear()
    global start
    start = True
    reset_count()
    return {"status": start, "data": nums, "data50": nums50, "data150": nums150}

# Endpoint to stop recording
@app.get("/stop")
def stop_record():
    global start
    start = False
    return {"status": start}

# Encoder callback function
def encoder_callback(channel):
    global counter, last_state, angle, nums, nums50, nums150,start
    channel_1= GPIO.input(channel_A)
    channel_2 = GPIO.input(channel_B)
    
    if channel_1 == 1 and channel_2 == 0:
        counter -= 1 
        while channel_2 == 0 :
            channel_2 = GPIO.input(channel_B)
        #while channel_2 == 1 :
            #channel_2 = GPIO.input(channel_B)
            
    elif channel_1 == 1 and channel_2 == 1:
        counter += 1
        while channel_1 == 1 :
            channel_1 = GPIO.input(channel_A)
    
    print("counter : " , counter)
     
    angle = counter
#    if time.time() - last_state > 1 and start:
#        last_state = round(time.time())
#        nums.append(angle)
        
#    if not start:
#        nums.clear()
#        nums50.clear()
#        nums150.clear()

    
    # Calculate angle
 #   angle = (counter / pulse_per_round) * 360
 #   if angle >= 360 or angle <= -360:
 #       counter = 0

    # Print angle
    #print("Current angle: {:.2f} degrees".format(angle))

def appendData():
    #print("Scheduler")
    global startSensor
    sensorRead = int(enc.read()) - startSensor
    current_angle = enc.myangle()  
    
    #print(int(enc.read()))
    #print(int(enc.myangle()))
    print("Current angle:", int(enc.myangle()))

    
    global test_list
    if start == True:
        print("Current angle: {:.2f} degreesss".format(current_angle))
        #nums.append(angle)
        nums.append(current_angle)
    elif start == False:
        if len(nums) >= 1:
            nums.clear()
            nums50.clear()
            nums150.clear()
        
        



@app.on_event('startup')
def init_data():
    scheduler = BackgroundScheduler()
    scheduler.add_job(appendData, 'cron', second='*/1')
    scheduler.start()
    
    
    
    
# Add event detection for channel A
#GPIO.add_event_detect(channel_A, GPIO.RISING, callback=encoder_callback)
