# -*- coding: utf-8 -*
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
logging.basicConfig(level=logging.DEBUG,
                    # format="%(asctime)s %(name)s %(levelname)s %(message)s",
                    format="%(asctime)s - %(filename)s[line:%(lineno)d] - %(levelname)s: %(message)s",
                    datefmt='%Y-%m-%d  %H:%M:%S %a'    #注意月份和天数不要搞乱了，这里的格式化符与time模块相同
                    )


glob_url = "http://127.0.0.1:9000"
# glob_url = "http://172.16.39.78:9000"
# glob_url = "http://47.100.88.79:9000"

mongo_client = pymongo.MongoClient('mongodb://47.100.88.79:27017/?authSource=webmap')
mongo_db = mongo_client['webmap']


# reload(sys)
# sys.setdefaultencoding('utf8')

def index(request):
    context = {'hello': 'Hello World!'}

    return render(request, 'index.html', context)


def test(request):
    context = {'hello': 'Hello World!'}

    return render(request, 'test.html', context)


def test_null(request):
    context = {'hello': 'Hello World!'}

    context = {}
    return HttpResponse(json.dumps(context), content_type="application/json")


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
        logging.debug(url)
        result = requests.post(url, data=task)
        # print(result.text)
        context['data'] = result.text
    except Exception as e:
        print(e)
        context['code'] = 500
        context['data'] = "json输入有误"
        context['error'] = task

    return context


def get_tesk_list(request):

    print(u"获得任务列表")
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
    project_set = mongo_db['projectdb']

    for i in project_set.find({'status': {'$ne': 'FINISHED'}}, {'_id': 0}).sort([('finish_time', -1)]):
        logging.debug(i)
        res.append(i)
    mongo_set = mongo_db['resultdb']
    for i in mongo_set.find({}, {'_id': 0}).sort([('finish_time', -1)]):
        if 'result' in i:
            i['status'] = 'FINISHED'
            i['statistical'] = deal_result_json_all(i)
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
    url = glob_url + "/v1/getscanresult"
    data = {"task_id": task_id}
    data = json.dumps(data)
    result = requests.post(url, data=data)
    context = {'data': "", 'code': result.status_code}
    if result.status_code == 200:
        res = json.loads(result.text)
        if res['code'] == 100:
            context['data'] = res['data']
    else:
        context['data'] = ""
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
    result = ['命中关键词', '信息类别','证据' , 'URL', '域名', '主机(ip)', '标题（网站名称）', '发现时间']
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
        statistical = deal_result_json_all(context['data'])
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
    print(json.dumps(statistical))
    return [res_list, keyword_res_list, context, statistical]


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
                        "notscanfile": ""
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
            for j in range(start, end+1):
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
    print(task)
    res = get_issue_task_result(glob_url + "/v1/sendtask", task)
    # print(res)
    context.append(res)

    return HttpResponse(json.dumps(context), content_type="application/json")


# 一次扫描任务的结果统计
def deal_result_json_all(data):
    statistical = {}
    statistical_one = {}
    for x in data['result']:
        res = data['result'][x]
        res_one = deal_result_json(res)
        if res_one:
            statistical_one[x] = res_one
            for k in res_one:
                if k not in statistical:
                    statistical[k] = {}
                for j in res_one[k]:
                    if j not in statistical[k]:
                        statistical[k][j] = 0
                    statistical[k][j] += res_one[k][j]
    return statistical


# 网站层面的结果
def deal_result_json(web):
    # print(key)
    result = {}
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


def get_report_html(request):

    task_id = request.GET.get("task_id")
    task_id = str(task_id)
    ip_scan, web_scan, context, statistical = get_scan_res_json(task_id)
    if context['data']:
        finish_time = context['data']['finish_time']
        finish_time = time.localtime(finish_time)
        other_style_time = time.strftime("%Y-%m-%d %H:%M:%S", finish_time)
        context['data']['finish_time'] = other_style_time
        start_time = context['data']['start_time']
        start_time = time.localtime(start_time)
        other_style_time = time.strftime("%Y-%m-%d %H:%M:%S", start_time)
        context['data']['start_time'] = other_style_time

    return render(request, 'report.html', {
        'data': json.dumps(context),
        'ip_scan': json.dumps(ip_scan),
        'web_scan': json.dumps(web_scan),
        'statistical': json.dumps(statistical),
    })
