// var SERVER_IP= "http://47.100.88.79:5000";

function get_abnormal_task_html()
{
    $.ajax({
        url: 'vulcheck/get_abnormal_task_html',
        dataType: "html",
        type: "get",
        success: function (res) {

            $('.tab-content').html(res);
            // 更改title
            document.title = '异常网站';
            abnormal_task_web_table();

        }
    });
}

function abnormal_task_web_table() {
    // 获取页码刷新时的高亮显示
    var page = 1;
    if (location.hash.split('?')[1]) {
        page = location.hash.split('?')[1].split('=')[1].split('&')[0] || 1;//获取当前页码
    }
    abnormal_task_web_table_page(page)//刷新后退加载页码表格数据
}
function abnormal_task_web_table_page(page) {
    let data = {
        "param": "",
        "page":page,
    };
    data= JSON.stringify(data);
    console.log(SERVER_IP +'/task_list');
    $.ajax({
        url: SERVER_IP +'/task_list',
        // dataType: "html",
        data:data,
        type: "post",
        success: function (res) {
            res = JSON.parse(res);
            res = res['data'];
            let max_page = parseInt(res['max_page']);
            let html = ``;
            for (let i in res['data']) {
                console.log(res['data'][i]);
                html+='<tr>';
                html+=`<td><p class="tabletd-overflow" title="${res['data'][i]['task_id']||""}">${res['data'][i]['task_id']||""}</td>`;
                html+=`<td><p class="tabletd-overflow" title="${res['data'][i]['task_name']||""}">${res['data'][i]['task_name']||""}</td>`;
                html+=`<td><p class="tabletd-overflow" title="${res['data'][i]['all_time']||""}">${res['data'][i]['all_time']||""}</td>`;
                html+=`<td><p class="tabletd-overflow" title="${res['data'][i]['intervals']||""}">${res['data'][i]['intervals']||""}</td>`;
                let is_run = "停止";
                if (res['data'][i]['is_run']){
                    is_run = "正在运行";
                }
                html+=`<td><p >${is_run||""}</td>`;
                html+=`<td><p class="tabletd-overflow" title="${res['data'][i]['update_time']||""}">${res['data'][i]['update_time']||""}</td>`;
                html+=`<td><p ><a onclick="stop_task('${res['data'][i]['task_id']||""}')">停止</a>
                            <a onclick="abnormal_delete_task('${res['data'][i]['task_id']||""}')">删除</a>
                </td>`;
                html+='</tr>'
            }

            $('.pagination').prev().find('tbody').html(html);


            addPagination(page, max_page);
        }
    });
}
$(document).on('click', '.abnormal_task.pagination>ul>li', function () {
    var page = $(this).attr('data-page'); // 获取按钮代表的页码
    abnormal_task_web_table_page(page)//点击页码获取数据
});


function abnormal_send_task() {

    console.log("下发任务");
    let tmp_url = $("#abnormal_task_text").val();
    let task_name = $("#abnormal_task_name").val();
    let run_all_time = $("#run_all_time").val();
    let scan_intervals_time = $("#scan_intervals_time").val();
    let alarm_count = $("#alarm_count").val();
    let url_list = tmp_url.split("\n");
    let send_data = {};
    if (task_name) {send_data['task_name'] = task_name;}
    if (run_all_time) {send_data['run_all_time'] = run_all_time;}
    if (scan_intervals_time) {send_data['scan_intervals_time'] = scan_intervals_time;}
    if (alarm_count) {send_data['alarm_count'] = alarm_count;}
    if (url_list) {send_data['url'] = url_list;}


    send_task(send_data);
}