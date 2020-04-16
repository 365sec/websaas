
// var SERVER_IP= "http://127.0.0.1:5000";
// var SERVER_IP= "http://47.100.88.79:5000";
var SERVER_IP= "http://172.16.39.81:5000";
function get_abnormal_html() {
    $.ajax({
        url: 'vulcheck/get_abnormal_html',
        dataType: "html",
        type: "get",
        success: function (res) {

            $('.tab-content').html(res);
            // 更改title
            document.title = '异常网站';
            abnormal_web_table();
            get_all_task_name()
        }
    });
}

function get_all_task_name()
{

    $.ajax({
        url: SERVER_IP+'/task_name',

        type: "get",
        success: function (res) {
            // console.log(res);
            res = JSON.parse(res);
            let html = ``;
            html+=`<option value="">选择任务名称</option>`;
            res = res['res_list'];
            for(let i in res)
            {
                html+=`<option value="${res[i][0]}">${res[i][1]}</option>`;
            }
            $("#abnormal_select_name").html("").append(html);
        }});
}

function abnormal_web_table() {

    // 获取页码刷新时的高亮显示
    var page = 1;
    if (location.hash.split('?')[1]) {
        page = location.hash.split('?')[1].split('=')[1].split('&')[0] || 1;//获取当前页码
    }
    abnormal_web_table_page(page)//刷新后退加载页码表格数据

}

function abnormal_web_table_page(page) {
    let post_data = $('#abnormal_form').serializeArray();
    // console.log(post_data);
    let data = {
        "param": post_data,
        "page":page,
    };
    data= JSON.stringify(data);
    $.ajax({
        url: SERVER_IP+'/get_website_data',
        // dataType: "html",
        data:data,
        type: "post",
        success: function (res) {
            res = JSON.parse(res);
            res= res['data'];
            let max_page = parseInt(res['max_page']);
            let html = ``;


            for (let i in res['data']) {
                html+='<tr>';
                html+=`<td><p class="tabletd-overflow" title="${res['data'][i]['task_id']||""}">${res['data'][i]['task_id']||""}</td>`;
                html+=`<td>${res['data'][i]['url']||""}</td>`;
                let redirect = res['data'][i]['redirect'];
                // console.log(redirect.length);
                if (redirect==='[]')
                {
                    redirect = ""
                }
                html+=`<td><p class="tabletd-overflow" title='${redirect||""}'>${redirect||""}</td>`;
                html+=`<td><p class="tabletd-overflow" title="${res['data'][i]['status_code']||""}">${res['data'][i]['status_code']||""}</td>`;
                html+=`<td><p class="tabletd-overflow" title="${res['data'][i]['ip']||""}">${res['data'][i]['ip']||""}</td>`;
                html+=`<td><p class="tabletd-overflow" title="${res['data'][i]['alive']||""}">${res['data'][i]['alive']||""}</td>`;
                html+=`<td><p class="tabletd-overflow" title='${res['data'][i]['change']||""}'>${res['data'][i]['change']||""}</td>`;
                html+=`<td><p class="tabletd-overflow" title="${res['data'][i]['is_alarm']||""}">${res['data'][i]['is_alarm']||""}</td>`;
                html+=`<td><p class="tabletd-overflow" title="${res['data'][i]['update_time']||""}">${res['data'][i]['update_time']||""}</td>`;

                html+='</tr>'
            }

            $('.pagination').prev().find('tbody').html(html);


            addPagination(page, max_page);
        }
    });
}

function change_task(task_id)
{
    let data = {
        "task_id":task_id,
    };
    data= JSON.stringify(data);
    $.ajax({
        url: SERVER_IP+'/change_task',
        // dataType: "html",
        data:data,
        type: "post",
        success: function (res) {
        console.log(res);
            location.reload();
        }});
}
function stop_task(task_id)
{
    let data = {
        "task_id":task_id,
    };
    data= JSON.stringify(data);
    $.ajax({
        url: SERVER_IP+'/stop_task',
        // dataType: "html",
        data:data,
        type: "post",
        success: function (res) {
        console.log(res);
            location.reload();
        }});
}

function abnormal_delete_task(task_id)
{
    let message=confirm("确定要删除该任务吗？");
    if (!message) {
        return;
    }
    let data = {
        "task_id":task_id,
    };
    data= JSON.stringify(data);
    $.ajax({
        url: SERVER_IP+'/delete_task',
        // dataType: "html",
        data:data,
        type: "post",
        success: function (res) {
            console.log(res);
            location.reload();
        }});
}

function send_task(send_data) {
    let data = send_data;
    data= JSON.stringify(data);
    $.ajax({
        url: SERVER_IP+'/url',
        // dataType: "html",
        data:data,
        type: "post",
        success: function (res) {
            console.log(res)
        }
    });
}

function get_run_task(page)
{
    let data = {
        "param": "",
        "page":page,
    };
    data= JSON.stringify(data);
    $.ajax({
        url: SERVER_IP+'/run_task',
        // dataType: "html",
        data:data,
        type: "post",
        success: function (res) {
            console.log(res)
        }
    });
}

