from rest_framework import serializers
from models import *


#########################################
#   Indexes for extension Serializers   #
#########################################


class CHVConceptSerializer(serializers.ModelSerializer):
    class Meta:
        model = CHVConcept
        fields = ('CUI', 'CHV_Pref_EN', 'CHV_Pref_PT', 'UMLS_Pref_EN', 'UMLS_Pref_PT')


class CHVStemmedIndexPTSerializer(serializers.ModelSerializer):
    class Meta:
        model = CHVStemmedIndexPT
        fields = ('term', 'idf', 'stringlist')


class CHVStemmedIndexENSerializer(serializers.ModelSerializer):
    class Meta:
        model = CHVStemmedIndexEN
        fields = ('term', 'idf', 'stringlist')


class CHVStringSerializer(serializers.ModelSerializer):
    class Meta:
        model = CHVString
        fields = ('id', 'en', 'pt', 'pt_stemmed', 'cui', 'en_count', 'pt_count', 'pt_stemmed_count')


########################################
#    LOGGING DATABASE SERIZLIZERS      #
#                                      #
#        User and Sessions             #
########################################

class TestUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestUser
        fields = ('cookieId', 'registerDate', 'browser', 'os')  # missing the sessions


class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ('ip', 'startTimestamp')  # missing the /lastEventTimestamp


#############################
#         Suggestions       #
#############################

class SuggestionLanguageSerializer(serializers.ModelSerializer):  # be populated initially
    class Meta:
        model = SuggestionLanguage
        fields = ('id', 'language', 'iso6391')


class SuggestionTypeSerializer(serializers.ModelSerializer):  # be populated initially
    class Meta:
        model = SuggestionType
        fields = ('id', 'type')


class SuggestionSerializer(serializers.ModelSerializer):
    suggestionLanguage = serializers.SlugRelatedField(
        slug_field='iso6391',
        queryset=SuggestionLanguage.objects.all()
    )
    suggestionType = serializers.SlugRelatedField(
        slug_field='type',
        queryset=SuggestionType.objects.all()
    )

    class Meta:
        model = Suggestion
        fields = 'suggestion'


########################################
#           Search Serializers         #
########################################


class SearchEngineSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchEngine
        fields = ('name', 'url')


class SERelatedSearch(serializers.ModelSerializer):
    class Meta:
        model = SERelatedSearch
        fields = 'suggestion'


class SearchSerializer(serializers.ModelSerializer):
    suggestions = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    seRelatedSearches = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Search
        fields = ('query', 'queryInputTimestamp', 'totalNoResults', 'answerTime', 'session', 'searchEngine')


class SearchPageSerializer(serializers.ModelSerializer):
    searchResults = serializers.PrimaryKeyRelatedField(many=True, queryset=SearchResult.objects.all())

    class Meta:
        model = SearchPage
        fields = ('SERPOrder', 'totalTimeOverSearchPage', 'totalTimeOverSuggestionsBoard', 'timestamp', 'url', 'search')


class SearchResultSerializer(serializers.ModelSerializer):
    webPages = serializers.PrimaryKeyRelatedField(many=True, queryset=WebPage.objects.all())

    class Meta:
        model = SearchResult
        fields = ('rank', 'link', 'title', 'snippet', 'searchPage')


class WebPageSerializer(serializers.ModelSerializer):
    searchResults = serializers.PrimaryKeyRelatedField(many=True, queryset=SearchResult.objects.all())

    class Meta:
        model = WebPage
        fields = ('pageLoadTimestamp', 'timeOnPage', 'numScrollEvents')


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ('id', 'eventTimestamp', 'type', 'searchPage', 'webPage')


class EventTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventType
        fields = 'type'


class CopySerializer(serializers.ModelSerializer):
    event = EventSerializer()

    class Meta:
        model = Copy
        fields = ('id', 'copyText')


class FindSerializer(serializers.ModelSerializer):
    event = EventSerializer()

    class Meta:
        model = Find
        fields = ('id', 'findText')


class SwitchSESerializer(serializers.ModelSerializer):
    event = EventSerializer()

    class Meta:
        model = SwitchSE
        fields = ('id', 'origin', 'destination')


class ClickSerializer(serializers.ModelSerializer):
    event = EventSerializer()

    class Meta:
        model = Click
        fields = ('id', 'linkText', 'searchResult', 'seRelatedSearch', 'Suggestion')