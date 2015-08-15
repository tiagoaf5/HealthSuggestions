# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthSuggestions', '0016_auto_20150813_1323'),
    ]

    operations = [
        migrations.RenameField(
            model_name='click',
            old_name='Suggestion',
            new_name='suggestion',
        ),
        migrations.AddField(
            model_name='click',
            name='webPage',
            field=models.ForeignKey(blank=True, to='healthSuggestions.WebPage', null=True),
        ),
        migrations.AlterField(
            model_name='find',
            name='findText',
            field=models.CharField(max_length=50, null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='search',
            name='hash',
            field=models.CharField(unique=True, max_length=40),
        ),
    ]
