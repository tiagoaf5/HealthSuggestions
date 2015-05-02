# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CHVConcept',
            fields=[
                ('CUI', models.TextField(serialize=True, primary_key=True)),
                ('CHV_Pref_EN', models.TextField(blank=True)),
                ('CHV_Pref_PT', models.TextField(blank=True)),
                ('UMLS_Pref_EN', models.TextField(blank=True)),
                ('UMLS_Pref_PT', models.TextField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='CHVStemmedIndexPT',
            fields=[
                ('term', models.TextField(serialize=True, primary_key=True)),
                ('idf', models.FloatField()),
                ('stringlist', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='CHVString',
            fields=[
                ('id', models.PositiveIntegerField(serialize=True, primary_key=True)),
                ('en', models.TextField(blank=True)),
                ('pt', models.TextField(blank=True)),
                ('pt_stemmed', models.TextField(blank=True)),
                ('en_count', models.PositiveSmallIntegerField(blank=True)),
                ('pt_count', models.PositiveSmallIntegerField(blank=True)),
                ('pt_stemmed_count', models.PositiveSmallIntegerField(blank=True)),
                ('cui', models.ForeignKey(to='healthSuggestions.CHVConcept')),
            ],
        ),
    ]
