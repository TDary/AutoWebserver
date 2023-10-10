from fastapi import FastAPI
from pydantic import BaseModel
import MongoDB.init as mdb
import uvicorn
import os
import json
import Parse
import MinioServer.minioclient as minioclient
from fastapi.middleware.cors import CORSMiddleware #解决跨域问题

#数据库服务 初始化数据库
DataBase = mdb.DB("10.11.144.31",27171,"MyDB")

#初始化minio
minioclient.MinioServe('10.11.144.31:8001','cdr','cdrmm666!@#')

#FastApi服务
app = FastAPI()   
app.add_middleware(  #解决跨域
    CORSMiddleware,
    # 允许跨域的源列表，例如 ["http://www.example.org"] 等等，["*"] 表示允许任何源
    allow_origins=["*"],
    # 跨域请求是否支持 cookie，默认是 False，如果为 True，allow_origins 必须为具体的源，不可以是 ["*"]
    allow_credentials=False,
    # 允许跨域请求的 HTTP 方法列表，默认是 ["GET"]
    allow_methods=["*"],
    # 允许跨域请求的 HTTP 请求头列表，默认是 []，可以使用 ["*"] 表示允许所有的请求头
    # 当然 Accept、Accept-Language、Content-Language 以及 Content-Type 总之被允许的
    allow_headers=["*"],
    # 可以被浏览器访问的响应头, 默认是 []，一般很少指定
    # expose_headers=["*"]
    # 设定浏览器缓存 CORS 响应的最长时间，单位是秒。默认为 600，一般也很少指定
    # max_age=1000
)

#获取整体案例火焰图
@app.get("/GetCaseFlameGraph/{uid}")
def ParseCaseFlameGraph(uid:str):
    res = Parse.GetDataForFlameGraph(DataBase,uid)
    if res!=[]:
        resJson = {
            "uuid":uid,
            "url":res
        }
        res = {
            "code":200,
            "msg":resJson
        }
        resData = json.dumps(res)
        return resData
    return '{"code":404,"msg":"Data is None."}'

#获取单帧堆栈函数信息
@app.post("/GetOneFunData/{uid}/{frame}/{type}")
def ParseFunStackData(uid:str,frame:int,type:str):
    res = DataBase.GetCaseFrameCount(uid)
    for item in res:
        rawfiles = item["rawfiles"]
        stackData = Parse.GetFunStack(rawFiles=rawfiles,frame=frame,uid=uid,type=type)
        if stackData == None:
            return '{"code":404,"msg":"Not Found."}'
        resJson = {
            "uuid":uid,
            "funstack":stackData
        }
        res = {
            "code":200,
            "msg":resJson
        }
        resData = json.dumps(res)
        return resData
    return '{"code":404,"msg":"Not Found."}'

#获取案例总帧数
@app.post("/GetFrameCount/{uid}")
def ParseTotalFrame(uid:str):
    res = DataBase.GetCaseFrameCount(uid)
    for item in res:
        resForjson = {
            "uuid":uid,
            "frametotalcount":item["frametotalcount"]
        }
        res = {
            "code":200,
            "msg":resForjson
        }
        resData = json.dumps(res)
        return resData
    return '{"code":404,"msg":"Not Found."}'

#函数统计数据
@app.post("/GetFunRow/{uid}/{funname}")
def ParseFunRow(uid:str,funname:str):
    res = DataBase.GetFunRow(uid,funname)
    for item in res:
        frames = Parse.GetFormatData(DataBase,uid,item["frames"])
        resForjson = {
            "uuid":uid,
            "name":funname,
            "frames":frames
        }
        res = {
            "code":200,
            "msg":resForjson
        }
        resData = json.dumps(res)
        return resData
    return '{"code":404,"msg":"Not Found."}'

#基础性能数据
@app.post("/GetSimpleData/{uid}/{funname}")
def ParseSimpleData(uid:str,funname:str):
    res = DataBase.GetSimple(uid,funname)
    for item in res:
        resForjson = {
            "uuid":uid,
            "name":funname,
            "values":item["values"]
        }
        res = {
            "code":200,
            "msg":resForjson
        }
        resData = json.dumps(res)
        return resData
    return '{"code":404,"msg":"Not Found."}'

#服务启动入口
if __name__ == '__main__':
    name_app = os.path.splitext(os.path.basename(__file__))[0]
    uvicorn.run(app=f"{name_app}:app", host="0.0.0.0",port=8600)
