function handler(event) {
  var request = event.request;
  var headers = request.headers;

  var host = headers.host && headers.host.value ? headers.host.value : "";
  var uri = request.uri || "/";

  // Normalize host to www.
  if (host === "liazon.ai") {
    return redirect("https://www.liazon.ai" + uri + buildQuerystring(request));
  }

  // Redirect bare /index.html to /.
  if (uri === "/index.html") {
    return redirect("https://www.liazon.ai/" + buildQuerystring(request));
  }

  // Redirect /path/index.html to /path/.
  if (uri.endsWith("/index.html")) {
    var newUri = uri.slice(0, -("index.html".length));
    return redirect("https://www.liazon.ai" + newUri + buildQuerystring(request));
  }

  // Canonicalize extensionless paths to a trailing slash.
  if (!uri.endsWith("/") && !hasFileExtension(uri)) {
    return redirect("https://www.liazon.ai" + uri + "/" + buildQuerystring(request));
  }

  // Rewrite directory paths for S3 REST origin object lookup.
  if (uri.endsWith("/") && uri !== "/") {
    request.uri = uri + "index.html";
  }

  return request;
}

function hasFileExtension(uri) {
  var tail = uri.substring(uri.lastIndexOf("/") + 1);
  return tail.indexOf(".") !== -1;
}

function redirect(location) {
  return {
    statusCode: 301,
    statusDescription: "Moved Permanently",
    headers: {
      location: { value: location }
    }
  };
}

function buildQuerystring(request) {
  var qs = request.querystring || {};
  var parts = [];

  for (var key in qs) {
    if (!Object.prototype.hasOwnProperty.call(qs, key)) continue;
    var entry = qs[key];

    if (entry.multiValue) {
      for (var i = 0; i < entry.multiValue.length; i++) {
        parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(entry.multiValue[i].value));
      }
    } else if (entry.value !== undefined) {
      parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(entry.value));
    } else {
      parts.push(encodeURIComponent(key));
    }
  }

  return parts.length ? ("?" + parts.join("&")) : "";
}
