"""websaas URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.contrib import admin

from websaas import views
# from vulcheck import views

urlpatterns = [
    # url(r'^admin/', admin.site.urls),
    # url(r'^issue_tesk', views.issue_tesk),
    # url(r'^tesk_list', views.get_tesk_list),
    # url(r'^task_finish_list', views.get_task_finish_list),
    # url(r'^get_scan_result$', views.get_scan_result),
    # url(r'^get_scan_result_report_ip$', views.get_scan_result_report_ip),
    # url(r'^get_scan_result_report_web$', views.get_scan_result_report_web),
    # url(r'^get_scan_result_report_word$', views.get_scan_result_report_key_word),
    # url(r'^stop_task', views.stop_task),
    # url(r'^task_status', views.get_task_status),
    # url(r'^get_plug', views.get_plug),
    # url(r'^issue_task_list', views.issue_task_list),
    # url(r'^test_post_ajax', views.test_post_ajax),
    # url(r'^test', views.test),
    # url(r'^get_report_html', views.get_report_html),
    url(r'vulcheck/', include('vulcheck.urls')),
    url(r'', views.index),

]
