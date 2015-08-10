# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthSuggestions', '0008_search_hash'),
    ]

    operations = [
        migrations.RenameField(
            model_name='suggestionlanguage',
            old_name='iso6391',
            new_name='iso6392',
        ),
    ]
