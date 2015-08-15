import json
import datetime as dt

from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.reverse import reverse

from ipware.ip import get_ip

from healthSuggestions.serializers import CHVConceptSerializer, CHVStemmedIndexPTSerializer, \
    CHVStemmedIndexENSerializer, CHVStringSerializer
from healthSuggestions.models import *
from utils import *
from django.db import transaction, IntegrityError


# Create your views here.


class CHVConceptView(generics.ListAPIView):
    queryset = CHVConcept.objects.all()
    serializer_class = CHVConceptSerializer
    paginate_by = 100


class CHVStemmedIndexPTView(generics.ListAPIView):
    queryset = CHVStemmedIndexPT.objects.all()
    serializer_class = CHVStemmedIndexPTSerializer
    paginate_by = 100


class CHVStemmedIndexENView(generics.ListAPIView):
    queryset = CHVStemmedIndexEN.objects.all()
    serializer_class = CHVStemmedIndexENSerializer
    paginate_by = 100


class CHVStringView(generics.ListAPIView):
    queryset = CHVString.objects.all()
    serializer_class = CHVStringSerializer
    paginate_by = 100


class GetConceptView(APIView):
    def get(self, request, language, query, format=None):
        print "->" + str(query)
        print "-->" + str(language)
        terms = str(query).split("+")
        objects = {}

        for term in terms:
            entry = CHVStemmedIndexPT.objects.get(term=term) if language.lower() == 'por' \
                else CHVStemmedIndexEN.objects.get(term=term)
            idf = entry.idf
            stringlist = entry.stringlist.split(";")

            for string in stringlist:
                if string != "":
                    objects[string] = idf if string not in objects else objects[string] + idf

        print json.dumps(objects)

        maximum = 0
        maximum_strings = []
        for k, v in objects.items():
            if v > maximum:
                maximum = v

        for k, v in objects.items():
            if v == maximum:
                maximum_strings.append(k)

        print "maximum: " + str(maximum)
        print "maximum_strings: " + str(maximum_strings)
        print "len(maximum_strings): " + str(len(maximum_strings))

        minimumwords = 1000
        minimumCui = ""
        for m in maximum_strings:
            o = CHVString.objects.get(id=m)
            if o.pt_count < minimumwords:
                minimumwords = o.pt_count
                minimumCui = o.cui

        print "minimumwords: " + str(minimumwords)
        print "minimumCui: " + str(minimumCui.CUI)

        return Response(data=CHVConceptSerializer(minimumCui).data, status=status.HTTP_200_OK)


class LogData(APIView):
    def post(self, request):
        data = request.data
        # print data
        print "----------------------------"

        if Search.objects.filter(hash=data['hash']).exists():
            return Response({"message": "Got some data! But already exists!"})

        try:
            with transaction.atomic():
                d_session = data['Session']
                d_search = data['Search']

                print "User and Session"
                user = TestUser.objects.filter(guid=d_session["guid"])
                ip = get_ip(request)

                if ip is not None:
                    print "\twe have an IP address for user", ip
                else:
                    print "\twe don't have an IP address for user"

                # user and session
                if len(user) > 0:
                    user = user[0]
                    print '\thas user:', user.guid, user.registerDate

                    print "\t<<", data['Search']['queryInputTimestamp']
                    d_sessionTimestamp = dt.datetime.strptime(d_search['queryInputTimestamp'], '%Y-%m-%dT%H:%M:%S.%fZ')
                    print "\t<<", d_sessionTimestamp
                    session = ""
                    for s in user.sessions.order_by('-startTimestamp'):
                        print "\t>>", s.startTimestamp
                        diff = (d_sessionTimestamp - s.startTimestamp.replace(tzinfo=None)).total_seconds()
                        if diff < 3600:
                            session = s
                            break
                        else:
                            break

                    if session == "":
                        session = Session(guid=user, ip=ip, browser=d_session['browser'], os=d_session['os'],
                                          startTimestamp=d_search['queryInputTimestamp'])
                        session.save()

                else:
                    user = TestUser(guid=d_session["guid"])
                    user.save()
                    session = Session(guid=user, ip=ip, browser=d_session['browser'], os=d_session['os'],
                                      startTimestamp=d_search['queryInputTimestamp'])
                    session.save()
                    print '\tcreating user: ', user.guid, user.registerDate

                print "SearchEngine"
                searchEngine = SearchEngine.objects.get(name=d_search['SearchEngine']['name'])

                print "Search"
                search = Search(query=d_search['query'], queryInputTimestamp=d_search['queryInputTimestamp'],
                                totalNoResults=d_search['totalNoResults'], hash=data['hash'],
                                answerTime=(
                                    -1 if d_search['answerTime'] == "" else float(
                                        d_search['answerTime'].replace(',', '.'))),
                                session=session, searchEngine=searchEngine)
                search.save()

                print "SERelatedSearches"
                d_seRelatedSearch = d_search['SERelatedSearches']
                for item in d_seRelatedSearch:
                    temp = SERelatedSearch.objects.filter(suggestion=item)
                    if len(temp) > 0:
                        search.seRelatedSearches.add(temp[0])
                    else:
                        temp = SERelatedSearch(suggestion=item)
                        temp.save()
                        search.seRelatedSearches.add(temp)

                print "Suggestions"
                d_suggestions = d_search['Suggestions']
                for item in d_suggestions:
                    temp = Suggestion.objects.filter(suggestion=item['term'], suggestionType__type=item['type'],
                                                     suggestionLanguage__iso6391=item['lang'])
                    if len(temp) > 0:
                        print '\tSuggestion exists'
                        search.suggestions.add(temp[0])
                    else:
                        print '\tSuggestion doesnt exist'
                        suggestionType = SuggestionType.objects.get(type=item['type'])
                        suggestionType.save()
                        suggestionLanguage = SuggestionLanguage.objects.get(iso6391=item['lang'])
                        suggestionLanguage.save()
                        temp = Suggestion(suggestion=item['term'], suggestionLanguage=suggestionLanguage,
                                          suggestionType=suggestionType)
                        temp.save()

                        search.suggestions.add(temp)

                print "SearchPages"
                d_searchPages = d_search['SearchPages']

                for item in d_searchPages:
                    searchPage = SearchPage(SERPOrder=item['SERPOrder'],
                                            totalTimeOverSearchPage=item['totalTimeOverSearchPage'],
                                            totalTimeOverSuggestionBoard=item['totalTimeOverSuggestionBoard'],
                                            timestamp=item['timestamp'],
                                            url=item['url'],
                                            search=search)
                    searchPage.save()

                    for result in item['SearchResults']:
                        # print ",-,>", vars(result)
                        searchResult = SearchResult(rank=result['index'], url=result['url'] if 'url' in result else "",
                                                    title=result['title'], snippet=result['snippet'],
                                                    searchPage=searchPage)
                        searchResult.save()

                print "Webpages"
                d_webPages = data['WebPages']

                for item in d_webPages:
                    webpage = WebPage.objects.filter(url=item["url"], searchResults__searchPage__search=search)

                    if 'searchResult' not in item:
                        print "\t", item['url'], "*WebPage hasnt searchResult"
                        continue
                    print "\t", item['searchResult']['link'], item['searchResult']['SERPOrder']
                    webpageSearchResult = SearchResult.objects.get(url=item['searchResult']['link'],
                                                                   searchPage__SERPOrder=item['searchResult'][
                                                                       'SERPOrder'],
                                                                   searchPage__search=search)

                    if len(webpage) > 0:
                        print '\t\tWebpage exists'
                        webpage[0].searchResults.add(webpageSearchResult)
                    else:
                        print '\t\tWebpage doesnt exist'
                        webpage = WebPage(url=item['url'], pageLoadTimestamp=item['pageLoadTimestamp'] if item[
                                                                                                              'pageLoadTimestamp'] != "" else None,
                                          timeOnPage=item['timeOnPage'], numScrollEvents=item['numScrollEvents'])

                        webpage.save()
                        webpage.searchResults.add(webpageSearchResult)

                print "Events"
                d_events = data['Events']

                # typeClickSearchResult =
                for item in d_events:

                    type = item['EventType']

                    if type == 'ClickSearchResult':
                        print '\tClickSearchResult'
                        eType = getClickEvent(item['button'])

                        eClickSearchResult = SearchResult.objects.get(searchPage__search=search,
                                                                      searchPage__SERPOrder=item['SERPOrder'],
                                                                      url=item['link'])

                        event = Event(eventTimestamp=item['EventTimestamp'], type=eType)
                        event.save()

                        eClick = Click(id=event, linkText=item['linkText'], searchResult=eClickSearchResult)
                        eClick.save()

                    elif type == 'ClickSuggestion':
                        print '\tClickSuggestion'
                        eType = getClickEvent(item['button'])
                        eClickSuggestion = Suggestion.objects.get(suggestion=item['suggestion']['term'],
                                                                  suggestionType__type=item['suggestion']['type'],
                                                                  suggestionLanguage__iso6391=item['suggestion'][
                                                                      'lang'])

                        event = Event(eventTimestamp=item['EventTimestamp'], type=eType)
                        event.save()

                        eClick = Click(id=event, linkText=item['linkText'], suggestion=eClickSuggestion)
                        eClick.save()

                    elif type == 'ClickSERelatedSearch':
                        print '\tClickSERelatedSearch'
                        eType = getClickEvent(item['button'])
                        eClickSERelatedSearch = SERelatedSearch.objects.get(suggestion=item['suggestion'])

                        event = Event(eventTimestamp=item['EventTimestamp'], type=eType)
                        event.save()

                        eClick = Click(id=event, linkText=item['linkText'], seRelatedSearch=eClickSERelatedSearch)
                        eClick.save()

                    elif type == 'ClickUrl':
                        print '\tClickUrl'

                        eType = getClickEvent(item['button'])
                        print "\t\t", item['link']

                        eClickUrl = WebPage.objects.filter(url=item['link'], searchResults__searchPage__search=search)

                        event = Event(eventTimestamp=item['EventTimestamp'], type=eType)
                        event.save()

                        if len(eClickUrl) > 0:
                            print "\t\thas webPage"
                            eClick = Click(id=event, linkText=item['linkText'], webPage=eClickUrl[0])
                        else:
                            print "\t\thasnt webPage", item['linkText'][0:200]
                            eClick = Click(id=event, linkText=item['linkText'][0:200])

                        eClick.save()

                    elif type == 'copy':
                        print '\tcopy'
                        eCopy = EventType.objects.get(type="Copy")

                        event = Event(eventTimestamp=item['EventTimestamp'], type=eCopy)
                        event.save()

                        copy = Copy(id=event, copyText=item['copyText'])
                        copy.save()
                    elif type == 'find':
                        print '\tfind'
                        eFind = EventType.objects.get(type="Find")

                        event = Event(eventTimestamp=item['EventTimestamp'], type=eFind)
                        event.save()

                        find = Find(id=event)
                        find.save()
                    elif type == 'SwitchSE':
                        print '\tSwitchSE'
                        eSwitchSE = EventType.objects.get(type="SwitchSE")

                        f = SearchEngine.objects.get(name=item['from'])
                        t = SearchEngine.objects.get(name=item['to'])

                        event = Event(eventTimestamp=item['EventTimestamp'], type=eSwitchSE)
                        event.save()

                        switchSE = SwitchSE(id=event, origin=f, destination=t)
                        switchSE.save()
                    elif type == 'ShowSugBoard' or type == 'HideSugBoard' or type == 'CloseSugBoard':
                        print "\t", type
                        eType = EventType.objects.get(type=type)
                        event = Event(eventTimestamp=item['EventTimestamp'], type=eType)
                        event.save()

                    if 'SERPOrder' in item:
                        sPage = search.searchPages.get(SERPOrder=item['SERPOrder'])
                        event.searchPage = sPage
                        event.save()
                    else:
                        wPage = WebPage.objects.filter(searchResults__searchPage__search=search, url=item['url'])
                        if len(wPage) > 0:
                            event.webPage = wPage[0]
                            event.save()

                return Response({"message": "Got some data!"})
        except IntegrityError:
            return Response({"message": "Bad Request!"}, 400)
        except KeyError:
            return Response({"message": "Bad Request."}, 400)
        except Exception:
            return Response({"message": "Bad Request"}, 400)


@api_view(('GET',))
def api_root(request, format=None):
    return Response({
        'CHVConcept': reverse('CHVConcept', request=request, format=format),
        'CHVStemmedIndexPT': reverse('CHVStemmedIndexPT', request=request, format=format),
        'CHVString': reverse('CHVString', request=request, format=format),
        # 'GetConceptView': reverse('GetConceptView', request=request, format=format),
    })
