import minio

minioClient = None
rawBucket = 'rawdata'# 源文件存储桶名
analyzeBucket = 'analyzedata' #解析后存储桶名

class MinioServe:
    def __init__(self,url,user,password):
        global minioClient
        self.url = url
        self.user = user
        self.password = password
        # url = '10.11.144.31:8001' # 存储服务器路径
        # zhanghao = 'cdr'
        # mima = 'cdrmm666!@#'
        minioClient = minio.Minio(endpoint=self.url,access_key=self.user,secret_key=self.password,secure=False)