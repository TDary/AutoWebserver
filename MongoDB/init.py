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
    result = collection.find({"uuid":UID,"name":funname})
    return result

def GetSimple(UID:str,Name:str):
    collection = db.SimpleData
    result = collection.find({"uuid":UID,"name":Name})
    return result

def GetCaseFrameCount(UID:str):
    collection = db.MainTable
    result = collection.find({"uuid":UID})
    return result