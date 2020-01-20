from django.conf.urls import url
from vulcheck import views

urlpatterns = [

    url(r'^issue_tesk', views.issue_tesk),
    url(r'^task_list', views.get_task_list),
    url(r'^task_finish_list', views.get_task_finish_list),
    url(r'^get_scan_result$', views.get_scan_result),
    url(r'^get_scan_result_report_ip$', views.get_scan_result_report_ip),
    url(r'^get_scan_result_report_web$', views.get_scan_result_report_web),
    url(r'^get_scan_result_report_word$', views.get_scan_result_report_key_word),
    url(r'^stop_task', views.stop_task),
    url(r'^task_status', views.get_task_status),
    url(r'^get_plug', views.get_plug),
    url(r'^issue_task_list', views.issue_task_list),
    url(r'^test_post_ajax', views.test_post_ajax),
    url(r'^get_report_html', views.get_report_html),
    url(r'^quickstart', views.quickstart),

    url(r'^show_all_task_html', views.show_all_task_html),
    url(r'^show_all_task', views.show_all_task),
    url(r'^send_task_html', views.send_task_html),
    url(r'', views.index),
]
