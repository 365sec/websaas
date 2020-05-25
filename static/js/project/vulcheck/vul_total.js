function vulcheck_get_total_html(task_id) {
    filter_param = {};
    filter_temp = {};
    let url ="";
    if(task_id)
    {
         filter_param['task_id']=task_id;
         document.title = '扫描任务信息';
         url = "vulcheck/task_detial_html"
    }
    else{
         document.title = '总览';
        url = "vulcheck/get_total_html"

    }
    /*
    * 加载统计信息HTML页面*/
    $.ajax({
        url: url,
        dataType: "html",
        type: "get",
        async:false,
        success: function (res) {
            $('.right-content').html(res);
            // 更改title
            classify_by_key(filter_param);

            if (task_id)
            {
                get_scan_task_list(filter_param)
            }
            else
            {
                get_scan_list(filter_param);
            }


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
    // console.log(data);
    let temp_list =[];
    let language = data['data']["language"].reduce(function (prev,item) {
        let key = item['_id'].split(":")[0];
        let version = item['_id'].split(":")[1]||"";
        let count = item['count'];
        if (prev.hasOwnProperty(key))
        {
            prev[key]['count']+=count;
            prev[key]['data'].push([version,count]);
        }
        else
        {
            let res = {};
            res['count'] = count;
            res['data'] = [];
            res['data'].push([version,count]);
            prev[key] = res;
        }
        return prev
    },{});
    let server = data['data']["server"].reduce(function (prev,item) {
        let key = item['_id'].split(":")[0];
        let version = item['_id'].split(":")[1]||"-";
        let count = item['count'];
        if (prev.hasOwnProperty(key))
        {
            prev[key]['count']+=count;
            prev[key]['data'].push([version,count]);
        }
        else
        {
            let res = {};
            res['count'] = count;
            res['data'] = [];
            res['data'].push([version,count]);
            prev[key] = res;
        }
        return prev
    },{});
    // console.log(server);
    // console.log(language);
    let temp_list1 = [];
    temp_list1.push({"result.value.language":language});
    temp_list1.push({"result.value.server":server});
    // temp_list.push({"result.value.location.country_ch":data['data']["result.value.location.country_ch"]});
    // temp_list.push({"result.value.location.province":data['data']["result.value.location.province"]});
    // temp_list.push({"result.value.location.city":data['data']["result.value.location.city"]});
    // temp_list.push({"result.value.server":data['data']["result.value.server"]});
    temp_list.push({"result.value.protocols":data['data']["protocols"]});
    // temp_list.push({"result.value.language":data['data']["result.value.language"]});
    temp_list.push({"result.value.cdn":data['data']["cdn"]});
    temp_list.push({"result.value.component":data['data']["component"]});
    temp_list.push({"result.value.illegal_feature.name":data['data']["illegal_feature"]});
    temp_list.push({"result.value.illegality.plugin_name":data['data']["illegality"]});
    temp_list.push({"result.value.vulnerables.plugin_name":data['data']["vulnerables"]});
    let html = ``;
    let location = data['data']["location"];
    // console.log(data['data']["result.value.location"]);
    html += `<div>
                <div class="key-title">国家/地区</div>
                <ul  class="key-content clearfix">`;
    for(let country in location){
        let country_name = location[country]['_id']['country']||'其他';
        html += `<li>
                    <img src="/static/img/countries_flags/${location[country]['_id']['country_code']}.png" alt="${location[country]['_id']['country_code']}.png" width="16px" style="border: 1px solid #eee;">
                    <a class="key-content-val" onclick="add_filter_param('result.value.location.country_ch','${country_name}')">${country_name}</a>
                    <span class="key-content-data-country float-right">&nbsp;&nbsp;&nbsp;${location[country]['country_count']}<i class="iconfont icon-arrow float-right"></i></span>
                </li>`;
        html += `<div style="display: none">
                    <ul  class="key-content clearfix">`;
        for(let province in location[country]['province']){
            let province_name = location[country]['province'][province]['province_name']||'未知';
            html += `<li>
                    <a class="key-content-val" onclick="add_filter_param('result.value.location.province','${province_name}')">${province_name}</a>
                    <span class="key-content-data-province float-right">&nbsp;&nbsp;&nbsp;${location[country]['province'][province]['province_count']}<i class="iconfont icon-arrow float-right"></i></span>
                </li>`;
        html += `<div style="display: none">
                    <ul  class="key-content clearfix">`;
                for(let city in location[country]['province'][province]['city']){
                    let city_name = location[country]['province'][province]['city'][city]['city_name']||'未知';
                    html += `<li>
                            <a class="key-content-val" onclick="add_filter_param('result.value.location.city','${city_name}')">${city_name}</a>
                            <span class="key-content-data-city float-right">&nbsp;&nbsp;&nbsp;${location[country]['province'][province]['city'][city]['count']}</span>
                        </li>`;
                }
                html += `</ul></div>`;
        }
        html += `</ul></div>`;
    }
    html += `</ul></div>`;


    html += `<div>
                <div class="key-title">开发语言</div>
                <ul  class="key-content clearfix">`;
    for(let name in language)
    {
        html += `<li>
                    <a class="key-content-val" onclick="add_filter_param('result.value.language.product','${name}')">${name}</a>
                    <span class="key-content-data-country float-right">&nbsp;&nbsp;&nbsp;${language[name]['count']}<i class="iconfont icon-arrow float-right"></i></span>
                </li>`;
        html += `<div style="display: none">
                    <ul  class="key-content clearfix">`;
        // console.log(language[name]);
        for(let i in language[name]['data'])
        {
            // console.log(language[name][i])
            let version = language[name]['data'][i][0]||'';
            let version_count = language[name]['data'][i][1]||'';
            let _name = name+":"+version;
            html += `<li>
                            <a class="key-content-val" onclick="add_filter_param('result.value.language','${_name}')">${_name}</a>
                            <span class="key-content-data-city float-right">&nbsp;&nbsp;&nbsp;${version_count}</span>
                        </li>`;
        }
        html += `</ul></div>`;
    }
    html += `</ul></div>`;
    html += `<div>
                <div class="key-title">服务信息</div>
                <ul  class="key-content clearfix">`;
    for(let name in server)
    {
        html += `<li>
                    <a class="key-content-val" onclick="add_filter_param('result.value.server.product','${name}')">${name}</a>
                    <span class="key-content-data-country float-right">&nbsp;&nbsp;&nbsp;${server[name]['count']}<i class="iconfont icon-arrow float-right"></i></span>
                </li>`;
        html += `<div style="display: none">
                    <ul  class="key-content clearfix">`;
        // console.log(language[name]);
        for(let i in server[name]['data'])
        {
            // console.log(language[name][i])
            let version = server[name]['data'][i][0]||'';
            let version_count = server[name]['data'][i][1]||'';
            let _name = name+":"+version;
            html += `<li>
                            <a class="key-content-val" onclick="add_filter_param('result.value.server','${_name}')">${_name}</a>
                            <span class="key-content-data-city float-right">&nbsp;&nbsp;&nbsp;${version_count}</span>
                        </li>`;
        }
        html += `</ul></div>`;
    }
    html += `</ul></div>`;

    for(let value of temp_list)
    {
        for(let key in value)
        {
            html += `<div>
                                <div class="key-title">${class_dir[key]}</div>
                                <ul  class="key-content clearfix">`;
                for (let i in value[key]) {
                    let val = value[key][i]['_id'];
                    html += `<li>
                                <a class="key-content-val" onclick="add_filter_param('${key}','${val}')">${val}</a>
                                <span class="key-content-data float-right">&nbsp;&nbsp;&nbsp;${value[key][i]['count']}</span>
                            </li>`;
                }
                html += `</ul></div>`;
        }


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
            console.log(data)
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
        if (version) {
            if (version==="未知"||version==="-")
            {
                filter_param[key2] = "";
            }
            else {
                filter_param[key2] = version;
            }

        }

    } else {
        if (val ==="未知"||val==="其他")
        {
            val = null;
        }
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
function btn_total_search() {
    /*搜索被点击*/
    let scheme_domain = $("#total_search_").val();
    filter_param['result.scheme_domain'] = {'$regex': scheme_domain};
    get_scan_list(filter_param);
    classify_by_key(filter_param);
}

function get_scan_list(filter_param) {
    /*
    * 加载每个IP扫描的结果信息*/
    // 如果有id即为内页
    if(getURLString('id')){
        get_total_one_detail(getURLString('id'))
    }else{
        // 获取页码刷新时的高亮显示
        var page = 1;
        if (location.href.split('?')[1]) {
            page = location.href.split('?')[1].split('=')[1].split('&')[0] || 1;//获取当前页码
        }
        get_scan_list_page(page, filter_param)//刷新后退加载页码表格数据

    }

}


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
            // console.log(res);
            // let html = get_scan_list_page_html(res);
            let html = get_scan_list_page_report_html(res);
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
            // for (let i in res['data'])
            // {
            //     res['data'][i]['result'] = res['data'][i]['result'][0]
            // }
            // let html = get_scan_list_page_html(res);
            // $('#report_vul_ill_list').html(html);

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
        let country ="";
        let country_code ="";

        if (res['data'][x]['result']['value'].hasOwnProperty('location'))
        {
            country = res['data'][x]['result']['value']['location']['country_ch'] || "";
            country_code = res['data'][x]['result']['value']['location']['country_code'] || "";
        }
        let protocols = res['data'][x]['result']['value']['protocols'] || "";
        let language =  "-";
        if (res['data'][x]['result']['value'].hasOwnProperty("language"))
        {
             language =  "";
            // language = res['data'][x]['result']['value']['language'][0]['product']
            for (let j in res['data'][x]['result']['value']['language'])
            {
                language +="&nbsp"+res['data'][x]['result']['value']['language'][j]['product'];
            }
        }
        let server =  "-";
        if (res['data'][x]['result']['value'].hasOwnProperty("server"))
        {
            server = res['data'][x]['result']['value']['server']['product']
        }
        let web_type =  "-";
        if (res['data'][x]['result']['value'].hasOwnProperty("illegal_feature"))
        {
            let web_map_set = new Set();
            web_type =  "";
            for (let j in res['data'][x]['result']['value']['illegal_feature'])
            {
                web_map_set.add(res['data'][x]['result']['value']['illegal_feature'][j]['name'])
            }
            web_map_set.forEach(function (item) {
                web_type+=item +"&nbsp"
            });
        }
        // let server = res['data'][x]['result']['value']['server']['product'] || "";

        let save_time = res['data'][x]['result']['value']['save_time'] || "";
        let vulnerables = res['data'][x]['result']['value']['vulnerables'] || [];
        let illegality = res['data'][x]['result']['value']['illegality'] || [];
        let vul_html =``;

        if (vulnerables.length>0)
        {
            vul_html =`<li><i class="iconfont icon-vulnerables"></i>&nbsp;&nbsp;插件扫描：${vulnerables.length}</li>`;
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
            ill_html =`<li><i class="iconfont icon-warn"></i>&nbsp;&nbsp;非法信息：${illegality.length}</li>`;

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

        // 获取国家国旗
        let countryline='';
        if(country)
        {
            let tmp = country;
            let province = res['data'][x]['result']['value']['location']['province'] || "";
            let city = res['data'][x]['result']['value']['location']['city'] || "";
            if (province)
            {
                tmp +="&nbsp;"+province;
            }
            if (city) {
                tmp +="&nbsp;"+city;
            }
            countryline= `<li><i class="iconfont icon-country"></i>&nbsp;&nbsp;国家/地区：<img src="/static/img/countries_flags/`+country_code+`.png" alt="`+country_code+`.png" width="16px" style="border: 1px solid #eee;">&nbsp;&nbsp;${tmp}</li>`;
        }
        html += `<div class="classify-content-data">
                            <div class="classify-content-data-ip">
                                <a onclick='get_total_one_detail("${detail}")'>${res['data'][x]['result']['scheme_domain']} <i class="iconfont icon-link"></i></a>
                             </div>
                             <div class="classify-content-data-content clearfix">
                                <ul class="classify-content-data-content-info float-left">
                                    <li><i class="iconfont icon-title"></i>&nbsp;&nbsp;标题：${title}</li>
                                    <li><i class="iconfont icon-ip"></i>&nbsp;&nbsp;ip：${ip}</li>
                                    ${countryline}
<!--                                    <li><i class="iconfont icon-port"></i>&nbsp;&nbsp;端口：${protocols}</li>-->
                                    <li><i class="iconfont icon-port"></i>&nbsp;&nbsp;开发语言：${language}</li>
                                    <li><i class="iconfont icon-port"></i>&nbsp;&nbsp;服务：${server}</li>
                                    <li><i class="iconfont icon-port"></i>&nbsp;&nbsp;网站类型：${web_type}</li>
                                    <li><i class="iconfont icon-time"></i>&nbsp;&nbsp;保存时间：${save_time}</li>
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
        let country ="";
        let country_code ="";

        if (res['data'][x]['result']['value'].hasOwnProperty('location'))
        {
            country = res['data'][x]['result']['value']['location']['country_ch'] || "";
            country_code = res['data'][x]['result']['value']['location']['country_code'] || "";
        }
        let protocols = res['data'][x]['result']['value']['protocols'] || "";
        let language =  "-";
        if (res['data'][x]['result']['value'].hasOwnProperty("language"))
        {
            language =  "";
            // language = res['data'][x]['result']['value']['language'][0]['product']
            for (let j in res['data'][x]['result']['value']['language'])
            {
                language +="&nbsp"+res['data'][x]['result']['value']['language'][j]['product'];
            }
        }
        let server =  "-";
        if (res['data'][x]['result']['value'].hasOwnProperty("server"))
        {
            server = res['data'][x]['result']['value']['server']['product']
        }
        let web_type =  "-";
        if (res['data'][x]['result']['value'].hasOwnProperty("illegal_feature"))
        {
            let web_map_set = new Set();
            web_type =  "";
            for (let j in res['data'][x]['result']['value']['illegal_feature'])
            {
                web_map_set.add(res['data'][x]['result']['value']['illegal_feature'][j]['name'])
            }
            web_map_set.forEach(function (item) {
                web_type+=item +"&nbsp"
            });
        }
        // let server = res['data'][x]['result']['value']['server']['product'] || "";

        let save_time = res['data'][x]['result']['value']['save_time'] || "";
        let vulnerables = res['data'][x]['result']['value']['vulnerables'] || [];
        let illegality = res['data'][x]['result']['value']['illegality'] || [];
        let vul_html =``;

        if (vulnerables.length>0)
        {
            vul_html =`<li><i class="iconfont icon-vulnerables"></i>&nbsp;&nbsp;插件扫描：${vulnerables.length}</li>`;
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
            ill_html =`<li><i class="iconfont icon-warn"></i>&nbsp;&nbsp;非法信息：${illegality.length}</li>`;

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

        // 获取国家国旗
        let countryline='';
        if(country)
        {
            let tmp = country;
            let province = res['data'][x]['result']['value']['location']['province'] || "";
            let city = res['data'][x]['result']['value']['location']['city'] || "";
            if (province)
            {
                tmp +="&nbsp;"+province;
            }
            if (city) {
                tmp +="&nbsp;"+city;
            }
            countryline= `<li><i class="iconfont icon-country"></i>&nbsp;&nbsp;国家/地区：<img src="/static/img/countries_flags/`+country_code+`.png" alt="`+country_code+`.png" width="16px" style="border: 1px solid #eee;">&nbsp;&nbsp;${tmp}</li>`;
        }
        html += `<div class="classify-content-data">
                            <div class="classify-content-data-ip">
                                <a onclick='get_total_one_detail("${detail}")'>${res['data'][x]['result']['scheme_domain']} <i class="iconfont icon-link"></i></a>
                             </div>
                             <div class="classify-content-data-content clearfix">
                                <ul class="classify-content-data-content-info float-left">
                                    <li><i class="iconfont icon-title"></i>&nbsp;&nbsp;标题：${title}</li>
                                    <li><i class="iconfont icon-ip"></i>&nbsp;&nbsp;ip：${ip}</li>
                                    ${countryline}
<!--                                    <li><i class="iconfont icon-port"></i>&nbsp;&nbsp;端口：${protocols}</li>-->
                                    <li><i class="iconfont icon-port"></i>&nbsp;&nbsp;开发语言：${language}</li>
                                    <li><i class="iconfont icon-port"></i>&nbsp;&nbsp;服务：${server}</li>
                                    <li><i class="iconfont icon-port"></i>&nbsp;&nbsp;网站类型：${web_type}</li>
                                    <li><i class="iconfont icon-time"></i>&nbsp;&nbsp;保存时间：${save_time}</li>
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
    // 点击详情触发 刷新触发
    if(!getURLString('id'))history.pushState(null,null,changeURLArg(location.href,'id',_info))
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
            $('.right-content').html(res);
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
    if (!info['result']['value'].hasOwnProperty("location"))
    {
        info['result']['value']['location']= {};
        info['result']['value']['location']['country_ch']= "";
        info['result']['value']['location']['province']= "";
        info['result']['value']['location']['city']= "";
    }
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">国家/地区</div>
                <div class="columnT-tr-right">${info['result']['value']['location']['country_ch']||""}</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">省份</div>
                <div class="columnT-tr-right">${info['result']['value']['location']['province']||""}</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">城市</div>
                <div class="columnT-tr-right">${info['result']['value']['location']['city']||""}</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">经度</div>
                <div class="columnT-tr-right">${info['result']['value']['location']['lon']||""}</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">纬度</div>
                <div class="columnT-tr-right">${info['result']['value']['location']['lat']||""}</div>
            </div>`;
    $("#base_info_body").html("").append(html);
    //服务信息
    html =``;
    $("#base_info_server").html("").append("服务信息");
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">操作系统</div>
                <div class="columnT-tr-right">${info['result']['value']['os']||""}</div>
            </div>`;
    if (info['result']['value'].hasOwnProperty("server")) {
        html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">服务器</div>
                <div class="columnT-tr-right">${info['result']['value']['server']['product']||""}</div>
            </div>`;
        html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">版本</div>
                <div class="columnT-tr-right">${info['result']['value']['server']['version']||""}</div>
            </div>`;
    }
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">端口</div>
                <div class="columnT-tr-right">${info['result']['value']['protocols']||""}</div>
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
            </div>`;
    }

    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">返回状态码</div>
                <div class="columnT-tr-right">${info['result']['value']['status_code']||""}</div>
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
            </div>`;

        }
        $("#base_info_whois").html("").append(html);
        $("#other_detail").show();
        $("#other_detail ul").append('<li><a href="#whois_div" data-toggle="tab">WHOIS</a></li>');

    }
//autonomous_system
    if (info['result']['value'].hasOwnProperty("autonomous_system"))
    {
        let temp = info['result']['value']['autonomous_system'];
        html=``;
        for(let key in temp)
        {
            html+=`<div  class="columnT-tr clearfix">
                                <div class="columnT-tr-left">${key}</div>
                                <div class="columnT-tr-right">${temp[key]}</div>`;

        }
        $("#base_info_autonomous_system").html("").append(html);
        $("#other_detail").show();
        $("#other_detail ul").append('<li><a href="#autonomous_system_div" data-toggle="tab">autonomous_system</a></li>');
    }
    $('#other_detail li:eq(0) a').tab('show')
    //备案
    // if (info['result']['value'].hasOwnProperty("icp"))
    // {
    //     let tmp_class = {};
    //     tmp_class['beian_domain'] = "备案域名";
    //     tmp_class['icp_code'] = "ICP备案号";
    //     tmp_class['site_name'] = "备案网站名称";
    //     tmp_class['org_name'] = "企业或事业单位名称";
    //     tmp_class['nature'] = "单位类型";
    //     let temp = info['result']['value']['icp'];
    //     html=``;
    //     for(let key in temp)
    //     {
    //         html+=`<div  class="columnT-tr clearfix">
    //                             <div class="columnT-tr-left">${tmp_class[key]}</div>
    //                             <div class="columnT-tr-right">${temp[key]}</div>`;
    //         html+=`<div class="columnT-tip">点击展开</div></div>`;
    //
    //     }
    //     $("#base_info_beian").html("").append(html);
    //     $("#beian_div").show();
    //
    // }


    //网站信息
    html =``;


    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">域名</div>
                <div class="columnT-tr-right">${info['result']['scheme_domain']||""}</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">URL</div>
                <div class="columnT-tr-right">${info['result']['value']['url']||""}</div>
            </div>`;
    if (info['result']['value'].hasOwnProperty("icp")){
        html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">ICP备案号</div>
                <div class="columnT-tr-right">${info['result']['value']['icp']['icp_code']||""}</div>
            </div>`;
    }
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">标题</div>
                <div class="columnT-tr-right">${info['result']['value']['title']||""}</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">描述</div>
                <div class="columnT-tr-right">${info['result']['value']['description']||""}</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">关键词</div>
                <div class="columnT-tr-right">${info['result']['value']['keywords']||""}</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">保存时间</div>
                <div class="columnT-tr-right">${info['result']['value']['save_time']||""}</div>
            </div>`;
    if (info['result']['value'].hasOwnProperty("statistics"))
    {
        html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">扫描URL总数</div>
                <div class="columnT-tr-right">${info['result']['value']['statistics']['total']||""}</div>
            </div>`;
        html+=`<div  class="columnT-tr clearfix overflow">
                <div class="columnT-tr-left">URL_LIST</div>
                <div class="columnT-tr-right">
                `;
        for (let i in info['result']['value']['statistics']['urls'])
        {
            let url = info['result']['value']['statistics']['urls'][i];
            // console.log(url);
            html+=`<div>${url||""}</div>`;
        }
    }
    let detail = get_detail_bs4(info['result']);
    html+=`    </div>
                <div class="columnT-tip" data-toggle="modal" data-target="#total_one_modal" onclick=total_detail_model("${detail}")>详情</div>

            </div>`;

    $("#web_info_body").html("").append(html);

    //网站响应信息
    if (info['result']['value'].hasOwnProperty("response_headers")) {
        html = ``;
        for (let key in info['result']['value']['response_headers'])
        {
            html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">${key}</div>
                <div class="columnT-tr-right">${info['result']['value']['response_headers'][key]||""}</div>
<!--                <div class="columnT-tip">点击展开</div>-->
            </div>`;
        }
        $("#web_response_info").html("").append(html);
        $("#web_response_info_div").show();

    }
    //网站类型
    if (info['result']['value'].hasOwnProperty("illegal_feature")) {
        html = ``;
        for(let i in info['result']['value']['illegal_feature'])
        {
            let url = info['result']['value']['illegal_feature'][i]['url']||"";

            html+=`<div class="columnT-sec">
                    <div class="columnT-sec-title">
                        <span>${info['result']['value']['illegal_feature'][i]['name']||""}&nbsp;${url}</span>
                        <i class="iconfont icon-arrow"></i>
                    </div>
                    <div class="columnT-sec-content">
                            <div class="columnT">
                                <div class="columnT-tr clearfix">
                                    <div class="columnT-tr-left">URL</div>
                                    <div class="columnT-tr-right">${info['result']['value']['illegal_feature'][i]['url']||""}</div>
<!--                                    <div class="columnT-tip">点击展开</div>-->
                                </div>
                              <div class="columnT-tr clearfix">
                                    <div class="columnT-tr-left">描述</div>
                                    <div class="columnT-tr-right">${info['result']['value']['illegal_feature'][i]['description']||""}</div>
<!--                                    <div class="columnT-tip">点击展开</div>-->
                                </div>
                            </div>
                </div>`;
        }
        $("#illegality_feature_div").show();
        $("#illegality_feature_info").html("").append(html);
    }

    //漏洞信息
    if (info['result']['value'].hasOwnProperty("vulnerables")) {
        html = ``;
        for(let i in info['result']['value']['vulnerables'])
        {
            let url = info['result']['value']['vulnerables'][i]['url']||"";
            let host = "";
            if (info['result']['value']['vulnerables'][i]['headers']&&info['result']['value']['vulnerables'][i]['headers'].hasOwnProperty("host"))
            {
                host = info['result']['value']['vulnerables'][i]['headers']['host']||"";
            }
            let Referer = "";
            if (info['result']['value']['vulnerables'][i]['headers']&&info['result']['value']['vulnerables'][i]['headers'].hasOwnProperty("Referer"))
            {
                Referer = info['result']['value']['vulnerables'][i]['headers']['Referer']||"";
            }
            let severity = info['result']['value']['vulnerables'][i]['severity']||"";
            let _style = `style="background-color: red"`;
            // severity_dir['Urgent'] = "严重"
            // severity_dir['High'] = "高级"
            // severity_dir['Medium'] = "中级"
            // severity_dir['Low'] = "低级"
            // severity_dir['Information'] = "信息"
            switch (severity) {
                case "Urgent":
                    _style = `style="background: darkred"`;
                    break;
                case "High":
                    _style = `style="background: red"`;
                    break;
                case "Medium":
                    _style = `style="background: orange"`;
                    break;
                case "Low":
                    _style = `style="background: yellowgreen"`;
                    break;
                case "Information":
                    _style = `style="background: green"`;
                    break;
                default:
                    _style = ``;
            }
            html+=`<div class="columnT-sec">
                    <div class="columnT-sec-title">
                        <div>${info['result']['value']['vulnerables'][i]['name']||""}</div>
                        <div class="columnT-level">
                            <div ${_style}></div><div ${_style}></div><div ${_style}></div>
                        </div>
                        <i class="iconfont icon-arrow"></i>
                        <div>${info['result']['value']['vulnerables'][i]['url']||""}</div>
                    </div>
                    <div class="columnT-sec-content">
                            <div class="columnT">
                                <div class="columnT-tr clearfix">
                                    <div class="columnT-tr-left">存在漏洞的URL</div>
                                    <div class="columnT-tr-right">${info['result']['value']['vulnerables'][i]['verify_url']||""}</div>
                                    <div class="columnT-tip">点击展开</div>
                                </div>
                                <div class="columnT-tr clearfix">
                                    <div class="columnT-tr-left">插件名称或POC名称</div>
                                    <div class="columnT-tr-right">${info['result']['value']['vulnerables'][i]['plugin_name']||""}</div>
                                    <div class="columnT-tip">点击展开</div>
                                </div>
                             
                                <div class="columnT-tr clearfix">
                                    <div class="columnT-tr-left">FUZZ测试时的请求头部:host</div>
                                    <div class="columnT-tr-right">${host||""}</div>
                                    <div class="columnT-tip">点击展开</div>
                                </div>
                                <div class="columnT-tr clearfix">
                                    <div class="columnT-tr-left">FUZZ测试时的请求头部:Referer</div>
                                    <div class="columnT-tr-right">${Referer||""}</div>
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
            //存在问题的URL
            let url = info['result']['value']['illegality'][i]['url']||"";
            if (info['result']['value']['illegality'][i]['plugin_name'] === "black_link")
            {
                url = info['result']['value']['illegality'][i]['value']['dark_link']
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
                            <div class="columnT-tr-right"></td><td>${info['result']['value']['illegality'][i]['severity']||""}</div>
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
    // getMap(info['result']['value']['location']['lon'],info['result']['value']['location']['lat'],'map-canvas');
}
// 地图
// function getMap(x,y,div) {
//     var map = new BMap.Map(div);            // 创建Map实例
//     var point = new BMap.Point(x,y); // 创建点坐标
//     map.centerAndZoom(point,17);
//     map.enableScrollWheelZoom();
//     var marker = new BMap.Marker(point);        // 创建标注
//     map.addOverlay(marker);                     // 将标注添加到地图中
//
// }
//二级嵌套table展开缩放
$(document).on('click','.columnT-sec-title',function () {
    $(this).next().slideToggle();
    $(this).find('i').toggleClass('iconRotate');

});

//总览左侧国家展开
$(document).on('click','.key-content-data-country,.key-content-data-province',function () {
    $(this).find('.icon-arrow').toggleClass('iconRotate');
    $(this).parent().next().slideToggle();
});


// 网站信息详情点开
function total_detail_model(data) {
    let b = new Base64();
    data = b.decode(data);
    data = JSON.parse(data);
    console.log(data);
    let html =``;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">域名</div>
                <div class="columnT-tr-right">${data['scheme_domain']||""}</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">URL</div>
                <div class="columnT-tr-right">${data['value']['url']||""}</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">标题</div>
                <div class="columnT-tr-right">${data['value']['title']||""}</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">描述</div>
                <div class="columnT-tr-right">${data['value']['description']||""}</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">关键词</div>
                <div class="columnT-tr-right">${data['value']['keywords']||""}</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">保存时间</div>
                <div class="columnT-tr-right">${data['value']['save_time']||""}</div>
            </div>`;
    if (data['value'].hasOwnProperty("statistics"))
    {
        html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">扫描URL总数</div>
                <div class="columnT-tr-right">${data['value']['statistics']['total']||""}</div>
            </div>`;
        html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">URL_LIST</div>
                <div class="columnT-tr-right">
                `;
        for (let i in data['value']['statistics']['urls'])
        {
            let url = data['value']['statistics']['urls'][i];
            // console.log(url);
            html+=`<div>${url||""}</div>`;
        }
    }
    html+=`    </div>
            </div>`;
    $("#total_one_detail_div").html("").append(html);
}