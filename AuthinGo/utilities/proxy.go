package utilities

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
)

func ProxyToService(targetBaseUrl string, pathPrefix string) http.HandlerFunc {

	target, err := url.Parse(targetBaseUrl)

	if err != nil {
		fmt.Println("Error passing target URL:", err)
		return nil
	}

	proxy := httputil.NewSingleHostReverseProxy(target)

	originalDirector := proxy.Director

	proxy.Director = func(r *http.Request) {
		originalDirector(r)

		fmt.Println("Proxying request to:", targetBaseUrl)

		originalPath := r.URL.Path

		fmt.Println("Original path:", originalPath)

		strippedPath := strings.TrimPrefix(originalPath, pathPrefix)

		fmt.Println("Stripped path:", strippedPath)

		r.URL.Host = target.Host

		r.URL.Path = target.Path + strippedPath

		r.Host = target.Host

		if userId, ok := r.Context().Value("userID").(string); ok {
			r.Header.Set("X-User-ID", userId)
		}

	}

	return proxy.ServeHTTP

}