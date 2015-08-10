# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthSuggestions', '0009_auto_20150810_1822'),
    ]

    operations = [
        migrations.RenameField(
            model_name='suggestionlanguage',
            old_name='iso6392',
            new_name='iso6391',
        ),
    ]
