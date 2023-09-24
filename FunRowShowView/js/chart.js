var timedom = document.getElementById('timecontainer');
var gcdom = document.getElementById('gccontainer');
var calldom = document.getElementById('callcontainer');
var buttonDom = document.getElementById('button-id');
var inputUID = document.getElementById('inputuid');
var inputFunName = document.getElementById('inputfunname');
	
buttonDom.addEventListener('click',function(){
	//初始化数据
	var funnameList =  [];
	var funname = String;
	var funtimedata =  [];
	var funselftimedata = [];
	var fungcdata = [];
	var funcalldata = [];
	var frameTotal =  [];
	
	// // 构造请求数据
	var funrowurl = 'http://10.11.144.31:8600/GetFunRow/';  // 请求的URL
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
		funnameList.push('(SelfTime)'+funname);
		var allsubFrames = resData["frames"];
		for(var i=0; i < allsubFrames.length;i++)
		{
			funtimedata.push(allsubFrames[i]["timems"] / 100);
			funselftimedata.push(allsubFrames[i]["selfms"] / 100);
			fungcdata.push(allsubFrames[i]["gcalloc"] / 100);
			funcalldata.push(allsubFrames[i]["calls"] / 100);
		}
		} catch (error) {
	    console.error('Error:', error);
		}
	}
	
	fetchframeData();//执行发送请求
	
	//获取主要总帧数  构造请求数据
	var frameurl = 'http://10.11.144.31:8600/GetFrameCount/';  // 请求的URL
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
		title: {
		text: '函数耗时表',
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
		name:'单位:ms'
		},
		series: [
		{
		  name: funname,
		  type: 'line',
		  stack: 'Total',
		  data: funtimedata
		},
		{
		  name: '(SelfTime)'+funname,
		  type: 'line',
		  stack: 'Total',
		  data: funselftimedata
		},
		]
		};
		
		//gc表(KB)
		gcoption = {
		title: {
		text: '函数GC表',
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
		name:'单位:KB'
		},
		series: [
		{
		  name: funname,
		  type: 'line',
		  stack: 'Total',
		  data: fungcdata
		},
		]
		};
		
		//gc表(KB)
		calloption = {
		title: {
		text: '函数Calls表',
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
		name:'单位:次数'
		},
		series: [
		{
		  name: funname,
		  type: 'line',
		  stack: 'Total',
		  data: funcalldata
		},
		]
		};
		
		if (option && typeof option === 'object') {
		timeChart.setOption(option);
		}
		if (gcoption && typeof gcoption === 'object') {
		gcChart.setOption(gcoption);
		}
		if (calloption && typeof calloption === 'object') {
		callChart.setOption(calloption);
		}
		
		window.addEventListener('resize', timeChart.resize);
		window.addEventListener('resize', gcChart.resize);
		window.addEventListener('resize', callChart.resize);
	  } catch (error) {
	    console.error('Error:', error);
	  }
	}
	fetchframecountData();
});

	

