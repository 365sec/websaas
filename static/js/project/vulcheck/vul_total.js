function vulcheck_get_total_html(task_id) {
    filter_param = {};
    filter_temp = {};
    if(task_id)
    {
         filter_param['task_id']=task_id;
         document.title = '扫描任务信息';
    }
    else{
         document.title = '总览';

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
            // 更改title
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
class_dir['result.value.illegality.plugin_name'] = "非法信息";
class_dir['result.value.vulnerables.plugin_name'] = "检查插件";
class_dir['result.value.illegal_feature.name'] = "网站类型";
function classify_by_key(filter_param) {
    /*
    * 左侧统计信息*/
    // console.log((filter_param));
    let send_data = {};
    send_data['param'] = filter_param;
    let  data = get_classify_by_key(send_data);
    let html = ``;
    for (let key in data['data']) {
        // console.log(key);
        // console.log(data['data'][key]);
        html += `<div>
                            <div class="key-title">${class_dir[key]}</div>
                            <ul  class="key-content clearfix">`;
        for (let i in data['data'][key]) {
            let val = data['data'][key][i]['_id'];
            html += `<li>
                                <a class="key-content-val" onclick="add_filter_param('${key}','${val}')">${val}</a> 
                                <span class="key-content-data float-right">&nbsp;&nbsp;&nbsp;${data['data'][key][i]['count']}</span>
                            </li>`;
        }
        html += `</ul></div>`;
    }

    $("#classify_list").html("").append(html);
}

function get_classify_by_key(send_data) {

    /*
   * 左侧统计信息*/
    let return_data;
    send_data = JSON.stringify(send_data);
    $.ajax({
        url: 'vulcheck/classify_by_key',
        type: "post",
        dataType: "json",
        contentType: 'application/json;charset=utf-8',
        data: send_data,
        async:false,
        success: function (data) {
            return_data = data;
        }
    });

    return return_data;
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
        html += `<span class="label-fliter">${filter_temp[i]}<i class="iconfont icon-del" onclick="remove_filter(this,'${i}')"></i></span>`
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
    $(par).parent().remove();
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
            console.log(res);
            let html = get_scan_list_page_html(res);
            $('.classify-content-data-all').html(html);
            addPagination(page, max_page);
            //设置右侧最小高度，使中间分割线撑满
            // console.log($('#classify_list').height())
            // $('.classify-content-data-all').css('min-height',$('#classify_list').height())
        }
    })
}
function get_scan_val_iil_list_page(filter_param) {
    let data = {
        "param": filter_param,
    };
    data = JSON.stringify(data);
    $.ajax({
        url: "vulcheck/get_scan_vul_iil_domain_list",
        type: "post",
        dataType: "json",
        contentType: 'application/json;charset=utf-8',
        data: data,
        success: function (res) {
            console.log(res)
            for (let i in res['data'])
            {
                res['data'][i]['result'] = res['data'][i]['result'][0]
            }
            let html = get_scan_list_page_html(res);
            $('#report_vul_ill_list').html(html);

        }
    })
}
function get_scan_list_page_html(res) {
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
        // console.log(res['data'][x]['result']['value']);
        let country =""
        if (res['data'][x]['result']['value'].hasOwnProperty('location'))
        {
            country = res['data'][x]['result']['value']['location']['country_ch'] || "";
        }
        let protocols = res['data'][x]['result']['value']['protocols'] || "";

        let save_time = res['data'][x]['result']['value']['save_time'] || "";
        let vulnerables = res['data'][x]['result']['value']['vulnerables'] || [];
        let illegality = res['data'][x]['result']['value']['illegality'] || [];
        let vul_html =``;

        if (vulnerables.length>0)
        {
            vul_html =`<li>插件扫描：${vulnerables.length}</li>`;
            let vul_reduce = vulnerables.reduce(function (prev,res) {
                if(prev.hasOwnProperty(res['name']))
                {
                    prev[res['name']]++;
                }
                else {
                    prev[res['name']]=1;
                }
                return prev
            },{});
            for( let i in vul_reduce)
            {
                vul_html +=`<li style="color: red">${i}: ${vul_reduce[i]}</li'>`;
            }
        }
        let ill_html =``;
        if (illegality.length>0)
        {
            ill_html =`<li>非法信息：${illegality.length}</li>`;

            let ill_reduce = illegality.reduce(function (prev,res) {
                if(prev.hasOwnProperty(res['name']))
                {
                    prev[res['name']]++;
                }
                else {
                    prev[res['name']]=1;
                }
                return prev
            },{});
            for( let i in ill_reduce)
            {
                ill_html +=`<li style="color: red">${i}: ${ill_reduce[i]}</li'>`;
            }
        }

        // console.log(res['data'][x]['result']);
        html += `<div class="classify-content-data">
                            <div class="classify-content-data-ip">
                                <a onclick='get_total_one_detail("${detail}")'>${res['data'][x]['result']['scheme_domain']} <i class="iconfont icon-link"></i></a>
                             </div>
                             <div class="classify-content-data-content clearfix">
                                <ul class="classify-content-data-content-info float-left">
                                    <li>标题：${title}</li>
                                    <li>ip：${ip}</li>
                                    <li>国家/地区：${country}</li>
                                    <li>端口：${protocols}</li>
                                    <li>保存时间：${save_time}</li>
                                    ${vul_html}
                                    ${ill_html}
                                </ul>
                                <div class="classify-content-data-content-code float-left">
                                    <pre>${response_headers}</pre>
                                </div>
                            </div>
                        </div>`;
    }

    return html
}
function get_scan_list_page_report_html(res) {
    let html = ``;
    for (let x in res['data']) {
        let title = res['data'][x]['result'][0]['value']['title'] || "";
        let ip = res['data'][x]['result'][0]['value']['ip'] || "";
        let response_headers = res['data'][x]['result'][0]['value']['response_headers'];
        if (response_headers) {
            response_headers = JSON.stringify(response_headers, undefined, 4);
        } else {
            response_headers = ""
        }

        let detail = JSON.stringify(res['data'][x]);
        let b = new Base64();
        detail = b.encode(detail);
        let protocols = res['data'][x]['result'][0]['value']['protocols'] || "";
        let save_time = res['data'][x]['result'][0]['value']['save_time'] || "";
        let vulnerables = res['data'][x]['result'][0]['value']['vulnerables'] || [];
        let illegality = res['data'][x]['result'][0]['value']['illegality'] || [];
        let vul_html =``;

        if (vulnerables.length>0)
        {
            vul_html =`<li>插件扫描：${vulnerables.length}</li>`;
            let vul_reduce = vulnerables.reduce(function (prev,res) {
                if(prev.hasOwnProperty(res['name']))
                {
                    prev[res['name']]++;
                }
                else {
                    prev[res['name']]=1;
                }
                return prev
            },{});
            for( let i in vul_reduce)
            {
                vul_html +=`<li style="color: red">${i}: ${vul_reduce[i]}</li'>`;
            }
        }
        let ill_html =``;
        if (illegality.length>0)
        {
            ill_html =`<li>非法信息：${illegality.length}</li>`;

            let ill_reduce = illegality.reduce(function (prev,res) {
                if(prev.hasOwnProperty(res['name']))
                {
                    prev[res['name']]++;
                }
                else {
                    prev[res['name']]=1;
                }
                return prev
            },{});
            for( let i in ill_reduce)
            {
                ill_html +=`<li style="color: red">${i}: ${ill_reduce[i]}</li'>`;
            }
        }

        // console.log(res['data'][x]['result']);
        html += `<div class="classify-content-data">
                            <div class="classify-content-data-ip">
                                <a onclick='get_total_one_detail("${detail}")'>${res['data'][x]['result'][0]['scheme_domain']} <i class="iconfont icon-link"></i></a>
                             </div>
                             <div class="classify-content-data-content clearfix">
                                <ul class="classify-content-data-content-info float-left">
                                    <li>标题：${title}</li>
                                    <li>ip：${ip}</li>
                                    <li>端口：${protocols}</li>
                                    <li>保存时间：${save_time}</li>
                                    ${vul_html}
                                    ${ill_html}
                                </ul>
                                <div class="classify-content-data-content-code float-left">
                                    <pre>${response_headers}</pre>
                                </div>
                            </div>
                        </div>`;
    }

    return html
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
    // history.pushState(null,null,location.href+ '&ip='+ info['result']['value']['ip']);

    let html = ``;
    // $("#total_one_detail_div").html("").append(JSON.stringify(info,undefined,4));

    console.log(info);
    //基础信息
    $("#base_info_ip").html("").append(info['result']['value']['ip']||"");
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">国家/地区</div>
                <div class="columnT-tr-right">${info['result']['value']['location']['country_ch']||""}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">省份</div>
                <div class="columnT-tr-right">${info['result']['value']['location']['province']||""}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">城市</div>
                <div class="columnT-tr-right">${info['result']['value']['location']['city']||""}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">经度</div>
                <div class="columnT-tr-right">${info['result']['value']['location']['lon']||""}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">纬度</div>
                <div class="columnT-tr-right">${info['result']['value']['location']['lat']||""}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
    $("#base_info_body").html("").append(html);
    //服务信息
    html =``;
    $("#base_info_server").html("").append("服务信息");
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">操作系统</div>
                <div class="columnT-tr-right">${info['result']['value']['os']||""}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
    if (info['result']['value'].hasOwnProperty("server")) {
        html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">服务器</div>
                <div class="columnT-tr-right">${info['result']['value']['server']['product']||""}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
        html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">版本</div>
                <div class="columnT-tr-right">${info['result']['value']['server']['version']||""}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
    }
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">端口</div>
                <div class="columnT-tr-right">${info['result']['value']['protocols']||""}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;

    if (info['result']['value'].hasOwnProperty("language"))
    {
        let language=  "";
        for (let lang in info['result']['value']['language'] )
        {
            let product= info['result']['value']['language'][lang]['product'];
            let version= info['result']['value']['language'][lang]['version'];
            language += product+":"+version+"<br>"
        }
        html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">语言</div>
                <div class="columnT-tr-right">${language||""}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
    }

    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">返回状态码</div>
                <div class="columnT-tr-right">${info['result']['value']['status_code']||""}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
    $("#base_info_server_body").html("").append(html);
    //WHOIS
    if (info['result']['value'].hasOwnProperty("whois"))
    {
        let temp_whois = info['result']['value']['whois'];
        html=``;
        for(let key in temp_whois)
        {
            html+=`<div  class="columnT-tr clearfix">
                                <div class="columnT-tr-left">${key}</div>
                                <div class="columnT-tr-right">`;
            for(let key_ in temp_whois[key]){
                if ( Array.isArray(temp_whois[key][key_])) {
                    for (let i in temp_whois[key][key_] )
                    {
                        html+=`<div>${temp_whois[key][key_][i]}</div>`;
                    }
                }
                else {
                    html+=`<div>${temp_whois[key][key_]}</div>`;
                }
            }
            html+=    `</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;

        }
        $("#base_info_whois").html("").append(html);
        $("#whois_div").show();

    }

    //网站信息
    html =``;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">域名</div>
                <div class="columnT-tr-right">${info['result']['scheme_domain']||""}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">URL</div>
                <div class="columnT-tr-right">${info['result']['value']['url']||""}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">标题</div>
                <div class="columnT-tr-right">${info['result']['value']['title']||""}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">描述</div>
                <div class="columnT-tr-right">${info['result']['value']['description']||""}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">关键词</div>
                <div class="columnT-tr-right">${info['result']['value']['keywords']||""}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">保存时间</div>
                <div class="columnT-tr-right">${info['result']['value']['save_time']||""}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">扫描URL总数</div>
                <div class="columnT-tr-right">${info['result']['value']['statistics']['total']||""}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">URL_LIST</div>
                <div class="columnT-tr-right">
                `;
    for (let i in info['result']['value']['statistics']['urls'])
    {
        let url = info['result']['value']['statistics']['urls'][i];
        // console.log(url);
        html+=`<div>${url||""}</div>`;
    }
    
    html+=`    </div>
                <div class="columnT-tip">点击展开</div>

            </div>`;

    $("#web_info_body").html("").append(html);

    //网站相应信息
    if (info['result']['value'].hasOwnProperty("response_headers")) {
        html = ``;
        for (let key in info['result']['value']['response_headers'])
        {
            html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">${key}</div>
                <div class="columnT-tr-right">${info['result']['value']['response_headers'][key]||""}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
        }
        $("#web_response_info").html("").append(html);
        $("#web_response_info_div").show();

    }

    //漏洞信息
    if (info['result']['value'].hasOwnProperty("vulnerables")) {
        html = ``;
        for(let i in info['result']['value']['vulnerables'])
        {
            html+=`<div class="columnT-sec">
                    <div class="columnT-sec-title">
                        <span>${info['result']['value']['vulnerables'][i]['name']||""}</span>
                        <i class="iconfont icon-arrow"></i>
                    </div>
                    <div class="columnT-sec-content">
                            <div class="columnT">
                                <div class="columnT-tr clearfix">
                                    <div class="columnT-tr-left">存在漏洞的URL</div>
                                    <div class="columnT-tr-right">${info['result']['value']['vulnerables'][i]['url']||""}</div>
                                    <div class="columnT-tip">点击展开</div>
                                </div>
                                <div class="columnT-tr clearfix">
                                    <div class="columnT-tr-left">插件名称或POC名称</div>
                                    <div class="columnT-tr-right">${info['result']['value']['vulnerables'][i]['plugin_name']||""}</div>
                                    <div class="columnT-tip">点击展开</div>
                                </div>
                                <div class="columnT-tr clearfix">
                                    <div class="columnT-tr-left">FUZZ测试时的请求头部:host</div>
                                    <div class="columnT-tr-right">${info['result']['value']['vulnerables'][i]['headers']['host']||""}</div>
                                    <div class="columnT-tip">点击展开</div>
                                </div>
                                <div class="columnT-tr clearfix">
                                    <div class="columnT-tr-left">FUZZ测试时的请求头部:Referer</div>
                                    <div class="columnT-tr-right">${info['result']['value']['vulnerables'][i]['headers']['Referer']||""}</div>
                                    <div class="columnT-tip">点击展开</div>
                                </div>
                                <div class="columnT-tr clearfix">
                                    <div class="columnT-tr-left">存在漏洞的变量</div>
                                    <div class="columnT-tr-right">${info['result']['value']['vulnerables'][i]['variable']||""}</div>
                                    <div class="columnT-tip">点击展开</div>
                                </div>
                                 <div class="columnT-tr clearfix">
                                    <div class="columnT-tr-left">漏洞结果描述</div>
                                    <div class="columnT-tr-right">${info['result']['value']['vulnerables'][i]['variable']||""}</div>
                                    <div class="columnT-tip">${info['result']['value']['vulnerables'][i]['result_desc']||""}</div>
                                </div> 
                                <div class="columnT-tr clearfix">
                                    <div class="columnT-tr-left">fuzz测试构造的payload</div>
                                    <div class="columnT-tr-right">${info['result']['value']['vulnerables'][i]['payload']||""}</div>
                                    <div class="columnT-tip">点击展开</div>
                                </div> 
                                <div class="columnT-tr clearfix">
                                    <div class="columnT-tr-left">请求方法</div>
                                    <div class="columnT-tr-right">${info['result']['value']['vulnerables'][i]['method']||""}</div>
                                    <div class="columnT-tip">点击展开</div>
                                </div> 
                                <div class="columnT-tr clearfix">
                                    <div class="columnT-tr-left">漏洞严重等级</div>
                                    <div class="columnT-tr-right">${info['result']['value']['vulnerables'][i]['severity']||""}</div>
                                    <div class="columnT-tip">点击展开</div>
                                </div>
                            </div>
                </div>`;
        }
        $("#vulnerables_div").show();
        $("#vulnerables_info").html("").append(html);
    }

    //违法信息 illegality
    if (info['result']['value'].hasOwnProperty("illegality")) {
        html = ``;
        for(let i in info['result']['value']['illegality'])
        {
            let temp_html = ``;
            if (info['result']['value']['illegality'][i]['plugin_name']==="keywords")
            {
                let type = "";
                let segment = "";
                let value = "";
                for (let j in info['result']['value']['illegality'][i]['value']) {
                    type +=info['result']['value']['illegality'][i]['value'][j]['type']+"&nbsp;";
                    for(let z in info['result']['value']['illegality'][i]['value'][j]['keyword_list'])
                    {
                        segment+=info['result']['value']['illegality'][i]['value'][j]['keyword_list'][z]['segment']+"&nbsp;";
                        value+=info['result']['value']['illegality'][i]['value'][j]['keyword_list'][z]['value']+"&nbsp;";
                    }
                }
                temp_html+=`
                        <div class="columnT-tr clearfix">
                            <div class="columnT-tr-left">敏感关键词类型</div>
                            <div class="columnT-tr-right">${type||""}</div>
                            <div class="columnT-tip">点击展开</div>
                        </div>
                        <div class="columnT-tr clearfix">
                            <div class="columnT-tr-left">敏感关键词截取片段</div>
                            <div class="columnT-tr-right">${segment||""}</div>
                            <div class="columnT-tip">点击展开</div>
                        </div>
                        <div class="columnT-tr clearfix">
                            <div class="columnT-tr-left">敏感关键词内容</div>
                            <div class="columnT-tr-right">${value||""}</div>
                            <div class="columnT-tip">点击展开</div>
                        </div>`;
            }else if(info['result']['value']['illegality'][i]['plugin_name']==="trojanhorse")
            {
                let type = "";
                let display = "";
                let value = "";
                for (let j in info['result']['value']['illegality'][i]['value']) {
                    type +=info['result']['value']['illegality'][i]['value'][j]['type']+"&nbsp;";
                    for(let z in info['result']['value']['illegality'][i]['value'][j]['keyword_list'])
                    {
                        display+=info['result']['value']['illegality'][i]['value'][j]['keyword_list'][z]['display']+"&nbsp;";
                        value+=info['result']['value']['illegality'][i]['value'][j]['keyword_list'][z]['value']+"&nbsp;";
                    }
                }
                temp_html+=`
                        <div class="columnT-tr clearfix">
                            <div class="columnT-tr-left">网页挂马类型</div>
                            <div class="columnT-tr-right">${type||""}</div>
                            <div class="columnT-tip">点击展开</div>
                        </div>
                        <div class="columnT-tr clearfix">
                            <div class="columnT-tr-left">网页挂马名称</div>
                            <div class="columnT-tr-right">${display||""}</div>
                            <div class="columnT-tip">点击展开</div>
                        </div>
                        <div class="columnT-tr clearfix">
                            <div class="columnT-tr-left">网页挂马截取片段</div>
                            <div class="columnT-tr-right">${value||""}</div>
                            <div class="columnT-tip">点击展开</div>
                        </div>
                `;

            }else if (info['result']['value']['illegality'][i]['plugin_name']==="domain_hijack")
            {
                temp_html+=`<div class="columnT-tr clearfix">
                            <div class="columnT-tr-left">网页劫持源地址</div>
                            <div class="columnT-tr-right">${info['result']['value']['illegality'][i]['orig_url']||""}</div>
                            <div class="columnT-tip">点击展开</div>
                        </div>
                        <div class="columnT-tr clearfix">
                            <div class="columnT-tr-left">网页劫持跳转地址</div>
                            <div class="columnT-tr-right">${info['result']['value']['illegality'][i]['redirect_url']||""}</div>
                            <div class="columnT-tip">点击展开</div>
                        </div>`;
            }

            html+=`<div class="columnT-sec">
                    <div class="columnT-sec-title">
                        <span>${info['result']['value']['illegality'][i]['name']||""}</span>
                        <i class="iconfont icon-arrow"></i>
                    </div>
                    <div class="columnT-sec-content">
                        <div class="columnT-tr clearfix">
                            <div class="columnT-tr-left">存在问题的URL</div>
                            <div class="columnT-tr-right">${info['result']['value']['illegality'][i]['url']||""}</div>
                            <div class="columnT-tip">点击展开</div>
                        </div>
                        <div class="columnT-tr clearfix">
                            <div class="columnT-tr-left">插件名称或POC名称</div>
                            <div class="columnT-tr-right">${info['result']['value']['illegality'][i]['plugin_name']||""}</div>
                            <div class="columnT-tip">点击展开</div>
                        </div>
                        <div class="columnT-tr clearfix">
                            <div class="columnT-tr-left">FUZZ测试时的请求头部:host</div>
                            <div class="columnT-tr-right">${info['result']['value']['illegality'][i]['plugin_name']||""}</div>
                            <div class="columnT-tip">点击展开</div>
                        </div>
                        <div class="columnT-tr clearfix">
                            <div class="columnT-tr-left">FUZZ测试时的请求头部:Referer</div>
                            <div class="columnT-tr-right">${info['result']['value']['illegality'][i]['plugin_name']||""}</div>
                            <div class="columnT-tip">点击展开</div>
                        </div>
                        <div class="columnT-tr clearfix">
                            <div class="columnT-tr-left">请求方法</div>
                            <div class="columnT-tr-right">${info['result']['value']['illegality'][i]['method']||""}</div>
                            <div class="columnT-tip">点击展开</div>
                        </div>
                        <div class="columnT-tr clearfix">
                            <div class="columnT-tr-left">漏洞严重等级</div>
                            <div class="columnT-tr-right">漏洞严重等级</td><td>${info['result']['value']['illegality'][i]['severity']||""}</div>
                            <div class="columnT-tip">点击展开</div>
                        </div>
                        ${temp_html}
                    </div>
                    </td>
                </div>`;
        }
        $("#illegality_div").show();
        $("#illegality_info").html("").append(html);


    }
    //高度过高数据缩放
    columnSlide();
    // 地图
    getMap(info['result']['value']['location']['lon'],info['result']['value']['location']['lat'],'map-canvas');
}
// 地图
function getMap(x,y,div) {
    var map = new BMap.Map(div);            // 创建Map实例
    var point = new BMap.Point(x,y); // 创建点坐标
    map.centerAndZoom(point,17);
    map.enableScrollWheelZoom();
    var marker = new BMap.Marker(point);        // 创建标注
    map.addOverlay(marker);                     // 将标注添加到地图中

}
//二级嵌套table展开缩放
$(document).on('click','.columnT-sec-title',function () {
    $(this).next().slideToggle();
    $(this).find('i').toggleClass('iconRotate');
});

