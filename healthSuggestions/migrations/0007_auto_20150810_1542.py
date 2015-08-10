# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthSuggestions', '0006_auto_20150810_1504'),
    ]

    operations = [
        migrations.AlterField(
            model_name='search',
            name='totalNoResults',
            field=models.CharField(max_length=16),
        ),
    ]
