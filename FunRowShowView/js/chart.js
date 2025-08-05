var timedom = document.getElementById('timecontainer');
var gcdom = document.getElementById('gccontainer');
var calldom = document.getElementById('callcontainer');
var buttonDom = document.getElementById('button-id');
// 获取 URL 参数
const urlParams = new URLSearchParams(window.location.search);
// 提取传递的值
const uuidValue = urlParams.get('uuid');
console.log("uuid:"+uuidValue);
var inputUID = uuidValue;
var inputFunName = document.getElementById('inputfunname');

function AlertError(msg) {
            // 使用 SweetAlert 替代 alert
            Swal.fire({
                title: '错误提示',
                text: msg,
                icon: 'error',
                confirmButtonText: '确定'
            });
        }
		
function PrintDetailFun(datainfo,frame,funname,type){
	var infodata = {};
	datainfo.then(result => {
	  if(result == null || undefined){
			throw Error("null object");
	  }
	  console.log(result);
	  Swal.fire({
	    title: '<strong>第【' + frame + '】帧【' + funname + '】' + type + '堆栈数据</strong>',
	    icon: 'info',
	    html:
	      '<div id="chart"></div>',
	    showCloseButton: true,
	    showConfirmButton:false,
	    showCancelButton: false,
	    focusConfirm: false,
	  });
	  var chart = flamegraph().width(960);
	  var data = result;
	  d3.select("#chart").datum(data).call(chart);
	}).catch(error => {
		// 处理错误
		console.error(error);
	});
}

async function GetOneStackData(uuid,frame,type){
	var url = 'http://10.11.145.125:8600/GetOneFunData/';  // 请求的URL
	url += uuid+'/'+frame+'/'+type;
	try {
	  const response = await fetch(url,{method:'POST',headers:
				{'Content-Type': 'multipart/form-data; boundary=<calculated when request is sent>',
				'Content-Length':'<calculated when request is sent>',
				'Host':'<calculated when request is sent>',
				'Accept':'*/*',
				}
			});
	  if (!response.ok) {
	    throw new Error('Network response was not ok.');
	  }
	  const data = await response.json();
	  var origindata = JSON.parse(data);
	  var resdata = origindata["msg"]["funstack"];
	  if(origindata["code"]==200){
		console.log(resdata);
	  }
	  else{
		  AlertError("当前帧无堆栈数据函数名");
		  throw origindata["msg"];
	  }
	  return resdata;
	  } catch (error) {
	  console.error('Error:', error);
	  }
}


buttonDom.addEventListener('click',function(){
	// 构造请求数据获取详细帧数据
	var funrowurl = 'http://10.11.145.125:8600/GetFunRow/';  // 请求的URL
	funrowurl += inputUID+'/'+inputFunName.value;
	async function fetchframeData() {
	  try {
	    const response = await fetch(funrowurl,{method:'POST',headers:
			{'Content-Type': 'multipart/form-data; boundary=<calculated when request is sent>',
			'Content-Length':'<calculated when request is sent>',
			'Host':'<calculated when request is sent>',
			'Accept':'*/*',
			}
		});
	    if (!response.ok) {
	      throw new Error('Network response was not ok.');
	    }
	    const data = await response.json();
		// console.log("returnData:"+data);
		//初始化数据
		var funnameList = [];
		var funname = String;
		var funtimedata = [];
		var funselftimedata = [];
		var fungcdata = [];
		var funcalldata = [];
		
		var origindata = JSON.parse(data);
		var resData = origindata["msg"];
		if (origindata["code"] == 200){
			funname = inputFunName.value;
			funnameList.push(funname);
			funnameList.push('(SelfTime)'+funname);
			var allsubFrames = resData["frames"];
			for(var i=0; i < allsubFrames.length;i++)
			{
				funtimedata.push(allsubFrames[i]["timems"] / 100);
				funselftimedata.push(allsubFrames[i]["selfms"] / 100);
				fungcdata.push(allsubFrames[i]["gcalloc"] / 100);
				funcalldata.push(allsubFrames[i]["calls"] / 100);
			}
		}
		else{
			AlertError("未找到当前函数名："+inputFunName.value);
			throw origindata["msg"];
		}
		return{
			prop1:funnameList,
			prop2:funname,
			prop3:funtimedata,
			prop4:funselftimedata,
			prop5:fungcdata,
			prop6:funcalldata
		};
		} catch (error) {
	    console.error('Error:', error);
		}
	}
	
	//获取主要总帧数构造函数
	var frameurl = 'http://10.11.145.125:8600/GetFrameCount/';  // 请求的URL
	frameurl += inputUID;
	async function fetchframecountData(inputdata) {
	  try {
	    const response = await fetch(frameurl,{method:'POST'});
	    if (!response.ok) {
	      throw new Error('Network response was not ok.');
	    }
	    const data = await response.json();
		//初始化
		var frameTotal = [];

		var origindata = JSON.parse(data);
		var res = origindata["msg"];
		if(origindata["code"] == 200){
			var frame = res["frametotalcount"];
			for(var i=1;i<=parseInt(frame);i++){
				frameTotal.push(i.toString());
			}
			console.log(data);
		}
		else{
			throw Error(origindata["msg"]);
		}
		
		inputdata.then(result => {
		  if(result == null || undefined){
				throw Error("null object");
		  }
		  
		  //绘制
		  var timeChart = echarts.init(timedom, null, {  //耗时表
			renderer: 'canvas',
			useDirtyRect: false
		  });
		  var gcChart = echarts.init(gcdom, null, { //GC表
			renderer: 'canvas',
			useDirtyRect: false
		  });
		  var callChart = echarts.init(calldom, null, { //Call调用次数表
			renderer: 'canvas',
			useDirtyRect: false
		  });
		  
		  var app = {};
		  
		  var option;
		  var gcoption;
		  var calloption;
		  
		  //函数耗时表
		  option = {
		  visualMap: [
			  {
				show: false,
				type: 'continuous',
				seriesIndex: 0,
				min: 0,
				max: 100,
				inRange: {
				      color: ['#c2cbff', '#006edd'] // 可视化范围内的颜色渐变
				    },
				textStyle: {
				      color: '#333' // 文字的颜色
				    },
			  }
			],
		  title: {
		  text: '函数耗时表(ms)',
		  },
		  tooltip: {
		  trigger: 'axis'
		  },
		  legend: {
		  data: result.prop1
		  },
		  grid: {
		  left: '3%',
		  right: '4%',
		  bottom: '3%',
		  containLabel: true
		  },
		  toolbox: {
			show:true,
			feature: {
				magicType: {show: true, type: ['line', 'bar']},
				dataZoom:
					{                        
						realtime: false,                         
						yAxisIndex: 'none',                      
					},                    
				restore: {},
				saveAsImage: {},
			},
		  },
		  xAxis: {
		  type: 'category',
		  boundaryGap: false,
		  data: frameTotal,
		  },
		  yAxis: {
		  type: 'value',
		  name:'单位:ms'
		  },
		  dataZoom:
		  [
			{type: 'inside'},  //用于添加滚轮缩放
		  	{type:'slider' },  //用于添加滑动条缩放，
		  ],
		  series: [
		  {
			name: result.prop2,
			type: 'line',
			stack: 'Total',
			data: result.prop3,
			markPoint: {
			        data: [
			        { 
						type: 'max', 
						name: '峰值',
						itemStyle: {
						        color: '#ff7552' // 标记点的颜色
						    }
					}
			        ],
			},
			markLine:{
				data: [
				  { type: 'average', name: '平均值' }
				],
			},
		  },
		  {
			name: '(SelfTime)'+result.prop2,
			type: 'line',
			stack: 'Total',
			data: result.prop4,
			markPoint: {
			        data: [
			        { 
						type: 'max',
						name: '最大值',
						itemStyle: {
						        color: '#ff7552' // 标记点的颜色
						    }
					}
			        ],
			},
			markLine:{
				data: [
				  { type: 'average', name: '平均值' }
				],
			},
		  },]
		};
		  
		  //gc表(KB)
		  gcoption = {
		  visualMap: [
					  {
						show: false,
						type: 'continuous',
						seriesIndex: 0,
						min: 0,
						max: 100,
						inRange: {
							  color: ['#c2cbff', '#006edd'] // 可视化范围内的颜色渐变
							},
						textStyle: {
							  color: '#333' // 文字的颜色
							},
					  }
		  ],
		  title: {
		  text: '函数GC表(KB)',
		  },
		  tooltip: {
		  trigger: 'axis'
		  },
		  legend: {
		  data: result.prop1
		  },
		  grid: {
		  left: '3%',
		  right: '4%',
		  bottom: '3%',
		  containLabel: true
		  },
		  toolbox: {
			show:true,
			feature: {
				magicType: {show: true, type: ['line', 'bar']},
				dataZoom:
					{                        
						realtime: false,                         
						yAxisIndex: 'none',                      
					},                    
				restore: {},
				saveAsImage: {},
			},
		  },
		  xAxis: {
		  type: 'category',
		  boundaryGap: false,
		  data: frameTotal
		  },
		  yAxis: {
		  type: 'value',
		  name:'单位:KB'
		  },
		  dataZoom:
		  [
		  	{type: 'inside'},  //用于添加滚轮缩放
		  	{type:'slider' },  //用于添加滑动条缩放，
		  ],
		  series: [
			  {
				name: result.prop2,
				type: 'line',
				stack: 'Total',
				data: result.prop5,
				markPoint: {
				        data: [
				          { 
							type: 'max',
							name: '最大值',
							itemStyle: {
						        color: '#ff7552' // 标记点的颜色
						    },
						  }
				        ],
				},
				markLine:{
					data: [
					  { type: 'average', name: '平均值' }
					],
				},
			  },]
		  };
		  
		  //gc表(KB)
		  calloption = {
		  visualMap: [
		  			  {
		  				show: false,
		  				type: 'continuous',
		  				seriesIndex: 0,
		  				min: 0,
		  				max: 80,
		  				inRange: {
		  				      color: ['#6670ff', '#006edd'] // 可视化范围内的颜色渐变
		  				    },
		  				textStyle: {
		  				      color: '#333' // 文字的颜色
		  				    },
		  			  }
		  ],
		  title: {
		  text: '函数Calls表(次)',
		  },
		  tooltip: {
		  trigger: 'axis'
		  },
		  legend: {
		  data: result.prop1
		  },
		  grid: {
		  left: '3%',
		  right: '4%',
		  bottom: '3%',
		  containLabel: true
		  },
		  toolbox: {
			  show:true,
			  feature: {
				magicType: {show: true, type: ['line', 'bar']},
				dataZoom:
					{                        
						realtime: false,                         
						yAxisIndex: 'none',                      
					},                    
				restore: {},
				saveAsImage: {},
			  },
		  },
		  xAxis: {
		  type: 'category',
		  boundaryGap: false,
		  data: frameTotal
		  },
		  yAxis: {
		  type: 'value',
		  name:'单位:次数'
		  },
		  dataZoom:
		  [
		  	{type: 'inside'},  //用于添加滚轮缩放
		  	{type:'slider' },  //用于添加滑动条缩放，
		  ],
		  series: [
		  {
			name: result.prop2,
			type: 'line',
			stack: 'Total',
			data: result.prop6
		  },]
		};
		  
		  if (option && typeof option === 'object') {
		  timeChart.setOption(option);
		  timeChart.on('click',function(params){
			  //帧号params.dataIndex 帧数据params.data
			  var typedata = "timems";
			  var resDa = GetOneStackData(inputUID,params.dataIndex+1,typedata);
			  PrintDetailFun(resDa,params.dataIndex+1,inputFunName.value,typedata);
		  });
		  }
		  if (gcoption && typeof gcoption === 'object') {
		  gcChart.setOption(gcoption);
		  gcChart.on('click',function(params){
			  //帧号params.dataIndex 帧数据params.data
			  var typedata = "gcalloc";
			  var resDa = GetOneStackData(inputUID,params.dataIndex+1,typedata);
			  PrintDetailFun(resDa,params.dataIndex+1,inputFunName.value,typedata);
		  });
		  }
		  if (calloption && typeof calloption === 'object') {
		  callChart.setOption(calloption);
		  callChart.on('click',function(params){
			  //帧号params.dataIndex 帧数据params.data
			  var typedata = "calls";
			  var resDa = GetOneStackData(inputUID,params.dataIndex+1,typedata);
			  PrintDetailFun(resDa,params.dataIndex+1,inputFunName.value,typedata);
		  });
		  }
		  
		  window.addEventListener('resize', timeChart.resize);
		  window.addEventListener('resize', gcChart.resize);
		  window.addEventListener('resize', callChart.resize);
		  
		  // console.log(result);
		}).catch(error => {
		  // 处理错误
		  console.error(error);
		});
		
	  } catch (error) {
	    console.error('Error:', error);
	  }
	}
	
	var resData = fetchframeData();//执行发送请求
	fetchframecountData(resData);
});

	

