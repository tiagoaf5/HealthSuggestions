# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthSuggestions', '0012_auto_20150810_1831'),
    ]

    operations = [
        migrations.RenameField(
            model_name='searchresult',
            old_name='link',
            new_name='url',
        ),
    ]
