import minio
minioClient = None
rawBucket = 'rawdata'# 源文件存储桶名
analyzeBucket = 'analyzedata' #解析后存储桶名

def InitMinio():
    global minioClient
    url = '10.11.144.31:8001' # 存储服务器路径
    zhanghao = 'cdr'
    mima = 'cdrmm666!@#'
    minioClient = minio.Minio(endpoint=url,access_key=zhanghao,secret_key=mima,secure=False)