// 引入所需的内页js
document.write("<script type='text/javascript' src='/static/js/project/vulcheck/vul_index.js'></script>");
document.write("<script type='text/javascript' src='/static/js/project/vulcheck/vul_quickstart.js'></script>");
document.write("<script type='text/javascript' src='/static/js/project/vulcheck/vul_task.js'></script>");
document.write("<script type='text/javascript' src='/static/js/project/vulcheck/vul_total.js'></script>");
document.write("<script type='text/javascript' src='/static/js/project/vulcheck/illegal_web.js'></script>");
document.write("<script type='text/javascript' src='/static/js/project/vulcheck/vul_web.js'></script>");
document.write("<script type='text/javascript' src='/static/js/project/vulcheck/beian.js'></script>");
document.write("<script type='text/javascript' src='/static/js/project/AbnormalWebsite/index.js'></script>");
document.write("<script type='text/javascript' src='/static/js/project/AbnormalWebsite/task.js'></script>");
$(function() {
    // 左侧手风琴点击样式变化
    $('.sidebar-firstNav').click(function () { //点击一级触发
        var parent = $(this).parent();
        parent.siblings().children('ul').slideUp();
        ;//收起其他一级展开框
        parent.siblings().find('.active').removeClass('active');//移除其他二级open active
        if (parent.attr('data-drop')) {//有展开框一级点击事件
            parent.toggleClass('open').siblings().removeClass('open');//移除其他一级open
            $(this).siblings().slideToggle();//展开当前展开框
            parent.siblings().find('.iconRotate').removeClass('iconRotate');//恢复其他模块箭头指向
            $(this).find('.icon-arrow').toggleClass('iconRotate');//调转当前箭头指向
        } else {//无展开框一级点击事件
            parent.addClass('active').siblings().removeClass('open active');//移除其他一级open active
            parent.siblings().find('.iconRotate').removeClass('iconRotate');//恢复其他模块箭头指向

        }
    })
    $('.sidebar-secondNav').click(function () { //点击二级触发
        var parent = $(this).parent();
        // 刷新加载时
        var parentlevel = parent.parents('.sidebar-firstItem');
        parentlevel.addClass('open')//展开当前上级
        parentlevel.children('ul').slideDown();//展开当前展开框
        parentlevel.children('div').find('.icon-arrow').toggleClass('iconRotate');//调转当前箭头指向
        if (parent.attr('data-drop')) {//有展开框二级点击事件
            // 暂无
            // parent.toggleClass('open').siblings().removeClass('open');//移除其他二级open
            // $(this).siblings().slideToggle();//展开当前展开框
            // parent.siblings().find('.iconRotate').removeClass('iconRotate');//恢复其他模块箭头指向
            // $(this).find('.icon-arrow').toggleClass('iconRotate');//调转当前箭头指向
        } else {//无展开框二级点击事件
            parent.addClass('active')//二级高亮
            parent.siblings().removeClass('active')//其他二级取消高亮
            parentlevel.siblings().removeClass('open active').find('.active').removeClass('active')
        }
    })

    // 左侧手风琴点击执行事件
    $(".sidebar-firstNav,.sidebar-secondNav").click(function () {
        var value = $(this).attr("data-value");
        if(value){
            var target = '/'+value.split('-')[0]+'#'+value.split('-')[1]
            // 在本页面刷新链接只有参数变化则不改变url
            if(!location.pathname || !location.hash ||
                location.pathname + location.hash.split('?')[0] !== target){
                history.pushState(null,null,target);
            }
        }
        switch (value) {
            // case "vulcheck-index":
            //     vulcheckIndex();
            //     break;
            case "vulcheck-quickstart":
                vulcheckQuickstart();
                break;
            case "vulcheck-show_all_task":
                vulcheck_show_all_task();
                break;
            // case "vulcheck-send_task":
            //     vulcheck_send_task();
            //     break;
            case "vulcheck-index":
                vulcheck_get_total_html();
                break;
            case "vulcheck-get_ill_web_html":
                vulcheck_get_ill_web_html();
                break;
            case "vulcheck-get_vul_web_html":
                vulcheck_get_vul_web_html();
                break;
            case "vulcheck-get_beian_html":
                vulcheck_get_beian_html();
                break;
            case "vulcheck-get_abnormal_html":
                get_abnormal_html();
                break;
            case "vulcheck-get_abnormal_task_html":
                get_abnormal_task_html();
                break;
            default:
        }
    });
    // 点击menu菜单按钮展开折叠左侧sidebar
    $('.menu-button').click(function () {
        if ($('.sidebar-scrollhidden').hasClass('sidebar-close')){ //判断sidebar为折叠，展开sidebar
            $(this).find('i').removeClass('iconRotate') //.menu-button转向
            $('.sidebar-scrollhidden').removeClass('sidebar-close').addClass('sidebar-open');//添加sidebar-open
            $('.main-content').css('width','calc(100% - 180px)');////设置折叠后右侧内容框
        }else{
            $(this).find('i').addClass('iconRotate')//.menu-button转向
            $('.sidebar-scrollhidden').removeClass('sidebar-open').addClass('sidebar-close');//添加sidebar-close
            $('.sidebar-firstDrop, .sidebar-secondDrop').css('display','none');//隐藏所有二级三级展开框
            $('.nano-content').find('.icon-arrow').removeClass('iconRotate')//恢复栏目的箭头指向
            $('.main-content').css('width','calc(100% - 50px)');//设置折叠后右侧内容框

        }
    })
    // sidebar折叠后，点击缩放的按钮展开sidebar
    $('.sidebar-close .nano-content>.sidebar-firstItem').click(function () {
        $('.sidebar-scrollhidden').removeClass('sidebar-close').addClass('sidebar-open');//展开sidebar
        $('.main-content').css('width','calc(100% - 180px)');//设置折叠后右侧内容框

    });

    refresh();//刷新时加载默认
    $(window).on("popstate",function(){//监听url变化，回退时触发 pushState不触发
        refresh();
    });


})
// 刷新，回退时加载默认
function refresh() {
    var req = '',//一级
        hash='',//二级
        page='';//页码参数
    if(location.pathname)req = location.pathname.slice(1);//解析一级路径
    if(location.hash)hash = location.hash.split('#')[1].split('?')[0];//解析二级路径
    if(!hash){
        if(!req){
            //默认页面
            $('.sidebar-secondNav[data-value="vulcheck-index"], .sidebar-firstNav[data-value="vulcheck-indexl"]').trigger('click');
        }else{
            //只有一级的默认页面为data-value为一级-index的内页
            $('.sidebar-secondNav[data-value="'+req+'-index"], .sidebar-firstNav[data-value="'+req+'-index"]').trigger('click');
        }
    }else{
        //模拟触发点击事件加载页面
        $('.sidebar-secondNav[data-value="'+req+'-'+hash+'"], .sidebar-firstNav[data-value="'+req+'-'+hash+'"]').trigger('click');
    }
}



// 添加分页
function addPagination(nowpage,maxpage) {
    nowpage = Number(nowpage);//当前页码
    maxpage = Number(maxpage);//最大页码
    var pagebtn = '';
    var btnnum = 5;  //展示页码数 为奇数
    if(maxpage <= btnnum){
        for(var i = 1;i <= maxpage; i++){
            pagebtn +='<li data-page="'+i+'">'+i+'</li>';
        }
    }else{
        if(nowpage <= Math.ceil(btnnum/2)){
            // 前几页

            for(var i = 1;i <= btnnum; i++){
                pagebtn +='<li data-page="'+i+'">'+i+'</li>';
            }
            pagebtn +='…<li data-page="'+maxpage+'">'+maxpage+'</li>';
        }else if(nowpage < maxpage - Math.floor(btnnum/2)){
            // 中间页码
            pagebtn +='<li data-page="1">'+1+'</li>';
            if(nowpage !== (Math.ceil(btnnum/2)+1))pagebtn +='…'
            for(var i = nowpage-Math.floor(btnnum/2) ;i <= nowpage+Math.floor(btnnum/2); i++){
                pagebtn +='<li data-page="'+i+'">'+i+'</li>';
            }
            if(nowpage !== (maxpage-Math.floor(btnnum/2)-1))pagebtn +='…'

            pagebtn +='<li data-page="'+maxpage+'">'+maxpage+'</li>';

        }else{
            // 后几页
            pagebtn +='<li data-page="1">'+1+'</li>…';
            for(var i = maxpage-btnnum+1;i <= maxpage; i++){
                pagebtn +='<li data-page="'+i+'">'+i+'</li>';
            }
        }
    }



    var pagination = '<ul>' ;
    if(nowpage > 1){
        pagination +='<li data-page="'+(nowpage-1)+'" class="pagination-link prev-link">上一页</li>' ;
    }else{
        pagination +='<li data-page="" class="pagination-link prev-link disabled">上一页</li>' ;//nowpage=1不可选
    }
    pagination += pagebtn;
    if(nowpage < maxpage){
        pagination +='<li data-page="'+(Number(nowpage)+1)+'" class="pagination-link next-link">下一页</li>' ;
    }else{
        pagination +='<li data-page="" class="pagination-link next-link disabled">下一页</li> ';//nowpage=maxpage不可选
    }
    pagination += '<span style="margin: 0 10px"><input class="pagination-input" type="text" placeholder="'+nowpage + '" value="'+nowpage+'" oninput="pageOverflow(this,'+maxpage+')"/>/' + maxpage+'页</span>' +
        '<li  data-page="'+nowpage+'" class="pagination-link">跳转</li><span class="jump-text" style="color: red;"></span>' +
        '</ul>';
    $('.pagination').html(pagination);
    if(location.hash.split('?')[1]){//若存在参数
        if ( nowpage !== location.hash.split('?')[1].split('=')[1]){
            // 不为当前页面则改变url（返回时也调用，不判断则当前重复进入history列表，上一页仍为当前页面）
            history.pushState(null,null,changeURLArg(location.href,'page',nowpage)); //更改当前路径
        }
    }else {
        // 不存在参数默认为1
        history.replaceState(null,null,changeURLArg(location.href,'page',1)); //更改当前路径

    }
    $('.pagination>ul li[data-page='+nowpage+']:not(".pagination-link")').addClass('active').siblings().removeClass('active')//当前页面高亮
    $('.pagination-input').on('change',function () {
        $(this).parent().next().attr('data-page',$(this).val())
    })
}
function pageOverflow(obj,maxpage){
    if(obj.value<1 || obj.value > maxpage){
        $('.jump-text').text('请输入正确页码');
        obj.value = ''
    }
}
$(document).off('click', '.pagination>ul>li:not(".disabled")').on('click', '.pagination>ul>li:not(".disabled")', function () {
    var page = $(this).attr('data-page'); // 获取按钮代表的页码
    var func = $(this).parents('.pagination').attr('data-func');
    var method = func+'(page,filter_param)';
    eval(method);
});
// 全选
$(document).on('change','.checkbox-single input',function(){
    var inputname = $(this).attr('name');
    var classlength = $('.checkbox-single input:checkbox[name="plugin-name"]').length;
    var checkedlength = $('.checkbox-single input:checkbox[name="plugin-name"]:checked').length;

    if(classlength && classlength === checkedlength){
        $('.checkbox-selectall input[name="'+inputname+'"]').prop("checked", true);
    }else{
        $('.checkbox-selectall input[name="'+inputname+'"]').prop("checked", false);
    }
})
$(document).on('change','.checkbox-selectall input',function() {
    var inputname = $(this).attr('name');
    var checkedAll=$(this).prop('checked');
    console.log($('input[name="'+inputname+'"]'));
    $('.checkbox-single input[name="'+inputname+'"]').prop('checked', checkedAll)
});

// 内容过长缩放显示
// 展开
$(document).on('click','.columnT-tip',function(){
    if($(this).siblings('.columnT-tr-right').height() > 100){
        $(this).siblings('.columnT-tr-right').css('max-height','100px').css('overflow','hidden');
        $(this).css('display','block').text('点击展开');

    }else{
        $(this).siblings('.columnT-tr-right').css('max-height','1200px')
        $(this).text('点击收起');
        var $this = $(this);
        setTimeout(function () {
            $this.siblings('.columnT-tr-right').css('overflow','auto');
        },200)
    }
})
//高度过高数据缩放
function columnSlide() {

    $('.columnT-tr').each(function(){
        if($(this).height() > 100){
            $(this).find('.columnT-tr-right').css('max-height','100px');
            $(this).find('.columnT-tip').css('display','block').text('点击展开');
        }
    });
}

/**
 * 引用获取url里的参数
 *
 * */

function changeURLArg(url,arg,arg_val){
    var pattern=arg+'=([^&]*)';
    var replaceText=arg+'='+arg_val;
    if(url.match(pattern)){
        var tmp='/('+ arg+'=)([^&]*)/gi';
        tmp=url.replace(eval(tmp),replaceText);
        return tmp;
    }else{
        if(url.match('[\?]')){
            return url+'&'+replaceText;
        }else{
            return url+'?'+replaceText;
        }
    }
}

/**
 * 获取url里的参数
 * @param arg 参数名
 * @returns
 */
function getURLString(arg) {
    if(!location.href.split('?')[1])return null;//无参数
    var reg = new RegExp("(^|&)" + arg + "=([^&]*)(&|$)", "i");
    var r = location.href.split('?')[1].match(reg);
    if (r != null)
        return unescape(r[2]);
    return null;
}
// 字符转转义  字符转包含html代码时使用
function htmlEncode(str){
    var s = "";
    if(str.length == 0) return "";
    s = str.replace(/&/g,"&amp;");
    s = s.replace(/</g,"&lt;");
    s = s.replace(/>/g,"&gt;");
    s = s.replace(/ /g,"&nbsp;");
    s = s.replace(/\'/g,"'");
    s = s.replace(/\"/g,'"');
    return s;

}