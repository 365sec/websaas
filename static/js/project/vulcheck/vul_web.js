// 漏洞列表
function vulcheck_get_vul_web_html() {
    $.ajax({
        url: 'vulcheck/get_vul_web_html',
        dataType: "html",
        type: "get",
        success: function (res) {

            $('.tab-content').html(res);
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
            console.log(res);

            let html = `<select name="result.value.vulnerables.name">`;
            html += ` <option value="">漏洞名称</option>`;
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
    let html = ``;
    for(let x of res['data'])
    {
        html +=`<div class="ill-web-top-number all">${x['_id']} <div id="ill-web-top-number-heilian-web">${x['count']}</div></div>`;
    }
    $("#ill_web_top_content").html("").append(html);
}

let vul_param;

function vul_web_table() {
    // 获取页码刷新时的高亮显示
    var page = 1;
    if (location.hash.split('?')[1]) {
        page = location.hash.split('?')[1].split('=')[1] || 1;//获取当前页码
    }
    vul_param = {};
    vul_web_table_page(page)//刷新后退加载页码表格数据
}

function vul_web_search() {
    let post_data = $('#vul_web_form').serializeArray();
    // console.log(post_data);
    for (let x in post_data) {
        let key = post_data[x]['name'] || "";
        let value = post_data[x]['value'] || "";
        if (value) {
            vul_param[key] = value;
        }

    }
    vul_web_table_page(1)
}

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
            // console.log(res);
            let max_page = parseInt(res['max_page']);
            let html = ``;
            for (let x in res['data']) {
                html += `<tr>`;
                // html+=`<td>${res['data'][x]['result']['value']['domain']||""}</td>`;
                html += `<td><p class="tabletd-overflow" title="${res['data'][x]['result']['scheme_domain'] || ""}">${res['data'][x]['result']['scheme_domain'] || ""}</p></td>`;
                html += `<td>${res['data'][x]['result']['value']['ip'] || ""}</td>`;
                let class_word_set = new Set();
                let key_word_set = new Set();
                let segment_word_set = new Set();
                for (let i in res['data'][x]['result']['value']['vulnerables']) {
                    class_word_set.add(res['data'][x]['result']['value']['vulnerables'][i]['name']);
                    segment_word_set.add(res['data'][x]['result']['value']['vulnerables'][i]['result_desc'])

                }
                let class_word = ``;
                for (let i of class_word_set) {
                    class_word += i + "&nbsp;"
                }

                let key_word = ``;
                for (let i of key_word_set) {
                    key_word += i + "&nbsp;"
                }
                let segment_word = ``;
                for (let i of segment_word_set) {
                    segment_word += i + "&nbsp;"
                }
                segment_word = segment_word.replace(/</g, "&lt")
                    .replace(/>/g, "&gt")
                    .replace(/\"/g, "&quot;");
                // console.log(segment_word);
                html += `<td><p class="tabletd-overflow" title='${class_word || ""}'>${class_word || ""}</p></td>`;
                // html+=`<td>${key_word||""}</td>`;
                // html+=`<td>${key_word||""}</td>`;
                let country_ch = res['data'][x]['result']['value']['location']['country_ch'] || "";
                let province = res['data'][x]['result']['value']['location']['province'] || "";
                let city = res['data'][x]['result']['value']['location']['city'] || "";
                html += `<td><p class="tabletd-overflow" title="${country_ch + "&nbsp;" + province + "&nbsp;" + city}">${country_ch + "&nbsp;" + province + "&nbsp;" + city}</p></td>`;
                html += `<td><p class="tabletd-overflow" title="${segment_word || ""}">${segment_word || ""}</p></td>`;
                html += `<td>${res['data'][x]['result']['value']['save_time'] || ""}</td>`;
                let detail = JSON.stringify(res['data'][x]);
                let b = new Base64();
                detail = b.encode(detail);
                html += `<td><a onclick='get_total_one_detail("${detail}")'>详情<i class="iconfont icon-link"></i></a></td>`;

                html += `</tr>`;
            }
            $('.pagination').prev().find('tbody').html(html);
            addPagination(page, max_page);
        }
    });
}

$(document).on('click', '.vul-web.pagination>ul>*', function () {
    var page = $(this).attr('data-page'); // 获取按钮代表的页码
    vul_web_table_page(page)//点击页码获取数据
});


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