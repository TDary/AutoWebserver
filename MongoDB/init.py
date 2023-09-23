from ctypes import Array
from pymongo import MongoClient

db = None

def InitDB():
    global mongoClient
    global db
    mongoClient = MongoClient("10.11.144.31",27171)
    db = mongoClient.get_database("MyDB")

def GetFunRow(UID:str,funname:str):
    collection = db.FunRow
    results = collection.find({"uuid":UID,"name":funname})
    return results

def GetSimple(UID:str,Name:str):
    collection = db.SimpleData
    results = collection.find({"uuid":UID,"name":Name})
    return results