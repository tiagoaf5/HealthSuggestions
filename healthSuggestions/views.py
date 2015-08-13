import json
from rest_framework.views import APIView
from healthSuggestions.serializers import CHVConceptSerializer, CHVStemmedIndexPTSerializer, \
    CHVStemmedIndexENSerializer, CHVStringSerializer
from healthSuggestions.models import *
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status
from rest_framework.reverse import reverse
from ipware.ip import get_ip
import datetime as dt


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
        d_session = data['Session']
        d_search = data['Search']

        user = TestUser.objects.filter(guid=d_session["guid"])
        ip = get_ip(request)

        if Search.objects.filter(hash=data['hash']).exists():
            return Response({"message": "Got some data! But already exists!", "data": request.data})

        if ip is not None:
            print "we have an IP address for user", ip
        else:
            print "we don't have an IP address for user"

        # user and session
        if len(user) > 0:
            user = user[0]
            print 'has user:', user.guid, user.registerDate

            print "<<", data['Search']['queryInputTimestamp']
            d_sessionTimestamp = dt.datetime.strptime(d_search['queryInputTimestamp'], '%Y-%m-%dT%H:%M:%S.%fZ')
            print "<<", d_sessionTimestamp

            for s in user.sessions.order_by('-startTimestamp'):
                print ">>", s.startTimestamp
                diff = (d_sessionTimestamp - s.startTimestamp.replace(tzinfo=None)).total_seconds()
                if diff < 3600:
                    session = s
                    break
                else:
                    break

            if not session:
                session = Session(guid=user, ip=ip, browser=d_session['browser'], os=d_session['os'],
                                  startTimestamp=d_search['queryInputTimestamp'])
                session.save()

        else:
            user = TestUser(guid=d_session["guid"])
            user.save()
            session = Session(guid=user, ip=ip, browser=d_session['browser'], os=d_session['os'],
                              startTimestamp=d_search['queryInputTimestamp'])
            session.save()
            print 'creating user: ', user.guid, user.registerDate

        searchEngine = SearchEngine.objects.get(name=d_search['SearchEngine']['name'])

        search = Search(query=d_search['query'], queryInputTimestamp=d_search['queryInputTimestamp'],
                        totalNoResults=d_search['totalNoResults'], hash=data['hash'],
                        answerTime=(-1 if d_search['answerTime'] == "" else float(d_search['answerTime'])),
                        session=session, searchEngine=searchEngine)
        search.save()

        d_seRelatedSearch = d_search['SERelatedSearches']
        for item in d_seRelatedSearch:
            temp = SERelatedSearch.objects.filter(suggestion=item)
            if len(temp) > 0:
                search.seRelatedSearches.add(temp[0])
            else:
                temp = SERelatedSearch(suggestion=item)
                temp.save()
                search.seRelatedSearches.add(temp)

        d_suggestions = d_search['Suggestions']
        for item in d_suggestions:
            temp = Suggestion.objects.filter(suggestion=item['term'], suggestionType__type=item['type'],
                                             suggestionLanguage__iso6391=item['lang'])
            if len(temp) > 0:
                print 'Suggestion exists'
                search.suggestions.add(temp[0])
            else:
                print 'Suggestion doesnt exist'
                suggestionType = SuggestionType.objects.get(type=item['type'])
                suggestionType.save()
                suggestionLanguage = SuggestionLanguage.objects.get(iso6391=item['lang'])
                suggestionLanguage.save()
                temp = Suggestion(suggestion=item['term'], suggestionLanguage=suggestionLanguage,
                                  suggestionType=suggestionType)
                temp.save()

                search.suggestions.add(temp)

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
                                            title=result['title'], snippet=result['snippet'], searchPage=searchPage)
                searchResult.save()

        d_webPages = data['WebPages']

        for item in d_webPages:
            webpage = WebPage.objects.filter(url=item["url"], searchResults__searchPage__search=search)

            webpageSearchResult = SearchResult.objects.get(url=item['searchResult']['link'],
                                                           searchPage__SERPOrder=item['searchResult']['SERPOrder'],
                                                           searchPage__search=search)

            if len(webpage) > 0:
                print 'Webpage exists'
                webpage[0].searchResults.add(webpageSearchResult)
            else:
                print 'Webpage doesnt exist'
                webpage = WebPage(url=item['url'], pageLoadTimestamp=item['pageLoadTimestamp'],
                                  timeOnPage=item['timeOnPage'], numScrollEvents=item['numScrollEvents'])
                print "->", item

                webpage.save()
                webpage.searchResults.add(webpageSearchResult)

        return Response({"message": "Got some data!", "data": request.data})


@api_view(('GET',))
def api_root(request, format=None):
    return Response({
        'CHVConcept': reverse('CHVConcept', request=request, format=format),
        'CHVStemmedIndexPT': reverse('CHVStemmedIndexPT', request=request, format=format),
        'CHVString': reverse('CHVString', request=request, format=format),
        # 'GetConceptView': reverse('GetConceptView', request=request, format=format),
    })
