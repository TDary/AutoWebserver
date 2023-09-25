// 获取按钮元素
var spsbtn = document.getElementById("btn-id");
var casfunbtn = document.getElementById("btn2-id");

// 添加点击事件监听器
spsbtn.addEventListener("click", function() {
    // 切换到speedcope网页
    window.location.href = "https://www.speedscope.app/";
});

// 添加点击事件监听器
casfunbtn.addEventListener("click", function() {
    // 切换到另一个页面
    window.location.href = "CaseFun.html";
});
