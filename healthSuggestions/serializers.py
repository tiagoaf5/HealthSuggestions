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
        queryset=SuggestionLanguage.objects.filter('iso6391')
    )
    suggestionType = serializers.SlugRelatedField(
        slug_field='type',
        queryset=SuggestionType.objects.filter('type')
    )

    class Meta:
        model = Suggestion
        fields = 'suggestion'


