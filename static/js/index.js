function click_issue_tesk() {

    let task = $("#d_issue_task_text").val();
    let parm = {};
    parm['task'] = task;
    $.ajax({
        url: "vulcheck/issue_tesk",
        type: "post",
        data: parm,
        success: function (data) {

            // console.log(data);
            $("#d_issue_task_text_result").html("").append(JSON.stringify(data, undefined, 2))
        }
    })
}


function click_task_list() {
    $.ajax({
        url: "vulcheck/task_list",
        type: "get",
        success: function (data) {
            console.log(data);

            let table_html = ``;

            for (x in data['data']) {
                table_html += `
                <tr>
                    <td>${data['data'][x]['task_id']}</td>
                    <td>${data['data'][x]['spider_task_id']}</td>
                    <td>${data['data'][x]['finish_time']}</td>
                    <td>${data['data'][x]['status']}</td>
<!--                    <td><button  class="button " onclick="click_task_result_json('${data['data'][x]['task_id']}')"  data-toggle="modal" data-target="#myModal">详情</button></td>-->
                    <td><a  target="_blank" href="vulcheck/get_report_html?task_id=${data['data'][x]['task_id']}"  >详情</a></td>
<!--                    <td><button  class="button " onclick="click_task_result_report('${data['data'][x]['task_id']}')" >报告</button></td>-->
                    <td><a href="vulcheck/get_scan_result_report_ip?task_id=${data['data'][x]['task_id']}" >ip报告</a></td>
                    <td><a href="vulcheck/get_scan_result_report_web?task_id=${data['data'][x]['task_id']}" >web报告</a></td>
                    <td><a href="vulcheck/get_scan_result_report_word?task_id=${data['data'][x]['task_id']}" >key_word报告</a></td>
                </tr>
                
                `
            }
            let html;
            html = ` <table class="table table-bordered">
            <caption>任务列表</caption>
        <thead>
        <tr>
            <th>task_id</th>
            <th>spider_task_id</th>
            <th>finish_time</th>
            <th>status</th>
            <th>结果</th>
        </tr>
        </thead>
        <tbody>
            ${table_html}
        </tbody>
        </table>`;
            $("#d_get_task_list").html("").append(html);
        }

    })
}

function click_task_finish_list() {
    $.ajax({
        url: "vulcheck/task_finish_list",
        type: "get",
        success: function (data) {
            console.log(data);
            let table_html = ``;

            for (x in data) {
                let statistical =JSON.stringify(data[x]['statistical']);
                table_html += `
                <tr>
                    <td>${data[x]['task_id']}</td>
                    <td>${data[x]['spider_task_id']}</td>
                    <td>${data[x]['finish_time']}</td>
                    <td>${data[x]['status']}</td>
                    <td>${statistical}</td>
                    <td><a  target="_blank" href="vulcheck/get_report_html?task_id=${data[x]['task_id']}"  >详情</a></td>
                    <td><a href="vulcheck/get_scan_result_report_ip?task_id=${data[x]['task_id']}" >ip报告</a></td>
                    <td><a href="vulcheck/get_scan_result_report_web?task_id=${data[x]['task_id']}" >web报告</a></td>
                    <td><a href="vulcheck/get_scan_result_report_word?task_id=${data[x]['task_id']}" >key_word报告</a></td>
                </tr>
                
                `
            }
            let html;
            html = ` <table class="table table-bordered">
            <caption>任务列表</caption>
        <thead>
        <tr>
            <th>task_id</th>
            <th>spider_task_id</th>
            <th>finish_time</th>
            <th>status</th>
            <th>威胁</th>
            <th>结果</th>
        </tr>
        </thead>
        <tbody>
            ${table_html}
        </tbody>
        </table>`;
            $("#d_get_task_finish_list").html("").append(html);
        }

    })
}

function click_task_result_json(task_id) {
    /*获得任务列表JSON*/
    // console.log($(this))
    let parm = {};
    parm['task_id'] = task_id;
    $.ajax({
        url: "vulcheck/et_scan_result",
        type: "get",
        data: parm,
        success: function (data) {
            // console.log(data);
            $("#model_result").html("").append(JSON.stringify(data, undefined, 4))
            // $("#myModal").show()
        }
    })
}

function click_task_result_report(task_id) {
    /*获得任务列表JSON*/
    // console.log($(this))
    let parm = {};
    parm['task_id'] = task_id;
    $.ajax({
        url: "vulcheck/get_scan_result_report",
        type: "get",
        data: parm,
        success: function (data) {
            console.log(data['data']['result']);
            let res_list = [];
            let keyword_res_list = [];
            for (x in data['data']['result']) {
                let res = data['data']['result'][x];
                let result = {};
                result.host = res['url'] || "";
                result.domain = res['domain'] || "";
                result.title = res['title'];
                result.port = res['protocols'].split("/")[0] || "";
                result.server = res['protocols'].split("/")[1] || "";
                result.update_time = res['save_time'] || "";
                result.icp = res.hasOwnProperty("icp");
                result.icp_server = "";
                if (result.icp) {
                    result.icp_server = res['icp']['icp_code'] || ""
                }
                res_list.push(result);

                if (res.hasOwnProperty("illegality")) {
                    if (res.illegality.hasOwnProperty("keywords")) {
                        let  keywords = res.illegality.keywords;
                        keywords.forEach(function (keyword) {
                            let res_keyword={};
                            res_keyword['url']=keyword['url']||"";
                            res_keyword['ip']=res['ip']||"";
                            res_keyword['title']=res['title']||"";
                            res_keyword['time']=res['save_time']||"";
                            if (keyword.hasOwnProperty("value"))
                            {
                                keyword.value.forEach(function (param) {
                                    res_keyword['type'] = param.type||"";
                                    param.keyword_list.forEach(function (val) {
                                        res_keyword['value'] = val.value||"";
                                        keyword_res_list.push(res_keyword);
                                    });
                                });
                            }
                        })

                    }
                }
            }
            console.log(res_list);
            console.log(keyword_res_list);
        }
    })
}

function click_stop_task() {
    let task_id = $("#id_stop_task").val();
    if (!task_id) {
        return
    }
    let parm = {};
    parm['task_id'] = task_id;
    $.ajax({
        url: "vulcheck/stop_task",
        type: "get",
        success: function (data) {
            console.log(data);
            let obj = JSON.stringify(data, undefined, 2);
            $("#d_stop_task_div").html("").append(obj)
        }
    })
}

function click_task_result() {

    let task_id = $("#id_get_task_result").val();
    if (!task_id) {
        return
    }
    let parm = {};
    parm['task_id'] = task_id;
    $.ajax({
        url: "vulcheck/get_scan_result",
        type: "get",
        data: parm,
        success: function (data) {
            console.log(data);
            let obj = JSON.stringify(data, undefined, 2);
            $("#d_get_task_result_div").html("").append(obj)
        }
    })
}


function click_task_status() {

    let task_id = $("#id_get_task_status").val();
    if (!task_id) {
        return
    }
    let parm = {};
    parm['task_id'] = task_id;
    $.ajax({
        url: "vulcheck/task_status",
        type: "get",
        data: parm,
        success: function (data) {
            console.log(data);
            let obj = JSON.stringify(data, undefined, 2);
            $("#d_get_task_status_div").html("").append(obj)
        }
    })
}

function click_get_plug() {
    let data = get_plug_list();

    let table_html = ``;

    for (x in data['data']) {
        table_html += `
                <tr>
                    <td>${data['data'][x]['plugin_name']}</td>
                    <td>${data['data'][x]['issue_name']}</td>
                    <td>${data['data'][x]['level']}</td>
                </tr>
                
                `
    }
    let html;
    html = ` <table class="table table-bordered">
            <caption>任务列表</caption>
        <thead>
        <tr>
            <th>plugin_name</th>
            <th>issue_name</th>
            <th>level</th>
        </tr>
        </thead>
        <tbody>
            ${table_html}
        </tbody>
        </table>`;
    $("#d_get_plug").html("").append(html);

}

function get_plug_list() {
    /*获得插件列表*/
    let res;
    $.ajax({
        url: "vulcheck/get_plug",
        type: "get",
        async: false,
        success: function (data) {
            // console.log(data);
            res = data

        }
    });
    // console.log(res)
    return res
}

function d_issue_tesk_batch_click() {

    let plug = get_plug_list();
    console.log(plug);
    /*
    * 批量检测被点击*/

    let plug_html = ``;
    for (x in plug['data']) {
        // console.log(plug['data'][x]['plugin_name'])
        let plug_name = plug['data'][x]['plugin_name'];
        plug_html += `<lable> <input type="checkbox" name="plugin_name" value="${plug_name}">${plug_name}</lable><br>`
    }
    $("#plug_check_list").html("").append(plug_html);

    let spider_html = ``;
    spider_html += `<lable>maxpage<input type="text" name="maxpage" placeholder="500" class="form-control"></lable><br>`;
    spider_html += `<lable>maxdepth<input type="text" name="maxdepth" placeholder="3" class="form-control"></lable><br>`;
    spider_html += `<lable>notscanurl<input type="text" name="notscanurl" placeholder="/.*?delete*,/.*?logout*,/.*?loginout*" class="form-control"></lable><br>`;
    spider_html += `<lable>crawlrule<input type="text" name="crawlrule" placeholder="0" class="form-control"></lable><br>`;
    spider_html += `<lable>notscanfile<input type="text" name="notscanfile" placeholder="" class="form-control"></lable><br>`;
    $("#spider_check_list").html("").append(spider_html);
}

function d_issue_task_batch_submit() {

    // console.log( $('#task_batch_form').serialize())
    let post_data = $('#task_batch_form').serializeArray();
    console.log(post_data);
    let res;
    $.ajax({
        url: "vulcheck/issue_task_list",
        type: "post",
        data: post_data,
        async: false,
        success: function (data) {
            // console.log(data);
            res = data;
            $("#d_issue_task_batch_res").html("").append(JSON.stringify(data, undefined, 4));
            console.log(data)
        }
    });

}

