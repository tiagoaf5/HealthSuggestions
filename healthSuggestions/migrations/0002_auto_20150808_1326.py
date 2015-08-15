# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import json

import os

from django.db import migrations
import sys

from healthSuggestions.serializers import CHVConceptSerializer, CHVStemmedIndexPTSerializer, \
    CHVStemmedIndexENSerializer, CHVStringSerializer, EventTypeSerializer, SuggestionLanguageSerializer, \
    SuggestionTypeSerializer, SearchEngineSerializer

fixture_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../initial_data'))


def populate_chvconcept(apps, schema_editor):
    print "\n"
    fixture_filename = 'CHVConcept_objects.json'
    fixture_file = os.path.join(fixture_dir, fixture_filename)

    fixture = open(fixture_file, 'r')

    data = json.load(fixture)

    var = 0
    for o in data:
        var += 1
        serializer = CHVConceptSerializer(data=o)
        if serializer.is_valid():
            serializer.save()
        else:
            print "Invalid: " + str(serializer.data)
        sys.stdout.write("Populating CHVConcept: %d%%   \r" % (((var * 1.0) / 35737) * 100))
        sys.stdout.flush()
    print '\n'


def populate_chvstemmedindexpt(apps, schema_editor):
    fixture_filename = 'CHVStemmedIndexPT_objects.json'
    fixture_file = os.path.join(fixture_dir, fixture_filename)

    fixture = open(fixture_file, 'r')

    data = json.load(fixture)

    var = 0
    for o in data:
        var += 1
        serializer = CHVStemmedIndexPTSerializer(data=o)
        if serializer.is_valid():
            serializer.save()
        else:
            print "Invalid: " + str(serializer.data)
        sys.stdout.write("Populating CHVStemmedIndexPT: %d%%   \r" % (((var * 1.0) / 24655) * 100))
        sys.stdout.flush()
    print '\n'


def populate_chvstemmedindexen(apps, schema_editor):
    fixture_filename = 'CHVStemmedIndexEN_objects.json'
    fixture_file = os.path.join(fixture_dir, fixture_filename)

    fixture = open(fixture_file, 'r')

    data = json.load(fixture)

    var = 0
    for o in data:
        var += 1
        serializer = CHVStemmedIndexENSerializer(data=o)
        if serializer.is_valid():
            serializer.save()
        else:
            print "Invalid: " + str(serializer.data)
        sys.stdout.write("Populating CHVStemmedIndexEN: %d%%   \r" % (((var * 1.0) / 24655) * 100))
        sys.stdout.flush()
    print '\n'


def populate_chvstring(apps, schema_editor):
    fixture_filename = 'CHVString_objects.json'
    fixture_file = os.path.join(fixture_dir, fixture_filename)

    fixture = open(fixture_file, 'r')

    data = json.load(fixture)

    var = 0
    for o in data:
        var += 1
        serializer = CHVStringSerializer(data=o)
        if serializer.is_valid():
            serializer.save()
        else:
            print "Invalid: " + str(serializer.data)
        sys.stdout.write("Populating CHVString: %d%%   \r" % (((var * 1.0) / 107500) * 100))
        sys.stdout.flush()
    print '\n'


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
        ('healthSuggestions', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(populate_chvconcept),
        migrations.RunPython(populate_chvstemmedindexpt),
        migrations.RunPython(populate_chvstemmedindexen),
        migrations.RunPython(populate_chvstring),
        migrations.RunPython(populate_searchengine),
        migrations.RunPython(populate_suggestionlanguage),
        migrations.RunPython(populate_suggestiontype),
        migrations.RunPython(populate_eventtype)
    ]
