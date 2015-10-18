"""server URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf.urls import include, url
from django.contrib import admin
from rest_framework.urlpatterns import format_suffix_patterns
from healthSuggestions import views

urlpatterns = [
    #url(r'^$', views.api_root),
    #url(r'^admin/', include(admin.site.urls)),
    #url(r'^CHVConcept/', views.CHVConceptView.as_view(), name='CHVConcept'),
    #url(r'^CHVStemmedIndexPT/', views.CHVStemmedIndexPTView.as_view(), name='CHVStemmedIndexPT'),
    #url(r'^CHVStemmedIndexEN/', views.CHVStemmedIndexENView.as_view(), name='CHVStemmedIndexEN'),
    #url(r'^CHVString/', views.CHVStringView.as_view(), name='CHVString'),
    #url(r'^GetConceptView/(?P<query>([a-z0-9]+\+)*([a-z0-9])+)$', views.GetConceptView.as_view(),
     #   name='GetConceptViewData'),
    url(r'^GetConceptView/(?P<language>[a-zA-z]{3})/(?P<query>([a-z0-9]+\+)*([a-z0-9])+)$',
        views.GetConceptView.as_view(), name='GetConceptViewData'),
    # url(r'^GetConceptView/', views.GetConceptView.as_view(), name='GetConceptView'),
    url(r'^LogData/', views.LogData.as_view(), name='LogData'),

]

urlpatterns = format_suffix_patterns(urlpatterns)