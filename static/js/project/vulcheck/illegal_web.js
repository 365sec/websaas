function vulcheck_get_ill_web_html() {
    $.ajax({
        url: 'vulcheck/get_ill_web_html',
        dataType: "html",
        type: "get",
        success: function (res) {

            $('.tab-content').html(res);
            ill_web_table();
            get_ill_keyword();
        }
    });
}

function get_ill_keyword() {

    $.ajax({
        url: 'vulcheck/get_ill_keyword',
        // dataType: "json",
        type: "get",
        success: function (res) {

            let html =`<select class="form-control" name="result.value.illegality.name">`;
            html+=` <option value="">命中关键字</option>`;
           for (let x of res['data'])
           {
            html+=` <option value="${x}">${x}</option>`;
           }
            html+='</select>';
           $("#ill_web_keyword_select").html("").append(html);
        }
    });

}
function ill_web_table() {
    // 获取页码刷新时的高亮显示
    var page = 1;
    if (location.hash.split('?')[1]) {
        page = location.hash.split('?')[1].split('=')[1] || 1;//获取当前页码
    }
    param ={};
    ill_web_table_page(page)//刷新后退加载页码表格数据
}

let param;//用来存储过滤时的变量
function ill_web_search() {

    let post_data = $('#ill_web_form').serializeArray();
    // console.log(post_data);
    for(let x in post_data)
    {
        let key = post_data[x]['name']||"";
        let value = post_data[x]['value']||"";
        if (value)
        {
            param[key]=value;
        }

    }
    ill_web_table_page(1)

}

function ill_web_table_page(page) {
    let data = {
        "param": param,
        "page":page,
    };
    data = JSON.stringify(data);
    $.ajax({
        url: 'vulcheck/get_ill_web_data',
        data:data,
        type: "post",
        success: function (res) {
            // console.log(res);
            let max_page = parseInt(res['max_page']);
            let html = ``;
            for (let x in res['data'])
            {
                html+=`<tr>`;
                // html+=`<td>${res['data'][x]['result']['value']['domain']||""}</td>`;
                html+=`<td>${res['data'][x]['result']['scheme_domain']||""}</td>`;
                html+=`<td>${res['data'][x]['result']['value']['ip']||""}</td>`;
                let class_word_set = new Set();
                let key_word_set = new Set();
                let segment_word_set = new Set();
                for(let i in res['data'][x]['result']['value']['illegality'])
                {
                    class_word_set.add(res['data'][x]['result']['value']['illegality'][i]['name']);
                    for(let j in res['data'][x]['result']['value']['illegality'][i]['value'] )
                    {
                        for (let z in res['data'][x]['result']['value']['illegality'][i]['value'][j]['keyword_list'])
                        {
                            key_word_set.add(res['data'][x]['result']['value']['illegality'][i]['value'][j]['keyword_list'][z]['value'])
                            segment_word_set.add(res['data'][x]['result']['value']['illegality'][i]['value'][j]['keyword_list'][z]['segment'])
                        }
                    }
                }
                let class_word= ``;
                for (let i of class_word_set)
                {
                    class_word+=i+"&nbsp;"
                }

                let key_word= ``;
                for (let i of key_word_set)
                {
                    key_word+=i+"&nbsp;"
                }
                let segment_word= ``;
                for (let i of segment_word_set)
                {
                    segment_word+=i+"&nbsp;"
                }
                html+=`<td>${class_word||""}</td>`;
                html+=`<td>${key_word||""}</td>`;
                // html+=`<td>${key_word||""}</td>`;
                let country_ch =res['data'][x]['result']['value']['location']['country_ch']||"";
                let province =res['data'][x]['result']['value']['location']['province']||"";
                let city =res['data'][x]['result']['value']['location']['city']||"";
                html+=`<td>${country_ch+"&nbsp;"+province+"&nbsp;"+city}</td>`;
                html+=`<td>${segment_word||""}</td>`;
                html+=`<td>${res['data'][x]['result']['value']['idc']||""}</td>`;
                html+=`<td>${res['data'][x]['result']['value']['save_time']||""}</td>`;
                html+=`<td>${""}</td>`;
                // html+=`<td>${res['data'][x]['finish_time']}</td>`;
                // html+=`<td><div><a href="#" >停止</a></div></td>`;
                html+=`</tr>`;
            }
            $('.pagination').prev().find('tbody').html(html);
            addPagination(page,max_page);
        }
    });
}