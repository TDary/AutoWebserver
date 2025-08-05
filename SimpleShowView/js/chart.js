var dom = document.getElementById('simplecontainer');
var buttonDom = document.getElementById('button-id');
var inputUID = document.getElementById('inputuid');
var inputFunName = document.getElementById('inputfunname');
	
buttonDom.addEventListener('click',function(){
	//初始化数据
	var funnameList =  [];
	var funname = String;
	var fundata =  [];
	var frameTotal =  [];
	
	// // 构造请求数据
	var funrowurl = 'http://10.11.145.125:8600/GetSimpleData/';  // 请求的URL
	funrowurl += inputUID.value+'/'+inputFunName.value;
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
		var resData = JSON.parse(data);
		funname = inputFunName.value;
		funnameList.push(funname);
		fundata = resData["values"];
		} catch (error) {
	    console.error('Error:', error);
		}
	}
	
	fetchframeData();//执行发送请求
	
	//获取主要总帧数  构造请求数据
	var frameurl = 'http://10.11.145.125:8600/GetFrameCount/';  // 请求的URL
	frameurl += inputUID.value;
	async function fetchframecountData() {
	  try {
	    const response = await fetch(frameurl,{method:'POST'});
	    if (!response.ok) {
	      throw new Error('Network response was not ok.');
	    }
	    const data = await response.json();
		var res = JSON.parse(data);
		var frame = res["frametotalcount"];
		for(var i=1;i<=parseInt(frame);i++){
			frameTotal.push(i.toString());
		}
	    console.log(data);
		//绘制
		var Chart = echarts.init(dom, null, {  //耗时表
		  renderer: 'canvas',
		  useDirtyRect: false
		});
		
		var app = {};
		
		var option;
		
		//函数耗时表
		option = {
		title: {
		text: '函数数据表',
		},
		tooltip: {
		trigger: 'axis'
		},
		legend: {
		data: funnameList
		},
		grid: {
		left: '3%',
		right: '4%',
		bottom: '3%',
		containLabel: true
		},
		toolbox: {
		feature: {
		  saveAsImage: {}
		}
		},
		xAxis: {
		type: 'category',
		boundaryGap: false,
		data: frameTotal
		},
		yAxis: {
		type: 'value',
		name:'value',
		},
		series: [
		{
		  name: funname,
		  type: 'line',
		  stack: 'Total',
		  data: fundata
		},
		]
		};
		
		if (option && typeof option === 'object') {
		Chart.setOption(option);
		}
		
		window.addEventListener('resize', Chart.resize);
	  } catch (error) {
	    console.error('Error:', error);
	  }
	}
	fetchframecountData();
});

	

