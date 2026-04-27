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

  if (uri === "/signup.html" || uri === "/signup/") {
    return signupUnavailable();
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

function signupUnavailable() {
  return {
    statusCode: 410,
    statusDescription: "Gone",
    headers: {
      "content-type": { value: "text/html; charset=utf-8" },
      "cache-control": { value: "no-store, max-age=0" }
    },
    body: {
      encoding: "text",
      data: "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>Liazon | Sign-up unavailable</title></head><body><main style=\"font-family:Arial,sans-serif;max-width:680px;margin:12vh auto;padding:0 24px;line-height:1.5\"><h1>Sign-up is temporarily unavailable</h1><p>New account creation is currently disabled. Existing customers can continue using Liazon as usual.</p><p><a href=\"/contact.html\">Contact support</a></p></main></body></html>"
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
