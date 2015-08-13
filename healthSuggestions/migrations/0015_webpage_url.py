# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthSuggestions', '0014_auto_20150811_1524'),
    ]

    operations = [
        migrations.AddField(
            model_name='webpage',
            name='url',
            field=models.URLField(default=''),
            preserve_default=False,
        ),
    ]
