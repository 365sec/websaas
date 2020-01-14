


var tAjax = function(config) {
    var url      = config.url;
    var complete = config.complete;
    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('post', url);

    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    // xhr.onreadystatechange = function() {
    //     if (xhr.readyState === 4) {
    //         if (xhr.status === 200) {
    //             complete(xhr.responseText);
    //         }
    //     }
    // };

    console.log(xhr);
    xhr.send();
    console.log(xhr);
};
function test_auto()
{
    config = {"url":"tAjax_","complete":function (data) {
            // console.log(data)
        }};
    // tAjax(config);
    console.log("test_auto run");


    // $.ajax({
    //     url: "########123132#####",
    //     type: "get",
    //     async: false,
    //     processData: false,
    //     contentType: false,
    //     success: function (data) {
    //         // console.log(data);
    //         // res = data
    //
    //     }
    // });
    $("#test_auto").append("<a href='http://www.baidu.com333333333' >baidu0000000000000</a><br>");
}
function qqqqq() {

    console.log("run test auto")
}
// test_auto();
// _tokenTaintTracer.initialize({"XMLHttpRequest.prototype":"open"});


// (function(xhr){
//     var req = new XMLHttpRequest();
//     XMLHttpRequest.prototype.open = function(method,url){
//         if(true){  // 成立的情况，原样发送
//             console.log("111111111");
//             req.prototype.open = this.xhr.open;
//             xhr.open(method,url);
//         }
//         else{   // 不成立的时候，进行拦截处理
//             //  处理函数
//         }
//     }
// })(window.XMLHttpRequest);


// console.log( _tokenTaintTracer);

function test_click()
{
    $("#test_auto").append("<a href='http://www.baidu.com44444444444' >baidu11111</a><br>");

    // test_auto();
    //
    // let res;
    // // XMLHttpRequest.prototype.open("get","####");
    $.get("test.php", { name:"Donald", town:"Ducktown" });
    $.post("test.php", { name:"Donald", town:"Ducktown" }, dataType="json");
    $.ajax({
        url: "/test_get_ajax",
        data:{"name":"xiao", "age":10},
        type: "get",
        async: false,
        // processData: false,
        // contentType: false,
        success: function (data) {
            // console.log(data);
            // res = data

        }
    });
    $.ajax({
        url: "/test_post_ajax",
        data:{"name":"xiao", "age":10},
        type: "post",
        async: false,
        // processData: false,
        // contentType: false,
        success: function (data) {
            // console.log(data);
            // res = data

        }
    });
    $.ajax({
        url: "/test_post_ajax_2",
        type: "post",
        async: false,
        // processData: false,
        //contentType: false,
        dataType:'text',
        contentType:'application/json;charset=utf-8',
        data:JSON.stringify({"name":"xiao", "age":10}) ,
        success: function (data) {
            // console.log(data);
            // res = data

        }
    });

}

