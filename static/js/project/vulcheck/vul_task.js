function vulcheck_show_all_task() {
    $.ajax({
        url: 'vulcheck/show_all_task_html',
        dataType: "html",
        type: "get",
        success: function (res) {
            $('.tab-content').html(res);

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
    $("#task_send_detail_div").show().html("").append(JSON.stringify(task_info,undefined,4));

    // cony(te.log(task_info);
}

function get_task_detail_html() {
    $.ajax({
        url: 'vulcheck/task_detial_html',
        dataType: "html",
        type: "get",
        async:false,
        success: function (res) {
            $('.tab-content').html(res);
        }
    });
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