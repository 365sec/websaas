# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import time

import pymongo
import logging
import coloredlogs

coloredlogs.install(level='DEBUG',
                    fmt="%(asctime)s - %(filename)s[line:%(lineno)d] - %(levelname)s: %(message)s",
                    )

mongo_client = pymongo.MongoClient('mongodb://47.100.88.79:27017/?authSource=webmap')
mongo_db = mongo_client['webmap']


def log_time(func):
    def wrapper(*args, **kw):
        start = time.time()
        result = func(*args, **kw)
        print("函数{0} 运行时间{1}".format(func.__name__, time.time() - start))
        return result

    return wrapper


@log_time
def get_all_vul_count():
    project_set = mongo_db['resultdb']
    vulnerables_dir = ['sqli', 'blindsql', 'xss', 'crlf_injection', 'directory_traversal']
    illegality_dir = ['keywords', 'trojanhorse', 'domain_hijack']

    plugs_class = ['illegality', 'vulnerables']
    # plugs_class = ['illegality']
    # task_id = "3d06ecda-5227-4ee4-867a-d74398da3abd"
    task_id = None
    if not task_id:
        task_id = {'$exists': True}
    for class_name in plugs_class:
        _dir = []
        if class_name == 'vulnerables':
            _dir = vulnerables_dir
        elif class_name == 'illegality':
            _dir = illegality_dir
        for x in _dir:
            pipeline = [
                {'$match': {"value.{}.{}".format(class_name, x): {'$exists': True}, "task_id": task_id}},
                {'$project': {"value.{}.{}".format(class_name, x): 1, "url": 1, "task_id": 1}},
            ]
            k = 0
            for i in project_set.aggregate(pipeline):
                logging.debug({i['url']: [i['task_id'], x, len(i['value'][class_name][x])]})
                k += len(i['value'][class_name][x])
            logging.debug({x: k})


def test():
    project_set = mongo_db['resultdb']

    # for i in project_set.find({}, {'value.vulnerables.sqli': 1, '_id': 0}):
    #     if i['value']:
    #         logging.debug(i['value']['vulnerables']['sqli'])

    logging.debug(project_set.count({"value.vulnerables.sqli": 1}))

    pipeline = [
        {'$match': {"value.vulnerables.sqli": {'$exists': True}}},
        # {'$project': {'value.vulnerables.sqli': 1} },
        {'$project': {'value.vulnerables.sqli': 1, "preIdx": "$_id"}},
        # {'$unwind': '$value.vulnerables'},
        # {'$unwind': '$value.vulnerables[{},{}]'},
        #
        # {'$group': {'_id': "$value.vulnerables", 'count': {'$sum': 1}}},
        # { '$project': {'task_id': 1} }
    ]

    k = 0
    for i in project_set.aggregate(pipeline):
        logging.debug(i)
        k += 1
    logging.debug(k)


@log_time
def classify_by_key():
    project_set = mongo_db['resultdb']
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

    for x in classify:
        # match = {'$match': {x: {'$exists': True}}}
        match = {'$match': {}}

        # match['$match']['result.value.location.province'] = "Hubei"
        # match['$match']['task_id'] = "486a8d13-ff6e-4b5a-9322-5f0b5f63b750"
        # match['$match']['result.value.protocols'] = "9000/http"
        if x == 'result.value.language':
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
        k = 0
        logging.debug(x)
        for i in project_set.aggregate(pipeline):
            if not i['_id']:
                continue
            if "result.value.server" in x:
                i['_id'] = i['_id']['product']+":"+i['_id']['version']
            logging.debug(i)
        #     k += 1
        # logging.debug(k)



@log_time
def classify_by_key2():
    project_set = mongo_db['resultdb']
    classify = [
        # 'result.value.server',
        # 'result.value.protocols',
        'result.value.location.city',
        # 'result.value.location.province',
        # 'result.value.location.country_ch',
        # 'result.value.language',
        # 'result.value.cdn',
        # 'result.value.component',
    ]

    for x in classify:
        match = {'$match': {x: {'$exists': True}}}
        match['$match']['task_id'] = "c0381eb6-b01d-434a-ab38-5e42756fa40f"
        # match['$match']['orig_url'] = 'http://45.249.246.179/'
        # match['$match']['task_id'] = "486a8d13-ff6e-4b5a-9322-5f0b5f63b750"
        # match['$match']['result.value.protocols'] = "80/http"
        if x == 'value.language':
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
                # {'$group': {
                #     '_id': "$" + x,
                #     'count': {'$sum': 1},
                # }},
                # {'$sort': {'count': -1}},
                # {'$project': {"_id": 1, 'count': 1}}
            ]
        k = 0
        logging.debug(x)
        for i in project_set.aggregate(pipeline):
            logging.debug(i)
        #     k += 1
        # logging.debug(k)


@log_time
def classify_by_key1():
    project_set = mongo_db['resultdb']
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

    # match = {'$match': {x: {'$exists': True}}}
    pipeline = [
        {'$project': {"task_id": 1, 'result': 1}},
        {'$unwind': '$result'},
        # match,
        {'$group': {
            '_id': {
                'server':'$result.value.server',
                'protocols':'$result.value.protocols',
                'city':'$result.value.location.city',
                'province':'$result.value.location.province',
            },
            'count': {'$sum': 1},
        }},
        # {'$sort': {'count': -1}},
        {'$project': {"_id": 1, 'count': 1}}
    ]


    for i in project_set.aggregate(pipeline):
        logging.debug(i)
        #     k += 1
        # logging.debug(k)

@log_time
def classify_by_key_vulnerables():
    project_set = mongo_db['resultdb']

    pipeline = [
        {'$project': {"task_id": 1, 'result': 1}},
        # # {'$match': {x: {'$exists': True},}},
        {'$unwind': "$result"},
        {'$unwind': "$result.value.vulnerables"},
        {'$unwind': "$result.value.vulnerables.plugin_name"},
        {'$group': {'_id': "$result.value.vulnerables.plugin_name", 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}},
    ]

    for i in project_set.aggregate(pipeline):
        logging.debug(i)


@log_time
def classify_by_key_illegality():
    project_set = mongo_db['resultdb']
    pipeline = [
        # {'$match': {'task_id': u'0a71f4a8-7987-49c0-b4a9-afadb39fe843'}},
        {'$project': {'result': 1, 'task_id': 1}},
        {'$unwind': '$result'},
        {'$unwind': '$result.value.vulnerables'},
        {'$unwind': '$result.value.vulnerables.plugin_name'},
        {'$group': {
            '_id': '$result.scheme_domain',
            'plugin_name': {'$push': "$result.value.vulnerables.plugin_name"},
        }},
        {'$unwind': "$plugin_name"},
        {
            '$group': {
                '_id': '$_id',
                'count': {'$sum': 1},
                'plugin_num': {'$push': "$plugin_name"},
            }
        },
    ]
    res = project_set.aggregate(pipeline)
    result = {}
    for i in res:
        # logging.debug(i)
        if i['_id'] not in result:
            result[i['_id']] = {}
            result[i['_id']]['total'] = i['count']
            result[i['_id']]['result'] = {}
        for plugin_num in i['plugin_num']:
            if plugin_num not in result[i['_id']]['result']:
                result[i['_id']]['result'][plugin_num] = 0
            result[i['_id']]['result'][plugin_num] += 1

    logging.debug(result)

@log_time
def classify_by_key_illegality_reduce():
    project_set = mongo_db['resultdb']
    # logging.debug(project_set)
    # x: {'$exists': True}
    pipeline = [
        {'$match': {'task_id': u'0a71f4a8-7987-49c0-b4a9-afadb39fe843','result': {'$exists': True}}},
        {'$project': {'result': 1, 'task_id': 1}},
        {'$unwind': '$result'},
        {'$unwind': '$result.value.vulnerables'},
        {'$unwind': '$result.value.vulnerables.plugin_name'},
        {'$group': {
            '_id': '$result.scheme_domain',
            'count': {'$sum': 1},
            'plugin_num': {'$push': "$result.value.vulnerables.plugin_name"},
            # 'plugin': {'$push': {'plugin_name': '$result.value.vulnerables.plugin_name','num':{'$sum':1}}},
        }},
        {'$unwind': '$plugin_num'},
        {'$group': {
            '_id': {
                'url': '$_id',
                'plugin': '$plugin_num',
            },
            # 'total': {'count'},
            'plugin_count': {'$sum': 1},

        }},
        {'$group': {
            '_id': '$_id.url',
            # 'plugin_total_num':{'$sum': 1},
            'plugin_classs_num': {'$sum': 1},
            'plugin_num': {'$addToSet': {'plugin': '$_id.plugin', 'num': '$plugin_count'}},

        }},

    ]
    res = project_set.aggregate(pipeline)
    result = {}
    for i in res:
        logging.debug(i)
    #     if i['_id'] not in result:
    #         result[i['_id']] = {}
    #         result[i['_id']]['total'] = i['count']
    #         result[i['_id']]['result'] = {}
    #     for plugin_num in i['plugin_num']:
    #         if plugin_num not in result[i['_id']]['result']:
    #             result[i['_id']]['result'][plugin_num] = 0
    #         result[i['_id']]['result'][plugin_num] += 1
    #
    # logging.debug(result)


def mongo_search():
    project_set = mongo_db['resultdb']
    # result = project_set.find({'$name':{'$search':"wxywwl.cn"}})
    result = project_set.list_indexes()

    for i in result:
        logging.debug(i)


@log_time
def get_scan_list():
    project_set = mongo_db['resultdb']

    pipeline = [
        {'$project': {"_id": 0, 'result': 1}},
        {'$match': {"result": {'$exists': True}, }},
        {'$unwind': "$result"},
        # {'$unwind': "$result.scheme_domain"},
        # {'$unwind': "$result.value.vulnerables.plugin_name"},
        # {'$group': {'_id': "$result.value.vulnerables.plugin_name", 'count': {'$sum': 1}}},
        {'$project': {"task_id": 1,
                      'result.scheme_domain': 1,
                      'result.value.language': 1,
                      'result.value.title': 1,
                      'result.value.ip': 1,
                      'result.value.protocols': 1,
                      'result.value.location': 1,
                      'result.value.save_time': 1,
                      'result.value.response_headers': 1,
                      }},
        {'$sort': {'result.value.save_time': -1}},
    ]

    for i in project_set.aggregate(pipeline):
        logging.debug(i)


@log_time
def get_array_count():
    project_set = mongo_db['resultdb']
    pipeline = [
        {"$match":{"result": {'$exists':True}} },
        {
            '$project':{
                '_id':0,
                'size_of_result':{'$size':"$result"},
            }
        },


    ]
    sum = 0
    for i in project_set.aggregate(pipeline):
        sum += i['size_of_result']
    logging.debug(sum)


if __name__ == '__main__':
    # get_all_vul_count()
    # classify_by_key_vulnerables()
    # classify_by_key_illegality()
    # classify_by_key_illegality_reduce()

    classify_by_key()
    # classify_by_key1()
    # get_scan_list()
    # get_array_count()
