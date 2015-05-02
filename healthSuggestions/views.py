import json
from rest_framework.views import APIView
from healthSuggestions.serializers import CHVConceptSerializer, CHVStemmedIndexPTSerializer, CHVStringSerializer
from healthSuggestions.models import CHVConcept, CHVStemmedIndexPT, CHVString
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status
from rest_framework.reverse import reverse

# Create your views here.


class CHVConceptView(generics.ListAPIView):
    queryset = CHVConcept.objects.all()
    serializer_class = CHVConceptSerializer
    paginate_by = 100


class CHVStemmedIndexPTView(generics.ListAPIView):
    queryset = CHVStemmedIndexPT.objects.all()
    serializer_class = CHVStemmedIndexPTSerializer
    paginate_by = 100


class CHVStringView(generics.ListAPIView):
    queryset = CHVString.objects.all()
    serializer_class = CHVStringSerializer
    paginate_by = 100


class GetConceptView(APIView):
    def get(self, request, data, format=None):
        print "->" + str(data)
        # print "-->" + str(request)
        terms = str(data).split("+")
        objects = {}

        for term in terms:
            entry = CHVStemmedIndexPT.objects.get(term=term)
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


@api_view(('GET',))
def api_root(request, format=None):
    return Response({
        'CHVConcept': reverse('CHVConcept', request=request, format=format),
        'CHVStemmedIndexPT': reverse('CHVStemmedIndexPT', request=request, format=format),
        'CHVString': reverse('CHVString', request=request, format=format),
        'GetConceptView': reverse('GetConceptView', request=request, format=format),
    })

