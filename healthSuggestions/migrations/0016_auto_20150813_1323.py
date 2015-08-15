# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import json

import os

from django.db import migrations
import sys

from healthSuggestions.serializers import SearchEngineSerializer, SuggestionTypeSerializer, SuggestionLanguageSerializer, \
    EventTypeSerializer

fixture_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../initial_data'))

def populate_eventtype(apps, schema_editor):
    fixture_filename = 'EventType_objects.json'
    fixture_file = os.path.join(fixture_dir, fixture_filename)

    fixture = open(fixture_file, 'r')

    data = json.load(fixture)

    var = 0
    for o in data:
        var += 1
        serializer = EventTypeSerializer(data=o)
        if serializer.is_valid():
            serializer.save()
        else:
            print "Invalid: " + str(serializer.data)
        sys.stdout.write("Populating EventType: %d%%   \r" % (((var * 1.0) / 9) * 100))
        sys.stdout.flush()
    print '\n'


class Migration(migrations.Migration):

    dependencies = [
        ('healthSuggestions', '0015_webpage_url'),
    ]

    operations = [
        migrations.RunPython(populate_eventtype)
    ]
