$(function () {
    // window.addEventListener('popstate', refresh(), false);
    refresh();//刷新时加载默认
    $(window).on("popstate",function(){//监听url变化，回退时触发 pushState不触发
        refresh();
    });

    function refresh() {
        var req = '',//一级
            hash='',//二级
            page='';//页码参数
        if(location.pathname)req = location.pathname.slice(1);//解析一级路径
        if(location.hash)hash = location.hash.split('#')[1].split('?')[0];//解析二级路径
        if(!hash){
            if(!req){
                //默认页面
                $('.sidebar-secondNav[data-value="vulcheck-index"], .sidebar-firstNav[data-value="vulcheck-index"]').trigger('click');
            }else{
                //只有一级的默认页面
                $('.sidebar-secondNav[data-value="'+req+'-index"], .sidebar-firstNav[data-value="'+req+'-index"]').trigger('click');
            }
        }else{
            //模拟触发点击事件加载页面
            $('.sidebar-secondNav[data-value='+req+'-'+hash+'], .sidebar-firstNav[data-value='+req+'-'+hash+']').trigger('click');
        }
    }
})