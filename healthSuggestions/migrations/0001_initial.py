# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone


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
                ('eventTimestamp', models.DateTimeField(default=django.utils.timezone.now)),
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
                ('queryInputTimestamp', models.DateTimeField(default=django.utils.timezone.now)),
                ('hash', models.CharField(unique=True, max_length=40)),
                ('totalNoResults', models.CharField(max_length=16)),
                ('answerTime', models.FloatField(null=True, blank=True)),
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
                ('totalTimeOverSearchPage', models.FloatField(null=True, blank=True)),
                ('totalTimeOverSuggestionBoard', models.FloatField(null=True, blank=True)),
                ('timestamp', models.DateTimeField(default=django.utils.timezone.now)),
                ('url', models.URLField()),
                ('search', models.ForeignKey(related_name='searchPages', to='healthSuggestions.Search')),
            ],
        ),
        migrations.CreateModel(
            name='SearchResult',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('rank', models.PositiveSmallIntegerField()),
                ('url', models.URLField()),
                ('title', models.CharField(max_length=100)),
                ('snippet', models.TextField(null=True, blank=True)),
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
                ('startTimestamp', models.DateTimeField(default=django.utils.timezone.now)),
                ('browser', models.CharField(max_length=50)),
                ('os', models.CharField(max_length=50)),
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
                ('iso6391', models.CharField(max_length=2, serialize=False, primary_key=True)),
                ('language', models.CharField(unique=True, max_length=20)),
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
                ('guid', models.UUIDField(serialize=False, primary_key=True)),
                ('registerDate', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='WebPage',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('pageLoadTimestamp', models.DateTimeField(default=django.utils.timezone.now, null=True, blank=True)),
                ('timeOnPage', models.FloatField(null=True, blank=True)),
                ('numScrollEvents', models.PositiveSmallIntegerField(null=True, blank=True)),
                ('url', models.URLField(max_length=400)),
                ('searchResults', models.ManyToManyField(related_name='webPages', to='healthSuggestions.SearchResult')),
            ],
        ),
        migrations.CreateModel(
            name='Click',
            fields=[
                ('id', models.OneToOneField(primary_key=True, serialize=False, to='healthSuggestions.Event')),
                ('linkText', models.CharField(max_length=200, null=True, blank=True)),
                ('seRelatedSearch', models.ForeignKey(blank=True, to='healthSuggestions.SERelatedSearch', null=True)),
                ('searchResult', models.ForeignKey(blank=True, to='healthSuggestions.SearchResult', null=True)),
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
                ('findText', models.CharField(max_length=50, null=True, blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='SwitchSE',
            fields=[
                ('id', models.OneToOneField(primary_key=True, serialize=False, to='healthSuggestions.Event')),
                ('destination', models.ForeignKey(related_name='engine_destination', to='healthSuggestions.SearchEngine')),
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
            name='guid',
            field=models.ForeignKey(related_name='sessions', to='healthSuggestions.TestUser'),
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
            name='suggestion',
            field=models.ForeignKey(blank=True, to='healthSuggestions.Suggestion', null=True),
        ),
        migrations.AddField(
            model_name='click',
            name='webPage',
            field=models.ForeignKey(blank=True, to='healthSuggestions.WebPage', null=True),
        ),
    ]
