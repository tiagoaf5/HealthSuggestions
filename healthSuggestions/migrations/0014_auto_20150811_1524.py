# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthSuggestions', '0013_auto_20150811_1514'),
    ]

    operations = [
        migrations.RenameField(
            model_name='searchpage',
            old_name='totalTimeOverSuggestionsBoard',
            new_name='totalTimeOverSuggestionBoard',
        ),
    ]
