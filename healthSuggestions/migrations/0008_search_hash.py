# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthSuggestions', '0007_auto_20150810_1542'),
    ]

    operations = [
        migrations.AddField(
            model_name='search',
            name='hash',
            field=models.CharField(default='', max_length=40),
            preserve_default=False,
        ),
    ]
