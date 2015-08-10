# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('healthSuggestions', '0004_auto_20150810_1401'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='eventTimestamp',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AlterField(
            model_name='search',
            name='queryInputTimestamp',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AlterField(
            model_name='searchpage',
            name='timestamp',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AlterField(
            model_name='session',
            name='startTimestamp',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AlterField(
            model_name='webpage',
            name='pageLoadTimestamp',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
