from flamegraph import FlameGraph

# 读取数据文件
data_file = './data.txt'
with open(data_file, 'r') as file:
    data = [line.strip().split() for line in file]

# 创建火焰图对象
flamegraph = FlameGraph()

# 添加数据到火焰图
for entry in data:
    function_name, duration = entry[0], float(entry[1])
    flamegraph.add_function(function_name, duration)

# 生成火焰图
flamegraph.generate('./flamegraph.svg')