from django.db import models

# Create your models here.

#############################
#   Indexes for extension   #
#############################

class CHVConcept(models.Model):
    CUI = models.TextField(primary_key=True)
    CHV_Pref_EN = models.TextField(blank=True)
    CHV_Pref_PT = models.TextField(blank=True)
    UMLS_Pref_EN = models.TextField(blank=True)
    UMLS_Pref_PT = models.TextField(blank=True)


class CHVStemmedIndexPT(models.Model):
    term = models.TextField(primary_key=True)
    idf = models.FloatField()
    stringlist = models.TextField()


class CHVString(models.Model):
    id = models.PositiveIntegerField(primary_key=True)
    en = models.TextField(blank=True)
    pt = models.TextField(blank=True)
    pt_stemmed = models.TextField(blank=True)
    en_count = models.PositiveSmallIntegerField(blank=True)
    pt_count = models.PositiveSmallIntegerField(blank=True)
    pt_stemmed_count = models.PositiveSmallIntegerField(blank=True)
    cui = models.ForeignKey('CHVConcept')

#############################
#      LOGGING DATABASE     #
#                           #
#     User and Sessions     #
#############################


class TestUser(models.Model):
    cookieID = models.UUIDField(primary_key=True)
    registerDate = models.DateTimeField(auto_now_add=True)
    browser = models.CharField(max_length=50, blank=True)
    os = models.CharField(max_length=50, blank=True)


class Session(models.Model):
    cookieID = models.ForeignKey('TestUser')
    ip = models.GenericIPAddressField()
    startTimestamp = models.DateTimeField(auto_now_add=True)

#############################
#         Suggestions       #
#############################


class SuggestionLanguage(models.Model):
    language = models.CharField(max_length=20, unique=True)
    iso6391 = models.CharField(max_length=2, unique=True)


class SuggestionType(models.Model):
    type = models.CharField(max_length=20, unique=True)


class Suggestion(models.Model):
    suggestion = models.CharField(max_length=100)
    suggestionLanguage = models.ForeignKey('SuggestionLanguage')
    suggestionType = models.ForeignKey('SuggestionType')


#############################
#           Search          #
#############################


class SearchEngine(models.Model):
    name = models.CharField(max_length=10, unique=True)
    url = models.URLField()


class SERelatedSearch(models.Model):
    suggestion = models.CharField(max_length=50)


class Search(models.Model):
    query = models.CharField(max_length=120)
    queryInputTimestamp = models.DateTimeField(auto_now_add=True)
    totalNoResults = models.PositiveIntegerField(blank=True)
    answerTime = models.FloatField(blank=True)
    session = models.ForeignKey('Session', related_name='searches')
    suggestions = models.ManyToManyField('Suggestion', related_name='searches')
    searchEngine = models.ForeignKey('SearchEngine')
    seRelatedSearches = models.ManyToManyField('SERelatedSearch', related_name='searches')


class SearchPage(models.Model):
    SERPOrder = models.PositiveSmallIntegerField()
    totalTimeOverSearchPage = models.FloatField(blank=True)  # in seconds
    totalTimeOverSuggestionsBoard = models.FloatField(blank=True)  # in seconds
    timestamp = models.DateTimeField(auto_now_add=True)
    url = models.URLField()
    search = models.ForeignKey('Search', related_name='searchPages')


class SearchResult(models.Model):
    rank = models.PositiveSmallIntegerField()
    link = models.URLField()
    title = models.CharField(max_length=100)
    snippet = models.TextField(blank=True)
    searchPage = models.ForeignKey('SearchPage', related_name='searchResults')


class WebPage(models.Model):
    pageLoadTimestamp = models.DateTimeField(auto_now_add=True)
    timeOnPage = models.FloatField(blank=True)
    numScrollEvents = models.PositiveSmallIntegerField(blank=True)
    searchResult = models.ManyToManyField('SearchResult', related_name='webPages')


#############################
#           Events          #
#############################


class Event(models.Model):
    id = models.AutoField(primary_key=True)
    eventTimestamp = models.DateTimeField(auto_now_add=True)
    type = models.ForeignKey('EventType', related_name='events')
    searchPage = models.ForeignKey('SearchPage', related_name='events', blank=True, null=True)
    webPage = models.ForeignKey('WebPage', related_name='events', blank=True, null=True)


class EventType(models.Model):
    type = models.CharField(max_length=20, unique=True)


class Copy(models.Model):
    id = models.OneToOneField(Event, primary_key=True)
    copyText = models.TextField()


class Find(models.Model):
    id = models.OneToOneField(Event, primary_key=True)
    findText = models.CharField(max_length=50)


class SwitchSE(models.Model):
    id = models.OneToOneField(Event, primary_key=True)
    origin = models.ForeignKey('SearchEngine', related_name='engine_origin')
    destination = models.ForeignKey('SearchEngine', related_name='engine_destination')


class Click(models.Model):
    linkText = models.URLField(blank=True)
    searchResult = models.ForeignKey('SearchResult', blank=True, null=True)
    seRelatedSearch = models.ForeignKey('SERelatedSearch', blank=True, null=True)
    Suggestion = models.ForeignKey('Suggestion', blank=True, null=True)