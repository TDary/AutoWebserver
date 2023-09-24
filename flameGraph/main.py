import caseflame_pb2
import json


fun_map = {}

def subdata_to_dict(data, value_name : str):
    result = {}
    value = data.__getattribute__(value_name)
    funname = data.__getattribute__("name")
    result['name'] = funname
    result['value'] = value
    if data.children != None:
        result["children"] = []
        for child_subdata in data.children:
            child_subdata_dict = subdata_to_dict(child_subdata, value_name)
            if child_subdata_dict != None:
                result["children"].append(child_subdata_dict)


    return result


template_html = ""
with open("template_html.txt", "r") as file:
    template_html = file.read()

with open("E:\\MergeData\\09244x\\1695549629.raw_fun.bin", "rb") as file:
    my_message = caseflame_pb2.ListCaseFlame()
    my_message.ParseFromString(file.read())
    flames = my_message.flames[1]
    result = subdata_to_dict(flames.flame, "timems")
    
    with open("1.html", "w") as f:
        f.write(template_html.replace("#DATA#", json.dumps(result)))