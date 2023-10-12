// 获取按钮元素
var spsbtn = document.getElementById("btn-id");
var casfunbtn = document.getElementById("btn2-id");
var caseflamebtn = document.getElementById("btn-search-caseflame");
var uidData = document.getElementById("uid-input");

// 添加点击事件监听器
spsbtn.addEventListener("click", function() {
    // 切换到speedcope网页
    window.location.href = "https://www.speedscope.app/";
});

// 添加点击事件监听器
casfunbtn.addEventListener("click", function() {
    // 切换到另一个页面
	if(uidData.value == ""){
		AlertError("UUID不能为空，请重新输入");
	}
	else{
		var res = GetCase(uidData.value);
		res.then(result => {
		  if(result == null || undefined){
				throw Error("null object");
		  };
		  if(result != 200){
		  	console.log(result);
		  }
		  else{
		  	window.location.href = "CaseFun.html?uuid=" + uidData.value;
		  }
		});
	}

});

function AlertError(msg) {
            // 使用 SweetAlert 替代 alert
            Swal.fire({
                title: '错误提示',
                text: msg,
                icon: 'error',
                confirmButtonText: '确定'
            });
        }

function PrintAlert(msg) {
            // 使用 SweetAlert 替代 alert
            Swal.fire({
                title: '提示',
                text: msg,
                icon: 'info',
                confirmButtonText: '确定'
            });
        }

async function GetCase(uuid){
	var url = 'http://10.11.144.31:8600/GetCase/' + uuid;  // 请求的URL;
	try {
	  const response = await fetch(url,{method:'GET',headers:
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
	  if(origindata["code"]==200){
		console.log(origindata);
	  }
	  else{
		  AlertError("当前案例不存在，请重新输入");
		  throw origindata["msg"];
	  }
	  return origindata["code"];
	  } catch (error) {
	  console.error('Error:', error);
	  }
}

async function GetFlameGragphData(uuid){
	var url = 'http://10.11.144.31:8600/GetCaseFlameGraph/' + uuid;  // 请求的URL;
	try {
	  const response = await fetch(url,{method:'GET',headers:
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
	  var resdata = origindata["msg"]["url"];
	  if(origindata["code"]==200){
		PrintAlert(resdata);
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

//添加点击事件监听器
caseflamebtn.addEventListener("click",function(){
	GetFlameGragphData(uidData.value);
});