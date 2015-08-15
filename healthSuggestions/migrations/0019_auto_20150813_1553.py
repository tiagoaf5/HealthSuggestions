# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('healthSuggestions', '0018_auto_20150813_1549'),
    ]

    operations = [
        migrations.AlterField(
            model_name='click',
            name='linkText',
            field=models.URLField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='search',
            name='answerTime',
            field=models.FloatField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='searchpage',
            name='totalTimeOverSearchPage',
            field=models.FloatField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='searchpage',
            name='totalTimeOverSuggestionBoard',
            field=models.FloatField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='searchresult',
            name='snippet',
            field=models.TextField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='session',
            name='browser',
            field=models.CharField(max_length=50, null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='session',
            name='os',
            field=models.CharField(max_length=50, null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='webpage',
            name='numScrollEvents',
            field=models.PositiveSmallIntegerField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='webpage',
            name='pageLoadTimestamp',
            field=models.DateTimeField(default=django.utils.timezone.now, null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='webpage',
            name='timeOnPage',
            field=models.FloatField(null=True, blank=True),
        ),
    ]
