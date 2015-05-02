from django.db import models

# Create your models here.


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
