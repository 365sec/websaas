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
    url(r'^get_report_html', views.get_report_html),
    url(r'^quickstart', views.quickstart),

    url(r'^show_all_task_html', views.show_all_task_html),  # 获得所有任务的页面
    url(r'^show_all_task', views.show_all_task),  # 按页数获得所有任务
    url(r'^send_task_html', views.send_task_html),  # 获得下发任务页面
    url(r'^task_detial_html', views.task_detial_html),  # 获得单个任务详情页面
    url(r'^get_scan_result$', views.get_scan_result),  # 获得单个任务扫描的结果
    url(r'^get_total_html$', views.get_total_html),  # 获得单个任务扫描的结果
    url(r'^delete_task$', views.delete_task),  # 删除任务

    url(r'^classify_by_key$', views.classify_by_key),  # 统计信息左侧 各个数据的数目
    url(r'^get_scan_list$', views.get_scan_list),  # 获得每一条结果的list[]
    url(r'^get_scan_vul_iil_domain_list$', views.get_scan_vul_iil_domain_list),  # 获得只有漏洞和违法信息结果的list[]
    url(r'^total_one_detail_html$', views.total_one_detail_html),  # 单条数据的HTML
    url(r'^get_ill_web_html$', views.get_ill_web_html),  # 网页非法信息的HTML
    url(r'^get_ill_web_data$', views.get_ill_web_data),  # 网页非法信息数据
    url(r'^get_ill_web_data_wei_fa$', views.get_ill_web_data_wei_fa),  # 网页feature非法信息数据
    url(r'^get_image_bs64$', views.get_image_bs64),  # 网页非法信息数据
    url(r'^get_ill_keyword$', views.get_ill_keyword),  # 网页非法信息关键词下拉框
    url(r'^get_ill_feature_keyword$', views.get_ill_feature_keyword),  # 网站非法信息关键词下拉框
    url(r'^get_vul_web_html$', views.get_vul_web_html),  # 网页非法信息的HTML
    url(r'^get_vul_web_data$', views.get_vul_web_data),  # 网页漏洞信息数据
    url(r'^get_vul_keyword$', views.get_vul_keyword),  # 网页漏洞关键词下拉框
    url(r'^get_vul_total$', views.get_vul_total),  # 网页漏洞上部分统计信息
    url(r'^get_ill_total$', views.get_ill_total),  # 违法信息漏洞上部分统计信息

    url(r'^get_keywords_library_html$', views.keywords_library_html),  # 关键词库的HTML
    url(r'^get_black_domain_library_html$', views.domain_library_html),  # 黑域名的HTML
    url(r'^get_beian_html$', views.get_beian_html),  # 备案的HTML
    url(r'^get_beian_data$', views.get_beian_data),  # 备案的数据

    # --------------- 异常网站---------------
    url(r'^get_abnormal_html$', views.get_abnormal_html),  # 异常网站的HTML
    url(r'^get_abnormal_task_html$', views.get_abnormal_task_html),  # 异常网站的HTML


    url(r'^index$', views.index),
    url(r'', views.index1),
]
