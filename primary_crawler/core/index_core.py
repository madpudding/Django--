# !usr/bin/env python 3.6
# -*- coding: utf-8 -*-
# Author: fcj
# Time: 2019-02-19
# Description: index 页面方法，仅限于index.html、index.js
from primary_crawler import models
import numpy as np
import math


# 首页种子列表采集信息
def sort_seed(sort_list):  # 取最新的两轮，第一轮种子数需减去上轮失败的种子总数(在两轮content_input_total都不为零的情况下)
    if sort_list[0]['content_input_total'] != 0 and sort_list[1]['content_input_total'] != 0:
        sort_list[0]['content_input_total'] = sort_list[0]['content_input_total'] - \
                                              (sort_list[1]['content_download_fail_total'] +
                                               sort_list[1]['content_match_fail_total'])
    return sort_list


def sort_all(sort_list):  # 取全部轮数数据，每一轮需减去上轮失败的种子总数
    result_json = {}
    for ind, item in enumerate(sort_list):
        mid_parameter = item
        if ind < 1:
            result_json['content_input_total'] = mid_parameter['content_input_total']
            result_json['content_download_fail_total'] = mid_parameter['content_download_fail_total']
            result_json['content_success_total'] = mid_parameter['content_success_total']
        else:
            content_input_total = result_json['content_input_total']
            # 本轮content_input_total 以及上轮content_input_total都不为零的情况下做相减
            if mid_parameter['content_input_total'] != 0 and sort_list[ind - 1]['content_input_total'] != 0:
                result_json['content_input_total'] = content_input_total + mid_parameter['content_input_total'] - \
                                                     (sort_list[ind - 1]['content_download_fail_total'] +
                                                      sort_list[ind - 1]['content_match_fail_total'])
            else:
                result_json['content_input_total'] = content_input_total + mid_parameter['content_input_total']

            content_download_fail_total = result_json['content_download_fail_total']
            result_json['content_download_fail_total'] = content_download_fail_total + mid_parameter[
                'content_download_fail_total']
            content_success_total = result_json['content_success_total']
            result_json['content_success_total'] = content_success_total + mid_parameter['content_success_total']

    return result_json


def sort_all_time(sort_list):  # 取全部轮数数据，每一轮需减去上轮失败的种子总数
    result_list = []
    for ind, item in enumerate(sort_list):
        if ind > 1:
            # 本轮content_input_total 以及上轮content_input_total都不为零的情况下做相减
            if item['content_input_total'] != 0 and sort_list[ind - 1]['content_input_total'] != 0:
                item['content_input_total'] = item['content_input_total'] - \
                                                     (sort_list[ind - 1]['content_download_fail_total'] +
                                                      sort_list[ind - 1]['content_match_fail_total'])
                number = item
            else:
                number = item
        else:
            number = item
        result_list.append(number)
    return result_list


def seed_site(start, end, top_num):  # seed表与site表关联操作  amount
    spider_amount = list(models.seed_record.objects.filter(update_time__range=(start, end)).values())
    plus_list = seed_most(spider_amount)  # 整合list
    result_json = amount(plus_list, top_num)  # amount数据处理
    return result_json


def seed_table(start, end, balance_time):  # seed表与site表关联操作 table
    choose_spider_amount = list(models.seed_record.objects.filter(update_time__range=(start, end)).values())
    choose_plus_list = seed_most(choose_spider_amount)  # 整合list
    choose_result_json = table(choose_plus_list)

    if balance_time is not None:  # 环比时间不为空，则开始进行环比数据的操作
        balance_start, balance_end = choose_balance(start, end, balance_time)
        balance_spider_amount = list(models.seed_record.objects.filter
                                     (update_time__range=(balance_start, balance_end)).values())
        balance_plus_list = seed_most(balance_spider_amount)
        balance_result_json = table(balance_plus_list)
        if balance_time == 'day':  # 以天进行对比
            choose_result_json = day_balance(choice_time=choose_result_json, balance_time=balance_result_json)
        elif balance_time == 'week':  # 以周进行对比
            choose_result_json = table_expect(choose_plus_list)  # 计算期望 数据不同 需要区别开来
            balance_result_json = table_expect(balance_plus_list)
            choose_result_json = week_balance(choice_time=choose_result_json, balance_time=balance_result_json)
        else:  # 以月进行对比
            choose_result_json = table_expect(choose_plus_list)  # 计算期望 数据不同 需要区别开来
            balance_result_json = table_expect(balance_plus_list)
            choose_result_json = month_balance(choice_time=choose_result_json, balance_time=balance_result_json)

    return choose_result_json


def choose_balance(start, end, balance_time):  # 通过得到时间，筛选对比时间,
    # TODO: 此处以后应精确到毫秒 * 1000  已经完成

    if balance_time == 'day':  # 日
        st = start - 24 * 3600 * 1000
        en = end - 24 * 3600 * 1000
    elif balance_time == 'week':  # 周
        st = start - 6 * 24 * 3600 * 1000
        en = end - 6 * 24 * 3600 * 1000
    else:  # 月
        st = start - 29 * 24 * 3600 * 1000
        en = end - 29 * 24 * 3600 * 1000
    return st, en


def seed_most(spider_amount):  # 之所以两个迭代，是避免迭代查询，造成时间过长 TODO：后续可以把site表查询结果过滤
    plus_list = []  # 整合list
    site_dict = {}
    specific_web = list(models.site_record.objects.all().values())  # site表所有

    for site_item in specific_web:
        site_dict[str(site_item['id'])] = site_item['id']
        site_dict[str(site_item['id'])+'site_name'] = site_item['site_name']
        site_dict[str(site_item['id'])+'model_name'] = site_item['model_name']

    for item in spider_amount:
        seed_site_id = item['site_id']
        if seed_site_id == site_dict[str(seed_site_id)]:
            item['site_name'] = site_dict[str(seed_site_id)+'site_name']
            item['model_name'] = site_dict[str(seed_site_id)+'model_name']
        plus_list.append(item)

    return plus_list


def amount(plus_list, top_num):  # amount数据
    result_json = {'all_result': 0}

    for ind, web in enumerate(plus_list):  # 迭代最后给出数据为{网站：该网站这段时间里存储成功总数}

        if web['site_name'] not in result_json.keys():
            result_json[web['site_name']] = web['storage_success_content_total']  # 存库成功的数量
        else:
            result_json[web['site_name']] = result_json[web['site_name']] + web['storage_success_content_total']
        result_json['all_result'] += web['storage_success_content_total']  # 所有数据总量

    result_json = top_extract(top_num, result_json)  # top榜排序
    return result_json


def top_extract(top_num, result_json):  # 数据排序筛选
    result = {}
    sorted_dict = sorted(result_json.items(), key=lambda x: x[1], reverse=True)
    if top_num < len(sorted_dict):  # 若排行榜数小于结果长度，则取排行榜数，否则取结果长度
        extract_dict = sorted_dict[0:top_num+1]
    else:
        extract_dict = sorted_dict

    for item in extract_dict:
        result[item[0]] = item[1]

    return result


def table(plus_list):  # table 数据
    result_json = {'all_result': 0}  # 返回的dict  all_result存储成功总数 TODO:修改了all_result的计算逻辑
    for ind, web in enumerate(plus_list):  # 迭代最后给出数据为{网站：该网站这段时间里存储成功总数...}
        result_json = table_plus(web, result_json)
        download_suc = result_json[web['site_name']]['download_suc']
        parse_suc = result_json[web['site_name']]['parse_suc']
        storage_suc = result_json[web['site_name']]['storage_suc']
        content_suc = result_json[web['site_name']]['content_suc']

        if content_suc > 0:  # 避免 被除数为 0

            if download_suc > 0:
                result_json[web['site_name']]['download_per'] = format((float(download_suc) /  # 下载成功率
                                                                        float(content_suc)) * 100, '.1f') + '%'
                result_json[web['site_name']]['parse_per'] = format((float(parse_suc) /  # 解析成功率
                                                                     float(download_suc)) * 100, '.1f') + '%'
                result_json[web['site_name']]['storage_per'] = format((float(storage_suc) /  # 存储成功率
                                                                       float(download_suc)) * 100, '.1f') + '%'
            else:
                result_json[web['site_name']]['download_per'] = '0.0%'
                result_json[web['site_name']]['parse_per'] = '0.0%'
                result_json[web['site_name']]['storage_per'] = '0.0%'
        else:
            result_json[web['site_name']]['download_per'] = '0.0%'
            result_json[web['site_name']]['parse_per'] = '0.0%'
            result_json[web['site_name']]['storage_per'] = '0.0%'
    return result_json


def table_expect(plus_list):  # 用于计算期望， 需要该公司每天的数据， 所以不能整合。
    result_json = {}
    for ind, web in enumerate(plus_list):  # 迭代最后给出数据为{网站：该网站这段时间里存储成功总数....}
        result_json = expect_plus(web, result_json)
        download_suc = result_json[web['site_name']][web['update_time']]['download_suc']
        parse_suc = result_json[web['site_name']][web['update_time']]['parse_suc']
        storage_suc = result_json[web['site_name']][web['update_time']]['storage_suc']
        content_suc = result_json[web['site_name']][web['update_time']]['content_suc']

        if content_suc > 0:  # 避免 被除数为 0
            result_json[web['site_name']][web['update_time']]['download_per'] = \
                format((float(download_suc) / float(content_suc)) * 100, '.1f') + '%'
            if download_suc > 0:
                result_json[web['site_name']][web['update_time']]['parse_per'] = \
                    format((float(parse_suc) / float(download_suc)) * 100, '.1f') + '%'
                if parse_suc > 0:
                    result_json[web['site_name']][web['update_time']]['storage_per'] = \
                        format((float(storage_suc) / float(parse_suc)) * 100, '.1f') + '%'
                else:
                    result_json[web['site_name']][web['update_time']]['storage_per'] = '0.0%'
            else:
                result_json[web['site_name']][web['update_time']]['parse_per'] = '0.0%'
                result_json[web['site_name']][web['update_time']]['storage_per'] = '0.0%'
        else:  # 分母为0，结果应为0
            result_json[web['site_name']][web['update_time']]['download_per'] = '0.0%'
            result_json[web['site_name']][web['update_time']]['parse_per'] = '0.0%'
            result_json[web['site_name']][web['update_time']]['storage_per'] = '0.0%'

    return result_json


def table_plus(web, result_json):  # table 数据加工

    if web['site_name'] not in result_json.keys():  # 若不存在则新创，否则数据相加。
        result_json[web['site_name']] = {'download_suc': web['download_success_content_total'],
                                         'parse_suc': web['parse_success_content_total'],
                                         'storage_suc': web['storage_success_content_total'],  # 存库成功的数量
                                         'content_suc': web['content_total'] + web['fail_count'],
                                         }
    else:
        result_json[web['site_name']] = {
            'download_suc': result_json[web['site_name']]['download_suc'] + web['download_success_content_total'],
            'parse_suc': result_json[web['site_name']]['parse_suc'] + web['parse_success_content_total'],
            'storage_suc': result_json[web['site_name']]['storage_suc'] + web['storage_success_content_total'],
            'content_suc': result_json[web['site_name']]['content_suc'] + web['content_total'] + web['fail_count'],
        }

    result_json['all_result'] += web['storage_success_content_total']  # 所有数据总量

    return result_json


def expect_plus(web, result_json):
    # TODO: 也许以后在这里可以将时间戳改成时间格式 yyyy-mm-dd hh:mm:ss，但我还没想好这样改，好处在哪
    time = web['update_time']
    if web['site_name'] not in result_json.keys():
        result_json[web['site_name']] = {}
    result_json[web['site_name']][time] = {'download_suc': web['download_success_content_total'],
                                           'parse_suc': web['parse_success_content_total'],
                                           'storage_suc': web['storage_success_content_total'],  # 存库成功的数量
                                           'content_suc': web['content_total'],
                                           }
    return result_json


def day_balance(choice_time, balance_time):  # 以天做对比
    '''choice_time : 前一天的数据
       balance_time : 当天的数据 '''
    b_key = balance_time.keys()
    c_key = choice_time.keys()
    comment = b_key & c_key  # comment 为共同拥有

    if 'all_result' in comment:
        comment.remove('all_result')  # all_result 无用数据，剔除

    for com_key in comment:
        for item in choice_time[com_key]:  # balance_float 浮动百分比
            if item.endswith('per'):  # 百分比数据相减
                choice_time[com_key][item] = float_per_choice(choice_time, balance_time, com_key, item)
            else:  # num数据相减在除以百分比
                choice_time[com_key][item] = float_num_choice(choice_time, balance_time, com_key, item)

    return choice_time


def float_per_choice(choice_time, balance_time, com_key, item):  # 计算百分比
    balance_float = float(choice_time[com_key][item].replace('%', '')) - \
                    float(balance_time[com_key][item].replace('%', ''))
    if balance_float > 0:
        balance_float = format(balance_float, '.1f') + '%'
        choice_time[com_key][item] = choice_time[com_key][item] + '    +' + balance_float
    elif balance_float == 0:
        balance_float = format(balance_float, '.1f') + '%'
        choice_time[com_key][item] = choice_time[com_key][item] + '    -' + balance_float
    else:
        balance_float = format(balance_float, '.1f') + '%'
        choice_time[com_key][item] = choice_time[com_key][item] + '    ' + balance_float
    return choice_time[com_key][item]


def float_num_choice(choice_time, balance_time, com_key, item):  # 计算浮动百分比

    if choice_time[com_key][item] > 0 and balance_time[com_key][item] > 0:  # 区分分母是不是为0
        balance_float = (choice_time[com_key][item] - balance_time[com_key][item]) / balance_time[com_key][item]
        if balance_float > 0:
            balance_float = format(balance_float, '.1f') + '%'
            choice_time[com_key][item] = str(choice_time[com_key][item]) + '    +' + str(balance_float)
        elif balance_float == 0:
            balance_float = format(balance_float, '.1f') + '%'
            choice_time[com_key][item] = str(choice_time[com_key][item]) + '    -' + str(balance_float)
        else:
            balance_float = format(balance_float, '.1f') + '%'
            choice_time[com_key][item] = str(choice_time[com_key][item]) + '    ' + str(balance_float)

    elif choice_time[com_key][item] < 1 and balance_time[com_key][item] > 0:
        choice_time[com_key][item] = str(choice_time[com_key][item]) + '    -'+str(balance_time[com_key][item]) + '.0%'
    elif choice_time[com_key][item] > 0 and balance_time[com_key][item] < 1:
        choice_time[com_key][item] = str(choice_time[com_key][item]) + '    +'+str(choice_time[com_key][item]) + '.0%'
    else:
        choice_time[com_key][item] = '0'

    return choice_time[com_key][item]


def week_balance(choice_time, balance_time):  # 以周做对比

    b_key = balance_time.keys()  # 找出所选期间与对比期间共同拥有的公司
    c_key = choice_time.keys()
    comment = b_key & c_key  # comment 为共同拥有

    for com_key in comment:

        download_num_arr = []  # 下载成功数
        parse_num_arr = []  # 解析成功数
        storage_num_arr = []  # 存储成功数
        download_per_arr = []  # 下载成功率
        parse_per_arr = []  # 解析成功率
        storage_per_arr = []  # 存储成功率

        choice_time = integration_data(choice_time, balance_time, com_key,  # 数据对比整合
                                       download_num_arr, parse_num_arr, storage_num_arr,
                                       download_per_arr, parse_per_arr, storage_per_arr)

    for other_key in choice_time.keys():

        download_num_arr = []  # 下载成功数
        parse_num_arr = []  # 解析成功数
        storage_num_arr = []  # 存储成功数
        download_per_arr = []  # 下载成功率
        parse_per_arr = []  # 解析成功率
        storage_per_arr = []  # 存储成功率

        if other_key not in comment:
            choice_time[other_key] = mean_company(choice_time, other_key, download_num_arr,
                                                  parse_num_arr, storage_num_arr, download_per_arr,
                                                  parse_per_arr, storage_per_arr)
    return choice_time


def integration_data(choice_time, balance_time, com_key,  # 数据对比整合
                     download_num_arr, parse_num_arr, storage_num_arr,
                     download_per_arr, parse_per_arr, storage_per_arr
                     ):

    choice_time[com_key] = mean_company(choice_time,  # 计算期望
                                        com_key, download_num_arr, parse_num_arr, storage_num_arr,
                                        download_per_arr, parse_per_arr, storage_per_arr)
    balance_time[com_key] = mean_company(balance_time,  # 计算期望
                                         com_key, download_num_arr, parse_num_arr, storage_num_arr,
                                         download_per_arr, parse_per_arr, storage_per_arr)

    for item in choice_time[com_key]:  # balance_float 浮动百分比
        if item.endswith('per'):
            choice_time[com_key][item] = float_per_choice(choice_time, balance_time, com_key, item)
        else:
            choice_time[com_key][item] = float_num_choice(choice_time, balance_time, com_key, item)

    return choice_time


def mean_company(in_time, com_key,   # 期望的运算
                 download_num_arr, parse_num_arr, storage_num_arr,
                 download_per_arr, parse_per_arr, storage_per_arr):
    result_json = {}
    for time in in_time[com_key]:

        for item in in_time[com_key][time]:

            if item.endswith('per'):
                float_num = float(in_time[com_key][time][item].replace('%', ''))
                if item == 'download_per':
                    download_per_arr.append(float_num)
                elif item == 'parse_per':
                    parse_per_arr.append(float_num)
                else:
                    storage_per_arr.append(float_num)

            if item == 'download_suc':
                download_num_arr.append(in_time[com_key][time][item])
            elif item == 'parse_suc':
                parse_num_arr.append(in_time[com_key][time][item])
            elif item == 'storage_suc':
                storage_num_arr.append(in_time[com_key][time][item])

    result_json['download_suc'] = math.ceil(np.mean(np.array(download_num_arr)))
    result_json['parse_suc'] = math.ceil(np.mean(np.array(parse_num_arr)))
    result_json['storage_suc'] = math.ceil(np.mean(np.array(storage_num_arr)))
    result_json['download_per'] = format(np.mean(np.array(download_per_arr)), '.1f') + '%'
    result_json['parse_per'] = format(np.mean(np.array(parse_per_arr)), '.1f') + '%'
    result_json['storage_per'] = format(np.mean(np.array(storage_per_arr)), '.1f') + '%'

    return result_json


def month_balance(choice_time, balance_time):  # 以月做对比
    b_key = balance_time.keys()  # 找出所选期间与对比期间共同拥有的公司
    c_key = choice_time.keys()
    comment = b_key & c_key

    for com_key in comment:
        download_num_arr = []  # 下载成功数
        parse_num_arr = []  # 解析成功数
        storage_num_arr = []  # 存储成功数
        download_per_arr = []  # 下载成功率
        parse_per_arr = []  # 解析成功率
        storage_per_arr = []  # 存储成功率

        choice_time = integration_data(choice_time, balance_time, com_key,
                                       download_num_arr, parse_num_arr, storage_num_arr,
                                       download_per_arr, parse_per_arr, storage_per_arr)

    for other_key in choice_time.keys():

        download_num_arr = []  # 下载成功数
        parse_num_arr = []  # 解析成功数
        storage_num_arr = []  # 存储成功数
        download_per_arr = []  # 下载成功率
        parse_per_arr = []  # 解析成功率
        storage_per_arr = []  # 存储成功率

        if other_key not in comment:
            choice_time[other_key] = mean_company(choice_time, other_key, download_num_arr,
                                                  parse_num_arr, storage_num_arr, download_per_arr,
                                                  parse_per_arr, storage_per_arr)
    return choice_time
