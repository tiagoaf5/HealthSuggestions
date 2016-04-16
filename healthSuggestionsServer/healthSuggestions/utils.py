from healthSuggestions.models import EventType


def getClickEvent(button):
    if button == 1:
        return EventType.objects.get(type="LClick")
    elif button == 2:
        return EventType.objects.get(type="MClick")
    elif button == 3:
        return EventType.objects.get(type="RClick")
