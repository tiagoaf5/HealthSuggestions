# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('healthSuggestions', '0017_auto_20150813_1439'),
    ]

    operations = [
        migrations.AlterField(
            model_name='webpage',
            name='pageLoadTimestamp',
            field=models.DateTimeField(default=django.utils.timezone.now, blank=True),
        ),
    ]
