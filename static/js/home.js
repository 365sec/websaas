document.write("<script type='text/javascript' src='/static/js/project/vulcheck/vul_index.js'></script>");
document.write("<script type='text/javascript' src='/static/js/project/vulcheck/vul_quickstart.js'></script>");

$(function () {
    $(".sidebar-firstNav,.sidebar-secondNav").click(function () {
        var value = $(this).attr("data-value");
        var target = '/'+value.split('-')[0]+'#'+value.split('-')[1]
        // 在本页面刷新链接只有参数变化则不改变url
        if(!location.pathname || !location.hash ||
            location.pathname + location.hash.split('?')[0] !== target){
            history.pushState(null,null,target);
        }
        switch (value) {
            case "vulcheck-index":
                vulcheckIndex();
                break;
            case "vulcheck-quickstart":
                vulcheckQuickstart();
                break;
            default:
        }
    });
})
