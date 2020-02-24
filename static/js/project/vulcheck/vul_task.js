function vulcheck_show_all_task() {
    $.ajax({
        url: 'vulcheck/show_all_task_html',
        dataType: "html",
        type: "get",
        success: function (res) {
            $('.tab-content').html(res);

            // console.log(res);
            vulcheck_all_task_able();
        }
    });
}

function vulcheck_all_task_able() {
    // 获取页码刷新时的高亮显示
    let page = 1;
    if (location.hash.split('?')[1]) {
        page = location.hash.split('?')[1].split('=')[1] || 1;//获取当前页码
    }
    get_task_list(page);//刷新后退加载页码表格数据
}

$(document).off('click','.task.pagination>ul>*').on('click', '.task.pagination>ul>*', function () {
    let page = $(this).attr('data-page'); // 获取按钮代表的页码
    get_task_list(page)//点击页码获取数据
});


function get_task_list(page) {

    let data = {
        "page":page,
    };
    $.ajax({
        url: 'vulcheck/show_all_task',
        data:data,
        type: "get",
        success: function (res) {
            let max_page = parseInt(res['max_page']);
            let html = ``;
            for (let x in res['data'])
            {

                let b = new Base64();
                let task_info = JSON.stringify(res['data'][x]['task_info']);
                task_info = b.encode(task_info);
                html+=`<tr>`;
                html+=`<td><a onclick='get_task_detail("${task_info}")'>${res['data'][x]['task_id']}</a></td>`;
                html+=`<td>${res['data'][x]['status']}</td>`;
                html+=`<td>${res['data'][x]['start_time']}</td>`;
                html+=`<td>${res['data'][x]['finish_time']}</td>`;
                html+=`<td><div><a href="#" >停止</a></div></td>`;
                html+=`</tr>`;
            }
            $('.pagination').prev().find('tbody').html(html);
            addPagination(page,max_page);
        }
    });
}

function vulcheck_send_task() {

    $.ajax({
        url: 'vulcheck/send_task_html',
        dataType: "html",
        type: "get",
        success: function (res) {
            $('.tab-content').html(res);
            d_issue_tesk_batch_click()
        }
    });
}

function d_issue_tesk_batch_click() {

    let plug = get_plug_list();
    console.log(plug);


    let plug_html = ``;
    for (let key in plug['data']) {

        for (let x in plug['data'][key]) {
            let plug_name = plug['data'][key][x]['plugin_name'];
            let issue_name = plug['data'][key][x]['issue_name'];
            plug_html += `<lable><input type="checkbox" name="plugin_name" value="${plug_name}">${plug_name}&nbsp;&nbsp;${issue_name}</lable><br>`
        }

    }
    $("#plug_check_list").html("").append(plug_html);

    let spider_html = ``;
    spider_html += `<lable>maxpage<input type="text" name="maxpage" placeholder="500" class="form-control"></lable><br>`;
    spider_html += `<lable>maxdepth<input type="text" name="maxdepth" placeholder="3" class="form-control"></lable><br>`;
    spider_html += `<lable>notscanurl<input type="text" name="notscanurl" placeholder="/.*?delete*,/.*?logout*,/.*?loginout*" class="form-control"></lable><br>`;
    spider_html += `<lable>crawlrule<input type="text" name="crawlrule" placeholder="0" class="form-control"></lable><br>`;
    spider_html += `<lable>notscanfile<input type="text" name="notscanfile" placeholder="" class="form-control"></lable><br>`;
    spider_html += `<lable>phantomjs_enable<input type="text" name="phantomjs_enable" placeholder="False" class="form-control"></lable><br>`;
    spider_html += `<lable>craw_current_directory<input type="text" name="craw_current_directory" placeholder="False" class="form-control"></lable><br>`;
    $("#spider_check_list").html("").append(spider_html);
}

function get_plug_list() {
    /*获得插件列表*/
    let res;
    $.ajax({
        url: "vulcheck/get_plug",
        type: "get",
        async: false,
        success: function (data) {
            res = data;

        }
    });
    return res
}

function d_issue_task_batch_submit() {
    /*下发扫描任务按钮被点击*/
    let post_data = $('#task_batch_form').serializeArray();
    console.log(post_data);
    let res;
    $.ajax({
        url: "vulcheck/issue_task_list",
        type: "post",
        data: post_data,
        async: false,
        success: function (data) {
            res = data;
            $("#d_issue_task_batch_res").html("").append(JSON.stringify(data, undefined, 4));
            console.log(data)
        }
    });
}

function get_task_detail(task_info) {
    /*获得单个任务的详情信息*/
    let b = new Base64();
    task_info = b.decode(task_info);
    // console.log(task_info);
    task_info = JSON.parse(task_info);
    // get_task_detail_html();

    // get_task_detail_result(task_info['task_id']);
    vulcheck_get_total_html(task_info['task_id']);
    let html= get_send_task_info_html(task_info);
    // $("#task_send_detail_div").show().html("").append(JSON.stringify(task_info,undefined,4));

    //任务下发信息
    $("#task_send_detail_div").show();
    $("#task_send_detail_table_body").html("").append(html);

    //报道a标签
    //<button class="btn btn-default">  </button>
    let  report_a = `<button class="btn btn-default"  onclick="get_task_detail_html('${task_info['task_id']}')"  >报告</button>`;
    $("#report_div").show().html("").append(report_a);




}

function get_send_task_info_html(task_info) {
    /*发送的任务信息*/

    let html = ``;
    let url_num = task_info['url'].length;
    html+=`<tr><td>task_id</td><td>${task_info['task_id']}</td></tr>`;
    html+=`<tr><td>URL</td><td>${task_info['url']}</td></tr>`;
    html+=`<tr><td>URL个数</td><td>${task_info['url'].length}</td></tr>`;
    html+=`<tr><td>爬虫信息</td><td></td></tr>`;
    html+=`<tr><td>notscanurl</td><td>${task_info['spider']['notscanurl']}</td></tr>`;
    html+=`<tr><td>crawlrule</td><td>${task_info['spider']['crawlrule']}</td></tr>`;
    html+=`<tr><td>craw_current_directory</td><td>${task_info['spider']['craw_current_directory']}</td></tr>`;
    html+=`<tr><td>maxpage</td><td>${task_info['spider']['maxpage']}</td></tr>`;
    html+=`<tr><td>notscanfile</td><td>${task_info['spider']['notscanfile']}</td></tr>`;
    html+=`<tr><td>phantomjs_enable</td><td>${task_info['spider']['phantomjs_enable']}</td></tr>`;
    html+=`<tr><td>maxdepth</td><td>${task_info['spider']['maxdepth']}</td></tr>`;

    let plug = "";
    for(let i in task_info['plugins'])
    {
        // console.log(i);
        if (i === "0")
        {
            plug += task_info['plugins'][i] ;

            continue;
        }
        plug +=  ";&nbsp;" +task_info['plugins'][i]
    }
    html+=`<tr><td>插件信息</td><td>${plug}</td></tr>`;

    $("#task_send_detail_table_body").html("").append(html);
    return html;
}

function get_task_detail_html(task_id) {
    $.ajax({
        url: 'vulcheck/task_detial_html',
        dataType: "html",
        type: "get",
        async:false,
        success: function (res) {
            $('.tab-content').html(res);
            let send_data = {};
            if (task_id)
            {
                send_data['param'] = {"task_id":task_id};
            }
            let  data = get_classify_by_key(send_data);
            console.log(data);
            $("#task_result_detail_div").html("").append(JSON.stringify(data, undefined, 4));
            chart_pie(data['data']['result.value.server'],"服务器","chart_server");
            chart_pie(data['data']['result.value.protocols'],"端口服务","chart_protocols");
            chart_pie(data['data']['result.value.language'],"开发语言","chart_language");
            chart_pie(data['data']['result.value.cdn'],"使用的cdn服务器","chart_cdn");
            chart_pie(data['data']['result.value.component'],"使用的组件","chart_component");
            chart_pie(data['data']['result.value.vulnerables.plugin_name'],"漏洞情况","chart_vulnerables");
            chart_pie(data['data']['result.value.illegality.plugin_name'],"违法信息情况","chart_illegality");


            get_scan_val_iil_list_page(send_data['param'])
        }
    });
}


function chart_pie(data, text, chat_div) {
    /*
    data:数据
    text:标题
    chat_div：div id
    * */
    let chart = echarts.init(document.getElementById(chat_div));
    let _data = data.reduce(function (prev, res) {
        prev['legend'].push(res['_id']);
        prev['series'].push({"value": res['count'], "name": res['_id']});
        return prev
    }, {"legend": [], "series": []});
    let option = {
        title: {
            text: text,
            subtext: '占有比',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: _data['legend']
        },
        series: [
            {
                name: '访问来源',
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data: _data['series'],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    // 使用刚指定的配置项和数据显示图表。
    chart.setOption(option);
}
function get_task_detail_result(task_id) {
    let parm = {};
    parm['task_id'] = task_id;
    $.ajax({
        url: "vulcheck/get_scan_result",
        type: "get",
        data: parm,
        success: function (data) {

            $("#task_result_detail_div").html("").append(JSON.stringify(data, undefined, 4))

        }
    })
}