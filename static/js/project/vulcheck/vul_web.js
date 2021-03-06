// 漏洞列表
function vulcheck_get_vul_web_html() {
    $.ajax({
        url: 'vulcheck/get_vul_web_html',
        dataType: "html",
        type: "get",
        success: function (res) {

            $('.right-content').html(res);
            // 更改title
            document.title = '漏洞列表';
            vul_web_table();
            get_vul_keyword();
            get_vul_total();
        }
    });
}

function get_vul_keyword() {
    /*获得关键词下拉框的信息*/
    $.ajax({
        url: 'vulcheck/get_vul_keyword',
        // dataType: "json",
        type: "get",
        success: function (res) {
            // console.log(res);

            let html = `<select name="result.value.vulnerables.name">`;
            html += ` <option value="null">漏洞名称</option>`;
            for (let x of res['data']) {
                html += ` <option value="${x['_id']}">${x['_id']}</option>`;
            }
            html += '</select>';
            $("#vul_web_keyword_select").html("").append(html);
            ill_web_top_content(res);
        }
    });

}

function ill_web_top_content(res) {
    console.log(res)
    var data = [];//原始数据
    var dataafter =[];//超出范围处理后数据
    var maxvalue = 100;//最大值
    for(let x of res['data'])
    {
        data.push({'name': x['_id'],'value':x['count']});
        dataafter.push(x['count']> maxvalue?{'name': x['_id'],'value':100}:{'name': x['_id'],'value':x['count']});
    }
    var myChart = echarts.init(document.getElementById('vue_web_threat_content'));
    var option = {
        tooltip: {
            trigger: 'item',
            formatter: function(parames){
                if(data[parames.dataIndex-2]) return parames.name + ':' + data[parames.dataIndex-2].value;
            }
        },
        series:[{
            type: 'treemap',
            width: '100%',
            height: '100%',
            breadcrumb: false,
            roam: false,
            nodeClick: false,
            color:[
                "#893448",
                "#b0475e",
                "#c75e76",
                "#cf607c",

                "#d95850",
                "#e6746f",
                "#e88b88",
                "#f0aca6",

                "#f29564",
                "#fab088",
                "#fcbc96",
                "#ffc06f",

                "#ffb248",
                "#ffcf92",
                "#ffdbaf",
                "#fff0b1",

                "#ffe2c8",
                "#ffeddd",
                "rgb(247,238,173)",
                "#ffeddd",

            ],

            itemStyle: {
                borderWidth:2
            },
            label: {
                fontSize: 12,
                formatter: function(parames){
                    if(data[parames.dataIndex-2].value)

                        return parames.name + '\n' + data[parames.dataIndex-2].value;
                }
            },
            data: [
                {
                    name: '漏洞统计',
                    children: dataafter
                }
            ]

        }]
    };
    myChart.setOption(option);
}

let vul_param;

function vul_web_table() {
    // 获取页码刷新时的高亮显示
    var page = 1;
    if (location.href.split('?')[1]) {
        page = location.href.split('?')[1].split('=')[1].split('&')[0] || 1;//获取当前页码
    }
    vul_param = {};
    vul_web_table_page(page)//刷新后退加载页码表格数据
}

function vul_web_search() {
    let post_data = $('#vul_web_form').serializeArray();
    console.log(post_data);
    for (let x in post_data) {
        let key = post_data[x]['name'] || "";
        let value = post_data[x]['value'] || "";
        if(value ==="null"||value ==="")
        {
            vul_param[key]=value;
            if (vul_param.hasOwnProperty(key))
            {
                delete vul_param[key]
            }
        }
        if (value&&value!=="null") {
            vul_param[key] = value;
        }

    }
    vul_web_table_page(1)
}

let severity_dir = {}
severity_dir['Urgent'] = "严重"
severity_dir['High'] = "高危"
severity_dir['Medium'] = "中危"
severity_dir['Low'] = "低级"
severity_dir['Information'] = "信息"
function vul_web_table_page(page) {
    let data = {
        "param": vul_param,
        "page": page,
    };
    data = JSON.stringify(data);
    $.ajax({
        url: 'vulcheck/get_vul_web_data',
        data: data,
        type: "post",
        success: function (res) {
            console.log(res);
            let max_page = parseInt(res['max_page']);
            let html = ``;
            for (let x in res['data']) {
                html += `<tr>`;
                // html+=`<td>${res['data'][x]['result']['value']['domain']||""}</td>`; verify_url
                let verify_url =res['data'][x]['result']['value']['vulnerables']['verify_url']||"";
                html += `<td><p class="tabletd-overflow" title="${verify_url || ""}">${verify_url|| ""}</p></td>`;
                html += `<td>${res['data'][x]['result']['value']['ip'] || ""}</td>`;
                let class_word = res['data'][x]['result']['value']['vulnerables']['name']||"";
                let segment_word = res['data'][x]['result']['value']['vulnerables']['result_desc']||"";

                segment_word = segment_word.replace(/</g, "&lt")
                    .replace(/>/g, "&gt")
                    .replace(/\"/g, "&quot;");
                // console.log(segment_word);
                html += `<td><p class="tabletd-overflow" title='${class_word || ""}'>${class_word || ""}</p></td>`;
                html += `<td><p class="tabletd-overflow" title='${segment_word || ""}'>${segment_word || ""}</p></td>`;
                let severity = res['data'][x]['result']['value']['vulnerables']['severity'];
                html+=`<td>${severity_dir[severity]||""}</td>`;
                html += `<td>${res['data'][x]['result']['value']['save_time'] || ""}</td>`;
                let detail = JSON.stringify(res['data'][x]['result']['value']['vulnerables']);
                let b = new Base64();
                detail = b.encode(detail);
                html += `<td><a data-toggle="modal" data-target="#vul_detail_modal" onclick='get_vul_one_detail("${detail}")'>详情<i class="iconfont icon-link"></i></a></td>`;

                html += `</tr>`;
            }
            $('.pagination').prev().find('tbody').html(html);
            addPagination(page, max_page);
        }
    });
}

function get_vul_total() {
    /*获得漏洞列表上部分的统计信息*/
    $.ajax({
        url: 'vulcheck/get_vul_total',
        type: "get",
        success: function (res) {

            let top_website = res['vul_web'].reduce(function (sum, prve) {
                sum += prve.length;
                return sum
            }, 0);

            let top_threat = res['vul_keyword'].reduce(function (sum, prve) {

                sum += prve['count'];
                return sum
            }, 0);

            $("#vul-web-top-asset").html("").append(res['all_web'][0]);
            $("#vul-web-top-threat").html("").append(top_threat);
            $("#vul-web-top-website").html("").append(top_website);
            // console.log(res)
        }
    });

}

function get_vul_one_detail(data) {
    let tmp_list =[];
    tmp_list.push({"url":"存在漏洞的URL"})
    tmp_list.push({"plugin_name":"插件名称或POC名称"})
    tmp_list.push({"host":"FUZZ测试时的请求头部:host"})
    tmp_list.push({"Referer":"FUZZ测试时的请求头部:Referer"})
    tmp_list.push({"variable":"存在漏洞的变量"})
    tmp_list.push({"result_desc":"漏洞结果描述"})
    tmp_list.push({"payload":"fuzz测试构造的payload"})
    tmp_list.push({"method":"请求方法"})
    tmp_list.push({"severity":"漏洞严重等级"})
    let b = new Base64();
    data = b.decode(data);
    data = JSON.parse(data);

    let html1 = ``;
    for(let item of tmp_list)
    {
        for (let key in item) {
            if (data.hasOwnProperty(key)&&data[key])
            {
                let val = data[key];
                if (key==="severity")
                {
                    val = severity_dir[data[key]];
                }
                html1+=`
                 <div class="columnT-tr clearfix">
                                    <div class="columnT-tr-left">${item[key]}</div>
                                    <div class="columnT-tr-right">${val||""}</div>
                                    <div class="columnT-tip">点击展开</div>
                                </div>
                `
            }
        }
    }
    $("#vul_detail_div").html("").append(html1);
}