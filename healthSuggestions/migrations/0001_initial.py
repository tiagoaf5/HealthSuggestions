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
                ('CUI', models.TextField(serialize=False, primary_key=True)),
                ('CHV_Pref_EN', models.TextField(blank=True)),
                ('CHV_Pref_PT', models.TextField(blank=True)),
                ('UMLS_Pref_EN', models.TextField(blank=True)),
                ('UMLS_Pref_PT', models.TextField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='CHVStemmedIndexEN',
            fields=[
                ('term', models.TextField(serialize=False, primary_key=True)),
                ('idf', models.FloatField()),
                ('stringlist', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='CHVStemmedIndexPT',
            fields=[
                ('term', models.TextField(serialize=False, primary_key=True)),
                ('idf', models.FloatField()),
                ('stringlist', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='CHVString',
            fields=[
                ('id', models.PositiveIntegerField(serialize=False, primary_key=True)),
                ('en', models.TextField(blank=True)),
                ('pt', models.TextField(blank=True)),
                ('en_stemmed', models.TextField(blank=True)),
                ('pt_stemmed', models.TextField(blank=True)),
                ('en_count', models.PositiveSmallIntegerField(blank=True)),
                ('pt_count', models.PositiveSmallIntegerField(blank=True)),
                ('en_stemmed_count', models.PositiveSmallIntegerField(blank=True)),
                ('pt_stemmed_count', models.PositiveSmallIntegerField(blank=True)),
                ('cui', models.ForeignKey(to='healthSuggestions.CHVConcept')),
            ],
        ),
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True)),
                ('eventTimestamp', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='EventType',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('type', models.CharField(unique=True, max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='Search',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('query', models.CharField(max_length=120)),
                ('queryInputTimestamp', models.DateTimeField(auto_now_add=True)),
                ('totalNoResults', models.PositiveIntegerField(blank=True)),
                ('answerTime', models.FloatField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='SearchEngine',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(unique=True, max_length=10)),
                ('url', models.URLField()),
            ],
        ),
        migrations.CreateModel(
            name='SearchPage',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('SERPOrder', models.PositiveSmallIntegerField()),
                ('totalTimeOverSearchPage', models.FloatField(blank=True)),
                ('totalTimeOverSuggestionsBoard', models.FloatField(blank=True)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('url', models.URLField()),
                ('search', models.ForeignKey(related_name='searchPages', to='healthSuggestions.Search')),
            ],
        ),
        migrations.CreateModel(
            name='SearchResult',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('rank', models.PositiveSmallIntegerField()),
                ('link', models.URLField()),
                ('title', models.CharField(max_length=100)),
                ('snippet', models.TextField(blank=True)),
                ('searchPage', models.ForeignKey(related_name='searchResults', to='healthSuggestions.SearchPage')),
            ],
        ),
        migrations.CreateModel(
            name='SERelatedSearch',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('suggestion', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='Session',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('ip', models.GenericIPAddressField()),
                ('startTimestamp', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Suggestion',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('suggestion', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='SuggestionLanguage',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('language', models.CharField(unique=True, max_length=20)),
                ('iso6391', models.CharField(unique=True, max_length=2)),
            ],
        ),
        migrations.CreateModel(
            name='SuggestionType',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('type', models.CharField(unique=True, max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='TestUser',
            fields=[
                ('cookieID', models.UUIDField(serialize=False, primary_key=True)),
                ('registerDate', models.DateTimeField(auto_now_add=True)),
                ('browser', models.CharField(max_length=50, blank=True)),
                ('os', models.CharField(max_length=50, blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='WebPage',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('pageLoadTimestamp', models.DateTimeField(auto_now_add=True)),
                ('timeOnPage', models.FloatField(blank=True)),
                ('numScrollEvents', models.PositiveSmallIntegerField(blank=True)),
                ('searchResults', models.ManyToManyField(related_name='webPages', to='healthSuggestions.SearchResult')),
            ],
        ),
        migrations.CreateModel(
            name='Click',
            fields=[
                ('id', models.OneToOneField(primary_key=True, serialize=False, to='healthSuggestions.Event')),
                ('linkText', models.URLField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Copy',
            fields=[
                ('id', models.OneToOneField(primary_key=True, serialize=False, to='healthSuggestions.Event')),
                ('copyText', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Find',
            fields=[
                ('id', models.OneToOneField(primary_key=True, serialize=False, to='healthSuggestions.Event')),
                ('findText', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='SwitchSE',
            fields=[
                ('id', models.OneToOneField(primary_key=True, serialize=False, to='healthSuggestions.Event')),
                ('destination',
                 models.ForeignKey(related_name='engine_destination', to='healthSuggestions.SearchEngine')),
                ('origin', models.ForeignKey(related_name='engine_origin', to='healthSuggestions.SearchEngine')),
            ],
        ),
        migrations.AddField(
            model_name='suggestion',
            name='suggestionLanguage',
            field=models.ForeignKey(to='healthSuggestions.SuggestionLanguage'),
        ),
        migrations.AddField(
            model_name='suggestion',
            name='suggestionType',
            field=models.ForeignKey(to='healthSuggestions.SuggestionType'),
        ),
        migrations.AddField(
            model_name='session',
            name='cookieID',
            field=models.ForeignKey(to='healthSuggestions.TestUser'),
        ),
        migrations.AddField(
            model_name='search',
            name='seRelatedSearches',
            field=models.ManyToManyField(related_name='searches', to='healthSuggestions.SERelatedSearch'),
        ),
        migrations.AddField(
            model_name='search',
            name='searchEngine',
            field=models.ForeignKey(to='healthSuggestions.SearchEngine'),
        ),
        migrations.AddField(
            model_name='search',
            name='session',
            field=models.ForeignKey(related_name='searches', to='healthSuggestions.Session'),
        ),
        migrations.AddField(
            model_name='search',
            name='suggestions',
            field=models.ManyToManyField(related_name='searches', to='healthSuggestions.Suggestion'),
        ),
        migrations.AddField(
            model_name='event',
            name='searchPage',
            field=models.ForeignKey(related_name='events', blank=True, to='healthSuggestions.SearchPage', null=True),
        ),
        migrations.AddField(
            model_name='event',
            name='type',
            field=models.ForeignKey(related_name='events', to='healthSuggestions.EventType'),
        ),
        migrations.AddField(
            model_name='event',
            name='webPage',
            field=models.ForeignKey(related_name='events', blank=True, to='healthSuggestions.WebPage', null=True),
        ),
        migrations.AddField(
            model_name='click',
            name='Suggestion',
            field=models.ForeignKey(blank=True, to='healthSuggestions.Suggestion', null=True),
        ),
        migrations.AddField(
            model_name='click',
            name='seRelatedSearch',
            field=models.ForeignKey(blank=True, to='healthSuggestions.SERelatedSearch', null=True),
        ),
        migrations.AddField(
            model_name='click',
            name='searchResult',
            field=models.ForeignKey(blank=True, to='healthSuggestions.SearchResult', null=True),
        ),
    ]
