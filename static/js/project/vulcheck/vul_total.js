function vulcheck_get_total_html(task_id) {
    filter_param = {};
    filter_temp = {};
    if(task_id)
    {
        filter_param['task_id']=task_id;
    }
    /*
    * 加载统计信息HTML页面*/
    $.ajax({
        url: 'vulcheck/get_total_html',
        dataType: "html",
        type: "get",
        async:false,
        success: function (res) {
            $('.tab-content').html(res);

            classify_by_key(filter_param);
            get_scan_list(filter_param);


        }
    });
}
let class_dir= {};
class_dir['result.value.server'] = "服务器";
class_dir['result.value.protocols'] = "端口";
class_dir['result.value.location.city'] = "城市";
class_dir['result.value.location.province'] = "省份";
class_dir['result.value.location.country_ch'] = "国家\\地区";
class_dir['result.value.language'] = "语言";
class_dir['result.value.cdn'] = "CDN";
class_dir['result.value.component'] = "组件";
function classify_by_key(filter_param) {
    /*
    * 左侧统计信息*/
    // console.log((filter_param));
    let send_data = {};
    send_data['param'] = filter_param;
    send_data = JSON.stringify(send_data);
    // send_data['param'] = "11111111111";
    $.ajax({
        url: 'vulcheck/classify_by_key',
        type: "post",
        dataType: "json",
        contentType: 'application/json;charset=utf-8',
        data: send_data,
        success: function (data) {
            // console.log(data);
            let html = ``;
            for (let key in data['data']) {
                // console.log(key);
                // console.log(data['data'][key]);
                html += `<div>
                            <div class="key-title">${class_dir[key]}</div>
                            <ul  class="key-content clearfix">`;
                for (let i in data['data'][key]) {
                    let val = data['data'][key][i]['_id']
                    html += `<li>
                                <a class="key-content-val" onclick="add_filter_param('${key}','${val}')">${val}</a> 
                                <span class="key-content-data float-right">&nbsp;&nbsp;&nbsp;${data['data'][key][i]['count']}</span>
                            </li>`;
                }
                html += `</ul></div>`;
            }

            $("#classify_list").html("").append(html);

        }
    });
}

var filter_param = {};
var filter_temp = {};

function add_filter_param(key, val) {
    filter_temp[key] = val;
    if (val.indexOf(":") !== -1) {
        let product = val.split(":")[0];
        let version = val.split(":")[1];
        let key1 = key + ".product";
        let key2 = key + ".version";
        filter_param[key1] = product;
        filter_param[key2] = version;
    } else {
        filter_param[key] = val
    }

    classify_by_key(filter_param);
    get_scan_list(filter_param);
    let filter_param_div = $("#filter_param");


    let html = ``;
    for (let i in filter_temp) {
        html += `<span onclick="remove_filter(this,'${i}')" class="label label-info">${filter_temp[i]}</span><br>`
    }
    // html += `<span onclick="remove_filter(this)" class="label label-info">${val}</span><br>`
    filter_param_div.html("").append(html);
}

function remove_filter(par,key) {
    // console.log(key);
    delete filter_param[key];
    delete filter_param[key+".product"];
    delete filter_param[key+".version"];
    delete filter_temp[key];
    // console.log(filter_param);
    $(par).remove();
    classify_by_key(filter_param);
    get_scan_list(filter_param);
}


function get_scan_list(filter_param) {
    /*
    * 加载每个IP扫描的结果信息*/

    // 获取页码刷新时的高亮显示
    var page = 1;
    if (location.hash.split('?')[1]) {
        page = location.hash.split('?')[1].split('=')[1] || 1;//获取当前页码
    }
    get_scan_list_page(page, filter_param)//刷新后退加载页码表格数据

}

$(document).off('click', '.total.pagination>ul>*').on('click', '.total.pagination>ul>*', function () {
    var page = $(this).attr('data-page'); // 获取按钮代表的页码
    get_scan_list_page(page, filter_param)//点击页码获取数据
});


function get_scan_list_page(page, filter_param) {
    let data = {
        "page": page,
        "param": filter_param,
    };
    data = JSON.stringify(data);
    $.ajax({
        url: "vulcheck/get_scan_list",
        type: "post",
        dataType: "json",
        contentType: 'application/json;charset=utf-8',
        data: data,
        success: function (res) {
            let max_page = parseInt(res['max_page']);
            let html = ``;
            for (let x in res['data']) {
                let title = res['data'][x]['result']['value']['title'] || "";
                let ip = res['data'][x]['result']['value']['ip'] || "";
                let response_headers = res['data'][x]['result']['value']['response_headers'];
                if (response_headers) {
                    response_headers = JSON.stringify(response_headers, undefined, 4);
                } else {
                    response_headers = ""
                }

                let detail = JSON.stringify(res['data'][x]);
                let b = new Base64();
                detail = b.encode(detail);
                let protocols = res['data'][x]['result']['value']['protocols'] || "";
                let save_time = res['data'][x]['result']['value']['save_time'] || "";
                // console.log(res['data'][x]['result']);
                html += `<div class="classify-content-data">
                            <div class="classify-content-data-ip">
                                <a onclick='get_total_one_detail("${detail}")'>${res['data'][x]['result']['scheme_domain']} <i class="iconfont icon-link"></i></a>
                             </div>
                             <div class="classify-content-data-content clearfix">
                                <ul class="classify-content-data-content-info float-left">
                                    <li>标题：${title}</li>
                                    <li>ip：${ip}</li>
                                    <li>端口：${protocols}</li>
                                    <li>保存时间：${save_time}</li>
                                </ul>
                                <div class="classify-content-data-content-code float-left">
                                    <pre>${response_headers}</pre>
                                </div>
                            </div>
                        </div>`;
            }
            $('.classify-content-data-all').html(html);
            addPagination(page, max_page);

        }
    })
}

function get_total_one_detail(_info) {
    /*获得单个数据的详情信息*/
    let b = new Base64();
    _info = b.decode(_info);
    // console.log(task_info);
    _info = JSON.parse(_info);
    get_total_one_detail_html();
    get_detail_html(_info);




    // get_task_detail_result(_info['task_id']);
}
function get_total_one_detail_html() {
    $.ajax({
        url: 'vulcheck/total_one_detail_html',
        dataType: "html",
        type: "get",
        async:false,
        success: function (res) {
            $('.tab-content').html(res);
        }
    });
}
function get_detail_html(info) {
    let html = ``;
    // $("#total_one_detail_div").html("").append(JSON.stringify(info,undefined,4));

    console.log(info);
    //基础信息
    $("#base_info_ip").html("").append(info['result']['value']['ip']);
    html+=`<tr><td>国家/地区</td><td>${info['result']['value']['location']['country_ch']||""}</td></tr>`;
    html+=`<tr><td>省份</td><td>${info['result']['value']['location']['province']||""}</td></tr>`;
    html+=`<tr><td>城市</td><td>${info['result']['value']['location']['city']||""}</td></tr>`;
    html+=`<tr><td>经度</td><td>${info['result']['value']['location']['lon']||""}</td></tr>`;
    html+=`<tr><td>纬度</td><td>${info['result']['value']['location']['lat']||""}</td></tr>`;
    $("#base_info_body").html("").append(html);
    //服务信息
    html =``;
    $("#base_info_server").html("").append("服务信息");
    html+=`<tr><td>操作系统</td><td>${info['result']['value']['os']||""}</td></tr>`;
    if (info['result']['value'].hasOwnProperty("server")) {
        html+=`<tr><td>服务器</td><td>${info['result']['value']['server']['product']||""}</td></tr>`;
        html+=`<tr><td>版本</td><td>${info['result']['value']['server']['version']||""}</td></tr>`;
    }
    html+=`<tr><td>端口</td><td>${info['result']['value']['protocols']||""}</td></tr>`;

    if (info['result']['value'].hasOwnProperty("language"))
    {
        let language=  "";
        for (let lang in info['result']['value']['language'] )
        {
            let product= info['result']['value']['language'][lang]['product'];
            let version= info['result']['value']['language'][lang]['version'];
            language += product+":"+version+"<br>"
        }
        html+=`<tr><td>语言</td><td>${language||""}</td></tr>`;
    }

    html+=`<tr><td>返回状态码</td><td>${info['result']['value']['status_code']||""}</td></tr>`;
    $("#base_info_server_body").html("").append(html);
    //WHOIS
    if (info['result']['value'].hasOwnProperty("whois"))
    {

        let temp_whois = info['result']['value']['whois'];
        html=``;
        for(let key in temp_whois)
        {
            html+=`<tr><td>${key}</td><td></td><td></td></tr>`;
            for(let key_ in temp_whois[key]){
                html+=`<tr><td></td><td>${key_}</td><td></td></tr>`;
                if ( Array.isArray(temp_whois[key][key_])) {
                    for (let i in temp_whois[key][key_] )
                    {
                        html+=`<tr><td></td><td></td><td>${temp_whois[key][key_][i]}</td></tr>`;
                    }
                }
                else {
                    html+=`<tr><td></td><td></td><td>${temp_whois[key][key_]}</td></tr>`;
                }
            }
        }
        $("#base_info_whois").html("").append(html);
        $("#whois_div").show();
    }

    //网站信息
    html =``;
    html+=`<tr><td>域名</td><td>${info['result']['scheme_domain']||""}</td></tr>`;
    html+=`<tr><td>URL</td><td>${info['result']['value']['url']||""}</td></tr>`;
    html+=`<tr><td>标题</td><td>${info['result']['value']['title']||""}</td></tr>`;
    html+=`<tr><td>描述</td><td>${info['result']['value']['description']||""}</td></tr>`;
    html+=`<tr><td>关键词</td><td>${info['result']['value']['keywords']||""}</td></tr>`;
    html+=`<tr><td>保存时间</td><td>${info['result']['value']['save_time']||""}</td></tr>`;
    html+=`<tr><td></td><td></td></tr>`;
    html+=`<tr><td>扫描URL总数</td><td>${info['result']['value']['statistics']['total']||""}</td></tr>`;
    html+=`<tr><td>URL_LIST</td><td></td></tr>`;
    for (let i in info['result']['value']['statistics']['urls'])
    {
        let url = info['result']['value']['statistics']['urls'][i];
        // console.log(url);
        html+=`<tr><td></td></td><td>${url||""}</td></tr>`;
    }
    $("#web_info_body").html("").append(html);

    //网站相应信息
    if (info['result']['value'].hasOwnProperty("response_headers")) {
        html = ``;
        for (let key in info['result']['value']['response_headers'])
        {
            html+=`<tr><td>${key}</td><td>${info['result']['value']['response_headers'][key]||""}</td></tr>`;
        }
        $("#web_response_info").html("").append(html);
        $("#web_response_info_div").show();

    }

    //漏洞信息
    if (info['result']['value'].hasOwnProperty("vulnerables")) {
        html = ``;
        for(let i in info['result']['value']['vulnerables'])
        {
            html+=`            <div class="row"  >
                <table class="table table-condensed">
                    <caption >${info['result']['value']['vulnerables'][i]['name']||""}</caption>
                    <tbody >
                    <tr><td>存在漏洞的URL</td><td>${info['result']['value']['vulnerables'][i]['url']||""}</td></tr>
                    <tr><td>插件名称或POC名称</td><td>${info['result']['value']['vulnerables'][i]['plugin_name']||""}</td></tr>
                    <tr><td>FUZZ测试时的请求头部:host</td><td>${info['result']['value']['vulnerables'][i]['headers']['host']||""}</td></tr>
                    <tr><td>FUZZ测试时的请求头部:Referer</td><td>${info['result']['value']['vulnerables'][i]['headers']['Referer']||""}</td></tr>
                    <tr><td>存在漏洞的变量</td><td>${info['result']['value']['vulnerables'][i]['variable']||""}</td></tr>
                    <tr><td>漏洞结果描述</td><td>${info['result']['value']['vulnerables'][i]['result_desc']||""}</td></tr>
                    <tr><td>fuzz测试构造的payload</td><td>${info['result']['value']['vulnerables'][i]['payload']||""}</td></tr>
                    <tr><td>请求方法</td><td>${info['result']['value']['vulnerables'][i]['method']||""}</td></tr>
                    <tr><td>漏洞严重等级</td><td>${info['result']['value']['vulnerables'][i]['severity']||""}</td></tr>
                    </tbody>
                </table>
            </div>`;
        }
        $("#vulnerables_div").html("").append(html);
    }

    //违法信息 illegality
    if (info['result']['value'].hasOwnProperty("illegality")) {
        html = ``;
        for(let i in info['result']['value']['illegality'])
        {
            html+=`            <div class="row"  >
                <table class="table table-condensed">
                    <caption >${info['result']['value']['illegality'][i]['name']||""}</caption>
                    <tbody >
                    <tr><td>存在问题的URL</td><td>${info['result']['value']['illegality'][i]['url']||""}</td></tr>
                    <tr><td>插件名称或POC名称</td><td>${info['result']['value']['illegality'][i]['plugin_name']||""}</td></tr>
                    <tr><td>FUZZ测试时的请求头部:host</td><td>${info['result']['value']['illegality'][i]['headers']['host']||""}</td></tr>
                    <tr><td>FUZZ测试时的请求头部:Referer</td><td>${info['result']['value']['illegality'][i]['headers']['Referer']||""}</td></tr>
                    <tr><td>请求方法</td><td>${info['result']['value']['illegality'][i]['method']||""}</td></tr>
                    <tr><td>漏洞严重等级</td><td>${info['result']['value']['illegality'][i]['severity']||""}</td></tr>
                    <tr><td>敏感关键词类型</td><td>${info['result']['value']['illegality'][i]['type']||""}</td></tr>
                    <tr><td>敏感关键词截取片段</td><td>${info['result']['value']['illegality'][i]['segment']||""}</td></tr>
                    <tr><td>敏感关键词内容</td><td>${info['result']['value']['illegality'][i]['value']||""}</td></tr>
                    <tr><td>网页挂马类型</td><td>${info['result']['value']['illegality'][i]['type']||""}</td></tr>
                    <tr><td>网页挂马名称</td><td>${info['result']['value']['illegality'][i]['display']||""}</td></tr>
                    <tr><td>网页挂马截取片段</td><td>${info['result']['value']['illegality'][i]['value']||""}</td></tr>
                    <tr><td>网页劫持源地址</td><td>${info['result']['value']['illegality'][i]['orig_url']||""}</td></tr>
                    <tr><td>网页劫持跳转地址</td><td>${info['result']['value']['illegality'][i]['redirect_url']||""}</td></tr>
              
                    </tbody>
                </table>
            </div>`;
        }
        $("#illegality_div").html("").append(html);
    }
}