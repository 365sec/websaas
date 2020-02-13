function vulcheck_get_total_html() {
    /*
    * 加载统计信息HTML页面*/
    $.ajax({
        url: 'vulcheck/get_total_html',
        dataType: "html",
        type: "get",
        success: function (res) {
            $('.tab-content').html(res);
            filter_param = {};
            filter_temp = {};
            classify_by_key(filter_param);
            get_scan_list(filter_param);

        }
    });
}

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
                html += `<div>${key}`;
                for (let i in data['data'][key]) {
                    let val = data['data'][key][i]['_id']
                    html += `<li><a onclick="add_filter_param('${key}','${val}')">${val}</a> &nbsp;&nbsp;&nbsp;${data['data'][key][i]['count']}</li>`;
                }
                html += `</div><br><br>`;
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

$(document).off('click', '.pagination>ul>*').on('click', '.pagination>ul>*', function () {
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
                html += `<div class="row">`;
                html += `<div class="col-lg-5">`;
                html += `<h4><a onclick='get_total_one_detail("${detail}")'>${res['data'][x]['result']['scheme_domain']}</a></h4>`;
                html += `<li>标题：${title}</li>`;
                html += `<li>ip：${ip}</li>`;
                html += `<li>端口：${protocols}</li>`;
                html += `<li>保存时间：${save_time}</li>`;
                html += `</div>`;
                html += `<div class="col-lg-4">`;
                html += `<pre>${response_headers}</pre>`;
                html += `</div>`;
                html += `</div><br><br>`;
            }
            $('.pagination').prev().find('tbody').html(html);
            addPagination(page, max_page);

        }
    })
}

function get_total_one_detail(_info) {
    /*获得单个任务的详情信息*/
    let b = new Base64();
    _info = b.decode(_info);
    // console.log(task_info);
    _info = JSON.parse(_info);
    get_total_one_detail_html();
    $("#total_one_detail_div").html("").append(JSON.stringify(_info,undefined,4));
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