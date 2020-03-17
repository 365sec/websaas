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
        }
    });
}

function abnormal_web_table() {

    // 获取页码刷新时的高亮显示
    var page = 1;
    if (location.hash.split('?')[1]) {
        page = location.hash.split('?')[1].split('=')[1] || 1;//获取当前页码
    }
    abnormal_web_table_page(page)//刷新后退加载页码表格数据

}

function abnormal_web_table_page(page) {
    let data = {
        "param": "",
        "page":page,
    };
    data= JSON.stringify(data);
    $.ajax({
        url: 'http://127.0.0.1:5000/get_website_data',
        // dataType: "html",
        data:data,
        type: "post",
        success: function (res) {

            let max_page = parseInt(res['max_page']);
            let html = ``;
            for (let i in res['data']) {
                html+='<tr>';
                html+=`<td><p class="tabletd-overflow" title="${res['data'][i][1]||""}">${res['data'][i][1]||""}</td>`;
                html+=`<td>${res['data'][i][2]||""}</td>`;
                let redirect = res['data'][i][3];
                // console.log(redirect.length);
                if (redirect==='[]')
                {
                    redirect = ""
                }
                html+=`<td><p class="tabletd-overflow" title='${redirect||""}'>${redirect||""}</td>`;
                html+=`<td><p class="tabletd-overflow" title="${res['data'][i][4]||""}">${res['data'][i][4]||""}</td>`;
                html+=`<td><p class="tabletd-overflow" title="${res['data'][i][5]||""}">${res['data'][i][5]||""}</td>`;
                html+=`<td><p class="tabletd-overflow" title="${res['data'][i][6]||""}">${res['data'][i][6]||""}</td>`;
                html+=`<td><p class="tabletd-overflow" title="${res['data'][i][7]||""}">${res['data'][i][7]||""}</td>`;
                html+=`<td><p class="tabletd-overflow" title="${res['data'][i][8]||""}">${res['data'][i][8]||""}</td>`;
                html+=`<td><p class="tabletd-overflow" title="${res['data'][i][9]||""}">${res['data'][i][9]||""}</td>`;

                html+='</tr>'
            }

            $('.pagination').prev().find('tbody').html(html);


            addPagination(page, max_page);
        }
    });
}

$(document).on('click', '.abnormal.pagination>ul>li', function () {
    var page = $(this).attr('data-page'); // 获取按钮代表的页码
    abnormal_web_table_page(page)//点击页码获取数据
});