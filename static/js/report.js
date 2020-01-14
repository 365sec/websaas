
var report_data;
var ip_scan;
var web_scan;
function get_data(data,ip_scan_,web_scan_) {
    report_data = data;
    ip_scan = ip_scan_;
    web_scan = web_scan_;
    console.log(report_data);
    console.log(ip_scan);

}

function get_html() {
    title_html();
    body_html();
}

function title_html() {
    let _html=``;

    _html+=`<li>开始时间：${report_data.data.start_time}</li>`;
    _html+=`<li>结束时间：${report_data.data.finish_time}</li>`;
    _html+=`<li>扫描时间：${report_data.data.scan_time}</li>`;
    _html+=`<li>任务id：${report_data.data['task_id']}</li>`;
    // console.log(report_data.data['task_id']);
    $("#title_div").html("").append(_html);
}
function body_html() {
    let _html=``;

    let result = report_data.data.result;
    for (res in result)
    {
        _html+=`<tr>`;
        _html+=`<td> <a onclick="url_detail('${res}')">${result[res]["url"]}</a> </td>`;
        _html+=`<td>${result[res]["domain"]}</td>`;
        _html+=`<td>${result[res]["title"]}</td>`;
        _html+=`<td>${result[res]["description"]}</td>`;
        _html+=`<td>${result[res]["protocols"]}</td>`;
        // console.log(result[res]);
        _html+=`</tr>`;
    }
    $("#body_div_tbody").html("").append(_html);
}

function url_detail(res) {
    let data =  report_data.data.result[res];
    // console.log(data)
}