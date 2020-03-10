function vulcheck_get_beian_html() {
    $.ajax({
        url: 'vulcheck/get_beian_html',
        dataType: "html",
        type: "get",
        success: function (res) {

            $('.tab-content').html(res);
            // 更改title
            document.title = '备案列表';
            beian_table();

        }
    });
}

let beian_param;
function beian_table() {
    // 获取页码刷新时的高亮显示
    var page = 1;
    if (location.hash.split('?')[1]) {
        page = location.hash.split('?')[1].split('=')[1] || 1;//获取当前页码
    }
    beian_param ={};
    beian_table_page(page)//刷新后退加载页码表格数据
}

function beian_table_page(page) {
    let data = {
        "param": beian_param,
        "page":page,
    };
    data = JSON.stringify(data);
    $.ajax({
        url: 'vulcheck/get_beian_data',
        data: data,
        type: "post",
        success: function (res) {
            console.log(res);
            let max_page = parseInt(res['max_page']);
            let html =``;
            for (let x in res['data']) {
                html+=`<tr>`;
                html+=`<td><p class="tabletd-overflow" title="${res['data'][x]['result']['value']['title']||""}">${res['data'][x]['result']['value']['title']||""}</p></td>`;
                html+=`<td><p class="tabletd-overflow" title="${res['data'][x]['result']['value']['domain']||""}">${res['data'][x]['result']['value']['domain']||""}</p></td>`;
                html+=`<td><p class="tabletd-overflow" title="${res['data'][x]['result']['value']['ip']||""}">${res['data'][x]['result']['value']['ip']||""}</p></td>`;
                let country_ch =res['data'][x]['result']['value']['location']['country_ch'] || "";
                let province =res['data'][x]['result']['value']['location']['province']||"";
                let city =res['data'][x]['result']['value']['location']['city']||"";
                html+=`<td><p class="tabletd-overflow" title="${country_ch+"&nbsp;"+province+"&nbsp;"+city}">${country_ch+"&nbsp;"+province+"&nbsp;"+city}</p></td>`;
                let icp_code = ""; //icp备案号
                let site_name = "";//备案网站名称 如人民网
                let beian_domain = "";//备案域名 可能是一级域名 也可能是二级域名
                let org_name = "";//企业或事业单位名称
                let nature = "";//单位类型 如企业 事业单位
                if(res['data'][x]['result']['value'].hasOwnProperty("icp"))
                {
                    icp_code =res['data'][x]['result']['value']['icp']['icp_code']||"";
                    site_name =res['data'][x]['result']['value']['icp']['site_name']||"";
                    beian_domain =res['data'][x]['result']['value']['icp']['beian_domain']||"";
                    org_name =res['data'][x]['result']['value']['icp']['org_name']||"";
                    nature =res['data'][x]['result']['value']['icp']['nature']||"";
                }
                html+=`<td><p class="tabletd-overflow" title="${icp_code}">${icp_code}</p></td>`;
                html+=`<td><p class="tabletd-overflow" title="${site_name}">${site_name}</p></td>`;
                html+=`<td><p class="tabletd-overflow" title="${beian_domain}">${beian_domain}</p></td>`;
                html+=`<td><p class="tabletd-overflow" title="${org_name}">${org_name}</p></td>`;
                html+=`<td><p class="tabletd-overflow" title="${nature}">${nature}</p></td>`;
                html+=`<td><p class="tabletd-overflow" title="${res['data'][x]['result']['value']['url']||""}">${res['data'][x]['result']['value']['url']||""}</p></td>`;
                let detail = JSON.stringify(res['data'][x]);
                let b = new Base64();
                detail = b.encode(detail);
                html+=`<td><a onclick='get_total_one_detail("${detail}")'>详情<i class="iconfont icon-link"></i></a></td>`;
                html+=`</tr>`;

            }

            $('.pagination').prev().find('tbody').html(html);
            addPagination(page,max_page);
        }
    });
}
$(document).on('click', '.beian.pagination>ul>li', function () {
    var page = $(this).attr('data-page'); // 获取按钮代表的页码
    beian_table_page(page)//点击页码获取数据
});

function beian_search() {
    let post_data = $('#beian_form').serializeArray();
    // console.log(post_data);
    for(let x in post_data)
    {
        let key = post_data[x]['name']||"";
        let value = post_data[x]['value']||"";
        if (value)
        {
            beian_param[key]=value;
        }
    }
    if (beian_param['result.value.icp']==="1")
    {
        beian_param['result.value.icp'] = {'$exists': true}
    }else if (beian_param['result.value.icp']==="0") {
        beian_param['result.value.icp'] = {'$exists': false}
    }
    beian_table_page(1)
}