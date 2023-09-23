from fastapi import FastAPI
from pydantic import BaseModel
import MongoDB.init as mdb
import uvicorn
import os
import json

app = FastAPI()

#函数统计数据
@app.post("/GetFunRow")
async def ParseFunRow(uid:str,funname:str):
    res = mdb.GetFunRow(uid,funname)
    if res!=None:
        resForjson = {
            "uuid":uid,
            "name":funname,
            "frames":res[0]["frames"]
        }
        return json.dumps(resForjson)
    return '{"code":200,"msg":"Not Found."}'

#基础性能数据
@app.post("/GetSimpleData")
async def ParseSimpleData(uid:str,funname:str):
    res = mdb.GetSimple(uid,funname)
    if res!=None:
        resForjson = {
            "uuid":uid,
            "name":funname,
            "values":res[0]["values"]
        }
        return json.dumps(resForjson)
    return '{"code":200,"msg":"Not Found."}'

if __name__ == '__main__':
    mdb.InitDB()  #初始化数据库
    name_app = os.path.splitext(os.path.basename(__file__))[0]
    uvicorn.run(app=f"{name_app}:app", host="0.0.0.0",port=8600)
