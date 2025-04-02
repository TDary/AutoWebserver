# 使用 Python 官方镜像作为基础镜像
FROM python:3.13.2

# 设置工作目录
WORKDIR /app

# 复制 requirements.txt 文件并安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 将代码复制到容器中
COPY AutoWebserver/MinioServer/* app/MinioServer/
COPY AutoWebserver/MongoDB/* app/MongoDB/
COPY AutoWebserver/main.py app/
COPY AutoWebserver/Parse.py app/
COPY AutoWebserver/config.py app/

# 指定容器启动时运行的命令
CMD ["python", "main.py"]