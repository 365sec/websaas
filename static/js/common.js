$(function() {
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
})
// 点击menu菜单按钮展开折叠左侧sidebar
$(document).on('click','.menu-button',function () {
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
$(document).on('click','.sidebar-close .nano-content>.sidebar-firstItem',function() {
    $('.sidebar-scrollhidden').removeClass('sidebar-close').addClass('sidebar-open');//展开sidebar
    $('.main-content').css('width','calc(100% - 180px)');//设置折叠后右侧内容框

});
function addPagination(nowpage,maxpage) {
    var pagination = '<ul>' ;
    if(nowpage > 1){
        pagination +='<button data-page="'+(nowpage-1)+'" class="pagination-link prev-link">上一页</button>' ;
    }else{
        pagination +='<button data-page="" class="pagination-link prev-link disabled" disabled>上一页</button>' ;//nowpage=1不可选
    }
    for(var i = 1;i<=maxpage;i++){
        pagination +='<li data-page="'+i+'">'+i+'</li>'
    }
    if(nowpage < maxpage){
        pagination +='<button data-page="'+(Number(nowpage)+1)+'" class="pagination-link next-link">下一页</button>' ;
    }else{
        pagination +='<button data-page="" class="pagination-link next-link disabled" disabled>下一页</button> ';//nowpage=maxpage不可选
    }
    pagination +='</ul>';
    $('.pagination').html(pagination);
    if(location.hash.split('?')[1]){//若存在参数
        if ( nowpage !== location.hash.split('?')[1].split('=')[1]){
            // 不为当前页面则改变url（返回时也调用，不判断则当前重复进入history列表，上一页仍为当前页面）
            history.pushState(null,null,location.href.split('?')[0]+'?page='+nowpage); //更改当前路径
        }
    }else {
        // 不存在参数默认为1
        history.pushState(null,null,location.href.split('?')[0]+'?page=1');
    }
    $('.pagination>ul li[data-page='+nowpage+']').addClass('active').siblings().removeClass('active')//当前页面高亮
}