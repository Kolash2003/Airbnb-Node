package controllers

import (
	"net/http"
)

// PingHandler is a simple health check handler.
func PingHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("pong"))
}
