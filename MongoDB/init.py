from ctypes import Array
from pymongo import MongoClient

db = None
class DB:
    def __init__(self,ip,port,database):
        global db
        self.ip = ip
        self.port = port
        self.database = database
        mongoClient = MongoClient(self.ip,self.port)
        db = mongoClient.get_database(self.database)

    def GetFunRow(self,UID,funname:str):
        self.uuid = UID
        self.name = funname
        collection = db.FunRow
        result = collection.find({"uuid":self.uuid,"name":self.name})
        return result

    def GetSimple(self,UID:str,Name:str):
        self.uuid = UID
        self.name = Name
        collection = db.SimpleData
        result = collection.find({"uuid":self.uuid,"name":self.name})
        return result

    def GetCaseFrameCount(self,UID:str):
        self.uuid = UID
        collection = db.MainTable
        result = collection.find({"uuid":self.uuid})
        return result

    def GetCaseFunNamePath(self,UID:str):
        self.uuid = UID
        collection = db.FunNamePath
        result = collection.find({"uuid":self.uuid})
        return result