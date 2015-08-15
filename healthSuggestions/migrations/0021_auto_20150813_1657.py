# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthSuggestions', '0020_auto_20150813_1649'),
    ]

    operations = [
        migrations.AlterField(
            model_name='click',
            name='linkText',
            field=models.CharField(max_length=200, null=True, blank=True),
        ),
    ]
