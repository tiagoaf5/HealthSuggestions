# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import json

import os

from django.db import migrations
import sys

from healthSuggestions.serializers import SearchEngineSerializer, SuggestionTypeSerializer, SuggestionLanguageSerializer

fixture_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../initial_data'))


def populate_suggestiontype(apps, schema_editor):
    fixture_filename = 'SuggestionType_objects.json'
    fixture_file = os.path.join(fixture_dir, fixture_filename)

    fixture = open(fixture_file, 'r')

    data = json.load(fixture)

    var = 0
    for o in data:
        var += 1
        serializer = SuggestionTypeSerializer(data=o)
        if serializer.is_valid():
            serializer.save()
        else:
            print "Invalid: " + str(serializer.data)
        sys.stdout.write("Populating SuggestionType: %d%%   \r" % (((var * 1.0) / 2) * 100))
        sys.stdout.flush()
    print '\n'


def populate_suggestionlanguage(apps, schema_editor):
    fixture_filename = 'SuggestionLanguage_objects.json'
    fixture_file = os.path.join(fixture_dir, fixture_filename)

    fixture = open(fixture_file, 'r')

    data = json.load(fixture)

    var = 0
    for o in data:
        var += 1
        serializer = SuggestionLanguageSerializer(data=o)
        if serializer.is_valid():
            serializer.save()
        else:
            print "Invalid: " + str(serializer.data)
        sys.stdout.write("Populating SuggestionLanguage: %d%%   \r" % (((var * 1.0) / 2) * 100))
        sys.stdout.flush()
    print '\n'


class Migration(migrations.Migration):

    dependencies = [
        ('healthSuggestions', '0011_auto_20150810_1830'),
    ]

    operations = [
        migrations.RunPython(populate_suggestionlanguage),
        migrations.RunPython(populate_suggestiontype)
    ]
