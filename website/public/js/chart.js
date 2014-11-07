window.charts = window.charts || {};

charts.graphUrl; // /v1/users/... without query params
charts.date;

var getEventsFor = function (type, typeId, objectTags, actionTags, operation, period, shareToken) {
    return $.ajax({
        url: "/v1/" + type + "/" + typeId + "/events/" + objectTags + "/" + actionTags + "/" + operation + "/" + period + "/" + "type/json",
        data: {
            shareToken: shareToken
        },
        headers: {
            "Accept": "application/json",
            "Authorization": $.cookie("_eun")
        }
    });
};

var plotChart = function (events) {
    if (renderType === "barchart") {
        charts.plotBarChart("#chart", events, null, null);
    }
};

charts.addComment = function () {
    var commentText = $("#commentText").val();
    var comment = {
        text: commentText,
        timestamp: new Date(),
        user: username
    };
    var graph = {
        graphUrl: charts.graphUrl,
        username: graphOwner,
        objectTags: objectTags,
        actionTags: actionTags,
        operation: operation,
        period: period,
        renderType: renderType,
        comment: comment
    };
    $.ajax({
        url: "/v1/comments",
        method: "POST",
        data: graph,
        headers: {
            "Accept": "application/json",
            "Authorization": $.cookie("_eun")
        }
    }).done(function (data) {
        $(".commentList").append("<li><div class='commenter'>" + comment.user + "</div>" +
            "<div class='commentText'><p>" + comment.text + "</p>" +
            "<sub><span class='commentTimestamp'>" + moment(comment.timestamp).format("DD MMM YYYY HH:mm") + "</span></sub></div></li>");
        console.info("awesome. comment added." + JSON.stringify(comment));
        $("#commentText").val("");
        $("#addCommentInput").hide();
    });
};

$("#addCommentInput").keyup(function (e) {
    if (e.keyCode == 13) {
        charts.addComment();
    }
});

var handleAddComment = function () {
    if (isUserLoggedIn) {
        $("#addCommentInput").show();
    }
    else {
        $("#loginModal").modal({show: true});
    }
};

var handleShareGraph = function () {
    var unregisteredUserOnStreamsPage = function () {
        return !isUserLoggedIn && (window.location.pathname.search("streams") !== -1)
    };

    if (isUserLoggedIn) {
        $("#shareModal").modal({show: true});
    } else if (unregisteredUserOnStreamsPage()) {
        $("#shareLoginModal").modal({show: true});
    } else {
        $("#loginModal").modal({show: true});
    }
};

var showChartTitle = function () {
    $("#chartTitle").html(chartTitle);
    if (isUserLoggedIn || (!isUserLoggedIn && !(_.isEmpty(shareToken)))) {
        $.when(getEventsFor("users", graphOwner, objectTags, actionTags, operation, period, shareToken))
            .done(plotChart)
            .fail();
    } else {
        $.when(getEventsFor("streams", streamId, objectTags, actionTags, operation, period, shareToken))
            .done(plotChart)
            .fail();
    }
};

var submitShare = function () {
    var emailId = $("#emailId").val();
    var graphShare = {
        toEmailId: emailId,
        graphUrl: window.location.pathname
    };
    $.ajax({
        url: "/v1/share_graph",
        method: "POST",
        data: graphShare,
        success: function () {
            alert("Graph shared successfully.");
        },
        error: function () {
            alert("some problem. Please try again later.");
        }
    });
};

charts.showComments = function () {
    $.ajax({
        url: "/v1/comments?graphUrl=" + charts.graphUrl,
        headers: {
            "Accept": "application/json",
            "Authorization": $.cookie("_eun")
        }
    }).done(function (comments) {
        var commentsDiv = $(".commentList");
        commentsDiv.empty();
        comments.forEach(function (comment) {
            commentsDiv.append("<li><div class='commenter'>" + comment.user + "</div>" +
                "<div class='commentText'><p>" + comment.text + "</p>" +
                "<sub><span class='commentTimestamp'>" + moment(comment.timestamp).format("DD MMM YYYY HH:mm") + "</span></sub></div></li><hr>");
        });
    });
};

$(document).ready(function () {
    showChartTitle();
    $("#shareSubmit").click(submitShare);
});
