from fastapi import FastAPI
from pydantic import BaseModel
import MongoDB.init as mdb
import uvicorn
import os
import json
import Parse
import minioclient
from fastapi.middleware.cors import CORSMiddleware #解决跨域问题

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

@app.post("/GetCaseFlameGraph/{uid}")
def ParseCaseFlameGraph(uid:str):
    res = Parse.GetDataForFlameGraph(uid)
    if res!=[]:
        resJson = {
                "uuid":uid,
                "funpathstack":res
            }
        return json.dumps(resJson)
    return '{"code":200,"msg":"Data is None."}'

@app.post("/GetOneFunData/{uid}/{frame}")
def ParseFunStackData(uid:str,frame:int):
    res = mdb.GetCaseFrameCount(uid)
    if res!=None:
        rawfiles = res[0]["rawfiles"]
        resJson = {
            "uuid":uid,
            "funstack":Parse.GetFunStack(rawFiles=rawfiles,frame=frame,uid=uid)
        }
        return json.dumps(resJson)
    return '{"code":200,"msg":"Not Found."}'

@app.post("/GetFrameCount/{uid}")
def ParseTotalFrame(uid:str):
    res = mdb.GetCaseFrameCount(uid)
    if res!=None:
        resForjson = {
            "uuid":uid,
            "frametotalcount":res[0]["frametotalcount"]
        }
        return json.dumps(resForjson)
    return '{"code":200,"msg":"Not Found."}'

#函数统计数据
@app.post("/GetFunRow/{uid}/{funname}")
def ParseFunRow(uid:str,funname:str):
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
@app.post("/GetSimpleData/{uid}/{funname}")
def ParseSimpleData(uid:str,funname:str):
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
    minioclient.InitMinio() #初始化minio
    name_app = os.path.splitext(os.path.basename(__file__))[0]
    uvicorn.run(app=f"{name_app}:app", host="0.0.0.0",port=8600)
