function vulcheck_show_all_task() {
    $.ajax({
        url: 'vulcheck/show_all_task_html',
        dataType: "html",
        type: "get",
        success: function (res) {

            $('.tab-content').html(res);
            vulcheck_all_task_able();

            // 更改title
            document.title = '任务列表';

            // console.log(res);
            // 模态框出现后
            $('#model').off('shown.bs.modal').on('shown.bs.modal', function () {
                $.when(vulcheck_send_task()).then(function () {
                        $('#model-submit').off('click').on('click', d_issue_task_batch_submit).css('display', 'inline-block');
                    }
                )
            });
            // 模态框关闭
            $('#model').off('hide.bs.modal').on('hide.bs.modal', function () {
                // 提前关闭，终止请求
                // event.stopPropagation();
            });
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

$(document).off('click','.task.pagination>ul>li').on('click', '.task.pagination>ul>li', function () {
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
                html+=`<td><p class="tabletd-overflow"><a onclick='get_task_detail("${task_info}")' title="${res['data'][x]['task_id']}">${res['data'][x]['task_id']}</a></p></td>`;
                html+=`<td><p class="tabletd-overflow"></p></td>`;
                html+=`<td>${res['data'][x]['status']}</td>`;
                html+=`<td>${res['data'][x]['start_time']}</td>`;
                html+=`<td>${res['data'][x]['finish_time']}</td>`;
                html+=`<td><div><a href="#" >停止</a>&nbsp;<a onclick="delete_task('${res['data'][x]['task_id']}')" >删除</a></div></td>`;
                html+=`</tr>`;
            }
            $('.pagination').prev().find('tbody').html(html);
            addPagination(page,max_page);
        }
    });
}

function delete_task(task_id) {
    var message=confirm("确定删除task_id=="+task_id+"吗？");
    if(message===true)
    {
        $.ajax({
            url: 'vulcheck/delete_task',
            data: {"task_id":task_id},
            type: "get",
            success: function (res) {
                alert("删除成功")
                get_task_list(1);
            }
        });
    }

}

function vulcheck_send_task() {

    $.ajax({
        url: 'vulcheck/send_task_html',
        dataType: "html",
        type: "get",
        success: function (res) {
            $('#myModalLabel').text('添加任务');
            $('#model .modal-body').html(res);

            //设置title
            // document.title = '下发任务'
            d_issue_tesk_batch_click()
        }
    });
}

function d_issue_tesk_batch_click() {

    let plug = get_plug_list();
    console.log(plug);


    let plug_html = ``;
    plug_html += `<div class="checkbox-selectall">
                        <input id="checkbox-selectall" class="checkbox-input" type="checkbox" name="plugin_name" value="" style="display: none;">
                        <label for="checkbox-selectall" >
                            <div class="checkbox-slide">
                                <div class="move"></div>
                                <div class="btn-background"></div>
                            </div>
                            <span>全选</span>
                        </label>
                    </div>`
    for (let key in plug['data']) {

        for (let x in plug['data'][key]) {
            let plug_name = plug['data'][key][x]['plugin_name'];
            let issue_name = plug['data'][key][x]['issue_name'];
            plug_html += `<div class="checkbox-single">
                            <input id="${plug_name}" class="checkbox-input" type="checkbox" name="plugin_name" value="${plug_name}" style="display: none;">
                            <label for="${plug_name}" >
                                <div class="checkbox-slide">
                                    <div class="move"></div>
                                    <div class="btn-background"></div>
                                </div>
                                <span>${plug_name}&nbsp;&nbsp;${issue_name}</span>
                            </label>
                        </div>`
        }

    }

    $("#plug_check_list").html("").append(plug_html);

    let spider_html = ``;
    spider_html += `<lable>maxpage<input type="text" name="maxpage" placeholder="500" class="form-control"></lable>`;
    spider_html += `<lable>maxdepth<input type="text" name="maxdepth" placeholder="3" class="form-control"></lable>`;
    spider_html += `<lable>notscanurl<input type="text" name="notscanurl" placeholder="/.*?delete*,/.*?logout*,/.*?loginout*" class="form-control"></lable>`;
    spider_html += `<lable>crawlrule<input type="text" name="crawlrule" placeholder="0" class="form-control"></lable>`;
    spider_html += `<lable>notscanfile<input type="text" name="notscanfile" placeholder="" class="form-control"></lable>`;
    spider_html += `
<!--<lable>phantomjs_enable<input type="text" name="phantomjs_enable" placeholder="False" class="form-control"></lable>-->
                    <div class='sipder-sildebtn'>
                        <input id="phantomjs_enable" class="checkbox-input" type="checkbox" name="phantomjs_enable" value="true" style="display: none;">
                        <label for="phantomjs_enable" >
                            <div class="checkbox-slide">
                                <div class="move"></div>
                                <div class="btn-background"></div>
                            </div>
                            <span>phantomjs_enable</span>
                        </label>
                    </div>
`;
    spider_html += `
<!--                    <lable>craw_current_directory<input type="text" name="craw_current_directory" placeholder="False" class="form-control"></lable>-->
                    <div class='sipder-sildebtn'>
                        <input id="craw_current_directory" class="checkbox-input" type="checkbox" name="craw_current_directory" value="true" style="display: none;">
                        <label for="craw_current_directory" >
                            <div class="checkbox-slide">
                                <div class="move"></div>
                                <div class="btn-background"></div>
                            </div>
                            <span>craw_current_directory</span>
                        </label>
                    </div>
                    `;
    $("#spider_check_list").html("").append(spider_html);
    //设置radio默认值
    $('#notscanfile').prop('checked',true);
    $('#phantomjs_enable').prop('checked',false);

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
            console.log(data)
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
    $("#task_send_detail_table_body .columnT").html("").append(html);

    //高度过高数据缩放
    columnSlide();

    //报道a标签
    //<button class="btn btn-default">  </button>
    let  report_a = `<button class="btn btn-default"  onclick="get_task_detail_html('${task_info['task_id']}')"  >报告</button>`;
    $("#report_div").show().children().html("").append(report_a);




}

function get_send_task_info_html(task_info) {
    /*发送的任务信息*/

    let html = ``;
    let url_num = task_info['url'].length;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">task_id</div>
                <div class="columnT-tr-right">${task_info['task_id']}</div>
                <div class="columnT-tip">点击展开</div>

            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">URL</div>
                <div class="columnT-tr-right">${task_info['url']}</div>
                <div class="columnT-tip">点击展开</div>

            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">URL个数</div>
                <div class="columnT-tr-right">${task_info['url'].length}</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">爬虫信息</div>
                <div class="columnT-tr-right"></div>
                <div class="columnT-tip">点击展开</div>

            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">notscanurl</div>
                <div class="columnT-tr-right">${task_info['spider']['notscanurl']}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">crawlrule</div>
                <div class="columnT-tr-right">${task_info['spider']['crawlrule']}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">craw_current_directory</div>
                <div class="columnT-tr-right">${task_info['spider']['craw_current_directory']}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">maxpage</div>
                <div class="columnT-tr-right">${task_info['spider']['maxpage']}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">notscanfile</div>
                <div class="columnT-tr-right">${task_info['spider']['notscanfile']}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">phantomjs_enable</div>
                <div class="columnT-tr-right">${task_info['spider']['phantomjs_enable']}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">maxdepth</div>
                <div class="columnT-tr-right">${task_info['spider']['maxdepth']}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;

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
    html+=`<div  class="columnT-tr clearfix">
                <div class="columnT-tr-left">插件信息</div>
                <div class="columnT-tr-right">${plug}</div>
                <div class="columnT-tip">点击展开</div>
            </div>`;

    // $("#task_send_detail_table_body .columnT").html(html);
    return html;
}
$(function(){

})

function get_task_detail_html(task_id) {
    $.ajax({
        url: 'vulcheck/task_detial_html',
        dataType: "html",
        type: "get",
        async:false,
        success: function (res) {
            $('.tab-content').html(res);
            document.title = '任务详情报告';
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
            // chart_pie(data['data']['result.value.language'],"开发语言","chart_language");
            chart_bar(data['data']['result.value.language'],"开发语言","chart_language");
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


function chart_bar(data, text, chat_div) {
    /*
    data:数据
    text:标题
    chat_div：div id
    * */
    let chart = echarts.init(document.getElementById(chat_div));
    let _data = data.reduce(function (prev, res) {
        prev['legend'].push(res['_id']);
        // prev['series'].push({"value": res['count'], "name": res['_id']});
        prev['series'].push(res['count']);
        return prev
    }, {"legend": [], "series": []});
    console.log(_data)
    let option = {
        title: {
            text: text,
            subtext: 'top统计'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: _data['legend']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            boundaryGap: [0, 0.01]
        },
        yAxis: {
            type: 'category',
            data: _data['legend']
        },
        series: [
            {
                name: '数目',
                type: 'bar',
                data: _data['series']
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

