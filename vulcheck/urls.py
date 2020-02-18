# -*- coding: utf-8 -*-
from django.conf.urls import url
from vulcheck import views

urlpatterns = [

    url(r'^issue_tesk', views.issue_tesk),
    url(r'^task_list', views.get_task_list),
    url(r'^task_finish_list', views.get_task_finish_list),

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

    url(r'^show_all_task_html', views.show_all_task_html),  # 获得所有任务的页面
    url(r'^show_all_task', views.show_all_task),  # 按页数获得所有任务
    url(r'^send_task_html', views.send_task_html),  # 获得下发任务页面
    url(r'^task_detial_html', views.task_detial_html),  # 获得单个任务详情页面
    url(r'^get_scan_result$', views.get_scan_result),  # 获得单个任务扫描的结果
    url(r'^get_total_html$', views.get_total_html),  # 获得单个任务扫描的结果
    url(r'^classify_by_key$', views.classify_by_key),  # 获得单个任务扫描的结果
    url(r'^get_scan_list$', views.get_scan_list),  # 获得每一条结果的list[]
    url(r'^total_one_detail_html$', views.total_one_detail_html),  # 单条数据的HTML
    # url(r'/index/$', views.index),
    # url(r'', views.index),
]
