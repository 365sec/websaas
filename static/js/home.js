document.write("<script type='text/javascript' src='/static/js/project/vulcheck/vul_index.js'></script>");
document.write("<script type='text/javascript' src='/static/js/project/vulcheck/vul_quickstart.js'></script>");
document.write("<script type='text/javascript' src='/static/js/project/vulcheck/vul_task.js'></script>");

$(function () {
    $(".sidebar-firstNav,.sidebar-secondNav").click(function () {
        var value = $(this).attr("data-value");
        if(value){
            var target = '/'+value.split('-')[0]+'#'+value.split('-')[1];
            // 在本页面刷新链接只有参数变化则不改变url
            if(!location.pathname || !location.hash ||
                location.pathname + location.hash.split('?')[0] !== target){
                history.pushState(null,null,target);
            }
        }
        switch (value) {
            case "vulcheck-index":
                vulcheckIndex();
                break;
            case "vulcheck-quickstart":
                vulcheckQuickstart();
                break;
            case "vulcheck-show_all_task":
                vulcheck_show_all_task();
                break;
            case "vulcheck-send_task":
                vulcheck_send_task();
                break;
            default:
        }
    });
})
