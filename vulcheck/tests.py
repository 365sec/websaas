# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import pymongo
import logging
import coloredlogs

coloredlogs.install(level='DEBUG',
                    fmt="%(asctime)s - %(filename)s[line:%(lineno)d] - %(levelname)s: %(message)s",
                    )

from utils.logs import logs

mongo_client = pymongo.MongoClient('mongodb://gree:12345@172.16.39.78:27017/?authSource=webmap')
mongo_db = mongo_client['webmap']
if __name__ == '__main__':
    project_set = mongo_db['resultdb']
    logger = logs()

    # for i in project_set.find({}, {'value.vulnerables.sqli': 1, '_id': 0}):
    #     if i['value']:
    #         logging.debug(i)

    pipeline = [
        # {'$match': {"value.vulnerables.sqli": 1}},
        {'$match': {"task_id": "3d06ecda-5227-4ee4-867a-d74398da3abd"}},
        # {'$unwind': '$value.vulnerables.xss'},
        {'$unwind': '$value.vulnerables.sqli'},
        # {'$group': {'_id': "$vulnerables", 'count': {'$sum': 1}}},
        # { '$project': {'task_id': 1} }
    ]

    k = 0
    for i in project_set.aggregate(pipeline):
        logging.debug(i)
        k += 1
    logging.debug(k)
