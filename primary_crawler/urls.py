from django.urls import path
from . import views

app_name = 'primary_crawler'
urlpatterns = [
    path('login', views.login, name='login'),  # 登录
    path('register', views.register, name='register'),  # 注册
    path('logout', views.logout, name='logout'),  # 登出
    path('', views.index, name='index'),  # 首页
    path('crawler_status', views.crawler_status, name='crawler_status'),  # 爬虫运行状态
    path('crawler_seed', views.crawler_seed, name='crawler_seed'),  # 爬虫数字呈现
    path('crawler_statistics', views.crawler_statistics, name='crawler_statistics'),  # 爬虫数据统计 曲线图
    path('crawler_amount', views.crawler_amount, name='crawler_amount'),  # 爬虫数据统计 饼图 柱状图
    path('crawler_table', views.crawler_table, name='crawler_table'),    # 爬虫数据统计 表格
    path('test', views.test_index, name='test'),
]
