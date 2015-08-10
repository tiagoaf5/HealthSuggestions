# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthSuggestions', '0003_auto_20150810_1145'),
    ]

    operations = [
        migrations.AlterField(
            model_name='session',
            name='guid',
            field=models.ForeignKey(related_name='sessions', to='healthSuggestions.TestUser'),
        ),
    ]
