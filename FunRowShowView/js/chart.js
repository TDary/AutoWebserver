var timedom = document.getElementById('timecontainer');
var gcdom = document.getElementById('gccontainer');
var calldom = document.getElementById('callcontainer');
var buttonDom = document.getElementById('button-id');
var inputUID = document.getElementById('inputuid');
var inputFunName = document.getElementById('inputfunname');
	
buttonDom.addEventListener('click',function(){
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
		//初始化数据
		var funnameList = [];
		var funname = String;
		var funtimedata = [];
		var funselftimedata = [];
		var fungcdata = [];
		var funcalldata = [];
		
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
	
	//获取主要总帧数  构造请求数据
	var frameurl = 'http://10.11.144.31:8600/GetFrameCount/';  // 请求的URL
	frameurl += inputUID.value;
	async function fetchframecountData(inputdata) {
	  try {
	    const response = await fetch(frameurl,{method:'POST'});
	    if (!response.ok) {
	      throw new Error('Network response was not ok.');
	    }
	    const data = await response.json();
		//初始化
		var frameTotal = [];

		
		var res = JSON.parse(data);
		var frame = res["frametotalcount"];
		for(var i=1;i<=parseInt(frame);i++){
			frameTotal.push(i.toString());
		}
		
	    console.log(data);
		
		inputdata.then(result => {
			// var funnameList = [];
			// var funname = String;
			// var funtimedata = [];
			// var funselftimedata = [];
			// var fungcdata = [];
			// var funcalldata = [];
			
			// funnameList = result.prop1;
			// funname = result.prop2;
		 //    funtimedata = result.prop3;
		 //    funselftimedata = result.prop4;
		 //    fungcdata = result.prop5;
		 //    funcalldata = result.prop6;
			
		 //  console.log(funnameList);
		 //  console.log(funname);
		 //  console.log(funtimedata);
		 //  console.log(funselftimedata);
		 //  console.log(fungcdata);
		 //  console.log(funcalldata);
		  
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
		  data: result.prop1
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
		    name: result.prop2,
		    type: 'line',
		    stack: 'Total',
		    data: result.prop3
		  },
		  {
		    name: '(SelfTime)'+result.prop2,
		    type: 'line',
		    stack: 'Total',
		    data: result.prop4
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
		  data: result.prop1
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
		    name: result.prop2,
		    type: 'line',
		    stack: 'Total',
		    data: result.prop5
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
		  data: result.prop1
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
		    name: result.prop2,
		    type: 'line',
		    stack: 'Total',
		    data: result.prop6
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

	

