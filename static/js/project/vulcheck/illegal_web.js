function vulcheck_get_ill_web_html() {
    $.ajax({
        url: 'vulcheck/get_ill_web_html',
        dataType: "html",
        type: "get",
        success: function (res) {

            $('.right-content').html(res);
            document.title = '违法网站分析';
            ill_web_table();
            get_ill_keyword();
            get_ill_feature_keyword();
            get_ill_total();
        }
    });
}

function get_ill_total() {
    /*获得违法信息列表上部分的统计信息*/
    $.ajax({
        url: 'vulcheck/get_ill_total',
        type: "get",
        success: function (data) {
            // console.log(data);
            let res = data['data'];
            let key_info = data['key_info'];
            // console.log(data)
            let keywords=0;
            let keywords_web=0;
            let trojanhorse=0;
            let trojanhorse_web=0;
            let domain_hijack=0;
            let domain_hijack_web=0;
            let black_link=0;
            let black_link_web=0;
            let yellow_image=0;
            let yellow_image_web=0;
            for(let i in res)
            {
                switch (res[i]['_id']) {
                    case 'keywords':
                        keywords = res[i]['count'];
                        break;
                    case 'trojanhorse':
                        trojanhorse = res[i]['count'];
                        break;
                    case 'domain_hijack':
                        domain_hijack = res[i]['count'];
                        break;
                    case 'black_link':
                        black_link = res[i]['count'];
                        break;
                    case 'yellow_image':
                        yellow_image = res[i]['count'];
                        break;
                }
            }

            for(let i in key_info)
            {
                switch (key_info[i]['_id']) {
                    case 'keywords':
                        keywords_web = key_info[i]['count'];
                        break;
                    case 'trojanhorse':
                        trojanhorse_web = key_info[i]['count'];
                        break;
                    case 'domain_hijack':
                        domain_hijack_web = key_info[i]['count'];
                        break;
                    case 'black_link':
                        black_link_web = key_info[i]['count'];
                        break;
                    case 'yellow_image':
                        yellow_image_web = key_info[i]['count'];
                        break;
                }
            }

            $("#ill-web-top-number-heilian-num").html("").append(black_link);
            $("#ill-web-top-number-heilian-web").html("").append(black_link_web);
            $("#ill-web-top-number-guama-num").html("").append(trojanhorse);
            $("#ill-web-top-number-guama-web").html("").append(trojanhorse_web);
            $("#ill-web-top-number-hijack-num").html("").append(domain_hijack);
            $("#ill-web-top-number-hijack-web").html("").append(domain_hijack_web);
            $("#ill-web-top-number-sense-num").html("").append(keywords);
            $("#ill-web-top-number-sense-web").html("").append(keywords_web);
            $("#ill-web-top-number-image-num").html("").append(yellow_image);
            $("#ill-web-top-number-image-web").html("").append(yellow_image_web);

            // console.log(res)
        }
    });


}

function get_ill_keyword() {

    $.ajax({
        url: 'vulcheck/get_ill_keyword',
        // dataType: "json",
        type: "get",
        success: function (res) {

            let html =`<select name="result.value.illegality.name">`;
            html+=` <option value="null" >违法关键字</option>`;
           for (let x of res['data'])
           {
            html+=` <option value="${x}">${x}</option>`;
           }
            html+='</select>';
           $("#ill_web_keyword_select").html("").append(html);
        }
    });

}
function get_ill_feature_keyword() {

    $.ajax({
        url: 'vulcheck/get_ill_feature_keyword',
        // dataType: "json",
        type: "get",
        success: function (res) {
            console.log(res);
            let html =`<select name="result.value.illegal_feature.name">`;
            html+=` <option value="null">网站类型</option>`;
            let top_html=``;
            for (let x of res['data'])
            {
                html+=` <option value="${x['_id']}">${x['_id']}</option>`;
                top_html+=` <div class="ill-web-top-number all">${x['_id']} <div>${x['count']}</div></div>`;
            }
            html+='</select>';
            $("#ill_feature_web_keyword_select").html("").append(html);

            $("#ill_feature_top_div").html("").append(top_html)
        }
    });

}


function ill_web_table() {
    // 获取页码刷新时的高亮显示
    var page = 1;
    page = getURLString('page');
    param ={};
    var type = getURLString('type');
    switch (type) {
        case '1':
            ill_web_table_page_gua_ma(page);
            break;
        case '2':
            ill_web_table_page_an_lian(page);
            break;
        case '3':
            ill_web_table_page_min_gan_ci(page);
            break;
        case '4':
            ill_web_table_page_jie_chi(page);
            break;
        case '5':
            ill_web_table_page_yellow_img(page);
            break;
        case '6':
            ill_web_table_page_wei_fa(page);
            break;
        default:
            ill_web_table_page_gua_ma(page);
    }
}

let param;//用来存储过滤时的变量
function ill_web_search() {

    let post_data = $('#ill_web_form').serializeArray();
    console.log(post_data);
    for(let x in post_data)
    {
        let key = post_data[x]['name']||"";
        let value = post_data[x]['value']||"";
        if(value ==="null"||value==="")
        {
            param[key]=value;
            if (param.hasOwnProperty(key))
            {
                delete param[key]
            }
        }
        if (value&&value!=="null")
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
        url: 'vulcheck/get_ill_web_data_wei_fa',
        data:data,
        type: "post",
        success: function (res) {
            let max_page = parseInt(res['max_page']);
            let html = ``;
            for (let x in res['data'])
            {
                html+=`<tr>`;
                //网站域名
                html+=`<td><p class="tabletd-overflow" title="${res['data'][x]['result']['scheme_domain']||""}">${res['data'][x]['result']['scheme_domain']||""}</p></td>`;
                //关联IP
                html+=`<td>${res['data'][x]['result']['value']['ip']||""}</td>`;

                let web_type = res['data'][x]['result']['value']['illegal_feature']['name'];
                let web_url = res['data'][x]['result']['value']['illegal_feature']['url'];
                let web_description = htmlEncode(res['data'][x]['result']['value']['illegal_feature']['description']);
                //	网站类型
                html+=`<td>${web_type||""}</td>`;
                //	描述
                html+=`<td><p class="tabletd-overflow" title="${web_description||""}">"${web_description}"</p></td>`;
                //	URL
                html+=`<td><p class="tabletd-overflow" title="${web_url||""}">${web_url||""}</p></td>`;
                let addr = get_addr(res['data'][x]['result']['value']);
                //	归属地区
                html+=`<td><p class="tabletd-overflow" title="${addr}">${addr}</td>`;

                //扫描时间
                html+=`<td>${res['data'][x]['result']['value']['save_time']||""}</td>`;
                //网页快照
                html+=get_images1(res['data'][x]['result']['value']);
                //详情
                let detail = get_detail_bs4(res['data'][x]['result']['value']['illegal_feature']);

                html+=`<td><a data-toggle="modal" data-target="#ill_detail_modal" onclick=get_ill_feature_one_detail("${detail}")>详情<i class="iconfont icon-link"></i></a></td>`;
            }
            $('.pagination').prev().find('tbody').html(html);
            addPagination(page,max_page);
        }
    });
}


function ill_web_table_page_gua_ma(page) {
    $('#ill_web_form').css('visibility','hidden');

    param = {'result.value.illegality.name': '网页挂马'};
    /*网页挂马*/
    let data = {
        "param": {'result.value.illegality.name': '网页挂马'},
        "page":page,
    };
    data = JSON.stringify(data);
    $.ajax({
        url: 'vulcheck/get_ill_web_data',
        data:data,
        type: "post",
        success: function (res) {
            let tab_div=`
            <tr>
                <th width="15%">网站域名</th>
                <th width="120px">关联IP</th>
              
                <th width="10%">挂马类型</th>
                <th width="10%">挂马名称</th>
                <th width="10%">挂马内容</th>
                  <th width="10%">归属地区</th>
                <th width="160px">扫描时间</th>
                <th width="80px">截图</th>
                <th width="80px">详情</th>
            </tr>
            `;
            $('.pagination').prev().find('thead').html(tab_div);
            console.log(res);
            let max_page = parseInt(res['max_page']);
            let html = ``;
            for (let x in res['data'])
            {
                html+=`<tr>`;
                //网站域名
                html+=`<td><p class="tabletd-overflow" title="${res['data'][x]['result']['scheme_domain']||""}">${res['data'][x]['result']['scheme_domain']||""}</p></td>`;
                //关联IP
                html+=`<td>${res['data'][x]['result']['value']['ip']||""}</td>`;
                let class_word = res['data'][x]['result']['value']['illegality']['value']['type']||"";
                let key_word = res['data'][x]['result']['value']['illegality']['value']['display']||"";
                let segment_word = res['data'][x]['result']['value']['illegality']['value']['value']||"";
                //	分类
                html+=`<td>${class_word||""}</td>`;
                //	命中关键字
                html+=`<td><p class="tabletd-overflow" title="${key_word||""}">${key_word||""}</p></td>`;
                //内容
                html+=`<td><p class="tabletd-overflow" title="${segment_word||""}">${segment_word||""}</p></td>`;
                //	归属地区
                let addr = get_addr(res['data'][x]['result']['value']);
                html+=`<td><p class="tabletd-overflow" title="${addr}">${addr}</td>`;
                //扫描时间
                html+=`<td>${res['data'][x]['result']['value']['save_time']||""}</td>`;
                //网页快照
                html+=get_images(res['data'][x]['result']['value']);
                //详情
                let detail = get_detail_bs4(res['data'][x]['result']['value']['illegality']);

                html+=`<td><a data-toggle="modal" data-target="#ill_detail_modal" onclick=get_ill_one_detail("${detail}")>详情<i class="iconfont icon-link"></i></a></td>`;
                html+=`</tr>`;
            }
            $('.pagination').prev().find('tbody').html(html);
            $('.pagination').attr('data-func','ill_web_table_page_gua_ma');
            addPagination(page,max_page);
        }
    });
    $('#ill-tab li:eq(0) a').tab('show');
    history.replaceState(null,null,changeURLArg(location.href,'type',1))
}
function ill_web_table_page_jie_chi(page) {
    /*网页劫持
    * */
    $('#ill_web_form').css('visibility','hidden');

    param = {'result.value.illegality.name': '网页劫持'};
    let data = {
        "param": {'result.value.illegality.name': '网页劫持'},
        "page":page,
    };
    data = JSON.stringify(data);
    $.ajax({
        url: 'vulcheck/get_ill_web_data',
        data:data,
        type: "post",
        success: function (res) {
            let tab_div=`
            <tr>
                <th width="15%">网站域名</th>
                <th width="120px">关联IP</th>
                <th width="10%">分类</th>
                <th width="10%">归属地区</th>
                <th width="10%">劫持前url</th>
                <th width="10%">劫持前url</th>
                <th width="160px">扫描时间</th>
                <th width="80px">详情</th>
            </tr>
            `;
            $('.pagination').prev().find('thead').html(tab_div);
            console.log(res);
            let max_page = parseInt(res['max_page']);
            let html = ``;
            for (let x in res['data'])
            {
                    html+=`<tr>`;
                    //网站域名
                    html+=`<td><p class="tabletd-overflow" title="${res['data'][x]['result']['scheme_domain']||""}">${res['data'][x]['result']['scheme_domain']||""}</p></td>`;
                    //关联IP
                    html+=`<td>${res['data'][x]['result']['value']['ip']||""}</td>`;
                    let class_keyword_segment = get_class_keyword_segment(res['data'][x]['result']['value']);
                    let class_word = res['data'][x]['result']['value']['illegality']['name'];

                    //	分类
                    html+=`<td>${class_word||""}</td>`;
                    let addr = get_addr(res['data'][x]['result']['value']);
                    //	归属地区
                    html+=`<td><p class="tabletd-overflow" title="${addr}">${addr}</td>`;
                    // 劫持前url
                    let orig_url = res['data'][x]['result']['value']['illegality']['value']['orig_url'];
                    html+=`<td>${orig_url||""}</td>`;
                    //劫持后url
                    let redirect_url = res['data'][x]['result']['value']['illegality']['value']['redirect_url'];
                    html+=`<td>${redirect_url||""}</td>`;
                    //扫描时间 save_time
                    html+=`<td>${res['data'][x]['result']['value']['save_time']||""}</td>`;
                    // //网页快照
                    // html+=get_images(res['data'][x]['result']['value']);
                    //详情
                    let detail = get_detail_bs4(res['data'][x]['result']['value']['illegality']);

                    html+=`<td><a data-toggle="modal" data-target="#ill_detail_modal" onclick=get_ill_one_detail("${detail}")>详情<i class="iconfont icon-link"></i></a></td>`;


            }
            $('.pagination').prev().find('tbody').html(html);
            $('.pagination').attr('data-func','ill_web_table_page_jie_chi')
            addPagination(page,max_page);
        }
    });
    $('#ill-tab li:eq(3) a').tab('show');
    history.replaceState(null,null,changeURLArg(location.href,'type',4))

}

function ill_web_table_page_an_lian(page) {
    $('#ill_web_form').css('visibility','hidden');

    param = {'result.value.illegality.name': '网站暗链'};
    // $("#ill_web_tab_div").html("eweqweqwe");
    let data = {
        "param": {'result.value.illegality.name': '网站暗链'},
        "page":page,
    };
    data = JSON.stringify(data);
    $.ajax({
        url: 'vulcheck/get_ill_web_data',
        data:data,
        type: "post",
        success: function (res) {
            let tab_div=`
            <tr>
                <th width="15%">网站域名</th>
                <th width="120px">关联IP</th>
                <th width="10%">暗链URL</th>
                <th width="10%">暗链类型</th>
                <th width="160px">归属地区</th>
                <th width="160px">扫描时间</th>
                <th width="80px">详情</th>
            </tr>
            `;
            $('.pagination').prev().find('thead').html(tab_div);
            console.log(res);
            let max_page = parseInt(res['max_page']);
            let html = ``;
            for (let x in res['data'])
            {
                html+=`<tr>`;
                //网站域名
                html+=`<td><p class="tabletd-overflow" title="${res['data'][x]['result']['scheme_domain']||""}">${res['data'][x]['result']['scheme_domain']||""}</p></td>`;
                //关联IP
                html+=`<td>${res['data'][x]['result']['value']['ip']||""}</td>`;
                let key_word =res['data'][x]['result']['value']['illegality']['value']['dark_link'];
                //	暗链URL
                html+=`<td><p class="tabletd-overflow" title="${key_word||""}">${key_word||""}</p></td>`;
                // 暗链类型
                let web_type =res['data'][x]['result']['value']['illegality']['value']['type'];
                html+=`<td><p class="tabletd-overflow" title="${web_type||""}">${web_type||""}</p></td>`;
                //	归属地区
                let addr = get_addr(res['data'][x]['result']['value']);
                html+=`<td><p class="tabletd-overflow" title="${addr}">${addr}</td>`;
                //扫描时间
                html+=`<td>${res['data'][x]['result']['value']['save_time']||""}</td>`;

                //详情
                let detail = get_detail_bs4(res['data'][x]['result']['value']['illegality']);

                html+=`<td><a data-toggle="modal" data-target="#ill_detail_modal" onclick=get_ill_one_detail("${detail}")>详情<i class="iconfont icon-link"></i></a></td>`;
            }
            $('.pagination').prev().find('tbody').html(html);
            $('.pagination').attr('data-func','ill_web_table_page_an_lian')
            addPagination(page,max_page);
        }
    });
    $('#ill-tab li:eq(1) a').tab('show');
    history.replaceState(null,null,changeURLArg(location.href,'type',2))

}

function ill_web_table_page_min_gan_ci(page) {
    $('#ill_web_form').css('visibility','hidden');

    param = {'result.value.illegality.name': '敏感关键词'};
    /*
    * 敏感词*/
    let data = {
        "param": {'result.value.illegality.name': '敏感关键词'},
        "page":page,
    };
    data = JSON.stringify(data);
    $.ajax({
        url: 'vulcheck/get_ill_web_data',
        data:data,
        type: "post",
        success: function (res) {
            let tab_div=`
            <tr>
                <th width="15%">网站域名</th>
                <th width="120px">关联IP</th>
                <th width="10%">关键词类型 </th>
                <th width="10%">关键词内容</th>
                <th width="160px">地区</th>
                <th width="160px">扫描时间</th>
                <th width="80px">截图</th>
                <th width="80px">详情</th>
            </tr>
            `;
            $('.pagination').prev().find('thead').html(tab_div);
            console.log(res);
            let max_page = parseInt(res['max_page']);
            let html = ``;
            for (let x in res['data'])
            {
                html+=`<tr>`;
                //网站域名
                html+=`<td><p class="tabletd-overflow" title="${res['data'][x]['result']['scheme_domain']||""}">${res['data'][x]['result']['scheme_domain']||""}</p></td>`;
                //关联IP
                html+=`<td>${res['data'][x]['result']['value']['ip']||""}</td>`;
                let key_word =res['data'][x]['result']['value']['illegality']['value']['type'];
                //	关键词类型
                html+=`<td><p class="tabletd-overflow" title="${key_word||""}">${key_word||""}</p></td>`;
                // 关键词内容
                let content = "";
                let keyword_list= res['data'][x]['result']['value']['illegality']['value']['keyword_list'];
                for (let j in keyword_list)
                {
                    content+=keyword_list[j]['value']+"&nbsp"
                }

                html+=`<td><p class="tabletd-overflow" title="${content||""}">${content||""}</p></td>`;
                //	归属地区
                let addr = get_addr(res['data'][x]['result']['value']);
                html+=`<td><p class="tabletd-overflow" title="${addr}">${addr}</td>`;
                //扫描时间
                html+=`<td>${res['data'][x]['result']['value']['save_time']||""}</td>`;
                //网页快照
                html+=get_images1(res['data'][x]['result']['value']);
                //详情
                //详情
                let detail = get_detail_bs4(res['data'][x]['result']['value']['illegality']);

                html+=`<td><a data-toggle="modal" data-target="#ill_detail_modal" onclick=get_ill_one_detail("${detail}")>详情<i class="iconfont icon-link"></i></a></td>`;
            }
            $('.pagination').prev().find('tbody').html(html);
            $('.pagination').attr('data-func','ill_web_table_page_min_gan_ci')
            addPagination(page,max_page);
        }
    });
    $('#ill-tab li:eq(2) a').tab('show');
    history.replaceState(null,null,changeURLArg(location.href,'type',3))

}

function ill_web_table_page_yellow_img(page) {
    $('#ill_web_form').css('visibility','hidden');
    param = {'result.value.illegality.name': '黄色图片'};
    /*
    * 敏感词*/
    let data = {
        "param": {'result.value.illegality.name': '黄色图片'},
        "page":page,
    };
    data = JSON.stringify(data);
    $.ajax({
        url: 'vulcheck/get_ill_web_data',
        data:data,
        type: "post",
        success: function (res) {
            let tab_div=`
            <tr>
            <th width="15%">网站域名</th>
            <th width="120px">关联IP</th>
<!--            <th width="10%">类型 </th>-->
            <th width="10%">黄色图片地址</th>
            <th width="160px">地区</th>
            <th width="160px">扫描时间</th>
            <th width="80px">详情</th>

            </tr>
            `;
            $('.pagination').prev().find('thead').html(tab_div);
            console.log(res);
            let max_page = parseInt(res['max_page']);
            let html = ``;
            for (let x in res['data'])
            {
                html+=`<tr>`;
                //网站域名
                html+=`<td><p class="tabletd-overflow" title="${res['data'][x]['result']['scheme_domain']||""}">${res['data'][x]['result']['scheme_domain']||""}</p></td>`;
                //关联IP
                html+=`<td>${res['data'][x]['result']['value']['ip']||""}</td>`;
                let key_word =res['data'][x]['result']['value']['illegality']['url'];
                //	图片URL
                html+=`<td><p class="tabletd-overflow" title="${key_word||""}">${key_word||""}</p></td>`;

                //	归属地区
                let addr = get_addr(res['data'][x]['result']['value']);
                html+=`<td><p class="tabletd-overflow" title="${addr}">${addr}</td>`;
                //扫描时间
                html+=`<td>${res['data'][x]['result']['value']['save_time']||""}</td>`;

                //详情
                let detail = get_detail_bs4(res['data'][x]['result']['value']['illegality']);

                html+=`<td><a data-toggle="modal" data-target="#ill_detail_modal" onclick=get_ill_one_detail("${detail}")>详情<i class="iconfont icon-link"></i></a></td>`;
            }
            $('.pagination').prev().find('tbody').html(html);
            $('.pagination').attr('data-func','ill_web_table_page_yellow_img')
            addPagination(page,max_page);
        }
    });
    $('#ill-tab li:eq(4) a').tab('show');
    history.replaceState(null,null,changeURLArg(location.href,'type',5))

}

function ill_web_table_page_wei_fa(page) {
    $('#ill_web_form').css('visibility','visible');
    // $("#ill_web_tab_div").html("eweqweqwe");
    param = {};
    let data = {
        "param": param,
        "page":page,
    };
    data = JSON.stringify(data);
    $.ajax({
        url: 'vulcheck/get_ill_web_data_wei_fa',
        data:data,
        type: "post",
        success: function (res) {
            let tab_div=`
            <tr>
                <th width="15%">网站域名</th>
                <th width="120px">关联IP</th>
                <th width="10%">网站类型 </th>
                <th width="10%">描述</th>
                <th width="160px">URL</th>
                <th width="160px">地区</th>
                <th width="160px">扫描时间</th>
                <th width="80px">图片</th>
                <th width="80px">详情</th>
            </tr>
            `;
            $('.pagination').prev().find('thead').html(tab_div);
            console.log(res);
            let max_page = parseInt(res['max_page']);
            let html = ``;
            for (let x in res['data'])
            {
                html+=`<tr>`;
                //网站域名
                html+=`<td><p class="tabletd-overflow" title="${res['data'][x]['result']['scheme_domain']||""}">${res['data'][x]['result']['scheme_domain']||""}</p></td>`;
                //关联IP
                html+=`<td>${res['data'][x]['result']['value']['ip']||""}</td>`;

                let web_type = res['data'][x]['result']['value']['illegal_feature']['name'];
                let web_url = res['data'][x]['result']['value']['illegal_feature']['url'];
                let web_description = htmlEncode(res['data'][x]['result']['value']['illegal_feature']['description']);
                //	网站类型
                html+=`<td>${web_type||""}</td>`;
                //	描述
                html+=`<td><p class="tabletd-overflow" title="${web_description||""}">"${web_description}"</p></td>`;
                //	URL
                html+=`<td><p class="tabletd-overflow" title="${web_url||""}">${web_url||""}</p></td>`;
                let addr = get_addr(res['data'][x]['result']['value']);
                //	归属地区
                html+=`<td><p class="tabletd-overflow" title="${addr}">${addr}</td>`;

                //扫描时间
                html+=`<td>${res['data'][x]['result']['value']['save_time']||""}</td>`;
                //网页快照
                html+=get_images1(res['data'][x]['result']['value']);
                //详情
                let detail = get_detail_bs4(res['data'][x]['result']['value']['illegal_feature']);

                html+=`<td><a data-toggle="modal" data-target="#ill_detail_modal" onclick=get_ill_feature_one_detail("${detail}")>详情<i class="iconfont icon-link"></i></a></td>`;
            }
            $('.pagination').prev().find('tbody').html(html);
            $('.pagination').attr('data-func','ill_web_table_page_wei_fa')
            addPagination(page,max_page);
        }
    });
    $('#ill-tab li:eq(5) a').tab('show');
    history.replaceState(null,null,changeURLArg(location.href,'type',6))

}


function get_addr(res) {
    let country_ch = "";
    let province = "";
    let city = "";
    if (res.hasOwnProperty("location"))
    {
        if (res['location'].hasOwnProperty('country_ch'))
        {
            country_ch = res['location']['country_ch'] || "";
        }
        if (res['location'].hasOwnProperty('province'))
        {
            province = res['location']['province'] || "";
        }
        if (res['location'].hasOwnProperty('city'))
        {
            city = res['location']['city'] || "";
        }
    }
    return country_ch+"&nbsp;"+province+"&nbsp;"+city
}

function get_web_type(res) {
    let web_type = "";
    if (res.hasOwnProperty("illegal_feature"))
    {
        for(let i in res['illegal_feature'])
        {
            web_type+="&nbsp"+res['illegal_feature'][i]['name']
        }
    }

    return web_type
}

function get_class_keyword_segment(res) {
    let class_word_set = new Set();
    let key_word_set = new Set();
    let segment_word_set = new Set();
    for(let i in res['illegality'])
    {
        class_word_set.add(res['illegality'][i]['name']);
        for(let j in res['illegality'][i]['value'] )
        {
            for (let z in res['illegality'][i]['value'][j]['keyword_list'])
            {
                key_word_set.add(res['illegality'][i]['value'][j]['keyword_list'][z]['value']);
                segment_word_set.add(res['illegality'][i]['value'][j]['keyword_list'][z]['segment'])
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
    segment_word = segment_word.replace(/</g,"&lt")
        .replace(/>/g,"&gt")
        .replace(/\"/g,"&quot;");

    return {"class_word":class_word,"key_word":key_word,"segment_word":segment_word}
}
function get_images(res) {
    let b = new Base64();
    let html = ``;
    let img_flag = false;
    let image_url_list = [];
    if (res.hasOwnProperty("illegal_feature"))
    {
        for (let i in res['illegal_feature']) {
            if(res['illegal_feature'][i].hasOwnProperty("image_snapshot"))
            {
                image_url_list.push(res['illegal_feature'][i]['image_snapshot'])
                img_flag =true;
            }
        }
    }
    if (res.hasOwnProperty("illegality"))
    {
        for (let i in res['illegality']) {
            if(res['illegality'][i].hasOwnProperty("image_snapshot"))
            {
                image_url_list.push(res['illegality'][i]['image_snapshot'])
                img_flag =true;
            }
        }
    }
    if(!img_flag)
    {
        html+="<td></td>"
    }
    else {
        image_url_list= JSON.stringify(image_url_list);
        let image_url_bs64 = b.encode(image_url_list);
        html+=`<td><a data-toggle="modal" data-target="#imageModal" onclick=show_images('${image_url_bs64}')>详情<i class="iconfont icon-link"></i></a></td>`;

    }
    return html;
}
function get_images1(res) {
    let b = new Base64();
    let html = ``;
    let img_flag = false;
    let image_url_list = [];
    if (res.hasOwnProperty("illegal_feature"))
    {
        for (let i in res['illegal_feature']) {
            if(res['illegal_feature'].hasOwnProperty("image_snapshot"))
            {
                image_url_list.push(res['illegal_feature'][i]['image_snapshot'])
                img_flag =true;
            }
        }
    }
    if (res.hasOwnProperty("illegality"))
    {
        if(res['illegality'].hasOwnProperty("image_snapshot"))
        {
            image_url_list.push(res['illegality']['image_snapshot'])
            img_flag =true;
        }
    }
    if(!img_flag)
    {
        html+="<td></td>"
    }
    else {
        image_url_list= JSON.stringify(image_url_list);
        let image_url_bs64 = b.encode(image_url_list);
        html+=`<td><a data-toggle="modal" data-target="#imageModal" onclick=show_images('${image_url_bs64}')>详情<i class="iconfont icon-link"></i></a></td>`;

    }
    return html;
}
function get_detail_bs4(res) {
    let detail = JSON.stringify(res);
    let b = new Base64();
    detail = b.encode(detail);
    return detail;
}
function show_images(bs_64) {

    let b = new Base64();
    let image_url_ = b.decode(bs_64);
    image_url_ = JSON.parse(image_url_);
    let data = {
        "img_url":image_url_,
    };
    data = JSON.stringify(data);
    // console.log(data)
    $.ajax({
        url: 'vulcheck/get_image_bs64',
        data:data,
        type: "post",
        success: function (res) {
            let html =``;
            for(let i in res['img_bs64_list'])
            {
                let img_bs64 = res['img_bs64_list'][i];
                html+=`<img src="data:image/jpg;base64,${img_bs64}">`;
                console.log(html)
            }
            $("#test_image_div").html("").append(html);
            // $("#imageModal").show();
        }});
}

function get_ill_one_detail(data) {

    let tmp_list =[];
    tmp_list.push({"headers":""});
    tmp_list.push({"url":"存在漏洞的URL"});
    tmp_list.push({"plugin_name":"插件名称或POC名称"});
    tmp_list.push({"host":"FUZZ测试时的请求头部:host"});
    tmp_list.push({"Referer":"FUZZ测试时的请求头部:Referer"});
    tmp_list.push({"variable":"存在漏洞的变量"});
    tmp_list.push({"result_desc":"漏洞结果描述"});
    tmp_list.push({"payload":"fuzz测试构造的payload"});
    tmp_list.push({"method":"请求方法"});
    tmp_list.push({"severity":"漏洞严重等级"});
    tmp_list.push({"value":""});
    let b = new Base64();
    data = b.decode(data);
    data = JSON.parse(data);

    let html1 = ``;
    for(let item of tmp_list)
    {
        for (let key in item) {
            if (data.hasOwnProperty(key)&&data[key])
            {
                if (typeof (data[key])==="object")
                {
                    for (let k in data[key])
                    {
                        if ( k==="keyword_list")
                        {
                            for (let i in data[key][k])
                            {
                                html1+=`
                                 <div class="columnT-tr clearfix">
                                                    <div class="columnT-tr-left">关键词</div>
                                                    <div class="columnT-tr-right">${data[key][k][i]['value']}</div>
                                                </div>
                                                
                                 <div class="columnT-tr clearfix">
                                            <div class="columnT-tr-left">内容</div>
                                            <div class="columnT-tr-right">${data[key][k][i]['segment']}</div>
                                        </div>
                                    `
                            }
                        }
                        else {
                            html1+=`
                     <div class="columnT-tr clearfix">
                                        <div class="columnT-tr-left">${k}</div>
                                        <div class="columnT-tr-right">${data[key][k]||""}</div>
                                    </div>
                        `
                        }


                    }
                }
                else {
                    let val = data[key];
                    if (key==="severity")
                    {
                        val = severity_dir[data[key]];
                    }
                    html1+=`
                 <div class="columnT-tr clearfix">
                                    <div class="columnT-tr-left">${item[key]}</div>
                                    <div class="columnT-tr-right">${val||""}</div>
                                </div>
                `
                }

            }
        }
    }

    $("#ill_detail_div").html("").append(html1);
}

function get_ill_feature_one_detail(data) {
    let tmp_list =[];
    tmp_list.push({"url":"地址"});
    tmp_list.push({"description":"描述"});
    tmp_list.push({"name":"网站类型"});
    tmp_list.push({"image_snapshot":"网页截图"});
    tmp_list.push({"snapshot_time":"保存时间"});


    let b = new Base64();
    data = b.decode(data);
    data = JSON.parse(data);
    console.log(data)
    let html1 = ``;
    html1+=`
        <div class="columnT-tr clearfix">
            <div class="columnT-tr-left">URL</div>
            <div class="columnT-tr-right">${data['url']||""}</div>
        </div>
    `;
    for(let item of  tmp_list){
        for (let key in item)
        {
            if (data.hasOwnProperty(key)&&data[key])
            {
                html1+=`
                 <div class="columnT-tr clearfix">
                    <div class="columnT-tr-left">${item[key]||""}</div>
                    <div class="columnT-tr-right">${data[key]||""}</div>
                </div>
                `;
            }
        }
    }


    $("#ill_detail_div").html("").append(html1);
}