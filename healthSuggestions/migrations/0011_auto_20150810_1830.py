# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthSuggestions', '0010_auto_20150810_1827'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='suggestionlanguage',
            name='id',
        ),
        migrations.AlterField(
            model_name='suggestionlanguage',
            name='iso6391',
            field=models.CharField(max_length=2, serialize=False, primary_key=True),
        ),
    ]
