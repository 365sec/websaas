function vulcheckIndex() {
    $.ajax({
        url: 'vulcheck/index',
        dataType: "html",
        type: "get",
        success: function (res) {
            $('.tab-content').html(res);
            vulcheckIndexTable()//加载表格数据
        }
    });
}

function vulcheckIndexTable() {
    // 获取页码刷新时的高亮显示
    var page = 1;
    if (location.hash.split('?')[1]) {
        page = location.hash.split('?')[1].split('=')[1] || 1;//获取当前页码
    }
    vulcheckIndexTablePage(page)//刷新后退加载页码表格数据
}

$(document).on('click', '.pagination>ul>*', function () {
    var page = $(this).attr('data-page'); // 获取按钮代表的页码
    vulcheckIndexTablePage(page)//点击页码获取数据
});

function vulcheckIndexTablePage(page) {
    // 模拟ajax异步获取数据
    setTimeout(function () {
        var html = '<tr>' +
            '<td>' + page + '</td>' +
            '<td>2020-01-15</td>' +
            '<td>5</td>' +
            '<td>3</td>' +
            '<td>222</td>' +
            '<td>8.0</td>' +
            '<td><div>高危</div></td>' +
            '<td><div><i class="iconfont icon-default"></i></div></td>' +
            '</tr>';
        $('.pagination').prev().find('tbody').html(html);
        addPagination(page, 5)
    }, 0)

}