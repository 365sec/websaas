function vulcheckQuickstart() {
    $.ajax({
        url: 'vulcheck/quickstart',
        dataType:"html",
        type: "get",
        success: function(res){
            // history.pushState(null,null,'/vulcheck#quickstart')
            $('.tab-content').html(res)
        }
    });
}