import minioclient
import os
import caseflame_pb2
import zipfile
import traceback
import MongoDB.init

#todo:将源文件txt转换成svg
def GetDataForFlameGraph(uuid:str):
    flamaeGraphObjes = minioclient.minioClient.list_objects(bucket_name=minioclient.analyzeBucket,prefix=uuid)
    uploadobjectName = uuid + "/" + uuid + ".txt"
    for item in flamaeGraphObjes:
        if item._object_name == uploadobjectName:
            return "http://10.11.144.31:8001/analyzedata/" +uploadobjectName
    result = []
    funnamePath = MongoDB.init.GetCaseFunNamePath(uuid)
    for fnP in funnamePath:
        res = fnP["stack"]
        for item in res:
            if ';' in item:
                splitdata = item.split(';')
                funname = splitdata[len(splitdata) - 1]
                funrowData = MongoDB.init.GetFunRow(uuid,funname)
                for data in funrowData:
                    value =data["avgvalidtime"]
                    if funname == "PlayerLoop":
                        addStr = f"{item} 0"
                        result.append(addStr)
                    else:
                        addStr = f"{item} {str(value)}"
                        result.append(addStr)
            else:
                funname = item
                funrowData = MongoDB.init.GetFunRow(uuid,funname)
                for data in funrowData:
                    value =data["avgvalidtime"]
                    if funname == "PlayerLoop":
                        addStr = f"{item} 0"
                        result.append(addStr)
                    else:
                        addStr = f"{item} {str(value)}"
                        result.append(addStr)
        writeFilepath = "./"+uuid+".txt"
        with open(writeFilepath,"w",encoding="utf-8") as file:
            file.writelines(line + "\n" for line in result)
        minioclient.minioClient.fput_object(bucket_name=minioclient.analyzeBucket,object_name=uploadobjectName,file_path=writeFilepath,content_type="application/txt")
        os.remove(writeFilepath)
        return "http://10.11.144.31:8001/analyzedata/"+ uploadobjectName #url

def unzip_file(zip_path, extract_dir):
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        for file_info in zip_ref.infolist():
            zip_ref.extract(file_info, extract_dir)


def subdata_to_dict(data):
    result = {}
    name = data.__getattribute__("name")
    total = data.__getattribute__("total")
    selfs = data.__getattribute__("self")
    calls = data.__getattribute__("calls")
    gcalloc = data.__getattribute__("gcalloc")
    timems = data.__getattribute__("timems")
    selfms = data.__getattribute__("selfms")
    result['name'] = name
    result['total'] = total
    result['self'] = selfs
    result['calls'] = calls
    result['gcalloc'] = gcalloc
    result['timems'] = timems
    result['selfms'] = selfms
    if data.children != None:
        result["children"] = []
        for child_subdata in data.children:
            child_subdata_dict = subdata_to_dict(child_subdata)
            if child_subdata_dict != None:
                result["children"].append(child_subdata_dict)
    return result

# 解析帧号落位具体在哪个文件上
def GetFunStack(rawFiles,frame:int,uid:str):
    f = 0
    for file in rawFiles:
        f +=298
        if frame > f:
            continue
        elif frame < f:
            #落在当前源文件或者叫解析文件上，先把原来减去的帧数加回来再进行反序列化操作
            f -= 298
            objetName = uid+"/"+file
            localPath = "./"+file
            try:
                if minioclient.minioClient.bucket_exists(minioclient.analyzeBucket):  # bucket_exists：检查桶是否存在
                    minioclient.minioClient.fget_object(bucket_name=minioclient.analyzeBucket,object_name=objetName,file_path=localPath)
                    #解压反序列化
                    unzip_file(localPath,"./")
                    funstackFile = "./"+file.split('.')[0]+".raw_fun.bin"
                    funrowFile = "./"+file.split('.')[0]+".raw_funrow.bin"
                    resData = {}
                    with open(funstackFile, "rb") as file:
                        while(True):
                            i = 0
                            if f == frame:
                                my_message = caseflame_pb2.ListCaseFlame()
                                my_message.ParseFromString(file.read())
                                flames = my_message.flames[i]
                                resData = subdata_to_dict(flames.flame)
                                break
                            f += 1
                            i += 1
                    os.remove(localPath)
                    os.remove(funstackFile)
                    os.remove(funrowFile)
                    return resData
                else:
                    print("当前存储桶不存在~"+minioclient.analyzeBucket)
            except Exception as err:
                    traceback.print_exception()