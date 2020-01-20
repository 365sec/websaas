
var report_data;
var ip_scan;
var web_scan;
var statistical;
var statistical_one;
function get_data(data,ip_scan_,web_scan_,statistical_,statistical_one_) {
    report_data = data;
    ip_scan = ip_scan_;
    web_scan = web_scan_;
    statistical = statistical_;
    statistical_one = statistical_one_;
    // console.log(report_data);
    console.log(ip_scan);
    console.log(web_scan);
    console.log(statistical);
    console.log(statistical_one);

}

function get_html() {
    title_html();
    chart_html();
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

function chart_html() {
    let _html=``;

}
function body_html() {
    let _html=``;

    let result = report_data.data.result;
    for (res in statistical_one)
    {
        let num =0;
        for (x in statistical_one[res])
        {
            for (j in statistical_one[res][x])
            {
                num+=statistical_one[res][x][j]
            }
          // console.log(x)
        }
        // console.log(num);
        //  console.log(statistical_one[res]);
        _html+=`<tr>`;
        _html+=`<td> <a onclick="url_detail('${res}')">${result[res]["url"]}</a> </td>`;
        _html+=`<td>${result[res]["domain"]}</td>`;
        _html+=`<td>${result[res]["title"]}</td>`;
        _html+=`<td>${result[res]["description"]}</td>`;
        _html+=`<td>${result[res]["protocols"]}</td>`;
        _html+=`<td>${num}</td>`;
        // console.log(result[res]);
        _html+=`</tr>`;
    }
    $("#body_div_tbody").html("").append(_html);
}

function url_detail(res) {
    let data =  report_data.data.result[res];
    // console.log(data)
}