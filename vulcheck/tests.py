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

    match = {}
    match['$match'] = {}
    match['$match']['result.value.illegal_feature'] = {'$exists': True}
    # match['$match']['result.value.illegal_feature.name'] = '色情网站'
    # match['$match']['result.value.save_time'] = {'$gt': '2020-02-9'}
    # match['$match']['result.value.save_time'] = {'$lt': '2020-02-26 '}
    pipeline = [
        {'$project': {"task_id": 1, 'result': 1}},
        {'$unwind': '$result'},
        match,
        {'$group': {
            '_id': {
                'name': '$result.value.illegal_feature.name',
                # 'protocols':'$result.value.protocols',
                # 'city':'$result.value.location.city',
                # 'province':'$result.value.location.province',
            },
            'count': {'$sum': 1},
        }},

        {'$sort': {'_id.save_time': -1}},
        {'$skip': 0},
        {'$limit': 10},
        {'$project': {"_id": 1, 'count': 1}}
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
        # 'result.value.server',
        # 'result.value.protocols',
        # 'result.value.location.city',
        # 'result.value.location.province',
        # 'result.value.location.country_ch',
        # 'result.value.location',
        # 'result.value.language',
        # 'result.value.cdn',
        # 'result.value.component',
        'result.value.illegal_feature.name',
    ]

    for x in classify:
        match = {'$match': {x: {'$exists': True}}}
        # match = {'$match': {}}

        # match['$match']['result.value.location.province'] = "Hubei"
        # match['$match']['task_id'] = "c0381eb6-b01d-434a-ab38-5e42756fa40f"
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
        elif "result.value.location" in x:
            pipeline = [
                {'$project': {"task_id": 1, 'result': 1}},
                {'$unwind': '$result'},
                match,
                {'$group': {
                    '_id': {
                        "country": "$result.value.location.country_ch",
                        "country_code": "$result.value.location.country_code",
                        "province": "$result.value.location.province",
                        "city": "$result.value.location.city",
                    },
                    'city_count':  {'$sum': 1},
                }},
                {'$sort': {'city_count': -1}},
                {
                    '$group': {
                        "_id": {
                            "country": "$_id.country",
                            "country_code": "$_id.country_code",
                            "province": "$_id.province",
                        },
                        'city': {'$push':  {"city_name": "$_id.city", "count": "$city_count"}},
                        'province_count':  {'$sum': "$city_count"},
                    }
                },
                {'$sort': {'province_count': -1}},
                {
                    '$group': {
                        "_id": {
                            "country": "$_id.country",
                            "country_code": "$_id.country_code",
                        },
                        'province': {'$push':  {"province_name":"$_id.province","province_count":"$province_count", "city":"$city"}},
                        'country_count':  {'$sum': '$province_count'},
                    }
                },
                {'$sort': {'country_count': -1}},

                # {'$project': {"_id": 1, 'count': 1}}
            ]
        elif "result.value.illegal_feature.name" in x:
            pipeline = [
                {'$project': {"task_id": 1, 'result': 1}},
                {'$unwind': '$result'},
                match,
                {'$unwind': "$result.value.illegal_feature"},
                {'$group': {
                    '_id': "$" + x,
                    'count': {'$sum': 1},
                }},
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
                i['_id'] = i['_id']['product'] + ":" + i['_id']['version']
            print(i)
            # logging.debug(i)
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
                'server': '$result.value.server',
                'protocols': '$result.value.protocols',
                'city': '$result.value.location.city',
                'province': '$result.value.location.province',
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
        {'$unwind': '$result.value.illegality'},
        {'$unwind': '$result.value.illegality.plugin_name'},
        {'$group': {
            '_id': '$result.scheme_domain',
            'plugin_name': {'$push': "$result.value.illegality.plugin_name"},
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
def classify_by_key_by_domian_reduce():
    project_set = mongo_db['resultdb']
    # logging.debug(project_set)
    result = {}
    # plug = ["vulnerables","illegality"]
    plug = ["illegality"]
    for x in plug:
        pipeline = [
            # {'$match': {'task_id': u'0a71f4a8-7987-49c0-b4a9-afadb39fe843','result': {'$exists': True}}},
            {'$project': {'result': 1, 'task_id': 1}},
            {'$unwind': '$result'},
            {'$unwind': '$result.value.' + x},
            {'$unwind': '$result.value.' + x + '.plugin_name'},
            {'$group': {
                '_id': '$result.scheme_domain',
                'count': {'$sum': 1},
                'plugin_num': {'$push': '$result.value.' + x + '.plugin_name'},
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
                '_id': '$_id.plugin',
                'url_num': {'$sum': 1},
                # 'url_list_num': {'$addToSet': {'plugin': '$_id.url', 'num': '$plugin_count'}},
            }},
            {'$sort': {'url_num': -1}},

        ]
        res = project_set.aggregate(pipeline)
        for i in res:
            logging.debug(i)


@log_time
def classify_by_domian_by_key_reduce():
    project_set = mongo_db['resultdb']
    # logging.debug(project_set)
    result = {}
    plug = ["vulnerables", "illegality"]
    for x in plug:
        pipeline = [
            # {'$match': {'task_id': u'0a71f4a8-7987-49c0-b4a9-afadb39fe843','result': {'$exists': True}}},
            {'$project': {'result': 1, 'task_id': 1}},
            {'$unwind': '$result'},
            {'$unwind': '$result.value.' + x},
            {'$unwind': '$result.value.' + x + '.plugin_name'},
            {'$group': {
                '_id': '$result.scheme_domain',
                'count': {'$sum': 1},
                'plugin_num': {'$push': '$result.value.' + x + '.plugin_name'},
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
            {'$sort': {'plugin_classs_num': -1}},

        ]
        res = project_set.aggregate(pipeline)

        for i in res:
            logging.debug(i)


def get_ill_keyword():
    """:arg获得违法网站关键词的个数
    """
    result_set = mongo_db['resultdb']
    # logging.debug(project_set)
    result = {}
    match = {}
    match['$match'] = {}
    match['$match']['$or'] = [
        {'result.value.illegality.plugin_name': {'$exists': True}},
        # {'result.value.illegal_feature.name': {'$exists': True}}
    ]

    pipeline = [
        # {'$match': {'task_id': u'0a71f4a8-7987-49c0-b4a9-afadb39fe843','result': {'$exists': True}}},

        {'$project': {'result': 1, 'task_id': 1}},
        {'$unwind': '$result'},
        match,
        {'$unwind': '$result.value.illegality'},
        {'$group': {
            # '_id': '$result.value.illegality.plugin_name',
            '_id': {
                # 'url': '$result.scheme_domain',
                # 'plugin_name': '$result.value.illegality.plugin_name',
                'plugin_name': '$result.value.illegality.image_snapshot',
            },
            'count': {'$sum': 1},
        }},

    ]
    res = result_set.aggregate(pipeline)
    for i in res:
        logging.debug(i)


def get_ill_feature_keyword():
    """:arg获得违法网站关键词的个数
    """
    result_set = mongo_db['resultdb']
    pipeline = [
        # {'$match': {'task_id': u'0a71f4a8-7987-49c0-b4a9-afadb39fe843','result': {'$exists': True}}},

        {'$project': {'result': 1, 'task_id': 1}},
        {'$unwind': '$result'},
        {'$unwind': '$result.value.illegal_feature'},
        {'$group': {
            # '_id': '$result.value.illegality.plugin_name',
            '_id': {
                'plugin_name': '$result.value.illegal_feature.name',
            },
            'count': {'$sum': 1},
        }},

    ]
    res = result_set.aggregate(pipeline)
    for i in res:
        logging.debug(i)

def get_vul_keyword():
    """:arg
    获得漏洞的个数
    """
    result_set = mongo_db['resultdb']
    # logging.debug(project_set)
    result = {}

    pipeline = [
        # {'$match': {'task_id': u'0a71f4a8-7987-49c0-b4a9-afadb39fe843','result': {'$exists': True}}},
        {'$project': {'result': 1, 'task_id': 1}},
        {'$unwind': '$result'},
        {'$unwind': '$result.value.vulnerables'},
        {'$group': {
            '_id': '$result.value.vulnerables.name',
            'count': {'$sum': 1},
        }},

    ]
    res = result_set.aggregate(pipeline)
    for i in res:
        logging.debug(i)


def get_vul_web():
    """:arg
    存在漏洞的网站个数
    """
    result_set = mongo_db['resultdb']
    # logging.debug(project_set)
    result = {}
    # match = {'$match': {x: {'$exists': True}}}
    # match['$match']['result.value.illegality.plugin_name'] = {'$exists': True}
    pipeline = [
        # {'$match': {'task_id': u'0a71f4a8-7987-49c0-b4a9-afadb39fe843','result': {'$exists': True}}},
        {'$project': {'result': 1, 'task_id': 1}},
        {'$unwind': '$result'},
        {'$match': {'result.value.vulnerables': {'$exists': True}}},
        {'$group': {
            '_id': '$result.scheme_domain',
            # 'domian_list': {'$addToSet': '$result.scheme_domain'},
            'domian_list': {'$push': '$result.scheme_domain'},
        }},
        # {'$count': "domian_list"}
        # {'$count':{'$size':"$domian_list"},}

    ]
    res = result_set.aggregate(pipeline)
    for i in res:
        logging.debug(i)


def get_all_web():
    """:arg
    检测所有web ip总数
    """
    result_set = mongo_db['resultdb']
    # logging.debug(project_set)
    result = {}
    # match = {'$match': {x: {'$exists': True}}}
    # match['$match']['result.value.illegality.plugin_name'] = {'$exists': True}
    pipeline = [
        # {'$match': {'task_id': u'0a71f4a8-7987-49c0-b4a9-afadb39fe843','result': {'$exists': True}}},
        {'$project': {'result': 1, 'task_id': 1}},
        {'$unwind': '$result'},
        # {'$match': {'result.value.vulnerables': {'$exists': True}}},
        {'$group': {
            '_id': '$result.scheme_domain',
            'domian_list': {'$addToSet': '$result.scheme_domain'},
        }},
        {'$count': "domian_list"}

    ]
    res = result_set.aggregate(pipeline)
    for i in res:
        logging.debug(i)



def get_ill_feature():
    """:arg
    违法加上feature
    """
    result_set = mongo_db['resultdb']
    # logging.debug(project_set)
    result = {}
    match = {}
    match = {'$match': {}}
    match['$match']['$or'] = [
                            {'result.value.illegality.plugin_name': {'$exists': True}},
                              {'result.value.illegal_feature.name': {'$exists': True}}
                              ]
    pipeline = [
        {'$project': {"_id": 0,"task_id": 1, 'result': 1}},
        {'$unwind': "$result"},
        match,
        {'$skip': 0},
        {'$limit': 10},
        {'$sort': {'result.value.save_time': -1}},

    ]
    res = result_set.aggregate(pipeline)
    for i in res:
        logging.debug(i)

def get_vul_iil_domain():
    result_set = mongo_db['resultdb']

    task_id = "c0381eb6-b01d-434a-ab38-5e42756fa40f"
    param = {}
    if task_id:
        param['task_id'] = task_id
    param['$or'] = [{'result.value.illegality.plugin_name': {'$exists': True}},
                    {'result.value.vulnerables.plugin_name': {'$exists': True}}]
    # param['_id'] = 0
    logging.debug(param)
    res = result_set.find(param, {"_id": 0})
    result = []
    for i in res:
        logging.debug(i)
        result.append(i)


def get_vul_iil_domain1():
    result_set = mongo_db['resultdb']

    task_id = "c0381eb6-b01d-434a-ab38-5e42756fa40f"
    param = {}
    if task_id:
        param['task_id'] = task_id
    param['$or'] = [{'result.value.illegality.plugin_name': {'$exists': True}},
                    {'result.value.vulnerables.plugin_name': {'$exists': True}}]
    # param['_id'] = 0
    logging.debug(param)
    res = result_set.find(param, {"_id": 0})
    result = []
    for i in res:
        logging.debug(i)
        result.append(i)


@log_time
def classify_by_key_plugin_reduce():
    project_set = mongo_db['resultdb']
    # logging.debug(project_set)
    result = {}
    plug = ["vulnerables", "illegality"]
    for x in plug:
        pipeline = [
            # {'$match': {'task_id': u'0a71f4a8-7987-49c0-b4a9-afadb39fe843','result': {'$exists': True}}},
            {'$project': {'result': 1, 'task_id': 1}},
            {'$unwind': '$result'},
            {'$unwind': '$result.value.' + x},
            {'$unwind': '$result.value.' + x + '.plugin_name'},
            {'$group': {
                '_id': '$result.value.' + x + '.plugin_name',
                'count': {'$sum': 1},
            }},
            {'$sort': {'count': -1}},

        ]
        res = project_set.aggregate(pipeline)
        result['result.value.' + x + '.plugin_name'] = []
        for i in res:
            result['result.value.' + x + '.plugin_name'].append(i)
            logging.debug(i)
        logging.debug(result)


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

        {"$match": {"result": {'$exists': True}}},
        {
            '$project': {
                '_id': 0,
                'size_of_result': {'$size': "$result"},
            }
        },

    ]
    sum = 0
    for i in project_set.aggregate(pipeline):
        sum += i['size_of_result']
    logging.debug(sum)


def get_vul_result_count():
    """:ivar获得所有含有漏洞 result长度总和"""
    # illegality
    # vulnerables
    match = {'$match': {"result": {'$exists': True}}}
    match['$match']['result.value.vulnerables'] = {'$exists': True}

    result_set = mongo_db['resultdb']
    pipeline = [
        {'$unwind': "$result"},
        match,
        # {'$group': {'_id': "$result.value.illegality.plugin_name", 'count': {'$sum': 1}}},

        {
            '$project': {
                '_id': 1,
                # 'size_of_result': {'$size': "$result"},
            }
        },
        # {'$count': "$_id"}
    ]
    sum = 0
    for i in result_set.aggregate(pipeline):
        logging.debug(i)
        sum += 1
    logging.debug(sum)
    return sum


def mongo_search_like():
    result_set = mongo_db['resultdb']
    match = {'$match': {"result": {'$exists': True}}}
    # match['$match']['result.value.vulnerables'] = {'$exists': True}
    # match['$match']['result.scheme_domain'] = {'$regex': '365*'}

    pipeline = [
        {'$project': {"_id": 0, "task_id": 1, 'result': 1}},
        {'$unwind': "$result"},
        {
            '$match': {
                'result.scheme_domain': {'$regex': "365"}
                # '$or': [
                #     {
                #         # 'result.scheme_domain': {
                #         #     '$elemMatch': {'name': 'name', 'value': {'$regex': "小"}}
                #         # },
                #         'result.scheme_domain': {'$regex': "365"}
                #     }
                # ]
            }
        },
        {'$sort': {'result.value.save_time': -1}},

    ]
    result = []
    for i in result_set.aggregate(pipeline):
        logging.debug(i)
        result.append(i)


def get_image():

    match = {'$match': {"result": {'$exists': True}}}
    match['$match']['result.value.illegal_feature'] = {'$exists': True}

    result_set = mongo_db['resultdb']
    pipeline = [
        {'$unwind': "$result"},

        match,
        # {'$group': {'_id': "$result.value.illegality.plugin_name", 'count': {'$sum': 1}}},
        {'$unwind': "$result.value.illegal_feature"},
        {"$match":{"result.value.illegal_feature.image_snapshot": {'$exists': True}}},
        {'$project': {
                '_id': 1,
                'result.value.illegal_feature.image_snapshot': 1,
            }
        },
        # {'$count': "$_id"}
    ]
    sum = 0
    for i in result_set.aggregate(pipeline):
        logging.debug(i)
        sum += 1
    logging.debug(sum)



if __name__ == '__main__':
    # get_image(
    # get_ill_feature()
    # get_all_vul_count()
    # classify_by_key_vulnerables()
    # classify_by_key_illegality()
    # classify_by_key_illegality()
    # classify_by_key_plugin_reduce()
    # classify_by_key_by_domian_reduce()
    # get_vul_iil_domain()
    get_ill_keyword()
    # get_ill_feature_keyword()
    # get_vul_keyword()
    # get_vul_web()
    # get_all_web()
    # classify_by_key()
    # classify_by_key1()
    # get_scan_list()
    # get_array_count()
    # test()
    # get_vul_result_count()
    # mongo_search_like()
