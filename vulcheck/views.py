# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from imp import reload

import math

from django.shortcuts import render

import copy
import json
import time
import uuid
import re

import pymongo
from IPy import IP
import sys
import csv

from django.http import HttpResponse
from django.shortcuts import render
import requests

import logging
import coloredlogs

coloredlogs.install(level='DEBUG',
                    fmt="%(asctime)s - %(filename)s[line:%(lineno)d] - %(levelname)s: %(message)s",
                    )

# glob_url = "http://172.16.39.65:9000"
glob_url = "http://127.0.0.1:9000"
mongo_client = pymongo.MongoClient('mongodb://47.100.88.79:27017/?authSource=webmap')

mongo_db = mongo_client['webmap']
project_set = mongo_db['projectdb']
result_set = mongo_db['resultdb']


# reload(sys)
# sys.setdefaultencoding('utf8')


def index(request):
    context = {'hello': 'Hello World!'}

    return render(request, r'vulcheck\index.html', context)


def quickstart(request):
    context = {'hello': 'Hello World!'}

    return render(request, r'vulcheck\quickstart.html', context)


def show_all_task_html(request):
    context = {}
    return render(request, r'vulcheck\show_all_task.html', context)


def show_all_task(request):
    page = request.GET.get("page")
    page = 0 if not page else int(page) - 1
    page_num = 10
    skip = int(page * page_num)
    max_num = project_set.count()
    max_page = int(math.ceil(float(max_num) / page_num))  # 最大分页数
    result = project_set.find({}, {'_id': 0}).skip(skip).limit(page_num)
    logging.debug(max_num)
    task_list = []
    for x in result:
        # logging.debug(x)
        x['finish_time'] = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(x['finish_time'])) if x[
            'finish_time'] else ""
        x['start_time'] = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(x['start_time'])) if x['start_time'] else ""
        task_list.append(x)

    context = {'code': '200',
               'data': task_list,
               'max_page': max_page,
               }

    return HttpResponse(json.dumps(context), content_type="application/json")


def send_task_html(request):
    context = {}
    return render(request, r'vulcheck\send_task.html', context)


def task_detial_html(request):
    context = {}
    return render(request, r'vulcheck\task_detail.html', context)


def get_total_html(request):
    context = {}
    return render(request, r'vulcheck\total.html', context)


def total_one_detail_html(request):
    context = {}
    return render(request, r'vulcheck\total_one.html', context)


def get_report_html(request):
    task_id = request.GET.get("task_id")
    task_id = str(task_id)
    ip_scan, web_scan, context, statistical, statistical_one = get_scan_res_json(task_id)
    if context['data']:
        finish_time = context['data']['finish_time']
        finish_time = time.localtime(finish_time)
        other_style_time = time.strftime("%Y-%m-%d %H:%M:%S", finish_time)
        context['data']['finish_time'] = other_style_time
        start_time = context['data']['start_time']
        start_time = time.localtime(start_time)
        other_style_time = time.strftime("%Y-%m-%d %H:%M:%S", start_time)
        context['data']['start_time'] = other_style_time

    return render(request, r'vulcheck\report.html', {
        'data': json.dumps(context),
        'ip_scan': json.dumps(ip_scan),
        'web_scan': json.dumps(web_scan),
        'statistical': json.dumps(statistical),
        'statistical_one': json.dumps(statistical_one),
    })


def test_post_ajax(request):
    print(request.body)
    print("test_post_ajax")
    context = {}
    return HttpResponse(json.dumps(context), content_type="application/json")


def issue_tesk(request):
    task = request.POST.get("task")
    url = glob_url + "/v1/sendtask"

    context = {}
    # print (json.loads(task))
    try:
        task = json.loads(task)
        if isinstance(task, list):
            context = []
            for x in task:
                res = get_issue_task_result(url, x)
                context.append(res)
        else:
            res = get_issue_task_result(url, task)
            context = res
    except Exception as e:
        print(e)
        context['code'] = 500
        context['data'] = "json输入有误"

    return HttpResponse(json.dumps(context), content_type="application/json")


def get_issue_task_result(url, task):
    context = {'url': task['url']}
    try:
        # task = json.loads(task)
        context['code'] = 200
        task = json.dumps(task)
        result = requests.post(url, data=task)
        # print(result.text)
        context['data'] = result.text
    except Exception as e:
        print(e)
        context['code'] = 500
        context['data'] = "json输入有误"
        context['error'] = task

    return context


def get_task_list(request):
    url = glob_url + "/v1/gettasklist"
    print(url)
    result = requests.get(url)
    context = {'data': "", 'code': result.status_code}
    if result.status_code == 200:
        res = json.loads(result.text)

        for x in res['data']:
            finish_time = x['finish_time']
            finish_time = time.localtime(finish_time)
            other_style_time = time.strftime("%Y-%m-%d %H:%M:%S", finish_time)
            x['finish_time'] = other_style_time
        if res['code'] == 100:
            context['data'] = res['data']

    else:
        context['data'] = ""

    return HttpResponse(json.dumps(context), content_type="application/json")


# 获取完成任务列表
def get_task_finish_list(request):
    res = []

    for i in project_set.find({'status': {'$ne': 'FINISHED'}}, {'_id': 0}).sort([('finish_time', -1)]):
        logging.debug(i)
        res.append(i)

    for i in result_set.find({}, {'_id': 0}).sort([('finish_time', -1)]):
        if 'result' in i:
            i['status'] = 'FINISHED'
            i['statistical'] = deal_result_json_all(i)[0]
        res.append(i)

    return HttpResponse(json.dumps(res), content_type="application/json")


def stop_task(request):
    task_id = request.GET.get("task_id")
    task_id = str(task_id)
    url = glob_url + "/v1/stoptask"
    data = {"task_id": task_id}
    data = json.dumps(data)
    result = requests.post(url, data=data)
    context = {'data': "", 'code': result.status_code}
    if result.status_code == 200:
        res = json.loads(result.text)
        if res['code'] == 100:
            context['data'] = res['data']
        # print(result.text)
    else:
        context['data'] = ""
    return HttpResponse(json.dumps(context), content_type="application/json")


def get_scan_result(request):
    task_id = request.GET.get("task_id")
    task_id = str(task_id)
    result = result_set.find({'task_id': task_id}, {'_id': 0})
    result_list = []
    for x in result:
        # logging.debug(x)
        result_list.append(x)

    context = {"code": 200, "data": result_list}
    return HttpResponse(json.dumps(context), content_type="application/json")


# csv 报表ip
def get_scan_result_report_ip(request):
    print("get_scan_result_report_ip")
    task_id = request.GET.get("task_id")
    res_list = get_scan_res_json(task_id)[0]
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename=ip_scan.csv'
    writer = csv.writer(response)
    result = ['主机', '域名', '标题', '端口', '服务', '更新时间', '是否备案', '备案信息']
    writer.writerow(result)
    CsvData = res_list
    res_list_list = []
    for item in [CsvData]:
        for x in item:
            temp = []
            temp.append(x['host'])
            temp.append(x['domain'])
            temp.append(x['title'])
            temp.append(x['port'])
            temp.append(x['server'])
            temp.append(x['update_time'])
            temp.append(x['icp'])
            temp.append(x['icp_server'])
            res_list_list.append(temp)

    for item in res_list_list:
        writer.writerow(item)

    return response


# csv 报表web
def get_scan_result_report_web(request):
    print("get_scan_result_report_web")
    task_id = request.GET.get("task_id")
    keyword_res_list = get_scan_res_json(task_id)[1]
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename=web_scan.csv'
    writer = csv.writer(response)
    result = ['命中关键词', '信息类别', '证据', 'URL', '域名', '主机(ip)', '标题（网站名称）', '发现时间']
    writer.writerow(result)
    CsvData = keyword_res_list

    res_list_list = []
    for item in [CsvData]:
        for x in item:
            temp = []
            temp.append(x['value'])
            temp.append(x['type'])
            temp.append(x['segment'])
            temp.append(x['url'])
            temp.append(x['domain'])
            temp.append(x['ip'])
            temp.append(x['title'])
            temp.append(x['time'])
            res_list_list.append(copy.deepcopy(temp))

    for item in res_list_list:
        writer.writerow(item)

    return response


def get_scan_result_report_key_word(request):
    print("get_scan_result_report_key_word")
    task_id = request.GET.get("task_id")
    keyword_res_list = get_scan_res_json(task_id)[1]
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename=key_word_scan.csv'
    writer = csv.writer(response)
    result = ['关键词']
    writer.writerow(result)
    CsvData = keyword_res_list
    res_list_list = []
    for item in [CsvData]:
        for x in item:
            if x['value'] in res_list_list:
                continue
            res_list_list.append(x['value'])

    for item in res_list_list:
        writer.writerow([item])

    return response


# 获取某个 task_id 扫描的json结果
def get_scan_res_json(task_id):
    task_id = str(task_id)
    url = glob_url + "/v1/getscanresult"
    data = {"task_id": task_id}
    data = json.dumps(data)
    result = requests.post(url, data=data)
    context = {'data': "", 'code': result.status_code}
    if result.status_code == 200:
        res = json.loads(result.text)
        if res['code'] == 100:
            context['data'] = res['data']
        # print(result.text)
    else:
        context['data'] = ""
    res_list = []
    keyword_res_list = []
    statistical = {}
    statistical_one = {}
    if "result" in context['data']:
        statistical, statistical_one = deal_result_json_all(context['data'])
        for x in context['data']['result']:
            res = context['data']['result'][x]
            result = {}
            result['host'] = res.get("ip", "")
            result['domain'] = res.get("domain", "")
            result['title'] = res.get("title", "")
            result['port'] = ""
            result['server'] = ""
            if "/" in res.get("protocols"):
                result['port'] = res.get("protocols", "").split("/")[0]
                result['server'] = res.get("protocols", "").split("/")[1]
            result['update_time'] = res.get("save_time", "")
            has_icp = result['icp'] = "icp" in res
            result['icp'] = "否"
            result['icp_server'] = ""
            if has_icp:
                result['icp'] = "是"
                result['icp_server'] = res['icp'].get('icp_code', "")
            res_list.append(copy.deepcopy(result))

            if "illegality" in context['data']['result'][x]:
                if "keywords" in context['data']['result'][x]['illegality']:
                    keywords = res['illegality']['keywords']
                    for keyword in keywords:
                        res_keyword = {}
                        res_keyword['url'] = keyword.get("url", "")
                        res_keyword['ip'] = res.get("ip", "")
                        res_keyword['title'] = res.get("title", "")
                        res_keyword['time'] = res.get("save_time", "")
                        res_keyword['domain'] = res.get("domain", "")
                        if "value" in keyword:
                            for param in keyword['value']:
                                res_keyword['type'] = param.get("type", "")
                                if "keyword_list" in param:
                                    for val in param['keyword_list']:
                                        res_keyword['value'] = val.get("value", "")
                                        res_keyword['segment'] = val.get("segment", "")
                                        res_keyword['segment'] = res_keyword['segment'].replace("\r", "")
                                        res_keyword['segment'] = res_keyword['segment'].replace("\n", "")
                                        keyword_res_list.append(copy.deepcopy(res_keyword))
    logging.debug(statistical)
    return [res_list, keyword_res_list, context, statistical, statistical_one]


def get_task_status(request):
    task_id = request.GET.get("task_id")
    task_id = str(task_id)
    url = glob_url + "/v1/gettaskstatus"
    data = {"task_id": task_id}
    # data = {"task_id": "11"}
    data = json.dumps(data)
    result = requests.post(url, data=data)
    context = {'data': "", 'code': result.status_code}

    if result.status_code == 200:
        res = json.loads(result.text)
        if res['code'] == 100:
            context['data'] = res['data']
        # print(result.text)
    else:
        context['data'] = ""
    return HttpResponse(json.dumps(context), content_type="application/json")


def get_plug(request):
    print(u"获得插件列表")
    url = glob_url + "/v1/getpluginlist"
    print(url)
    result = requests.get(url)
    context = {'data': "", 'code': result.status_code}
    if result.status_code == 200:
        res = json.loads(result.text)
        if res['code'] == 100:
            context['data'] = res['data']
        # print(result.text)
    else:
        context['data'] = ""
    return HttpResponse(json.dumps(context), content_type="application/json")


task_content = {
    "task_id": "",
    "spider_task_id": "",
    "url": "",
    "spider": {
        "maxpage": 500,
        "maxdepth": 3,
        "notscanurl": "/.*?delete*,/.*?logout*,/.*?loginout*",
        "crawlrule": 0,
        "notscanfile": "",
        "phantomjs_enable": False,
        "craw_current_directory": False

    },
    "plugins": ""
}


def issue_task_list(request):
    check_url = request.POST.get("url")
    check_url = check_url
    check_url = check_url.split("\r\n")
    plugins = request.POST.getlist("plugin_name")
    maxpage = request.POST.get("maxpage")
    maxdepth = request.POST.get("maxdepth")
    notscanurl = request.POST.get("notscanurl")
    crawlrule = request.POST.get("crawlrule")
    notscanfile = request.POST.get("notscanfile")
    phantomjs_enable = request.POST.get("phantomjs_enable")
    craw_current_directory = request.POST.get("craw_current_directory")
    # plugins = request.POST.getlist("plugin_name")
    print(request.POST)
    context = []

    check_url_list = []
    for x in check_url:
        x = x.strip()
        res = re.search(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/\d{1,2}", x)
        res1 = re.search(r"(\d{1,3}\.\d{1,3}\.\d{1,3}\.)(\d{1,3})-(\d{1,3})", x)
        if res:
            y = IP(x)
            for j in list(y):
                check_url_list.append(str(j))
        elif res1:

            start = int(res1.group(2))
            end = int(res1.group(3))
            for j in range(start, end + 1):
                temp_ip = res1.group(1)
                temp_ip = temp_ip + str(j)
                check_url_list.append(temp_ip)
        else:
            check_url_list.append(str(x))

    print(check_url_list)

    task_id = str(uuid.uuid4())
    spider_task_id = str(uuid.uuid4())

    # task = task_content['']
    task = task_content
    task['task_id'] = task_id
    task['spider_task_id'] = spider_task_id
    task['url'] = ",".join(check_url_list)
    task['plugins'] = plugins
    task['spider']['maxpage'] = maxpage if maxpage else 500
    task['spider']['maxdepth'] = maxdepth if maxdepth else 3
    task['spider']['notscanurl'] = notscanurl if notscanurl else "/.*?delete*,/.*?logout*,/.*?loginout*"
    task['spider']['crawlrule'] = crawlrule if crawlrule else 0
    task['spider']['notscanfile'] = notscanfile if notscanfile else ""
    task['spider']['phantomjs_enable'] = phantomjs_enable if phantomjs_enable else False
    task['spider']['craw_current_directory'] = phantomjs_enable if craw_current_directory else False

    res = get_issue_task_result(glob_url + "/v1/sendtask", task)
    # print(res)
    context.append(res)

    return HttpResponse(json.dumps(context), content_type="application/json")


# 一次扫描任务的结果统计
def deal_result_json_all(data):
    statistical = {}
    statistical_one = {}
    statistical_detail = {}
    for x in data['result']:
        res = data['result'][x]
        res_one = deal_result_json(res)
        if res_one:
            statistical_one[x] = res_one
            statistical_detail[x] = res
            logging.debug(x)
            logging.debug(res_one)
            for k in res_one:
                if k not in statistical:
                    statistical[k] = {}
                for j in res_one[k]:
                    if j not in statistical[k]:
                        statistical[k][j] = 0
                    statistical[k][j] += res_one[k][j]
    return statistical, statistical_one


# 网站层面的结果
def deal_result_json(web):
    # print(key)
    result = {}  # 一个网站的汇总
    if 'vulnerables' in web:
        result['vulnerables'] = {}
        for x in web['vulnerables']:
            result['vulnerables'][x] = len(web['vulnerables'][x])
    if 'illegality' in web:
        result['illegality'] = {}
        if 'keywords' in web['illegality']:
            result['illegality']['keywords'] = 0
            for j in web['illegality']['keywords']:
                result['illegality']['keywords'] = result['illegality']['keywords'] + len(j['value'])
        if 'trojanhorse' in web['illegality']:
            result['illegality']['trojanhorse'] = 0
            for k in web['illegality']['trojanhorse']:
                result['illegality']['trojanhorse'] = result['illegality']['trojanhorse'] + len(k['value'])
        if 'domain_hijack' in web['illegality']:
            result['illegality']['domain_hijack'] = len(web['illegality']['domain_hijack'])
    return result


def classify_by_key(request):
    """
    关于所有分类信息的查询过滤
    :arg request
    :return 结果
    """
    # project_set = mongo_db['resultdb']
    filter_param = json.loads(request.body)

    context = {"data": {}}
    classify = [
        'result.value.server',
        'result.value.protocols',
        'result.value.location.city',
        'result.value.location.province',
        'result.value.location.country_ch',
        'result.value.language',
        'result.value.cdn',
        'result.value.component',
    ]
    match = {'$match': {}}
    # match['$match']['result.value.location.province'] = "Hubei"
    for key in filter_param['param']:
        val = filter_param['param'][key]
        # logging.debug(filter_param['param'][key])
        match['$match'][key] = val
        logging.debug(val)
    logging.debug(match)
    for x in classify:
        # match['$match'][x] = {'$exists': True}
        # match['$match']['result.value.location.province'] = "Hubei"
        # match['$match']['task_id'] = "2e50b90c-d6a6-41e3-a3ed-502e1d9fa131"
        # match['$match']['task_id'] = "486a8d13-ff6e-4b5a-9322-5f0b5f63b750"
        # match['$match']['result.value.protocols'] = "9000/http"
        if x == 'result.value.language' or x == 'result.value.component':
            pipeline = [
                {'$project': {"task_id": 1, 'result': 1}},
                {'$unwind': '$result'},
                {'$unwind': "$" + x},
                match,
                {'$group': {'_id': "$" + x, 'count': {'$sum': 1}}},
                {'$sort': {'count': -1}},
                {'$project': {"_id": 1, 'count': 1}}
            ]
        else:
            pipeline = [
                {'$project': {"task_id": 1, 'result': 1}},
                {'$unwind': '$result'},
                match,
                {'$group': {
                    '_id': "$" + x,
                    'count': {'$sum': 1},
                }},
                {'$sort': {'count': -1}},
                {'$project': {"_id": 1, 'count': 1}}
            ]
        # logging.debug(x)
        context['data'][x] = []
        for i in result_set.aggregate(pipeline):
            if not i['_id']:
                continue
            if isinstance(i['_id'], dict):
                if 'version' in i['_id']:
                    i['_id'] = i['_id']['product'] + ":" + i['_id']['version']
                else:
                    i['_id'] = i['_id']['product']
            # logging.debug(i)

            context['data'][x].append(i)

    return HttpResponse(json.dumps(context), content_type="application/json")


def get_result_count(match):
    """:ivar获得所有result长度总和"""

    # project_set = mongo_db['resultdb']
    pipeline = [
        match,
        {
            '$project': {
                '_id': 0,
                'size_of_result': {'$size': "$result"},
            }
        },
    ]
    sum = 0
    for i in result_set.aggregate(pipeline):
        sum += i['size_of_result']
    # logging.debug(sum)
    return sum


def get_scan_list(request):
    context = {"max_page": 0}
    page = request.GET.get("page")
    logging.debug(json.loads(request.body))
    param = json.loads(request.body)
    page = param['page']
    filter_param = param['param']
    # project_set = mongo_db['resultdb']
    page = 0 if not page else int(page) - 1
    page_num = 10
    skip = int(page * page_num)

    match = {'$match': {"result": {'$exists': True}}}

    for key in filter_param:
        val = filter_param[key]
        match['$match'][key] = val
    # match['$match']['task_id'] = "c0381eb6-b01d-434a-ab38-5e42756fa40f"
    max_num = get_result_count(match)
    max_page = int(math.ceil(float(max_num) / page_num))  # 最大分页数
    pipeline = [
        {'$project': {"_id": 0,"task_id":1, 'result': 1}},
        match,
        {'$unwind': "$result"},
        {'$skip': skip},
        {'$limit': page_num},
        {'$sort': {'result.value.save_time': -1}},
    ]
    result = []
    for i in result_set.aggregate(pipeline):
        # logging.debug(i)
        result.append(i)

    # logging.debug(max_page)
    context['max_page'] = max_page
    context['data'] = result
    return HttpResponse(json.dumps(context), content_type="application/json")
