from rest_framework import serializers
from models import CHVConcept, CHVStemmedIndexPT, CHVString


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
