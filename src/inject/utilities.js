/**
 * Created by tiago on 28/02/15.
 */

function getWidget() {
    return $("." + widgetClass);
}

function getWidgetContent() {
    return $("." + widgetContentClass).contents();
}
