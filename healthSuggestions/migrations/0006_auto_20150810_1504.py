# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import json

import os

from django.db import migrations
import sys

from healthSuggestions.serializers import SearchEngineSerializer

fixture_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../initial_data'))


def populate_searchengine(apps, schema_editor):
    fixture_filename = 'SearchEngine_objects.json'
    fixture_file = os.path.join(fixture_dir, fixture_filename)

    fixture = open(fixture_file, 'r')

    data = json.load(fixture)

    var = 0
    for o in data:
        var += 1
        serializer = SearchEngineSerializer(data=o)
        if serializer.is_valid():
            serializer.save()
        else:
            print "Invalid: " + str(serializer.data)
        sys.stdout.write("Populating SearchEngine: %d%%   \r" % (((var * 1.0) / 3) * 100))
        sys.stdout.flush()
    print '\n'


class Migration(migrations.Migration):
    dependencies = [
        ('healthSuggestions', '0005_auto_20150810_1432'),
    ]

    operations = [
        migrations.RunPython(populate_searchengine)
    ]
