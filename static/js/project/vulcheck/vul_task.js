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

$(document).on('click', '.pagination>ul>*', function () {
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
            console.log(res);
            let max_page = parseInt(res['max_page']);

            let html = ``;
            for (let x in res['data'])
            {
                html+=`<tr>`;
                html+=`<td>${res['data'][x]['task_id']}</td>`;
                html+=`<td>${res['data'][x]['status']}</td>`;
                html+=`<td>${res['data'][x]['updatetime']}</td>`;
                html+=`<td>${res['data'][x]['finish_time']}</td>`;
                html+=`<td><div><a href="#" >停止</a></div></td>`;
                html+=`</tr>`;
            }
            $('.pagination').prev().find('tbody').html(html);
            addPagination(page,max_page);
            console.log(page);
            console.log(max_page);
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

            // vulcheck_all_task_able();
        }
    });
}