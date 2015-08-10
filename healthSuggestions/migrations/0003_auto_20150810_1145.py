# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthSuggestions', '0002_auto_20150808_1326'),
    ]

    operations = [
        migrations.RenameField(
            model_name='session',
            old_name='cookieID',
            new_name='guid',
        ),
        migrations.RenameField(
            model_name='testuser',
            old_name='cookieID',
            new_name='guid',
        ),
        migrations.RemoveField(
            model_name='testuser',
            name='browser',
        ),
        migrations.RemoveField(
            model_name='testuser',
            name='os',
        ),
        migrations.AddField(
            model_name='session',
            name='browser',
            field=models.CharField(max_length=50, blank=True),
        ),
        migrations.AddField(
            model_name='session',
            name='os',
            field=models.CharField(max_length=50, blank=True),
        ),
    ]
